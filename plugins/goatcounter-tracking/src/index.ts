import { h } from "preact"
import type { QuartzTransformerPlugin } from "@quartz-community/types"

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

export interface GoatcounterTrackingOptions {
  /** GoatCounter site subdomain, e.g. "haejunhyun" for haejunhyun.goatcounter.com */
  site: string
  /** URL of the GoatCounter counter script */
  scriptSrc: string
}

const defaultOptions: GoatcounterTrackingOptions = {
  site: "haejunhyun",
  scriptSrc: "//gc.zgo.at/count.js",
}

const GoatcounterTracking: QuartzTransformerPlugin<Partial<GoatcounterTrackingOptions>> = (
  userOpts,
) => {
  const opts: GoatcounterTrackingOptions = { ...defaultOptions, ...userOpts }

  return {
    name: "GoatcounterTracking",
    // No-op: only `externalResources` is used, but Quartz's transformer-category
    // validation requires at least one of textTransform/markdownPlugins/htmlPlugins
    // to be present on the instance (see config-loader.ts's `validateCategory`).
    htmlPlugins() {
      return []
    },
    externalResources() {
      return {
        additionalHead: [
          h("script", {
            "data-goatcounter": `https://${opts.site}.goatcounter.com/count`,
            async: true,
            src: opts.scriptSrc,
          }),
        ],
      }
    },
  }
}

export default GoatcounterTracking
