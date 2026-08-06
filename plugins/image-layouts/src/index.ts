import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { Root } from "mdast"
import { SKIP, visit } from "unist-util-visit"
import { buildCarouselNode, buildLayoutNode, buildMasonryNode } from "./build-nodes"
import { resolveLayout } from "./layouts"
import { parseBlock } from "./parse-block"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import carouselScript from "./scripts/carousel.inline.ts"
import styles from "./styles/imageLayouts.scss"

export interface ImageLayoutsOptions {
  defaultLayout: string
  carouselHeight: string
  gap: string
}

const defaults: ImageLayoutsOptions = {
  defaultLayout: "single",
  carouselHeight: "24rem",
  gap: "0.5rem",
}

/**
 * ```image-layout 코드펜스를 그리드/메이슨리/캐러셀 마크업으로 바꾼다.
 *
 * 핵심은 컨테이너가 아니라 안에 넣는 **진짜 mdast image 노드**다. 원시 HTML 문자열로
 * <img>를 만들면 CrawlLinks/Assets 파이프라인을 우회해 중첩 슬러그에서 404가 난다.
 * ⚠️ 그래서 order는 CrawlLinks(60)보다 반드시 앞서야 한다.
 */
const ImageLayouts: QuartzTransformerPlugin<Partial<ImageLayoutsOptions>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  return {
    name: "ImageLayouts",
    markdownPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "code", (node, index, parent) => {
            if (!node.lang?.startsWith("image-layout")) return
            if (index === undefined || parent === null || parent === undefined) return

            const block = parseBlock(node.lang, node.value)
            if (!block || block.images.length === 0) return // 원본 코드블록을 그대로 둔다

            const spec = resolveLayout(block.layout, block.opts.grid, opts.defaultLayout)
            parent.children[index] =
              spec.kind === "carousel"
                ? buildCarouselNode(block, opts)
                : spec.kind === "masonry"
                  ? buildMasonryNode(block, spec, opts)
                  : buildLayoutNode(block, spec, opts)

            return SKIP
          })
        },
      ]
    },
    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
        js: [{ script: carouselScript, loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
  }
}

export default ImageLayouts
