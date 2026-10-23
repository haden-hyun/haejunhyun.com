import type {
  QuartzComponentConstructor,
  QuartzPageTypePluginInstance,
  QuartzTransformerPluginInstance,
  TreeTransform,
} from "@quartz-community/types"
import type { Element, Root as HtmlRoot } from "hast"
import type { Paragraph, Root } from "mdast"
import { SKIP, visit } from "unist-util-visit"
import type { SeriesFile } from "../../_shared/series"
import { parseSpec, type RoadmapSpec } from "./parse"
import { buildRoadmap } from "./roadmap"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import roadmapScript from "./scripts/roadmap.inline.ts"
import styles from "./styles/roadmap.scss"

export interface SeriesRoadmapOptions {
  seriesTitles: Record<string, string>
}

const Empty: QuartzComponentConstructor = () => () => null

// ```series-roadmap 펜스를 자리표시 div로 바꾸고, allFiles가 있는 렌더 시점 treeTransform(pageType 훅, match는 항상 false)에서 로드맵으로 채운다.
export default function SeriesRoadmap(
  userOpts?: Partial<SeriesRoadmapOptions>,
): QuartzTransformerPluginInstance & QuartzPageTypePluginInstance {
  const seriesTitles = userOpts?.seriesTitles ?? {}

  const resolveRoadmaps: TreeTransform = (root, slug, componentData) => {
    visit(root as HtmlRoot, "element", (node: Element) => {
      const raw = node.properties?.dataSeriesRoadmap
      if (typeof raw !== "string") return
      const warn = (msg: string) => console.warn(`[series-roadmap] ${slug}: ${msg}`)
      let spec: RoadmapSpec
      try {
        spec = JSON.parse(raw) as RoadmapSpec
      } catch {
        warn("자리표시 데이터를 읽지 못했다 — 노드를 그대로 둔다")
        return SKIP
      }
      const nav = buildRoadmap(
        spec,
        seriesTitles[spec.series] ?? spec.series,
        componentData.allFiles as SeriesFile[],
        slug,
        warn,
        componentData.fileData as SeriesFile,
      )
      node.properties = { className: ["series-roadmap"], id: "series-roadmap" }
      node.children = nav ? [nav] : []
      return SKIP
    })
  }

  return {
    name: "SeriesRoadmap",
    markdownPlugins() {
      return [
        () => (tree: Root, file) => {
          visit(tree, "code", (node, index, parent) => {
            if (node.lang !== "series-roadmap" || index === undefined || !parent) return
            const result = parseSpec(node.value)
            if (!result.ok) {
              console.warn(`[series-roadmap] ${file.path}: ${result.error}`) // 원본 코드블록을 그대로 둔다
              return
            }
            // 폴더 목록(folder-listing)이 시리즈 카드의 로드맵 링크를 이 표시로 찾는다.
            file.data.seriesRoadmap = result.spec.series
            parent.children[index] = {
              type: "paragraph",
              data: { hName: "div", hProperties: { dataSeriesRoadmap: JSON.stringify(result.spec) } },
              children: [],
            } as unknown as Paragraph
            return SKIP
          })
        },
      ]
    },
    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
        js: [{ script: roadmapScript, loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
    match: () => false,
    layout: "series-roadmap",
    body: Empty,
    treeTransforms: () => [resolveRoadmaps],
  }
}
