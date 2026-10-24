import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { folderTitle, isListedNote, topicName } from "../../../_shared/notes"
import { resolveRelative } from "../../../_shared/path"
import { seriesIndexOf, seriesOf } from "../../../_shared/series"
import { aliasCollisions, buildTopicGraph, relations, type GraphNode, type NoteInput } from "../core/graph"
import { FONT, placeLabels, type Box } from "../core/labels"
import { layoutTopicGraph, VIEW_PORTRAIT, VIEW_SHORT, VIEW_TALL, VIEW_WIDE, type View } from "../core/layout"
import style from "./styles/topicGraph.scss"
// @ts-expect-error - inline script imported as string by esbuild loader
import script from "./scripts/topicGraph.inline.ts"
// @ts-expect-error - inline script imported as string by esbuild loader
import tocFold from "./scripts/tocFold.inline.ts"

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

// 빌드당 한 번만 — 컴포넌트는 페이지마다 렌더된다.
const warned = new Set<string>()
function warnAliasCollisions(files: FileData[]) {
  const notes = files.filter((f) => f.slug && isListedNote(f)).map((f) => ({ slug: f.slug as string, aliases: ((f.aliases as string[] | undefined) ?? []).map(String) }))
  for (const c of aliasCollisions(notes)) {
    const key = `${c.slug}|${c.alias}`
    if (warned.has(key)) continue
    warned.add(key)
    console.warn(`[topic-graph] ${c.slug}: 별칭 "${c.alias}"의 리다이렉트 슬러그가 노트 파일명(${c.hits.join(", ")})과 겹친다 — [[파일명]] 링크가 별칭 페이지로 풀려 Backlinks에서 빠진다`)
  }
}

const R_CURRENT = 5
const R_RING = 9
const R_DIRECT = 3.8
const R_SIBLING = 2.8
const R_OTHER = 1.8
const NOTE_LABEL_MAX = 22

const clip = (t: string, max: number) => ([...t].length > max ? [...t].slice(0, max - 1).join("") + "…" : t)

