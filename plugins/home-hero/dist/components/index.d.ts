import { QuartzComponent } from '@quartz-community/types';

/**
 * Hero + StatsStrip. 두 컴포넌트를 하나의 패키지로 묶은 이유: StatsStrip이
 * Hero 내부 하단에 위치해 분리할 이유가 없고, 패키지 수 = 빌드 대상 수라
 * 나눌수록 빌드가 늘어난다.
 *
 * 홈 전용 렌더: `condition: is-index`는 내장되어 있지 않고(not-index의 역만
 * 있음), 등록에 실패해도 안전하지만("컴포넌트 항상 렌더"로 폴백) 실패 시
 * 모든 노트 페이지에 Hero가 뜨는 눈에 띄는 회귀가 생긴다. 위험을 감수할
 * 이유가 없어 recent-notes-index와 동일하게 컴포넌트 내부 가드를 쓴다.
 *
 * 통계는 전부 allFiles 런타임 집계 — 목업이 가정한 "129 노트"는 실측 결과
 * 90으로 틀렸고, 최다 토픽도 Data Science(38)가 아니라 Programming이었다.
 * 콘텐츠 규모를 눈으로 어림한 값은 믿지 말 것. 하드코딩 금지.
 */
type Link = {
    label: string;
    href: string;
    primary?: boolean;
};
interface HomeHeroOptions {
    eyebrow: string;
    /** \n으로 줄바꿈 */
    headline: string;
    description: string;
    links: Link[];
    /** avatarImage가 없을 때만 쓰이는 폴백 (이니셜 원) */
    avatarInitial: string;
    /** [2026-08-04] 실제 아바타 이미지 경로(예: "./static/avatar.png"). 설정 시
     *  avatarInitial 원 대신 이 이미지를 렌더. 설계 당시엔 쓸 이미지가 없어
     *  이니셜로 대체했었다 — 이제 있으므로 우선한다. */
    avatarImage?: string;
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
