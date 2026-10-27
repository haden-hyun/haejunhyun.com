import { QuartzComponent } from '@quartz-community/types';

interface NoteSpecsOptions {
    labels: {
        created: string;
        revised: string;
        updated: string;
        runtime: string;
    };
}
/**
 * 제목 아래 메타 한 줄 — 날짜 · 읽는 시간 · 독자 수 · 개념 태그(폴더 미러 태그 제외).
 * 개정·수정은 앞선 날짜와 다를 때만 나온다(getNoteDates). 구분자 `·`는 CSS가 단다.
 */
declare const _default: (userOpts?: Partial<NoteSpecsOptions>) => QuartzComponent;

export { _default as NoteSpecs };
