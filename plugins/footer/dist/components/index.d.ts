import { QuartzComponent } from '@quartz-community/types';

/**
 * 콜로폰 푸터 — 업스트림 footer(문구 옵션 없음)를 대체한다.
 * - 열(링크 목록 또는 문단) + 하단 한 줄(brand · meta). 이미지 없음
 */
interface FooterColumn {
    title: string;
    /** 표시 텍스트 → 링크 */
    links?: Record<string, string>;
    /** 링크 대신 문단 */
    text?: string;
}
interface FooterOptions {
    columns: FooterColumn[];
    /** 하단 줄 왼쪽 */
    brand?: string;
    /** 하단 줄 오른쪽 저작권 */
    meta?: string;
}
declare const _default: (opts?: FooterOptions) => QuartzComponent;

export { type FooterOptions as F, _default as Footer };
