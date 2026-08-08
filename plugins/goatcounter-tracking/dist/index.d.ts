import { QuartzTransformerPlugin } from '@quartz-community/types';

/**
 * GoatCounter 트래킹 스크립트를 `<head>`에 주입한다.
 *
 * - native provider가 있지만 `analytics:`는 provider를 하나만 받는다.
 *   이 사이트는 Google Analytics를 쓰므로 추가 head 리소스로 넣는다
 * - visitor-counter가 읽는 방문 수의 출처다. 함께 유지할 것
 */
interface GoatcounterTrackingOptions {
    /** GoatCounter site subdomain, e.g. "haejunhyun" for haejunhyun.goatcounter.com */
    site: string;
    /** URL of the GoatCounter counter script */
    scriptSrc: string;
}
declare const GoatcounterTracking: QuartzTransformerPlugin<Partial<GoatcounterTrackingOptions>>;

export { type GoatcounterTrackingOptions, GoatcounterTracking as default };
