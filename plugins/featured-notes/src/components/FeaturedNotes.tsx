import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/featured.scss"

/**
 * Featured — 홈 전용. 대형 카드 1개 + 소형 카드 3개.
 *
 * 선정 순서
 *   1. `frontmatter.featured: true` 우선
 *   2. 부족분은 **토픽 라운드로빈**(토픽별 최신 1개씩) — 전체 최신순으로 뽑으면
 *      노트가 많은 토픽이 슬롯을 독식한다
 *   3. 메인 = 선정분 중 가장 최근, 나머지 3개는 사이드에 최신순
 *
 * ⚠️ 중복 노출 방지: 자동 채움에서만 Recent Notes 상위 N개를 후보에서 뺀다.
 *    수동 featured는 빼지 않는다(작성자 의도 우선).
 *    N = `recentExcludeCount`, quartz.config.yaml의 recent-notes-index.limit과
 *    같은 값으로 유지할 것.
 *
 * 기타
 *   · 읽기 시간은 별도 필드가 없어 단어 수 / 200wpm으로 산출(og-image와 동일)
 *   · 카테고리 라벨에 색을 쓰지 않는다 — 토픽 컬러 체계 폐지(DESIGN-SYSTEM.md).
 *     위계는 대문자 + 자간으로, 색은 중립(--text-3)
 *   · 홈 전용 렌더는 내부 slug 가드 (`is-index` layout condition은 없음)
 */

type FileData = QuartzPluginData & Record<string, unknown>

const CATEGORY_NAMES: Record<string, string> = {
  "computer-science": "Computer Science",
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  gis: "GIS",
  programming: "Programming",
  "finance-property": "Finance & Property",
  tools: "Tools",
}

function getCategoryName(slug: string): string {
  const key = slug.split("/")[0] ?? ""
  return CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  if (slug === "topics" || slug === "archive") return false
  return true
}

function getTime(f: FileData): number {
  const dates = f.dates as { modified?: Date; created?: Date } | undefined
  return dates?.modified?.getTime() ?? dates?.created?.getTime() ?? 0
}

function getDisplayDate(f: FileData): Date | undefined {
  const dates = f.dates as { modified?: Date; created?: Date; published?: Date } | undefined
  return dates?.modified ?? dates?.created ?? dates?.published
}

function getReadingMinutes(f: FileData): number {
  const text = (f.text as string | undefined) ?? ""
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/** 토픽별 최신 노트를 하나씩, "자신의 최신 노트가 더 최근인 토픽" 순으로
 * 순회하며 뽑는다. count를 못 채우면 각 토픽의 다음 노트로 라운드를 더 돈다. */
function pickRoundRobin(files: FileData[], count: number, exclude: Set<string>): FileData[] {
  const byTopic = new Map<string, FileData[]>()
  for (const f of files) {
    const slug = (f.slug as string) ?? ""
    if (exclude.has(slug)) continue
    const topic = slug.split("/")[0]
    if (!topic) continue
    const list = byTopic.get(topic) ?? []
    list.push(f)
    byTopic.set(topic, list)
  }
  for (const list of byTopic.values()) list.sort((a, b) => getTime(b) - getTime(a))

  const topicOrder = [...byTopic.keys()].sort(
    (a, b) => getTime(byTopic.get(b)![0]!) - getTime(byTopic.get(a)![0]!),
  )

  const picked: FileData[] = []
  let round = 0
  while (picked.length < count) {
    let addedThisRound = false
    for (const topic of topicOrder) {
      if (picked.length >= count) break
      const list = byTopic.get(topic)!
      if (round < list.length) {
        picked.push(list[round]!)
        addedThisRound = true
      }
    }
    round++
    if (!addedThisRound) break
  }
  return picked
}

export interface FeaturedNotesOptions {
  /** recent-notes-index의 options.limit과 같은 값으로 유지할 것. */
  recentExcludeCount: number
}

const defaultOptions: FeaturedNotesOptions = {
  recentExcludeCount: 6,
}

export default ((userOpts?: Partial<FeaturedNotesOptions>) => {
  const opts: FeaturedNotesOptions = { ...defaultOptions, ...userOpts }

  const FeaturedNotes: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const files = (allFiles as FileData[]).filter((f) => isRealNote((f.slug as string) ?? ""))

    const manuallyFeatured = files
      .filter((f) => (f.frontmatter as { featured?: boolean } | undefined)?.featured === true)
      .sort((a, b) => getTime(b) - getTime(a))

    // recent-notes-index와 같은 정렬 기준(최신순)으로 상위 N개를 재현해 제외.
    const recentPostsSlugs = new Set(
      [...files]
        .sort((a, b) => getTime(b) - getTime(a))
        .slice(0, opts.recentExcludeCount)
        .map((f) => f.slug as string),
    )

    const exclude = new Set([...manuallyFeatured.map((f) => f.slug as string), ...recentPostsSlugs])
    const needed = Math.max(0, 4 - manuallyFeatured.length)
    const autoFilled = needed > 0 ? pickRoundRobin(files, needed, exclude) : []

    const selected = [...manuallyFeatured, ...autoFilled].sort((a, b) => getTime(b) - getTime(a))
    if (selected.length === 0) return <></>

    const [main, ...rest] = selected
    const sideItems = rest.slice(0, 3)

    return (
      <section class={`${displayClass ?? ""} featured-section`}>
        <div class="featured-header">
          <h2>Featured</h2>
        </div>
        <div class="featured-grid">
          <a class="featured-main" href={resolveRelative(fileData.slug!, main!.slug as string)}>
            <span
              class="featured-cat"
            >
              {getCategoryName((main!.slug as string) ?? "")}
            </span>
            <h3>{(main!.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"}</h3>
            {main!.description && <p>{main!.description as string}</p>}
            <div class="featured-meta">
              {(() => {
                const d = getDisplayDate(main!)
                return d ? (
                  <span>
                    {d.toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                ) : null
              })()}
              <span class="featured-meta-sep" />
              <span>{getReadingMinutes(main!)}분</span>
            </div>
          </a>
          <div class="featured-side">
            {sideItems.map((item) => (
              <a class="featured-item" href={resolveRelative(fileData.slug!, item.slug as string)}>
                <span
                  class="featured-cat"
                >
                  {getCategoryName((item.slug as string) ?? "")}
                </span>
                <h4>{(item.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"}</h4>
                <div class="featured-meta">
                  {(() => {
                    const d = getDisplayDate(item)
                    return d ? (
                      <span>
                        {d.toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    ) : null
                  })()}
                  <span class="featured-meta-sep" />
                  <span>{getReadingMinutes(item)}분</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    )
  }

  FeaturedNotes.css = style
  return FeaturedNotes
}) satisfies QuartzComponentConstructor<Partial<FeaturedNotesOptions>>
