import { QuartzTransformerPlugin } from '@quartz-community/types';

interface ImageLayoutsOptions {
    defaultLayout: string;
    carouselHeight: string;
    gap: string;
}
/**
 * ```image-layout 코드펜스를 그리드/메이슨리/캐러셀 마크업으로 바꾼다.
 *
 * 핵심은 컨테이너가 아니라 안에 넣는 진짜 mdast image 노드다. 원시 HTML 문자열로
 * <img>를 만들면 CrawlLinks/Assets 파이프라인을 우회해 중첩 슬러그에서 404가 난다.
 * 주의: 그래서 order는 CrawlLinks(60)보다 반드시 앞서야 한다.
 */
declare const ImageLayouts: QuartzTransformerPlugin<Partial<ImageLayoutsOptions>>;

export { type ImageLayoutsOptions, ImageLayouts as default };
