import { QuartzComponent } from '@quartz-community/types';

/**
 * 홈 마스트헤드 — 메타 한 줄 + 헤드라인 + 설명 + 링크(좌) + 비닐판 BGM 토글(우).
 * 비닐은 래스터 이미지가 아니라 CSS로 그린다.
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
    /** \n으로 줄바꿈 */
    headline: string;
    description: string;
    links: Link[];
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
