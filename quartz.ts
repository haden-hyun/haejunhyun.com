import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { CustomOgImages } from "./.quartz/plugins"
import { customOgImage } from "./og-image.overrides"

// v4 parity: og-image's `imageStructure` is function-typed and can't be expressed
// in quartz.config.yaml, so it's supplied here via the plugin's TS-override hook.
// See og-image.overrides.tsx for what changed vs. the plugin's own default template.
CustomOgImages({ imageStructure: customOgImage })

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
