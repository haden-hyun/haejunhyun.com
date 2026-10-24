import { QuartzPageTypePlugin } from '@quartz-community/types';

interface TopicsContentOptions {
    /** 시리즈 키 → 표시명. 주의: folder-listing·series-box·series-pager·series-roadmap 옵션과 같게 둘 것. */
    seriesTitles: Record<string, string>;
}

declare const TopicsPage: QuartzPageTypePlugin<Partial<TopicsContentOptions>>;

export { TopicsPage };
