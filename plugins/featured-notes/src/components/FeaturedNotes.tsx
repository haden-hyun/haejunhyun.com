import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { getListDate, readingMinutes } from "../../../_shared/noteMeta"
import { buildRecentRows, byListDateDesc, isListedNote, topicName } from "../../../_shared/notes"
import { resolveRelative } from "../util/path"
import style from "./styles/featured.scss"

/**
 * Featured — 홈 전용. 번호 + 제목 + "토픽 · N분" 4행.
 *
 * - `options.slugs`가 유일한 지정 수단. 쓴 순서가 표시 순서(번호)
 * - 부족분은 토픽 라운드로빈으로 채운다 (전체 최신순은 큰 토픽이 슬롯을 독식)
 * - Recent Notes에 나온 노트는 지정·자동 채움 모두에서 뺀다(중복 노출 금지)
 *
 * 주의: 목록 순서를 최신순으로 다시 정렬하지 말 것. 순서 제어가 이 방식의 목적이다.
 */

const MAX_SLOTS = 4

type FileData = QuartzPluginData & Record<string, unknown>

/** recent-notes-index와 같은 목록 날짜 — max(created, revised ?? created). */
function getTime(f: FileData): number {
  return getListDate(f)?.getTime() ?? 0
}

/** Recent Notes 표에 나오는 노트 슬러그 — 묶음 행의 구성원 포함. 규칙은 recent-notes-index와 같은 _shared 구현. */
function getRecentSlugs(files: FileData[], limit: number): Set<string> {
  const sorted = files
    .filter((f) => (f.frontmatter as { title?: string } | undefined)?.title)
    .sort(byListDateDesc)
  const rows = buildRecentRows(sorted, limit)
  return new Set(rows.flatMap((r) => (r.kind === "note" ? [r.file] : r.files)).map((f) => f.slug as string))
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
  /** Featured 노트 슬러그. 쓴 순서가 표시 순서(번호). */
  slugs: string[]
}

const defaultOptions: FeaturedNotesOptions = {
  recentExcludeCount: 5,
  slugs: [],
}

/** 슬러그를 노트로 해석한다. 미해결·중복·Recent 중복·초과는 빌드 로그에 경고를 남긴다. */
function resolveSlugs(slugs: string[], files: FileData[], recent: Set<string>): FileData[] {
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
    if (recent.has(slug)) {
      console.warn(`[featured-notes] Recent Notes에 이미 나와 건너뜁니다: "${slug}"`)
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

    const files = (allFiles as FileData[]).filter((f) => isListedNote(f))
    const recent = getRecentSlugs(files, opts.recentExcludeCount)
    const curated = resolveSlugs(opts.slugs, files, recent)

    const exclude = new Set([...curated.map((f) => f.slug as string), ...recent])
    const needed = MAX_SLOTS - curated.length
    // 자동 채움분만 최신순으로 정렬한다 — curated의 순서는 그대로 둔다.
    const autoFilled =
      needed > 0
        ? pickRoundRobin(files, needed, exclude).sort((a, b) => getTime(b) - getTime(a))
        : []

    const selected = [...curated, ...autoFilled]
    if (selected.length === 0) return <></>

    const pad = (n: number) => String(n).padStart(2, "0")
    const titleOf = (f: FileData) =>
      (f.frontmatter as { title?: string } | undefined)?.title ?? "Untitled"
    // 요약 = summary-description이 채운 frontmatter.description(원고의 [!summary] 콜아웃).
    const descOf = (f: FileData) =>
      (f.frontmatter as { description?: string } | undefined)?.description ?? ""

    return (
      <section class={`${displayClass ?? ""} featured-section`} aria-labelledby="featured-h">
        <h2 id="featured-h" class="featured-label">
          Featured
        </h2>
        <ol class="featured-tracks">
          {selected.map((item, i) => {
            const minutes = readingMinutes(item.text as string | undefined)
            const meta = [topicName((item.slug as string) ?? ""), minutes ? `${minutes} min` : ""]
              .filter(Boolean)
              .join(" · ")
            const desc = descOf(item)
            return (
              <li class={i === 0 ? "is-lead" : undefined}>
                <a class="featured-row" href={resolveRelative(fileData.slug!, item.slug as string)}>
                  <span class="featured-no">{pad(i + 1)}</span>
                  <span class="featured-body">
                    <span class="featured-title">{titleOf(item)}</span>
                    {desc && <span class="featured-desc">{desc}</span>}
                    <span class="featured-meta">{meta}</span>
                  </span>
                </a>
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
