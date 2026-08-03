import { QuartzComponent } from '@quartz-community/types';

/**
 * design-handoff.md §4.1 Hero + StatsStrip 스펙 구현. 두 컴포넌트를 하나의
 * 패키지로 묶은 이유는 REDESIGN-GUIDE.md §1 참고 (StatsStrip이 Hero 내부
 * 하단에 위치 — 분리할 이유가 없고, 패키지 수 = 빌드 대상 수).
 *
 * 홈 전용 렌더: `condition: is-index`는 내장되어 있지 않고(not-index의 역만
 * 있음), 등록에 실패해도 안전하지만("컴포넌트 항상 렌더"로 폴백) 실패 시
 * 모든 노트 페이지에 Hero가 뜨는 눈에 띄는 회귀가 생긴다. 위험을 감수할
 * 이유가 없어 recent-notes-index와 동일하게 컴포넌트 내부 가드를 쓴다.
 *
 * 통계는 전부 allFiles 런타임 집계 — 목업의 "129 노트"는 실측 결과 90으로
 * 틀렸음이 확인됨(REDESIGN-GUIDE.md F2). 하드코딩 금지.
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
    /** 실제 아바타 이미지 미정(design-handoff.md §Q1) — 이니셜 원으로 대체 */
    avatarInitial: string;
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
