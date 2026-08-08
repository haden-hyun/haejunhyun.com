import { h } from "preact"
import type { QuartzTransformerPlugin } from "@quartz-community/types"

/**
 * GoatCounter 트래킹 스크립트를 `<head>`에 주입한다.
 *
 * - native provider가 있지만 `analytics:`는 provider를 하나만 받는다.
 *   이 사이트는 Google Analytics를 쓰므로 추가 head 리소스로 넣는다
 * - visitor-counter가 읽는 방문 수의 출처다. 함께 유지할 것
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
    // 주의: no-op이지만 지우면 안 된다 — Quartz의 transformer 검증이
    // textTransform/markdownPlugins/htmlPlugins 중 하나를 요구한다.
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
