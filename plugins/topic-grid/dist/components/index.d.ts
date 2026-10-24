import { QuartzComponent } from '@quartz-community/types';

interface TopicGridOptions {
    /** true면 섹션 라벨 표시 */
    showHeader: boolean;
}
declare const _default: (userOpts?: Partial<TopicGridOptions>) => QuartzComponent;

export { _default as TopicGrid, type TopicGridOptions };
