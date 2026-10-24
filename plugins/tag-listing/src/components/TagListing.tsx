import type { FullSlug, QuartzComponent, QuartzComponentProps } from "@quartz-community/types"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { Root } from "hast"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { byListDateDesc, isListedNote } from "../../../_shared/notes"
import { resolveRelative } from "../../../_shared/path"
import { seriesIndexOf, seriesLabel, seriesOf } from "../../../_shared/series"
import type { PageEntry } from "../../../folder-listing/src/folderTree"
import { byListDate, PageRow } from "../../../folder-listing/src/components/rows"
import style from "../../../folder-listing/src/components/styles/folderListing.scss"

// "a/b" 태그는 "a"·"a/b" 두 페이지에 속한다(업스트림 tag-page와 같은 규칙).
const tagPrefixes = (tag: string): string[] =>
  tag.split("/").map((_, i, parts) => parts.slice(0, i + 1).join("/"))

const tagsOf = (file: PageEntry): string[] => {
  const tags = file.frontmatter?.tags
  return Array.isArray(tags) ? tags.map(String).flatMap(tagPrefixes) : []
}

// 같은 날 같은 시리즈 편은 편 순으로 — 묶지 않으므로 제목순이면 편 순서가 뒤섞인다.
const byListDateThenEpisode = (a: PageEntry, b: PageEntry): number => {
  const ia = seriesIndexOf(a)
  const ib = seriesIndexOf(b)
  const sameSeries = seriesOf(a) !== "" && seriesOf(a) === seriesOf(b) && ia !== undefined && ib !== undefined
  return byListDateDesc(a, b) || (sameSeries ? ia - ib : 0) || byListDate(a, b)
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

/** 태그 색인 행 = 메타 열 `N notes` │ 태그명 + 최근 노트 2편. */
function TagRow({ tag, notes, slug }: { tag: string; notes: PageEntry[]; slug: FullSlug }) {
  const recent = notes.slice(0, 2).map((page) => page.frontmatter?.title).join(" · ")
  return (
    <li>
      <a class="fi-row" href={resolveRelative(slug, `tags/${tag}` as FullSlug)} data-no-popover="true">
        <span class="fi-kind">{plural(notes.length, "note")}</span>
        <span class="fi-title">#{tag}</span>
        {recent && <span class="fi-desc">{recent}</span>}
      </a>
    </li>
  )
}

export default () => {
  const TagListing: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles } = props
    const slug = fileData.slug as FullSlug | undefined
    if (!slug) return null

    const notes = (allFiles as PageEntry[]).filter(isListedNote).sort(byListDateThenEpisode)
    const ast = tree as Root
    const content =
      ast.children.length === 0
        ? (fileData as { description?: unknown }).description
        : toJsxRuntime(ast, { Fragment, jsx, jsxs, elementAttributeNameCase: "html" } as never)
    const classes = ((fileData.frontmatter?.cssclasses as string[] | undefined) ?? []).join(" ")

    let listing
    if (slug === "tags" || slug === "tags/index") {
      const byTag = new Map<string, PageEntry[]>()
      for (const page of notes) {
        for (const tag of new Set(tagsOf(page))) byTag.set(tag, [...(byTag.get(tag) ?? []), page])
      }
      const tags = [...byTag.keys()].sort((a, b) => a.localeCompare(b))
      const tagged = notes.filter((page) => tagsOf(page).length > 0).length
      listing = (
        <>
          <p class="folder-meta">
            {plural(tags.length, "tag")} · {plural(tagged, "note")}
          </p>
          <ul class="fi-rows fi-root">
            {tags.map((tag) => (
              <TagRow tag={tag} notes={byTag.get(tag)!} slug={slug} />
            ))}
          </ul>
        </>
      )
    } else {
      const tag = slug.slice("tags/".length)
      const pages = notes.filter((page) => tagsOf(page).includes(tag))
      listing = (
        <>
          <p class="folder-meta">{plural(pages.length, "note")}</p>
          <ul class="fi-rows fi-root">
            {pages.map((page) => (
              <PageRow page={page} ctx={{ slug }} track={seriesLabel(page) !== undefined} />
            ))}
          </ul>
        </>
      )
    }

    return (
      <div class="popover-hint">
        <article class={classes}>
          <div class="markdown-preview-view markdown-rendered">{content}</div>
        </article>
        <div class="page-listing folder-index tag-index">{listing}</div>
      </div>
    )
  }

  TagListing.css = style
  return TagListing
}
