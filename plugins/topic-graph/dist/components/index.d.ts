import { QuartzComponent } from '@quartz-community/types';

interface TopicGraphOptions {
    title: string;
    /** 폴더 표시명 — folder-listing의 folderTitles와 같게 둘 것. */
    folderTitles: Record<string, string>;
}
declare const _default: (userOpts?: Partial<TopicGraphOptions>) => QuartzComponent;

export { _default as TopicGraph };
