import { QuartzComponent } from '@quartz-community/types';

/**
 * 커스텀 footer — 기본 "Created with Quartz vX © year"를 통째로 대체한다.
 * 커뮤니티 footer 플러그인엔 문구 옵션이 없어 로컬 플러그인으로 교체.
 *
 * 텍스트 콜로폰: 열(링크 목록 또는 문단) + 하단 한 줄. 이미지 없음.
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
