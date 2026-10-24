import { QuartzComponent } from '@quartz-community/types';

/**
 * TopicGrid — 홈 전용. 토픽 이름 · 점선 · 노트 수의 색인 목록.
 *
 * - 토픽별 색·이모지 없음. 식별은 라벨 타이포가 한다 (DESIGN-SYSTEM.md)
 * - 정렬은 노트 수 내림차순
 * - 부제는 그 토픽의 1단 폴더 표시명(런타임 집계) — 토픽 표는 `_shared/topics.ts` 하나
 */
interface TopicGridOptions {
    /** true면 섹션 라벨 표시 */
    showHeader: boolean;
}
declare const _default: (userOpts?: Partial<TopicGridOptions>) => QuartzComponent;

export { _default as TopicGrid, type TopicGridOptions };
