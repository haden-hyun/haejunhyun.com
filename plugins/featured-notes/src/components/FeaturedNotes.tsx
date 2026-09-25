import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/featured.scss"

/**
 * Selected — 홈 전용. 번호 매긴 목록 4행, 첫 항목만 크게.
 *
 * - `options.slugs`가 유일한 지정 수단. 쓴 순서가 표시 순서(번호), 첫 항목이 크게
 * - 부족분은 토픽 라운드로빈으로 채운다 (전체 최신순은 큰 토픽이 슬롯을 독식)
 * - 중복 노출 방지(`recentExcludeCount`)는 자동 채움에만 적용
 *
 * 주의: 목록 순서를 최신순으로 다시 정렬하지 말 것. 순서 제어가 이 방식의 목적이다.
 */

const MAX_SLOTS = 4

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

/** 토픽별 최신 노트를 하나씩, 최신 토픽 순으로 순회하며 뽑는다. */
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
  /** Selected 노트 슬러그. 쓴 순서가 표시 순서(번호)고, 첫 항목이 크게 표시된다. */
  slugs: string[]
}

const defaultOptions: FeaturedNotesOptions = {
  recentExcludeCount: 6,
  slugs: [],
}

/** 슬러그를 노트로 해석한다. 미해결·중복·초과는 빌드 로그에 경고를 남긴다. */
function resolveSlugs(slugs: string[], files: FileData[]): FileData[] {
  const bySlug = new Map(files.map((f) => [f.slug as string, f]))
  const resolved: FileData[] = []
  const seen = new Set<string>()

  for (const slug of slugs) {
    if (seen.has(slug)) {
      console.warn(`[featured-notes] 중복된 슬러그를 건너뜁니다: "${slug}"`)
      continue
    }
    seen.add(slug)
    const file = bySlug.get(slug)
    if (!file) {
      console.warn(`[featured-notes] 슬러그를 찾을 수 없어 건너뜁니다: "${slug}"`)
      continue
    }
    resolved.push(file)
  }

  if (resolved.length > MAX_SLOTS) {
    console.warn(
      `[featured-notes] 슬롯은 ${MAX_SLOTS}개인데 ${resolved.length}개가 지정됐습니다. ` +
        `뒤 ${resolved.length - MAX_SLOTS}개는 표시되지 않습니다.`,
    )
  }
  return resolved.slice(0, MAX_SLOTS)
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

    const curated = resolveSlugs(opts.slugs, files)

    // recent-notes-index와 같은 정렬 기준(최신순)으로 상위 N개를 재현해 제외.
    const recentPostsSlugs = new Set(
      [...files]
        .sort((a, b) => getTime(b) - getTime(a))
        .slice(0, opts.recentExcludeCount)
        .map((f) => f.slug as string),
    )

    const exclude = new Set([...curated.map((f) => f.slug as string), ...recentPostsSlugs])
    const needed = MAX_SLOTS - curated.length
    // 자동 채움분만 최신순으로 정렬한다 — curated의 순서는 그대로 둔다.
    const autoFilled =
      needed > 0
        ? pickRoundRobin(files, needed, exclude).sort((a, b) => getTime(b) - getTime(a))
        : []

    const selected = [...curated, ...autoFilled]
    if (selected.length === 0) return <></>

    const pad = (n: number) => String(n).padStart(2, "0")
    const formatDate = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
    const titleOf = (f: FileData) =>
      (f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"

    return (
      <section class={`${displayClass ?? ""} featured-section`}>
        <div class="featured-header">
          <h2>Selected</h2>
        </div>
        <ol class="featured-tracks">
          {selected.map((item, i) => {
            const isLead = i === 0
            const href = resolveRelative(fileData.slug!, item.slug as string)
            const date = getDisplayDate(item)
            const meta = [
              getCategoryName((item.slug as string) ?? ""),
              isLead && date ? formatDate(date) : undefined,
              `${getReadingMinutes(item)}분`,
            ].filter(Boolean)
            return (
              <li class={`featured-track${isLead ? " is-lead" : ""}`}>
                <span class="featured-no">{pad(i + 1)}</span>
                <a class="featured-title" href={href}>
                  {titleOf(item)}
                </a>
                {isLead && item.description && (
                  <p class="featured-desc">{item.description as string}</p>
                )}
                <span class="featured-meta">{meta.join(" · ")}</span>
              </li>
            )
          })}
        </ol>
      </section>
    )
  }

  FeaturedNotes.css = style
  return FeaturedNotes
}) satisfies QuartzComponentConstructor<Partial<FeaturedNotesOptions>>
