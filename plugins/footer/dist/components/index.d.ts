import { QuartzComponent } from '@quartz-community/types';

/**
 * 커스텀 footer — 기본 "Created with Quartz vX © year"를 통째로 대체한다.
 * 커뮤니티 footer 플러그인엔 문구 옵션이 없어 로컬 플러그인으로 교체.
 *
 * 방문자 카운터는 여기 없다 — home-hero(아바타 아래)가 렌더한다.
 */
interface FooterOptions {
    links: Record<string, string>;
}
declare const _default: (opts?: FooterOptions) => QuartzComponent;

export { type FooterOptions as F, _default as Footer };
