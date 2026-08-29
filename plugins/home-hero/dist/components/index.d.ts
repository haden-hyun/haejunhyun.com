import { QuartzComponent } from '@quartz-community/types';

/**
 * Hero + StatsStrip + 방문자 카운터 — 홈 전용.
 *
 * - 홈 전용 렌더는 내부 slug 가드. `condition: is-index`는 내장에 없다
 * - 통계는 전부 allFiles 런타임 집계. 하드코딩 금지
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
    /** 아바타 이미지 경로(예: "./static/avatar.png"). 있으면 이니셜 원보다 우선. */
    avatarImage?: string;
    /**
     * 히어로 배경 이미지. 마크업만 얹고 켜고 끄는 것은 hero.scss가 한다 —
     * 다크에서만 밤 히어로가 되고, 라이트에서는 배경·베일이 꺼지며 아바타 열이 돌아온다.
     */
    backgroundImage?: string;
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
