// 노트 레코드 행(DESIGN-SYSTEM §4.16) — 폴더 페이지와 태그 페이지(tag-listing)가 함께 쓴다.
// 주의: tag-listing이 상대 경로로 번들하므로 여기에 npm 런타임 의존성을 들이지 말 것(folder-listing의 node_modules로 해석된다).
import type { FullSlug } from "@quartz-community/types"
import { formatYmd, getListDate } from "../../../_shared/noteMeta"
import { byListDateDesc } from "../../../_shared/notes"
import { resolveRelative } from "../../../_shared/path"
import { seriesLabel } from "../../../_shared/series"
import type { PageEntry } from "../folderTree"

export interface RowContext {
  slug: FullSlug
  seriesTitles: Record<string, string>
  /** 시리즈 키 → 로드맵이 있는 노트(series-roadmap이 남긴 data.seriesRoadmap). */
  roadmaps: Map<string, PageEntry>
}

// 목록 날짜(posted → created) 최신순, 같은 날이면 제목순.
export const byListDate = (a: PageEntry, b: PageEntry): number =>
  byListDateDesc(a, b) ||
  String(a.frontmatter?.title ?? "").localeCompare(String(b.frontmatter?.title ?? ""), "ko", { numeric: true })

export const descOf = (page: PageEntry): string =>
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
export function PageRow({ page, ctx, track }: { page: PageEntry; ctx: Pick<RowContext, "slug">; track?: boolean }) {
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
