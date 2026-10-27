import { QuartzComponent } from '@quartz-community/types';

interface TopicGraphOptions {
    title: string;
    /** 폴더 표시명. quartz.config.yaml의 `&folderTitles` 앵커를 받는다. */
    folderTitles: Record<string, string>;
}
declare const _default: (userOpts?: Partial<TopicGraphOptions>) => QuartzComponent;

export { _default as TopicGraph };
