// 로드맵 데이터 병합·검증·마크업의 단일 구현. 블로그(hast)와 Obsidian 미리보기(DOM)가 이 노드 트리를 함께 쓴다.
import { toIndexList, type OutlineItem, type RoadmapSpec } from "../parse"

/** 발행본 한 편. id는 블로그 slug 또는 볼트 경로이고 href는 hrefFor(id)로 만든다. */
export interface PublishedEntry {
  index: number
  title: string
  question?: string
  part?: unknown
  requires?: unknown
  id: string
}

type Properties = Record<string, string | number | string[] | undefined>
export interface RText {
  type: "text"
  value: string
}
/** hast Element와 같은 모양이라 블로그는 그대로 트리에 넣는다. */
export interface RNode {
  type: "element"
  tagName: string
  properties: Properties
  children: (RNode | RText)[]
}

interface Episode {
  index: number
  part: string
  title: string
  question?: string
  requires: number[]
  planned: boolean
  id?: string
}

interface Part {
  name: string
  episodes: Episode[]
}

type Child = RNode | string | false | null | undefined

function h(tagName: string, properties: Properties, ...children: Child[]): RNode {
  return {
    type: "element",
    tagName,
    properties,
    children: children
      .filter((c): c is RNode | string => c !== false && c != null && c !== "")
      .map((c) => (typeof c === "string" ? { type: "text", value: c } : c)),
  }
}

const text = (v: unknown): string => (v == null ? "" : String(v).trim())

