import { QuartzTransformerPluginInstance, QuartzPageTypePluginInstance } from '@quartz-community/types';

interface SeriesRoadmapOptions {
    seriesTitles: Record<string, string>;
}
declare function SeriesRoadmap(userOpts?: Partial<SeriesRoadmapOptions>): QuartzTransformerPluginInstance & QuartzPageTypePluginInstance;

export { type SeriesRoadmapOptions, SeriesRoadmap as default };
