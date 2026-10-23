import type { FullSlug, QuartzComponent, QuartzComponentProps } from "@quartz-community/types"
import { byDateAndAlphabeticalFolderFirst } from "@quartz-community/folder-page/components"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { Root } from "hast"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { resolveRelative } from "../../../_shared/path"
import { groupBySeries, seriesLabel, type SeriesGroup } from "../../../_shared/series"
import type { FolderListingOptions } from "../pageType"
import {
  buildSection,
  flattenSections,
  type FolderSection,
  type PageEntry,
  type TrieNode,
} from "../folderTree"
import style from "./styles/folderListing.scss"

interface RowContext {
  slug: FullSlug
  locale: string
  sort: (a: PageEntry, b: PageEntry) => number
  seriesTitles: Record<string, string>
  /** 시리즈 키 → 로드맵이 있는 노트(series-roadmap이 남긴 data.seriesRoadmap). */
  roadmaps: Map<string, PageEntry>
}

function getDate(page: PageEntry): Date | undefined {
  const type = page.defaultDateType as keyof NonNullable<PageEntry["dates"]> | undefined
  return type ? page.dates?.[type] : undefined
}

const sectionId = (path: string) => `folder-${path.replace(/\//g, "-")}`

// 폴더 경로를 되풀이하는 태그(`data-engineering/infra`, `docker`)는 같은 섹션 모든 행에 붙어 변별력이 없다.
function isPathTag(tag: string, page: PageEntry): boolean {
  const folder = (page.slug ?? "").split("/").slice(0, -1).join("/")
  return `/${folder}/`.includes(`/${tag}/`)
}

