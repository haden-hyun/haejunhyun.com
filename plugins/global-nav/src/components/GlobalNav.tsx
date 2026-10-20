import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/globalNav.scss"
import { getListDate } from "../../../_shared/noteMeta"
import { isRealNote } from "../../../_shared/notes"

/**
 * 글로벌 내비 — `Home | Topics | Archive | Notes`. 현재는 topbar 배치.
 *
 * - `condition`을 걸지 않는다 — 홈 포함 전 페이지에 항상 보여야 한다
 * - 주의: `position: "header"`는 쓸 수 없다. YAML 스키마 enum에 없고,
 *   config-loader의 positions 레코드도 left/right/beforeBody/afterBody 4개뿐이라
 *   등록해도 에러 없이 조용히 버려진다(사실상 죽은 슬롯)
 * - Notes는 전용 페이지가 없다. 노트 위에선 링크가 아닌 `<span>`으로 죽이고,
 *   그 밖에선 최신 노트로 보낸다. 전용 페이지가 생기면 static 항목으로 바꾸면 된다
 * - About은 자기소개 콘텐츠가 있어야 추가 가능. NAV_ITEMS에 항목만 넣으면 된다
 */

type NavItem =
  | { label: string; kind: "static"; slug: string }
  | { label: string; kind: "latest-note" }

const NAV_ITEMS: NavItem[] = [
  { label: "Home", kind: "static", slug: "index" },
  { label: "Topics", kind: "static", slug: "topics" },
  { label: "Archive", kind: "static", slug: "archive" },
  { label: "Notes", kind: "latest-note" },
]

// 노트가 하나도 없을 때 Notes의 목적지. 빈 아카이브가 깨진 링크보다 낫다.
const LATEST_NOTE_FALLBACK = "archive"

// 홈 Recent Notes 맨 윗줄과 Notes의 목적지가 항상 같은 노트여야 한다 — 같은 목록 날짜를 쓴다.
const getSortTime = (f: QuartzPluginData & Record<string, unknown>): number =>
  getListDate(f)?.getTime() ?? 0

function findLatestNoteSlug(allFiles: QuartzComponentProps["allFiles"]): string | null {
  let latest: (typeof allFiles)[number] | null = null
  for (const f of allFiles) {
    const slug = f.slug as string | undefined
    if (!slug || !f.frontmatter?.title || !isRealNote(slug)) continue
    if (latest === null || getSortTime(f) > getSortTime(latest)) latest = f
  }
  return (latest?.slug as string | undefined) ?? null
}

export default (() => {
  const GlobalNav: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) || "index"
    const onNote = isRealNote(currentSlug) && Boolean(fileData.frontmatter?.title)

    return (
      <nav class={`${displayClass ?? ""} global-nav`}>
        {NAV_ITEMS.map((item) => {
          // 노트 위의 Notes는 자기 자신을 가리키게 두지 않는다 — 스크롤이 튀고
          // 히스토리만 쌓인다. 링크 자체를 없앤다.
          if (item.kind === "latest-note" && onNote) {
            return (
              <span class="global-nav-link active" aria-current="page">
                {item.label}
              </span>
            )
          }

          const isActive = item.kind === "static" && currentSlug === item.slug
          const targetSlug =
            item.kind === "static"
              ? item.slug
              : (findLatestNoteSlug(allFiles) ?? LATEST_NOTE_FALLBACK)

          return (
            <a
              class={`global-nav-link${isActive ? " active" : ""}`}
              href={resolveRelative(currentSlug, targetSlug)}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    )
  }

  GlobalNav.css = style
  return GlobalNav
}) satisfies QuartzComponentConstructor
