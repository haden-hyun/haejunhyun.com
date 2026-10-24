import { QuartzComponent } from '@quartz-community/types';

interface RecentNotesForIndexOptions {
    title?: string;
    limit: number;
    linkToMore: string | false;
    linkToMoreLabel: string;
    showTags: boolean;
}
declare const _default: (userOpts?: Partial<RecentNotesForIndexOptions>) => QuartzComponent;

export { type RecentNotesForIndexOptions as R, _default as RecentNotesForIndex };
