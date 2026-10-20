import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { Root } from "mdast"
import { SKIP, visit } from "unist-util-visit"
import { buildNode } from "./build-nodes"
import { parseSpec } from "./parse"
import { resolveAsset } from "./resolve"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import animScript from "./scripts/anim.inline.ts"
import styles from "./styles/anim.scss"

/**
 * ```anim 코드펜스(YAML)를 단계형 SVG · 캔버스 루프 데모 · 루프 영상 위젯으로 바꾼다.
 * 주의: data-src는 CrawlLinks가 고치지 않으므로 자산 경로를 여기서 직접 해석한다.
 */
const AnimWidgets: QuartzTransformerPlugin = () => {
  return {
    name: "AnimWidgets",
    markdownPlugins(ctx) {
      return [
        () => (tree: Root, file) => {
          const slug = (file.data as { slug?: string }).slug ?? ""
          visit(tree, "code", (node, index, parent) => {
            if (node.lang !== "anim") return
            if (index === undefined || parent === null || parent === undefined) return

            const result = parseSpec(node.value)
            if (!result.ok) {
              console.warn(`[anim-widgets] ${file.path}: ${result.error}`) // 원본 코드블록을 그대로 둔다
              return
            }

            parent.children[index] = buildNode(result.spec, (name) => {
              const url = resolveAsset(slug, name, ctx.allSlugs)
              if (!url) console.warn(`[anim-widgets] ${file.path}: 자산을 찾지 못함 (${name})`)
              return url ?? name
            })
            return SKIP
          })
        },
      ]
    },
    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
        js: [{ script: animScript, loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
  }
}

export default AnimWidgets
export { parseSpec } from "./parse"
export type { AnimSpec } from "./parse"
