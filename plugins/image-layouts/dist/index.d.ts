import { QuartzTransformerPlugin } from '@quartz-community/types';

interface ImageLayoutsOptions {
    defaultLayout: string;
    carouselHeight: string;
    gap: string;
}
declare const ImageLayouts: QuartzTransformerPlugin<Partial<ImageLayoutsOptions>>;

export { type ImageLayoutsOptions, ImageLayouts as default };
