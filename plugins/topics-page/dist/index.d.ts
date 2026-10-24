import { QuartzPageTypePlugin } from '@quartz-community/types';

/**
 * 내비의 "Topics" 라우트 — 토픽마다 섹션 라벨 + 시리즈 행 + 1단 폴더 행(폴더 페이지 §4.16 문법).
 * 수치·부제는 전부 allFiles 런타임 집계, 토픽 표는 `_shared/topics.ts` 하나.
 */
interface TopicsContentOptions {
    /** 시리즈 키 → 표시명. 주의: folder-listing·series-box·series-pager·series-roadmap 옵션과 같게 둘 것. */
    seriesTitles: Record<string, string>;
}

declare const TopicsPage: QuartzPageTypePlugin<Partial<TopicsContentOptions>>;

export { TopicsPage };
