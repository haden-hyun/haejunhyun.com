import { QuartzComponent } from '@quartz-community/types';

interface SeriesNavOptions {
    seriesTitles: Record<string, string>;
}

/** 제목 아래 시리즈 상자 — 현재 위치·이전/다음·접히는 전체 목록(네이티브 details라 클라이언트 JS 없음). */
declare const _default$1: (userOpts?: Partial<SeriesNavOptions>) => QuartzComponent;

/** 본문 하단 시리즈 이전·다음 편 링크. 시리즈 노트가 아니면 렌더하지 않는다. */
declare const _default: (userOpts?: Partial<SeriesNavOptions>) => QuartzComponent;

export { type SeriesNavOptions as S, _default$1 as SeriesBox, _default as SeriesPager };
