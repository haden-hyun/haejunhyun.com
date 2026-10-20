import { QuartzTransformerPlugin } from '@quartz-community/types';

interface AnimStep {
    say: string;
    on: string[];
    flow: string[];
}
interface Base {
    alt: string;
    caption?: string;
}
interface StepsSpec extends Base {
    kind: "steps";
    scene: string;
    steps: AnimStep[];
    interval: number;
    autoplay: boolean;
}
interface CanvasSpec extends Base {
    kind: "canvas";
    src: string;
    height: number;
    cycle: number;
    hold: number;
}
interface VideoSpec extends Base {
    kind: "video";
    src: string;
    poster?: string;
}
type AnimSpec = StepsSpec | CanvasSpec | VideoSpec;
type ParseResult = {
    ok: true;
    spec: AnimSpec;
} | {
    ok: false;
    error: string;
};
declare function parseSpec(source: string): ParseResult;

/**
 * ```anim 코드펜스(YAML)를 단계형 SVG · 캔버스 루프 데모 · 루프 영상 위젯으로 바꾼다.
 * 주의: data-src는 CrawlLinks가 고치지 않으므로 자산 경로를 여기서 직접 해석한다.
 */
declare const AnimWidgets: QuartzTransformerPlugin;

export { type AnimSpec, AnimWidgets as default, parseSpec };
