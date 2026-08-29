import { QuartzComponent } from '@quartz-community/types';

/**
 * 커스텀 footer — 기본 "Created with Quartz vX © year"를 통째로 대체한다.
 * 커뮤니티 footer 플러그인엔 문구 옵션이 없어 로컬 플러그인으로 교체.
 *
 * 잉크 판(--stage) 위에 서는 무대형 푸터. figureImage는 배경이 투명한 컷아웃
 * 전제다 — 흰 옷이 크림 배경에서 1.06:1로 사라져 밝은 판 위에는 쓸 수 없다.
 *
 * 방문자 카운터는 여기 없다 — home-hero(아바타 아래)가 렌더한다.
 */
interface FooterOptions {
    links: Record<string, string>;
    /** 판 왼쪽 위 소문자 라벨 */
    eyebrow?: string;
    /** 라벨 아래 한 줄 제목 */
    headline?: string;
    /** 제목 아래 문단 */
    description?: string;
    /** 맨 아래 저작권 줄 */
    meta?: string;
    /** 오른쪽에 세울 컷아웃 경로(예: "./static/bluegiant/player.webp"). 없으면 판만 렌더한다. */
    figureImage?: string;
    /** 판 배경 이미지. 잉크 베일 86%가 덮으므로 분위기만 남는다. */
    backgroundImage?: string;
}
declare const _default: (opts?: FooterOptions) => QuartzComponent;

export { type FooterOptions as F, _default as Footer };
