import { QuartzPageTypePlugin } from '@quartz-community/types';

interface TopicsContentOptions {
    /** 시리즈 키 → 표시명. quartz.config.yaml의 `&seriesTitles` 앵커를 받는다. */
    seriesTitles: Record<string, string>;
}

declare const TopicsPage: QuartzPageTypePlugin<Partial<TopicsContentOptions>>;

export { TopicsPage };
