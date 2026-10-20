// verify-anim이 Node에서 쓰는 묶음. 블로그 빌드와 같은 parse·build-nodes로 figure HTML을 만든다(복제 없음).
import { toHast } from "mdast-util-to-hast"
import { find, html } from "property-information"
import { buildNode } from "../../src/build-nodes"
import { parseSpec } from "../../src/parse"

export { parseSpec, buildNode }
export * from "./static"

type HNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HNode[]; value?: string }

const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source"])
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const escAttr = (s: string) => esc(s).replace(/"/g, "&quot;")

function serialize(node: HNode): string {
  switch (node.type) {
    case "root":
      return (node.children ?? []).map(serialize).join("")
    case "text":
      return esc(node.value ?? "")
    case "raw":
      return node.value ?? "" // scene SVG: parse.ts 허용 목록을 통과한 문자열
    case "element": {
      const attrs = Object.entries(node.properties ?? {})
        .filter(([, v]) => v !== false && v !== null && v !== undefined)
        .map(([k, v]) => {
          const name = find(html, k).attribute
          if (v === true) return ` ${name}`
          return ` ${name}="${escAttr(Array.isArray(v) ? v.join(" ") : String(v))}"`
        })
        .join("")
      if (VOID.has(node.tagName!)) return `<${node.tagName}${attrs}>`
      return `<${node.tagName}${attrs}>${(node.children ?? []).map(serialize).join("")}</${node.tagName}>`
    }
    default:
      return ""
  }
}

/** 펜스 원문 → 블로그와 같은 figure HTML. resolve는 자산 파일명 → 하니스 URL. */
export function renderFigure(source: string, resolve: (name: string) => string) {
  const result = parseSpec(source)
  if (!result.ok) return result
  const hast = toHast(buildNode(result.spec, resolve) as never, { allowDangerousHtml: true }) as HNode
  return { ok: true as const, spec: result.spec, html: serialize(hast) }
}
