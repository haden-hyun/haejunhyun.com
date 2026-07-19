import { QuartzTransformerPlugin } from '@quartz-community/types';

/**
 * v4 parity: v4's `quartz/components/Head.tsx` hardcoded a GoatCounter tracking
 * `<script>` tag directly into `<head>`, in addition to (not instead of) the
 * `analytics.provider: "google"` config already handled by the built-in Head
 * component + `componentResources.ts` (v5 has native `provider: "goatcounter"`
 * support too, but `analytics:` only accepts a single provider, and this site
 * already runs Google Analytics — so the GoatCounter script has to be added as
 * an *extra* head resource rather than by switching providers).
 *
 * The VisitorCounter local plugin (Task 10) reads visit counts from the
 * GoatCounter API independently of this script, but the counts it reads are
 * only accurate if this tracking script is actually recording pageviews.
 *
 * This is a plain transformer plugin (no layout/component) that injects the
 * exact static script tag v4 used, via the `externalResources().additionalHead`
 * extension point in `quartz/components/Head.tsx` — no core file edits needed.
 */
interface GoatcounterTrackingOptions {
    /** GoatCounter site subdomain, e.g. "haejunhyun" for haejunhyun.goatcounter.com */
    site: string;
    /** URL of the GoatCounter counter script */
    scriptSrc: string;
}
declare const GoatcounterTracking: QuartzTransformerPlugin<Partial<GoatcounterTrackingOptions>>;

export { type GoatcounterTrackingOptions, GoatcounterTracking as default };
