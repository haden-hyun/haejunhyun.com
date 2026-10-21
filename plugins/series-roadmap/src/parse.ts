import { load as parseYaml } from "js-yaml"

export interface OutlineItem {
  index: number
  part: string
  title: string
  requires: number[]
  planned: boolean
}

export interface RoadmapSpec {
  series: string
  outline: OutlineItem[]
}

export type ParseResult = { ok: true; spec: RoadmapSpec } | { ok: false; error: string }

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v)

const text = (v: unknown): string => (v == null ? "" : String(v).trim())

/** 프론트매터 series_requires와 펜스 requires를 같은 규칙으로 읽는다. 정수가 아닌 값은 버린다. */
export function toIndexList(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw : raw == null || raw === "" ? [] : [raw]
  return list.map((v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : v)).filter(isInt)
}

export function parseSpec(source: string): ParseResult {
  let doc: unknown
  try {
    doc = parseYaml(source)
  } catch (e) {
    return { ok: false, error: `YAML 오류: ${e instanceof Error ? e.message.split("\n")[0] : e}` }
  }
  if (!doc || typeof doc !== "object") return { ok: false, error: "펜스 내용이 YAML 객체가 아니다" }

  const { series, outline } = doc as Record<string, unknown>
  if (!text(series)) return { ok: false, error: "series가 없다" }
  if (outline != null && !Array.isArray(outline)) return { ok: false, error: "outline은 목록이어야 한다" }

  const items: OutlineItem[] = []
  for (const [i, raw] of (outline ?? []).entries()) {
    const item = (raw ?? {}) as Record<string, unknown>
    const index = typeof item.index === "string" ? Number(item.index) : item.index
    if (!isInt(index)) return { ok: false, error: `outline[${i}]: index가 정수가 아니다` }
    if (!text(item.part) || !text(item.title)) {
      return { ok: false, error: `outline[${i}] (${index}편): part와 title이 필요하다` }
    }
    items.push({
      index,
      part: text(item.part),
      title: text(item.title),
      requires: toIndexList(item.requires),
      planned: item.planned === true,
    })
  }
  return { ok: true, spec: { series: text(series), outline: items } }
}