/** 발행본(프론트매터)과 펜스 outline을 번호로 합친다. 같은 번호면 발행본이 이긴다. */
function mergeEpisodes(spec: RoadmapSpec, published: PublishedEntry[], warn: (msg: string) => void): Episode[] {
  const outlineByIndex = new Map<number, OutlineItem>()
  for (const o of spec.outline) {
    if (outlineByIndex.has(o.index)) warn(`outline에 ${o.index}편이 여럿이다 — 첫 항목을 쓴다`)
    else outlineByIndex.set(o.index, o)
  }
  const byIndex = new Map<number, Episode>()

  for (const entry of published) {
    if (entry.index === 0) continue
    if (byIndex.has(entry.index)) {
      warn(`${entry.index}편 발행본이 여럿이다 — ${entry.id}는 뺀다`)
      continue
    }
    const part = text(entry.part) || outlineByIndex.get(entry.index)?.part || ""
    if (!part) warn(`${entry.index}편(${entry.id})에 series_part가 없다`)
    byIndex.set(entry.index, {
      index: entry.index,
      part: part || "미분류",
      title: entry.title,
      question: entry.question,
      requires: toIndexList(entry.requires),
      planned: false,
      id: entry.id,
    })
  }
  for (const o of outlineByIndex.values()) {
    if (o.index === 0 || byIndex.has(o.index)) continue
    byIndex.set(o.index, { ...o })
  }
  return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

/** 부 순서 = 그 부의 가장 작은 번호. episodes가 번호순이라 처음 나온 순서가 곧 부 순서다. */
function groupParts(episodes: Episode[]): Part[] {
  const parts: Part[] = []
  for (const ep of episodes) {
    let part = parts.find((p) => p.name === ep.part)
    if (!part) parts.push((part = { name: ep.part, episodes: [] }))
    part.episodes.push(ep)
  }
  return parts
}

/** 선을 그릴 선수 번호만 돌려준다. 같은 부 직전 편·뒤 번호·뒤 부·없는 번호는 경고하고 뺀다(부를 넘는 직전 편은 그린다). */
function validateRequires(
  ep: Episode,
  byIndex: Map<number, Episode>,
  partOrder: Map<string, number>,
  warn: (msg: string) => void,
): number[] {
  const valid: number[] = []
  for (const r of ep.requires) {
    const src = byIndex.get(r)
    if (r >= ep.index) {
      warn(`${ep.index}편 requires의 ${r}편은 자기 번호보다 앞이어야 한다 — 선을 그리지 않는다`)
    } else if (!src) {
      warn(`${ep.index}편 requires의 ${r}편은 시리즈에 없다`)
    } else if (src.part === ep.part && r === ep.index - 1) {
      warn(`${ep.index}편 requires에 같은 부 바로 앞 편(${r}편)이 있다 — 읽는 순서 화살표와 겹친다`)
    } else if (partOrder.get(src.part)! > partOrder.get(ep.part)!) {
      warn(`${ep.index}편 requires의 ${r}편은 뒤 부("${src.part}")에 있다 — 선을 그리지 않는다`)
    } else {
      valid.push(r)
    }
  }
  return valid
}

type HrefFor = (id: string) => string

function chip(r: number, target: Episode | undefined, linked: boolean, hrefFor: HrefFor): RNode {
  const label = `선수 ${r}편`
  if (!target) return h("span", { className: ["chip", "is-missing"] }, label)
  const props: Properties = { className: ["chip"], title: target.title }
  if (linked) props.dataFrom = String(r)
  if (target.id) return h("a", { ...props, href: hrefFor(target.id) }, label)
  return h("span", { ...props, tabIndex: linked ? 0 : undefined }, label)
}

/** 로드맵이 놓인 노트. 같은 시리즈의 편이면 그 카드를 "이 글"로 표시하고 링크를 넣지 않는다. */
export interface CurrentNote {
  series: string
  index: number
}

function card(
  ep: Episode,
  valid: number[],
  byIndex: Map<number, Episode>,
  hrefFor: HrefFor,
  isCurrent: boolean,
): RNode {
  const state = ep.id ? "pub" : ep.planned ? "plan" : ""
  const sub = ep.planned && !ep.id ? "예정" : ep.question
  return h(
    "li",
    {
      className: ["rm-ep", ...(state ? [`is-${state}`] : []), ...(isCurrent ? ["is-current"] : [])],
      dataNo: String(ep.index),
      dataReq: valid.join(","),
      ariaCurrent: isCurrent ? "page" : undefined,
    },
    h(
      "div",
      { className: ["rm-ep-top"] },
      h("span", { className: ["dot", ...(state ? [state] : [])], ariaHidden: "true" }),
      h("span", { className: ["no"] }, `${ep.index}편`),
      isCurrent && h("span", { className: ["rm-current"] }, "이 글"),
    ),
    h(
      "div",
      { className: ["rm-ep-title"] },
      ep.id && !isCurrent ? h("a", { href: hrefFor(ep.id) }, ep.title) : ep.title,
    ),
    sub && h("div", { className: ["rm-ep-q"] }, sub),
    ep.requires.length > 0 &&
      h(
        "div",
        { className: ["rm-req"] },
        ...ep.requires.map((r) => chip(r, byIndex.get(r), valid.includes(r), hrefFor)),
      ),
  )
}

function editDistance(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]!
}

/** 편 1개뿐인 부가 다른 부 이름과 비슷하면(공백 뺀 편집 거리 ≤ 2, 짧은 쪽 3자 이상) 오타 의심 경고. */
export function partTypoWarnings(parts: { name: string; episodes: { index: number }[] }[]): string[] {
  const chars = (s: string) => Array.from(s.replace(/\s+/g, ""))
  const out: string[] = []
  const named = new Set<string>()
  for (const p of parts) {
    if (p.episodes.length !== 1 || named.has(p.name)) continue
    const a = chars(p.name)
    const twin = parts.find((q) => {
      if (q === p) return false
      const b = chars(q.name)
      return Math.min(a.length, b.length) >= 3 && editDistance(a, b) <= 2
    })
    if (!twin) continue
    named.add(twin.name)
    out.push(`부 "${p.name}"(${p.episodes[0]!.index}편)이 "${twin.name}"과 비슷하다 — 부 이름 오타인지 확인`)
  }
  return out
}

