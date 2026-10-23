// 현재 노트의 최상위 주제 그래프(주제·폴더·노트 + 구조·링크·시리즈 간선). 빌드 산출물 없이 표로 검증할 수 있게 순수 함수로 둔다.

export interface NoteInput {
  slug: string
  title: string
  links: string[]
  tags: string[]
  series: string
  seriesIndex?: number
}

export type NodeKind = "topic" | "folder" | "note"

export interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  parent: string | null
  depth: number
  current: boolean
  /** 노트: 폴더 미러 태그를 뺀 개념 태그. */
  tags: string[]
  /** 폴더: 하위 노트 수. */
  count: number
  slug?: string
}

export interface GraphEdge {
  s: string
  t: string
  kind: "tree" | "link" | "series"
}

export interface TopicGraphModel {
  topic: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  current: string
}

const dirOf = (slug: string): string => slug.split("/").slice(0, -1).join("/")
const folderId = (path: string): string => "f:" + path

/** 태그 경로가 노트 폴더 경로와 같거나 그 접두면 폴더를 되풀이할 뿐이다. */
export function isFolderMirrorTag(slug: string, tag: string): boolean {
  const dir = dirOf(slug)
  return dir === tag || dir.startsWith(tag + "/")
}

/** 링크는 crawl-links의 단순화 슬러그다. 그대로 없으면 끝 경로가 하나로 맞는 노트로 푼다. */
function resolveLink(link: string, slugs: Set<string>, all: string[]): string | undefined {
  const clean = link.replace(/\/index$/, "").replace(/^\.?\//, "")
  if (slugs.has(clean)) return clean
  const hits = all.filter((s) => s.endsWith("/" + clean))
  return hits.length === 1 ? hits[0] : undefined
}

export function buildTopicGraph(
  current: string,
  notes: NoteInput[],
  folderLabel: (path: string) => string,
  topicLabel: (topic: string) => string,
): TopicGraphModel | undefined {
  const topic = current.split("/")[0]
  if (!topic || !current.includes("/")) return undefined
  const inTopic = notes.filter((n) => n.slug.startsWith(topic + "/")).sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
  if (!inTopic.some((n) => n.slug === current)) return undefined

  const folders = new Set<string>()
  for (const n of inTopic) {
    const parts = dirOf(n.slug).split("/")
    for (let i = 1; i <= parts.length; i++) folders.add(parts.slice(0, i).join("/"))
  }
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  for (const path of [...folders].sort()) {
    const parent = dirOf(path)
    nodes.push({
      id: folderId(path),
      kind: path === topic ? "topic" : "folder",
      label: path === topic ? topicLabel(topic) : folderLabel(path),
      parent: parent ? folderId(parent) : null,
      depth: path.split("/").length - 1,
      current: false,
      tags: [],
      count: inTopic.filter((n) => n.slug.startsWith(path + "/")).length,
    })
    if (parent) edges.push({ s: folderId(path), t: folderId(parent), kind: "tree" })
  }
  for (const n of inTopic) {
    nodes.push({
      id: n.slug,
      kind: "note",
      label: n.title,
      parent: folderId(dirOf(n.slug)),
      depth: n.slug.split("/").length - 1,
      current: n.slug === current,
      tags: n.tags.filter((t) => !isFolderMirrorTag(n.slug, t)),
      count: 0,
      slug: n.slug,
    })
    edges.push({ s: n.slug, t: folderId(dirOf(n.slug)), kind: "tree" })
  }

  const slugs = new Set(inTopic.map((n) => n.slug))
  const all = inTopic.map((n) => n.slug)
  const pairs = new Set<string>()
  for (const n of inTopic) {
    for (const raw of n.links) {
      const t = resolveLink(raw, slugs, all)
      if (!t || t === n.slug) continue
      const key = [n.slug, t].sort().join("|")
      if (pairs.has(key)) continue
      pairs.add(key)
      edges.push({ s: n.slug, t, kind: "link" })
    }
  }
  const bySeries = new Map<string, NoteInput[]>()
  for (const n of inTopic) if (n.series && n.seriesIndex !== undefined) bySeries.set(n.series, [...(bySeries.get(n.series) ?? []), n])
  for (const key of [...bySeries.keys()].sort()) {
    const chain = bySeries.get(key)!.sort((a, b) => a.seriesIndex! - b.seriesIndex!)
    for (let i = 1; i < chain.length; i++) edges.push({ s: chain[i - 1]!.slug, t: chain[i]!.slug, kind: "series" })
  }
  return { topic, nodes, edges, current }
}

/** 현재 노트 기준 관계 — 링크 이웃·시리즈 앞뒤·같은 폴더 형제·상위 폴더. */
export function relations(model: TopicGraphModel) {
  const cur = model.nodes.find((n) => n.current)!
  const link = new Set<string>()
  const series = new Set<string>()
  for (const e of model.edges) {
    if (e.kind === "tree") continue
    const other = e.s === cur.id ? e.t : e.t === cur.id ? e.s : undefined
    if (other) (e.kind === "link" ? link : series).add(other)
  }
  const siblings = new Set(model.nodes.filter((n) => n.kind === "note" && n.parent === cur.parent && n.id !== cur.id).map((n) => n.id))
  const ancestors = new Set<string>()
  const byId = new Map(model.nodes.map((n) => [n.id, n]))
  for (let p = cur.parent; p; p = byId.get(p)?.parent ?? null) ancestors.add(p)
  return { cur, link, series, direct: new Set([...link, ...series]), siblings, ancestors }
}

/**
 * 별칭 리다이렉트 슬러그가 노트 파일명과 겹치는 경우. 링크 해석(shortest)이 노트 대신 루트의 별칭 페이지를 골라
 * 링크는 리다이렉트로 도착하지만 Backlinks에선 빠진다. 상대 별칭(./·../)은 노트 폴더 기준으로 푼다.
 */
export function aliasCollisions(notes: { slug: string; aliases: string[] }[]): { slug: string; alias: string; hits: string[] }[] {
  const byBase = new Map<string, string[]>()
  for (const n of notes) {
    const base = n.slug.split("/").pop()!.toLowerCase()
    byBase.set(base, [...(byBase.get(base) ?? []), n.slug])
  }
  const out: { slug: string; alias: string; hits: string[] }[] = []
  for (const n of notes) {
    for (const alias of n.aliases) {
      const parts = alias.startsWith("./") || alias.startsWith("../") ? [...dirOf(n.slug).split("/"), ...alias.split("/")] : alias.split("/")
      const resolved: string[] = []
      for (const p of parts) {
        if (p === "." || p === "") continue
        if (p === "..") resolved.pop()
        else resolved.push(p)
      }
      const target = resolved.join("/")
      if (!target || target === n.slug) continue
      const hits = byBase.get(target.split("/").pop()!.toLowerCase()) ?? []
      if (hits.length > 0 && target.split("/").length < Math.min(...hits.map((h) => h.split("/").length)))
        out.push({ slug: n.slug, alias, hits })
    }
  }
  return out
}
