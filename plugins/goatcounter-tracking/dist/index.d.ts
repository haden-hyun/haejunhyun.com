import { QuartzTransformerPlugin } from '@quartz-community/types';

/**
 * GoatCounter 트래킹 스크립트를 `<head>`에 주입한다.
 *
 * - native provider 대신 head 리소스로 넣는다(`analytics:`는 비워 둔다)
 * - home-hero 메타 줄이 읽는 방문 수의 출처다. 함께 유지할 것
 * - `headMeta`로 검색엔진 소유 확인 `<meta>`도 같은 자리에 주입한다
 */
interface GoatcounterTrackingOptions {
    /** GoatCounter site subdomain, e.g. "haejunhyun" for haejunhyun.goatcounter.com */
    site: string;
    /** URL of the GoatCounter counter script */
    scriptSrc: string;
    /** `<head>`에 넣을 `<meta name content>` 목록(검색엔진 소유 확인용) */
    headMeta: {
        name: string;
        content: string;
    }[];
}
declare const GoatcounterTracking: QuartzTransformerPlugin<Partial<GoatcounterTrackingOptions>>;

export { type GoatcounterTrackingOptions, GoatcounterTracking as default };
