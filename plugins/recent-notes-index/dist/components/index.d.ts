import { QuartzPluginData, QuartzComponent } from '@quartz-community/types';

type RecentNotesPluginData = QuartzPluginData & Record<string, unknown>;
interface RecentNotesForIndexOptions {
    title?: string;
    limit: number;
    linkToMore: string | false;
    showTags: boolean;
    filter: (f: RecentNotesPluginData) => boolean;
    sort: (f1: RecentNotesPluginData, f2: RecentNotesPluginData) => number;
}
declare const _default: (userOpts?: Partial<RecentNotesForIndexOptions>) => QuartzComponent;

export { type RecentNotesForIndexOptions as R, _default as RecentNotesForIndex };
