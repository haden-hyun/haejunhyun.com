import { QuartzTransformerPlugin } from '@quartz-community/types';

interface SummaryDescriptionOptions {
    /** 슬러그 → description. 원고에 description·요약 콜아웃이 모두 없을 때만 쓴다. */
    fallbackDescriptions: Record<string, string>;
}
declare const SummaryDescription: QuartzTransformerPlugin<Partial<SummaryDescriptionOptions>>;

export { type SummaryDescriptionOptions, SummaryDescription as default };
