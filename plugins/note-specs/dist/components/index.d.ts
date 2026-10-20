import { QuartzComponent } from '@quartz-community/types';

interface NoteSpecsOptions {
    title: string;
    labels: {
        created: string;
        revised: string;
        updated: string;
        runtime: string;
        topic: string;
    };
}
/**
 * 좌측 사이드바 최상단 스펙 블록 — 음반 슬리브의 사양 표기.
 * 개정·수정 행은 앞선 날짜와 다를 때만 나온다(getNoteDates).
 */
declare const _default: (userOpts?: Partial<NoteSpecsOptions>) => QuartzComponent;

export { _default as NoteSpecs };