function PageRow({ page, ctx }: { page: PageEntry; ctx: RowContext }) {
  const date = getDate(page)
  const tags = ((page.frontmatter?.tags ?? []) as string[]).filter((t) => !isPathTag(t, page))
  const label = seriesLabel(page)
  return (
    <li class="section-li">
      <div class="section">
        <p class="meta">
          {date && (
            <time dateTime={date.toISOString()}>
              {date.toLocaleDateString(ctx.locale, { year: "numeric", month: "short", day: "2-digit" })}
            </time>
          )}
        </p>
        <div class="desc">
          <h3>
            {label && <span class="series-index">{label}</span>}
            <a href={resolveRelative(ctx.slug, page.slug!)} class="internal">
              {page.frontmatter?.title}
            </a>
          </h3>
        </div>
        {tags.length > 0 && (
          <ul class="tags">
            {tags.map((tag) => (
              <li>
                <a class="internal tag-link" href={resolveRelative(ctx.slug, `tags/${tag}`)}>
                  {tag}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

/** 폴더 노트 — 그 폴더 페이지 본문이라 섹션 맨 위 소개 행으로 그 페이지를 가리킨다. */
function IntroRow({ page, ctx }: { page: PageEntry; ctx: RowContext }) {
  const desc = (page as { description?: unknown }).description
  return (
    <ul class="section-ul folder-intro">
      <li class="section-li">
        <div class="section">
          <p class="meta">폴더 소개</p>
          <div class="desc">
            <h3>
              <a href={resolveRelative(ctx.slug, page.slug!)} class="internal">
                {page.frontmatter?.title}
              </a>
            </h3>
          </div>
          {typeof desc === "string" && desc !== "" && <p class="intro-desc">{desc}</p>}
        </div>
      </li>
    </ul>
  )
}

function SeriesActions({ group, ctx }: { group: SeriesGroup<PageEntry>; ctx: RowContext }) {
  const first = group.items[0]!
  const roadmap = ctx.roadmaps.get(group.series)
  return (
    <p class="series-actions">
      <a href={resolveRelative(ctx.slug, first.slug!)} class="internal" data-no-popover="true">
        {seriesLabel(first) ?? "1편"}부터 읽기
      </a>
      {roadmap && (
        <a
          href={`${resolveRelative(ctx.slug, roadmap.slug!)}#series-roadmap`}
          class="internal"
          data-no-popover="true"
        >
          로드맵
        </a>
      )}
    </p>
  )
}

function SeriesHead({ group, ctx }: { group: SeriesGroup<PageEntry>; ctx: RowContext }) {
  return (
    <>
      <span class="series-eyebrow">시리즈 · {group.items.length}편</span>
      <span class="series-name">{ctx.seriesTitles[group.series] ?? group.series}</span>
    </>
  )
}

function SeriesRows({ group, ctx }: { group: SeriesGroup<PageEntry>; ctx: RowContext }) {
  return (
    <ul class="section-ul series-rows">
      {group.items.map((page) => (
        <PageRow page={page} ctx={ctx} />
      ))}
    </ul>
  )
}

/** 섹션에 비시리즈 노트가 섞이면 접힌 카드, 시리즈뿐이면 펼친 그룹. 링크는 summary 밖에 둬 토글과 겹치지 않는다. */
function SeriesRun(props: { group: SeriesGroup<PageEntry>; ctx: RowContext; folded: boolean }) {
  const { group, ctx } = props
  if (!props.folded) {
    return (
      <li class="series-li">
        <div class="series-group">
          <div class="series-head">
            <SeriesHead group={group} ctx={ctx} />
          </div>
          <SeriesActions group={group} ctx={ctx} />
          <SeriesRows group={group} ctx={ctx} />
        </div>
      </li>
    )
  }
  return (
    <li class="series-li">
      <div class="series-card">
        <details>
          <summary class="series-head">
            <SeriesHead group={group} ctx={ctx} />
            <span class="series-chevron" aria-hidden="true" />
          </summary>
          <SeriesRows group={group} ctx={ctx} />
        </details>
        <SeriesActions group={group} ctx={ctx} />
      </div>
    </li>
  )
}

function NoteList({ notes, ctx }: { notes: PageEntry[]; ctx: RowContext }) {
  if (notes.length === 0) return null
  const groups = groupBySeries([...notes].sort(ctx.sort))
  const folded = groups.some((g) => !g.series) && groups.some((g) => g.series)
  return (
    <ul class="section-ul">
      {groups.map((group) =>
        group.series ? (
          <SeriesRun group={group} ctx={ctx} folded={folded} />
        ) : (
          <PageRow page={group.items[0]!} ctx={ctx} />
        ),
      )}
    </ul>
  )
}

function SectionBody({ section, ctx }: { section: FolderSection; ctx: RowContext }) {
  return (
    <>
      {section.intro && <IntroRow page={section.intro} ctx={ctx} />}
      <NoteList notes={section.notes} ctx={ctx} />
    </>
  )
}

const Count = ({ n }: { n: number }) => <span class="folder-count"> · {n}</span>

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export default (opts?: Partial<FolderListingOptions>) => {
  const showFolderCount = opts?.showFolderCount ?? true
  const folderTitles = opts?.folderTitles ?? {}
  const seriesTitles = opts?.seriesTitles ?? {}

  const FolderListing: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, cfg, allFiles } = props
    const slug = fileData.slug as FullSlug | undefined
    const folder = (props.ctx as { trie?: TrieNode } | undefined)?.trie?.findNode(slug?.split("/") ?? [])
    if (!slug || !folder) return null

    const roadmaps = new Map<string, PageEntry>()
    for (const file of allFiles as PageEntry[]) {
      const series = file.seriesRoadmap
      if (typeof series === "string" && !roadmaps.has(series)) roadmaps.set(series, file)
    }
    const ctx: RowContext = {
      slug,
      locale: (cfg as { locale?: string } | undefined)?.locale ?? "en-US",
      sort: byDateAndAlphabeticalFolderFirst(cfg) as RowContext["sort"],
      seriesTitles,
      roadmaps,
    }

    const root = buildSection(folder, folderTitles, false)
    const sections = root.children

    const ast = tree as Root
    const content =
      ast.children.length === 0
        ? (fileData as { description?: unknown }).description
        : toJsxRuntime(ast, { Fragment, jsx, jsxs, elementAttributeNameCase: "html" } as never)
    const classes = ((fileData.frontmatter?.cssclasses as string[] | undefined) ?? []).join(" ")

    return (
      <div class="popover-hint">
        <article class={classes}>
          <div class="markdown-preview-view markdown-rendered">{content}</div>
        </article>
        <div class="page-listing folder-index">
          {showFolderCount && (
            <p class="folder-meta">
              {plural(root.count, "note")}
              {sections.length > 0 && ` · ${plural(sections.length, "section")}`}
            </p>
          )}
          {sections.length > 1 && (
            <nav class="folder-jump" aria-label="섹션 바로가기">
              <ul>
                {sections.map((s) => (
                  <li>
                    <a href={`#${sectionId(s.path)}`} data-no-popover="true">
                      {s.title}
                      <span class="folder-jump-count">{s.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <NoteList notes={root.notes} ctx={ctx} />
          {sections.map((s) => (
            <section class="folder-section" aria-labelledby={sectionId(s.path)}>
              <h2 id={sectionId(s.path)} class="folder-heading">
                <a href={resolveRelative(slug, `${s.path}/index`)} class="internal" data-no-popover="true">
                  {s.title}
                </a>
                <Count n={s.count} />
              </h2>
              <SectionBody section={s} ctx={ctx} />
              {flattenSections(s.children).map((sub) => (
                <section class="folder-sub" aria-labelledby={sectionId(sub.path)}>
                  <h3 id={sectionId(sub.path)} class="folder-subheading">
                    <a
                      href={resolveRelative(slug, `${sub.path}/index`)}
                      class="internal"
                      data-no-popover="true"
                    >
                      {sub.title}
                    </a>
                    <Count n={sub.count} />
                  </h3>
                  <SectionBody section={sub} ctx={ctx} />
                </section>
              ))}
            </section>
          ))}
        </div>
      </div>
    )
  }

  FolderListing.css = style
  return FolderListing
}
