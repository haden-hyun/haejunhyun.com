// quartz.ts — YAML(quartz.config.yaml)로 표현 못 하는 오버라이드.
// - og-image 템플릿 주입(og-image.overrides.tsx)
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { CustomOgImages } from "./.quartz/plugins"
import { customOgImage } from "./og-image.overrides"

// og-image의 `imageStructure`는 함수라 YAML에 못 쓴다 — 플러그인의 TS 오버라이드 훅으로 넘긴다.
CustomOgImages({ imageStructure: customOgImage })

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
