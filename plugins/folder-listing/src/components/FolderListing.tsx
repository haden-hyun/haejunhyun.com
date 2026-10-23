import type { FullSlug, QuartzComponent, QuartzComponentProps } from "@quartz-community/types"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { Root } from "hast"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { formatYmd, getListDate } from "../../../_shared/noteMeta"
import { byListDateDesc } from "../../../_shared/notes"
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
  seriesTitles: Record<string, string>
  /** 시리즈 키 → 로드맵이 있는 노트(series-roadmap이 남긴 data.seriesRoadmap). */
  roadmaps: Map<string, PageEntry>
}

const sectionId = (path: string) => `folder-${path.replace(/\//g, "-")}`

// 목록 날짜(posted → created) 최신순, 같은 날이면 제목순.
const byListDate = (a: PageEntry, b: PageEntry): number =>
  byListDateDesc(a, b) ||
  String(a.frontmatter?.title ?? "").localeCompare(String(b.frontmatter?.title ?? ""), "ko", { numeric: true })

const descOf = (page: PageEntry): string =>
  typeof page.description === "string" ? page.description.trim() : ""

function Ymd({ page, class: cls }: { page: PageEntry; class: string }) {
  const date = getListDate(page)
  return date ? (
    <time class={cls} dateTime={formatYmd(date)}>
      {formatYmd(date)}
    </time>
  ) : (
    <span class={cls} />
  )
}

/** 노트 행 = 행 전체가 링크 하나. track이면 메타 열에 `N편`, 날짜는 끝 열. */
function PageRow({ page, ctx, track }: { page: PageEntry; ctx: RowContext; track?: boolean }) {
  const desc = descOf(page)
  return (
    <li>
      <a
        class={track ? "fi-row is-track" : "fi-row"}
        href={resolveRelative(ctx.slug, page.slug!)}
        data-no-popover="true"
      >
        {track ? <span class="fi-no">{seriesLabel(page)}</span> : <Ymd page={page} class="fi-date" />}
        <span class="fi-title">{page.frontmatter?.title}</span>
        {track && <Ymd page={page} class="fi-date fi-end" />}
        {desc && <span class="fi-desc">{desc}</span>}
      </a>
    </li>
  )
}

/** 폴더 노트 — 그 폴더 페이지 본문이라 섹션 맨 위 소개 행으로 그 페이지를 가리킨다. */
function IntroRow({ page, ctx }: { page: PageEntry; ctx: RowContext }) {
  const desc = descOf(page)
  return (
    <ul class="fi-rows">
      <li>
        <a class="fi-row is-intro" href={resolveRelative(ctx.slug, page.slug!)} data-no-popover="true">
          <span class="fi-kind">폴더 소개</span>
          <span class="fi-title">{page.frontmatter?.title}</span>
          {desc && <span class="fi-desc">{desc}</span>}
        </a>
      </li>
    </ul>
  )
}

function SeriesActions({ group, ctx }: { group: SeriesGroup<PageEntry>; ctx: RowContext }) {
  const first = group.items[0]!
  const roadmap = ctx.roadmaps.get(group.series)
  return (
    <>
      <a href={resolveRelative(ctx.slug, first.slug!)} data-no-popover="true">
        {seriesLabel(first) ?? "1편"}부터 읽기 →
      </a>
      {roadmap && (
        <a href={`${resolveRelative(ctx.slug, roadmap.slug!)}#series-roadmap`} data-no-popover="true">
          로드맵
        </a>
      )}
    </>
  )
}

function SeriesRows({ group, ctx }: { group: SeriesGroup<PageEntry>; ctx: RowContext }) {
  return (
    <ul class="fi-rows">
      {group.items.map((page) => (
        <PageRow page={page} ctx={ctx} track />
      ))}
    </ul>
  )
}

/** 섹션에 비시리즈 노트가 섞이면 접힌 행, 시리즈뿐이면 펼친 그룹. 링크는 summary 밖(펼친 안쪽)에 둔다. */
function SeriesRun(props: { group: SeriesGroup<PageEntry>; ctx: RowContext; folded: boolean }) {
  const { group, ctx } = props
  const kind = <span class="fi-kind">시리즈 · {group.items.length}편</span>
  const name = ctx.seriesTitles[group.series] ?? group.series
  if (!props.folded) {
    return (
      <li class="fi-series">
        <div class="fi-series-head">
          {kind}
          <span class="fi-series-name">{name}</span>
          <span class="fi-acts">
            <SeriesActions group={group} ctx={ctx} />
          </span>
        </div>
        <SeriesRows group={group} ctx={ctx} />
      </li>
    )
  }
  return (
    <li>
      <details class="fi-fold">
        <summary class="fi-row is-series">
          {kind}
          <span class="fi-title">{name}</span>
          <span class="fi-chev" aria-hidden="true" />
        </summary>
        <div class="fi-fold-body">
          <SeriesRows group={group} ctx={ctx} />
          <p class="fi-acts">
            <SeriesActions group={group} ctx={ctx} />
          </p>
        </div>
      </details>
    </li>
  )
}

function NoteList({ notes, ctx, root }: { notes: PageEntry[]; ctx: RowContext; root?: boolean }) {
  if (notes.length === 0) return null
  const groups = groupBySeries([...notes].sort(byListDate))
  const folded = groups.some((g) => !g.series) && groups.some((g) => g.series)
  return (
    <ul class={root ? "fi-rows fi-root" : "fi-rows"}>
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

/** 섹션 라벨 = 이름(텍스트) · 편수 · 우측 이동 링크. 제목과 이동의 역할을 나눈다. */
function SectionLabel({ section, slug, sub }: { section: FolderSection; slug: FullSlug; sub?: boolean }) {
  const Heading = sub ? "h3" : "h2"
  return (
    <div class={sub ? "fi-label is-sub" : "fi-label"}>
      <Heading id={sectionId(section.path)}>{section.title}</Heading>
      <span class="fi-count">{section.count}</span>
      <a
        class="fi-open"
        href={resolveRelative(slug, `${section.path}/index`)}
        aria-label={`${section.title} 폴더 열기`}
        data-no-popover="true"
      >
        {!sub && <span class="fi-open-word">폴더&nbsp;</span>}열기 →
      </a>
    </div>
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export default (opts?: Partial<FolderListingOptions>) => {
  const showFolderCount = opts?.showFolderCount ?? true
  const folderTitles = opts?.folderTitles ?? {}
  const seriesTitles = opts?.seriesTitles ?? {}

  const FolderListing: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles } = props
    const slug = fileData.slug as FullSlug | undefined
    const folder = (props.ctx as { trie?: TrieNode } | undefined)?.trie?.findNode(slug?.split("/") ?? [])
    if (!slug || !folder) return null

    const roadmaps = new Map<string, PageEntry>()
    for (const file of allFiles as PageEntry[]) {
      const series = file.seriesRoadmap
      if (typeof series === "string" && !roadmaps.has(series)) roadmaps.set(series, file)
    }
    const ctx: RowContext = { slug, seriesTitles, roadmaps }

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
          <NoteList notes={root.notes} ctx={ctx} root />
          {sections.map((s) => (
            <section class="folder-section" aria-labelledby={sectionId(s.path)}>
              <SectionLabel section={s} slug={slug} />
              <SectionBody section={s} ctx={ctx} />
              {flattenSections(s.children).map((sub) => (
                <section class="folder-sub" aria-labelledby={sectionId(sub.path)}>
                  <SectionLabel section={sub} slug={slug} sub />
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
