import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/featured.scss"

/**
 * Featured: 대형 카드 1개 + 소형 카드 3개.
 *
 * 선정 로직 (원안의 3가지 옵션 중 실제 데이터에 맞는 것을 적용):
 *   1. frontmatter.featured === true 우선 사용(실측 0건 — 지금은 no-op이지만
 *      나중에 수동 큐레이션을 켜면 자동으로 우선한다)
 *   2. 부족분은 **토픽 라운드로빈**으로 채운다: 토픽별 최신 노트를 하나씩,
 *      토픽을 "자신의 최신 노트가 더 최근인 순"으로 돌며 뽑는다. 순수
 *      전체 최신순 4개를 뽑으면 Programming(38건)이 슬롯을 독식할 수 있어
 *      다양성을 위해 라운드로빈을 기본으로 둔다.
 *   3. `pinned` 태그도 실측 0건이라 이번엔 관여하지 않는다.
 *
 * 메인 카드 = 선정된 4개 중 가장 최근 것(현재성 유지), 나머지 3개는 사이드에
 * 최신순으로 배치.
 *
 * 읽기 시간: 별도 readingTime 필드가 없어(Quartz가 자동 산출해 줄 것으로 봤으나
 * 실측 결과 어느 파일에도 붙어있지 않았다) og-image.overrides.tsx와 동일한
 * 방식(단어 수 / 200wpm)으로 산출. `fileData.text`는 description 플러그인이
 * 모든 파일에 채워 넣으므로(order 70) allFiles 각 항목에서도 사용 가능함을
 * 확인함(quartz/build.ts의 allFiles = content.map(c => c[1].data)).
 *
 * "전체 보기 →" 링크(원안)는 넣지 않았다 — 연결할 Notes
 * 페이지가 아직 없음(전체 노트 페이지네이션 UI, Phase 6 범위 밖). Archive는
 * 이제 있지만 "전체 노트"와 "전체 아카이브"는 다른 개념이라 링크하지 않음.
 *
 * [2026-08-03 버그픽스] 카테고리 라벨(featured-cat)이 전부 `--accent`
 * 고정색이었다 — 목업(haejun-redesign-abc.html:104-108) 재확인 결과 실제로는
 * `.cat`이 토픽별로 다른 색(`.c-fin`, `.c-ds`, `.c-de`, `.c-cs` 등, custom.scss
 * §0의 `--c-*` 토큰)이었다. topic-grid/topics-page와 동일한 토픽→색 매핑을
 * 재사용하되, 라벨은 텍스트라 대비가 확보된 `-text` 변형을 쓴다(원본 `--c-*`
 * 그대로 쓰면 topic-grid 작업 때 확인된 것과 같은 AA 미달 문제가 재발한다).
 *
 * 홈 전용 렌더: 다른 홈 컴포넌트와 동일한 내부 가드 패턴.
 *
 * [2026-08-03 버그픽스] 초판은 홈 하단 `recent-notes-index`(RecentList,
 * "최신순 6개")와 겹침을 전혀 고려하지 않았다. 실측 결과 라운드로빈이
 * 토픽별 "가장 최신" 노트부터 뽑다 보니, 상위 4개 토픽의 최근 시점이 서로
 * 겹치지 않는 흔한 경우엔 Featured 4개가 곧 전체 최신 4개와 정확히 일치해
 * **Featured와 Recent Posts에 동일한 글이 4/4 중복**되는 문제가 있었다 —
 * 방문자가 한 스크롤 안에서 같은 글을 두 번 본다.
 *
 * 해결: `recent-notes-index`의 선정 로직(실제 노트만, 최신순 정렬, 상위 N개)은
 * 단순해 그대로 재현 가능하다. 자동(라운드로빈) 채움에서만 그 상위 N개를
 * 후보에서 제외한다. **수동 `frontmatter.featured: true`는 제외하지 않는다**
 * — 작성자가 명시적으로 지정한 의도를 존중하고, 중복 노출 여부는 작성자
 * 판단에 맡긴다.
 *
 * `recentExcludeCount`는 quartz.config.yaml의 `recent-notes-index`
 * `options.limit`과 값이 일치해야 한다(진짜 런타임 결합은 아니고 설정 값을
 * 나란히 맞추는 수준 — 두 플러그인이 서로의 존재를 모르는 채로 유지하기
 * 위한 절충. 둘 중 하나를 바꾸면 다른 쪽 주석도 함께 갱신할 것).
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

const CATEGORY_COLOR_VARS: Record<string, string> = {
  "computer-science": "--c-cs-text",
  "data-engineering": "--c-de-text",
  "data-science": "--c-ds-text",
  gis: "--c-gis-text",
  programming: "--c-prog-text",
  "finance-property": "--c-fin-text",
  tools: "--c-tool-text",
}

function getCategoryName(slug: string): string {
  const key = slug.split("/")[0] ?? ""
  return CATEGORY_NAMES[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function getCategoryColorVar(slug: string): string {
  const key = slug.split("/")[0] ?? ""
  return CATEGORY_COLOR_VARS[key] ?? "--text-3"
}

function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  // Phase 6에서 추가된 가상 페이지(topics-page/archive-page)도 같은 이유로 제외.
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

/** 토픽별 최신 노트를 하나씩, 토픽을 "자신의 최신 노트가 더 최근인 순"으로
 * 순회하며 뽑는다. 필요 개수(count)를 못 채우면 각 토픽의 다음으로 최신인
 * 노트로 2라운드를 돈다. */
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
  /** recent-notes-index의 options.limit과 동일하게 맞출 것 (자동 선정이
   * Recent Posts 상위 N개를 후보에서 제외해 중복 노출을 피한다). */
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

    // recent-notes-index가 보여줄 상위 N개(같은 정렬 기준: 최신순)를 자동
    // 선정 후보에서 제외한다. 수동 featured는 제외 대상에서 뺀다(작성자 의도 우선).
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
              style={`color:var(${getCategoryColorVar((main!.slug as string) ?? "")})`}
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
                  style={`color:var(${getCategoryColorVar((item.slug as string) ?? "")})`}
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
