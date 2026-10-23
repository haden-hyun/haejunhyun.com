import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { folderTitle, isListedNote, topicName } from "../../../_shared/notes"
import { resolveRelative } from "../../../_shared/path"
import { seriesIndexOf, seriesOf } from "../../../_shared/series"
import { buildTopicGraph, relations, type GraphNode, type NoteInput } from "../core/graph"
import { FONT, placeLabels, type Box } from "../core/labels"
import { layoutTopicGraph, VIEW_SHORT, VIEW_TALL, type View } from "../core/layout"
import style from "./styles/topicGraph.scss"
// @ts-expect-error - inline script imported as string by esbuild loader
import script from "./scripts/topicGraph.inline.ts"

type FileData = QuartzPluginData & Record<string, unknown>

export interface TopicGraphOptions {
  title: string
  /** 폴더 표시명 — folder-listing의 folderTitles와 같게 둘 것. */
  folderTitles: Record<string, string>
}

const defaultOptions: TopicGraphOptions = { title: "Graph", folderTitles: {} }

function tagsOf(f: FileData): string[] {
  const raw: unknown = f.frontmatter?.tags
  if (Array.isArray(raw)) return raw.map(String)
  return typeof raw === "string" && raw.trim() ? [raw.trim()] : []
}

const R_CURRENT = 5
const R_RING = 9
const R_DIRECT = 3.8
const R_SIBLING = 2.8
const R_OTHER = 1.8

