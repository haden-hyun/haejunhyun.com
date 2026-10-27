import { QuartzComponent } from '@quartz-community/types';

interface RecentNotesForIndexOptions {
    title?: string;
    limit: number;
    linkToMore: string | false;
    linkToMoreLabel: string;
    showTags: boolean;
    /** 시리즈 키 → 표시명. quartz.config.yaml의 `&seriesTitles` 앵커를 받는다. */
    seriesTitles: Record<string, string>;
    /** 폴더 표시명. quartz.config.yaml의 `&folderTitles` 앵커를 받는다. */
    folderTitles: Record<string, string>;
}
declare const _default: (userOpts?: Partial<RecentNotesForIndexOptions>) => QuartzComponent;

export { type RecentNotesForIndexOptions as R, _default as RecentNotesForIndex };
