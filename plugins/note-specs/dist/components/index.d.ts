import { QuartzComponent } from '@quartz-community/types';

interface NoteSpecsOptions {
    title: string;
    labels: {
        date: string;
        runtime: string;
        topic: string;
    };
}
/**
 * 우측 사이드바 최상단 스펙 블록 — 음반 슬리브의 사양 표기.
 * 제목 바로 아래에 뭉쳐 있던 날짜·읽기시간·태그를 여기로 옮겨
 * 제목에서 본문으로 가는 길을 비운다.
 */
declare const _default: (userOpts?: Partial<NoteSpecsOptions>) => QuartzComponent;

export { _default as NoteSpecs };