export default ((userOpts?: Partial<TopicGraphOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const TopicGraph: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const current = fileData as FileData
    const slug = current.slug as string | undefined
    if (!slug || !isListedNote(current)) return null

    const notes: NoteInput[] = (allFiles as FileData[])
      .filter((f) => f.slug && isListedNote(f))
      .map((f) => ({
        slug: f.slug as string,
        title: String(f.frontmatter?.title ?? f.slug),
        links: (f.links as string[] | undefined) ?? [],
        tags: tagsOf(f),
        series: seriesOf(f),
        seriesIndex: seriesIndexOf(f),
      }))
    const model = buildTopicGraph(slug, notes, (p) => folderTitle(p, opts.folderTitles), topicName)
    if (!model) return null

    const rel = relations(model)
    const touches = (s: string, t: string) => s === rel.cur.id || t === rel.cur.id
    const rank = (n: GraphNode) =>
      n.current ? 4 : rel.direct.has(n.id) ? 3 : n.kind !== "note" ? 2 : rel.siblings.has(n.id) ? 1 : 0
    const radius = (n: GraphNode) =>
      n.kind !== "note" ? 5 : n.current ? R_RING : rel.direct.has(n.id) ? R_DIRECT : rel.siblings.has(n.id) ? R_SIBLING : R_OTHER
    // 상시 라벨은 1단 폴더와 현재 노트의 상위 폴더뿐 — 현재 폴더부터 놓는다.
    const labelled = model.nodes
      .filter((n) => n.kind === "folder" && (n.depth === 1 || rel.ancestors.has(n.id)))
      .sort((a, b) => Number(b.id === rel.cur.parent) - Number(a.id === rel.cur.parent) || Number(rel.ancestors.has(b.id)) - Number(rel.ancestors.has(a.id)))
    const hrefOf = (n: GraphNode) => {
      const target = n.kind === "note" ? n.slug! : `${n.id.slice(2)}/index`
      return resolveRelative(slug, target)
    }
    const tipOf = (n: GraphNode) => (n.kind === "note" ? n.label : `${n.label} · ${n.count}편`)
    const tagLine = (n: GraphNode) => n.tags.map((t) => "#" + t).join(" ")
    const edges = [...model.edges].sort(
      (a, b) =>
        Number(a.kind !== "tree") - Number(b.kind !== "tree") || Number(touches(a.s, a.t)) - Number(touches(b.s, b.t)),
    )
    const nodes = [...model.nodes].sort((a, b) => rank(a) - rank(b))

    const renderSvg = (view: View, cls: string) => {
      const pos = layoutTopicGraph(model, view)
      const at = (id: string) => pos.get(id)!
      const obstacles: (Box & { id: string })[] = model.nodes
        .filter((n) => n.kind !== "note" || n.current || rel.direct.has(n.id) || rel.siblings.has(n.id))
        .map((n) => {
          const r = radius(n) + 2
          const p = at(n.id)
          return { id: n.id, x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r }
        })
      const labels = placeLabels(
        labelled.map((n) => ({ id: n.id, text: n.label, bold: n.id === rel.cur.parent, at: at(n.id), gap: 7 })),
        obstacles,
        view,
      )
      return (
        <svg class={cls} viewBox={`0 0 ${view.w} ${view.h}`} role="group" aria-label={`${topicName(slug)} topic graph`}>
          <g class="tg-edges">
            {edges.map((e) => {
              const a = at(e.s)
              const b = at(e.t)
              const hot = e.kind !== "tree" && touches(e.s, e.t)
              return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class={`tg-e tg-${e.kind}${hot ? " hot" : ""}`} />
            })}
          </g>
          <g class="tg-nodes">
            {nodes.map((n) => {
              const p = at(n.id)
              const here = n.id === rel.cur.parent
              let shape
              if (n.kind === "topic") shape = <circle cx={p.x} cy={p.y} r={4.5} class="tg-topic" />
              else if (n.kind === "folder") {
                const s = here ? 7 : 6
                shape = <rect x={p.x - s / 2} y={p.y - s / 2} width={s} height={s} class={here ? "tg-folder here" : "tg-folder"} />
              } else if (n.current)
                shape = (
                  <>
                    <circle cx={p.x} cy={p.y} r={R_RING} class="tg-current-ring" />
                    <circle cx={p.x} cy={p.y} r={R_CURRENT} class="tg-current" />
                  </>
                )
              else if (rel.direct.has(n.id)) shape = <circle cx={p.x} cy={p.y} r={R_DIRECT} class="tg-direct" />
              else if (rel.siblings.has(n.id)) shape = <circle cx={p.x} cy={p.y} r={R_SIBLING} class="tg-sibling" />
              else shape = <circle cx={p.x} cy={p.y} r={R_OTHER} class="tg-other" />
              const tags = n.kind === "note" ? tagLine(n) : ""
              return (
                <g
                  class={`tg-n${n.current ? " current" : ""}`}
                  tabindex={0}
                  role="link"
                  aria-label={tipOf(n) + (tags ? ` · ${tags}` : "")}
                  aria-current={n.current ? "page" : undefined}
                  data-href={hrefOf(n)}
                  data-id={n.kind !== "note" ? n.id : undefined}
                  data-tip={tipOf(n)}
                  data-tags={tags || undefined}
                  data-x={p.x}
                  data-y={p.y}
                >
                  <circle cx={p.x} cy={p.y} r={R_RING} class="tg-hit" />
                  {shape}
                </g>
              )
            })}
          </g>
          <g class="tg-labels" aria-hidden="true">
            {labels.map((l) => (
              <text
                x={Math.round(l.x * 10) / 10}
                y={Math.round(l.y * 10) / 10}
                text-anchor={l.anchor}
                font-size={FONT}
                class={l.id === rel.cur.parent ? "tg-label here" : "tg-label"}
                data-for={l.id}
              >
                {l.text}
              </text>
            ))}
          </g>
        </svg>
      )
    }

    return (
      <div class={["topic-graph", displayClass].filter(Boolean).join(" ")}>
        <div class="topic-graph-head">
          <h3 class="topic-graph-title">{opts.title}</h3>
          <span class="topic-graph-topic">{topicName(slug)}</span>
          <button type="button" class="global-graph-icon topic-graph-global" aria-label="Global Graph" title="Global graph (⌘G)">
            ⌘G
          </button>
        </div>
        <div class="topic-graph-box">
          {renderSvg(VIEW_TALL, "tg-tall")}
          {renderSvg(VIEW_SHORT, "tg-short")}
          <div class="topic-graph-tip" hidden></div>
        </div>
      </div>
    )
  }

  TopicGraph.css = style
  TopicGraph.afterDOMLoaded = script
  return TopicGraph
}) satisfies QuartzComponentConstructor<Partial<TopicGraphOptions>>