export default ((userOpts?: Partial<TopicGraphOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const TopicGraph: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const current = fileData as FileData
    const slug = current.slug as string | undefined
    if (!slug || !isListedNote(current)) return null
    warnAliasCollisions(allFiles as FileData[])

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

    // 확대 판은 나머지 폴더·현재 노트·직접 관련 노트도 자리가 비면 단다.
    const extra = [
      ...model.nodes.filter((n) => n.current),
      ...model.nodes.filter((n) => n.kind === "note" && rel.direct.has(n.id)),
      ...model.nodes.filter((n) => n.kind === "folder" && !labelled.includes(n)),
    ]
    const labelClass = (id: string) => {
      const n = model.nodes.find((m) => m.id === id)!
      return id === rel.cur.parent ? "tg-label here" : n.current ? "tg-label cur" : n.kind === "note" ? "tg-label note" : "tg-label"
    }

    const renderSvg = (view: View, cls: string, wide = false) => {
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
        [
          ...labelled.map((n) => ({ id: n.id, text: n.label, bold: n.id === rel.cur.parent, at: at(n.id), gap: 7 })),
          ...(wide ? extra : []).map((n) => ({
            id: n.id,
            text: n.kind === "note" ? clip(n.label, NOTE_LABEL_MAX) : n.label,
            bold: n.current,
            at: at(n.id),
            gap: n.current ? R_RING + 3 : 7,
            optional: true,
          })),
        ],
        obstacles,
        view,
      )
      return (
        <svg class={cls} viewBox={`0 0 ${view.w} ${view.h}`} role="group" aria-label={`${topicName(slug)} topic graph`}>
          <g class="tg-world">
          <g class="tg-edges">
            {edges.map((e) => {
              const a = at(e.s)
              const b = at(e.t)
              const hot = e.kind !== "tree" && touches(e.s, e.t)
              return (
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} class={`tg-e tg-${e.kind}${hot ? " hot" : ""}`} data-s={e.s} data-t={e.t} />
              )
            })}
          </g>
          <g class="tg-nodes">
            {nodes.map((n) => {
              const p = at(n.id)
              const here = n.id === rel.cur.parent
              let shape
              if (n.kind === "topic") shape = <circle r={4.5} class="tg-topic" />
              else if (n.kind === "folder") {
                const s = here ? 7 : 6
                shape = <rect x={-s / 2} y={-s / 2} width={s} height={s} class={here ? "tg-folder here" : "tg-folder"} />
              } else if (n.current)
                shape = (
                  <>
                    <circle r={R_RING} class="tg-current-ring" />
                    <circle r={R_CURRENT} class="tg-current" />
                  </>
                )
              else if (rel.direct.has(n.id)) shape = <circle r={R_DIRECT} class="tg-direct" />
              else if (rel.siblings.has(n.id)) shape = <circle r={R_SIBLING} class="tg-sibling" />
              else shape = <circle r={R_OTHER} class="tg-other" />
              const tags = n.kind === "note" ? tagLine(n) : ""
              return (
                <g
                  class={`tg-n${n.current ? " current" : ""}`}
                  tabindex={0}
                  role="link"
                  aria-label={tipOf(n) + (tags ? ` · ${tags}` : "")}
                  aria-current={n.current ? "page" : undefined}
                  transform={`translate(${p.x},${p.y})`}
                  data-href={hrefOf(n)}
                  data-id={n.id}
                  data-tip={tipOf(n)}
                  data-name={n.label}
                  data-tags={tags || undefined}
                >
                  <circle r={R_RING} class="tg-hit" />
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
                class={labelClass(l.id)}
                data-for={l.id}
              >
                {l.text}
              </text>
            ))}
          </g>
          </g>
        </svg>
      )
    }

    return (
      <div class={["topic-graph", displayClass].filter(Boolean).join(" ")}>
        <div class="topic-graph-head">
          <h3 class="topic-graph-title">{opts.title}</h3>
          <span class="topic-graph-topic">{topicName(slug)}</span>
          <button type="button" class="topic-graph-btn topic-graph-expand" aria-label="Expand graph" aria-haspopup="dialog" title="확대 보기">
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M7.5 1.5h3v3M4.5 10.5h-3v-3M10.5 1.5 7 5M1.5 10.5 5 7" />
            </svg>
          </button>
          <button type="button" class="global-graph-icon topic-graph-btn topic-graph-global" aria-label="Global Graph" title="Global graph (⌘G)">
            ⌘G
          </button>
        </div>
        <div class="topic-graph-box">
          {renderSvg(VIEW_TALL, "tg-tall")}
          {renderSvg(VIEW_SHORT, "tg-short")}
          <div class="topic-graph-tip" hidden></div>
        </div>
        <dialog class="topic-graph-dialog" aria-label={`${opts.title} · ${topicName(slug)}`}>
          <div class="topic-graph-sheet">
            <div class="topic-graph-head">
              <h3 class="topic-graph-title">{opts.title}</h3>
              <span class="topic-graph-topic">{topicName(slug)}</span>
              <button type="button" class="topic-graph-btn topic-graph-close" aria-label="Close" title="닫기 (Esc)">
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                </svg>
              </button>
            </div>
            <div class="topic-graph-box tg-wide-box">
              {renderSvg(VIEW_WIDE, "tg-wide tg-land", true)}
              {renderSvg(VIEW_PORTRAIT, "tg-wide tg-port", true)}
              <div class="topic-graph-tip" hidden></div>
            </div>
          </div>
        </dialog>
      </div>
    )
  }

  TopicGraph.css = style
  // 긴 TOC 접기도 우측 island 판정이라 여기 싣는다. 주의: 두 스크립트의 축약된 최상위 이름이 겹치므로 IIFE로 가둔다.
  TopicGraph.afterDOMLoaded = script + ";\n(() => {\n" + tocFold + "\n})();"
  return TopicGraph
}) satisfies QuartzComponentConstructor<Partial<TopicGraphOptions>>
