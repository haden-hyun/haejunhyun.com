import { QuartzComponent } from '@quartz-community/types';

interface TopicGridOptions {
    /** true면 헤더(라벨 + 토픽 페이지 링크) 표시 */
    showHeader: boolean;
}
declare const _default: (userOpts?: Partial<TopicGridOptions>) => QuartzComponent;

export { _default as TopicGrid, type TopicGridOptions };
