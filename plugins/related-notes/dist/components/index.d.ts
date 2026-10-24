import { QuartzComponent } from '@quartz-community/types';

interface RelatedNotesOptions {
    limit: number;
    /** Backlinks 패널에 이미 있는 노트는 뺀다(같은 island에 같은 제목이 두 번 뜨지 않게). */
    excludeBacklinks: boolean;
}
/** 노트 하단 Related — 링크 > 같은 시리즈 > 개념 태그 순위로 최대 limit편. 기준 점수를 넘는 노트가 없으면 그리지 않는다. */
declare const _default: (userOpts?: Partial<RelatedNotesOptions>) => QuartzComponent;

export { _default as RelatedNotes };
