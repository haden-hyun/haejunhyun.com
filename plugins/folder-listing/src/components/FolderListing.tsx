import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import type { FolderPageOptions } from "@quartz-community/folder-page"
import { byDateAndAlphabeticalFolderFirst } from "@quartz-community/folder-page/components"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { Root } from "hast"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { resolveRelative } from "../../../_shared/path"
import { groupBySeries, seriesLabel, type SeriesGroup } from "../../../_shared/series"
import style from "./styles/folderListing.scss"

type PageEntry = QuartzPluginData & Record<string, unknown>

interface TrieNode {
  isFolder: boolean
  children: TrieNode[]
  data: unknown
  slug: string
  displayName: string
  findNode(path: string[]): TrieNode | undefined
}

// 업스트림 FolderContent의 pagesFromTrie·mostRecentDatesFromChildren과 같은 동작.
function mostRecentDates(children: TrieNode[]): PageEntry["dates"] {
  let dates: PageEntry["dates"] | undefined
  for (const child of children) {
    const d = (child.data as { dates?: PageEntry["dates"] } | null)?.dates
    if (!d) continue
    if (!dates) {
      dates = { ...d }
      continue
    }
    if (d.created > dates.created) dates.created = d.created
    if (d.modified > dates.modified) dates.modified = d.modified
    if (d.published > dates.published) dates.published = d.published
  }
  return dates ?? { created: new Date(), modified: new Date(), published: new Date() }
}

function pagesFromTrie(folder: TrieNode, showSubfolders: boolean): PageEntry[] {
  const pages: PageEntry[] = []
  for (const node of folder.children) {
    const data = node.data as PageEntry | null
    if (data) {
      if (data.unlisted !== true) pages.push(data)
    } else if (node.isFolder && showSubfolders) {
      pages.push({
        slug: node.slug as FullSlug,
        dates: mostRecentDates(node.children),
        frontmatter: { title: node.displayName, tags: [] },
      } as PageEntry)
    }
  }
  return pages
}

function getDate(page: PageEntry): Date | undefined {
  const type = page.defaultDateType as keyof NonNullable<PageEntry["dates"]> | undefined
  return type ? page.dates?.[type] : undefined
}

function PageRow({ page, slug, locale }: { page: PageEntry; slug: FullSlug; locale: string }) {
  const date = getDate(page)
  const tags = (page.frontmatter?.tags ?? []) as string[]
  const label = seriesLabel(page)
  return (
    <li class="section-li">
      <div class="section">
        <p class="meta">
          {date && (
            <time dateTime={date.toISOString()}>
              {date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" })}
            </time>
          )}
        </p>
        <div class="desc">
          <h3>
            {label && <span class="series-index">{label}</span>}
            <a href={resolveRelative(slug, page.slug!)} class="internal">
              {page.frontmatter?.title}
            </a>
          </h3>
        </div>
        <ul class="tags">
          {tags.map((tag) => (
            <li>
              <a class="internal tag-link" href={resolveRelative(slug, `tags/${tag}`)}>
                {tag}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/** 시리즈 묶음의 렌더 지점 — 그룹 헤더·접기를 얹을 땐 여기만 바꾼다. 지금은 편 행만 잇는다. */
function SeriesRun(props: { group: SeriesGroup<PageEntry>; slug: FullSlug; locale: string }) {
  return (
    <>
      {props.group.items.map((page) => (
        <PageRow page={page} slug={props.slug} locale={props.locale} />
      ))}
    </>
  )
}

export default (opts?: FolderPageOptions) => {
  const showFolderCount = opts?.showFolderCount ?? true
  const showSubfolders = opts?.showSubfolders ?? true

  const FolderListing: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, cfg } = props
    const slug = fileData.slug as FullSlug | undefined
    const folder = (props.ctx as { trie?: TrieNode } | undefined)?.trie?.findNode(slug?.split("/") ?? [])
    if (!slug || !folder) return null

    const pages = pagesFromTrie(folder, showSubfolders)
    // 기존 순서(폴더 먼저 → defaultDateType 내림차순)를 정한 뒤 시리즈만 모은다.
    const groups = groupBySeries(pages.sort(byDateAndAlphabeticalFolderFirst(cfg)))
    const locale = (cfg as { locale?: string } | undefined)?.locale ?? "en-US"

    const root = tree as Root
    const content =
      root.children.length === 0
        ? (fileData as { description?: unknown }).description
        : toJsxRuntime(root, { Fragment, jsx, jsxs, elementAttributeNameCase: "html" } as never)
    const classes = ((fileData.frontmatter?.cssclasses as string[] | undefined) ?? []).join(" ")
    const count = pages.length

    return (
      <div class="popover-hint">
        <article class={classes}>
          <div class="markdown-preview-view markdown-rendered">{content}</div>
        </article>
        <div class="page-listing">
          {showFolderCount && (
            <p>{count === 1 ? "1 item under this folder." : `${count} items under this folder.`}</p>
          )}
          <div>
            <ul class="section-ul">
              {groups.map((group) =>
                group.series ? (
                  <SeriesRun group={group} slug={slug} locale={locale} />
                ) : (
                  <PageRow page={group.items[0]!} slug={slug} locale={locale} />
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  FolderListing.css = style
  return FolderListing
}
