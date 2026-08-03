import { QuartzComponent } from '@quartz-community/types';

interface TopicGridOptions {
    /** true면 헤더("Topics" + "전체 N개") 표시 */
    showHeader: boolean;
}
declare const _default: (userOpts?: Partial<TopicGridOptions>) => QuartzComponent;

export { _default as TopicGrid, type TopicGridOptions };