/** 같은 부의 이웃한 두 편 사이에 발행본·outline 어디에도 없는 번호가 있으면 경고. 0편과 부 사이 공백은 보지 않는다. */
export function gapWarnings(parts: { name: string; episodes: { index: number }[] }[], known: Set<number>): string[] {
  const out: string[] = []
  for (const p of parts) {
    for (let i = 1; i < p.episodes.length; i++) {
      for (let n = p.episodes[i - 1]!.index + 1; n < p.episodes[i]!.index; n++) {
        if (!known.has(n)) out.push(`부 "${p.name}"에 ${n}편이 빠졌다 — outline 누락인지 확인`)
      }
    }
  }
  return out
}

const legendItem =(marker: RNode, label: string, className?: string[]): RNode =>
  h("li", className ? { className } : {}, marker, label)

/** 로드맵 nav. 시리즈에 편이 없으면 undefined. */
export function buildRoadmap(
  spec: RoadmapSpec,
  title: string,
  published: PublishedEntry[],
  hrefFor: HrefFor,
  warn: (msg: string) => void,
  current?: CurrentNote,
): RNode | undefined {
  const episodes = mergeEpisodes(spec, published, warn)
  if (episodes.length === 0) {
    warn(`시리즈 ${spec.series}에 표시할 편이 없다`)
    return undefined
  }

  const byIndex = new Map(episodes.map((e) => [e.index, e]))
  const parts = groupParts(episodes)
  const partOrder = new Map(parts.map((p, i) => [p.name, i]))
  partTypoWarnings(parts).forEach(warn)
  gapWarnings(parts, new Set(byIndex.keys())).forEach(warn)
  const columns = Math.max(1, ...parts.map((p) => p.episodes.length))
  const publishedCount = episodes.filter((e) => e.id).length
  let hasWires = false

  const partNodes = parts.map((p, i) =>
    h(
      "li",
      { className: ["rm-part"] },
      h(
        "div",
        { className: ["rm-part-head"] },
        h("span", { className: ["rm-part-no"] }, `${String(i + 1).padStart(2, "0")}부`),
        h("span", { className: ["rm-part-name"] }, p.name),
      ),
      h(
        "ol",
        { className: ["rm-eps"] },
        ...p.episodes.map((ep) => {
          const valid = validateRequires(ep, byIndex, partOrder, warn)
          if (valid.length > 0) hasWires = true
          return card(ep, valid, byIndex, hrefFor, current?.series === spec.series && current.index === ep.index)
        }),
      ),
    ),
  )

  return h(
    "nav",
    {
      className: ["rm"],
      ariaLabel: `${title} 로드맵`,
      style: `--rm-cols: ${columns}`,
      dataRoadmapInit: "true",
    },
    h(
      "div",
      { className: ["rm-head"] },
      h("span", { className: ["rm-title"] }, title),
      h(
        "ul",
        { className: ["rm-legend"] },
        legendItem(h("span", { className: ["dot", "pub"], ariaHidden: "true" }), `발행 ${publishedCount}편`),
        legendItem(h("span", { className: ["dot"], ariaHidden: "true" }), "준비 중"),
        legendItem(h("span", { className: ["dot", "plan"], ariaHidden: "true" }), "예정"),
        legendItem(h("span", { className: ["lg-line"], ariaHidden: "true" }), "읽는 순서", ["lg-wire"]),
        legendItem(h("span", { className: ["legend-chip"] }, "선수 N편"), "선수 관계"),
      ),
    ),
    h(
      "div",
      { className: ["rm-board"] },
      h("ol", { className: ["rm-parts"] }, ...partNodes),
      h("svg", { className: ["rm-wires"], ariaHidden: "true" }),
    ),
    h(
      "p",
      { className: ["rm-foot"] },
      `전체 ${episodes.length}편`,
      hasWires &&
        h("span", { className: ["rm-hint"] }, " · 카드에 올리면 그 편의 선수 선 전부, 칩에 올리면 그 선 하나만 나타난다"),
    ),
  )
}
