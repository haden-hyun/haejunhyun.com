import { parseCustomGrid } from "./parse-grid"

export interface LayoutSpec {
  kind: "grid" | "masonry" | "carousel"
  templateColumns?: string
  templateAreas?: string
  columns?: number
}

// 원 플러그인의 레거시 프리셋. 영역 이름이 custom 그리드와 같아 CSS 경로가 하나로 합쳐진다.
const PRESETS: Record<string, { templateColumns: string; templateAreas: string }> = {
  a: { templateColumns: "1fr 1fr", templateAreas: `"image-0 image-1"` },
  b: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1"` },
  c: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0"` },
  d: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1" "image-0 image-2"` },
  e: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0" "image-2 image-0"` },
  f: {
    templateColumns: "3fr 1fr",
    templateAreas: `"image-0 image-1" "image-0 image-2" "image-0 image-3"`,
  },
  g: {
    templateColumns: "1fr 3fr",
    templateAreas: `"image-1 image-0" "image-2 image-0" "image-3 image-0"`,
  },
  h: { templateColumns: "1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2"` },
  i: { templateColumns: "1fr 1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2 image-3"` },
  single: { templateColumns: "1fr", templateAreas: `"image-0"` },
}

const MASONRY = /^masonry-([2-6])$/

// templateAreas 없는 { kind: "grid" } = 자동배치 폴백. SCSS의 auto-fit 그리드가 받는다.
const AUTO: LayoutSpec = { kind: "grid" }

export function resolveLayout(layout: string, grid: unknown, fallback: string): LayoutSpec {
  const name = (layout || fallback).trim().toLowerCase()

  if (name === "carousel") return { kind: "carousel" }

  const masonry = name.match(MASONRY)
  if (masonry) return { kind: "masonry", columns: Number(masonry[1]) }

  if (name === "custom") {
    const parsed = parseCustomGrid(grid)
    if (!parsed) return AUTO
    return {
      kind: "grid",
      templateColumns: `repeat(${parsed.columns}, 1fr)`,
      templateAreas: parsed.templateAreas,
    }
  }

  const preset = PRESETS[name]
  if (preset) return { kind: "grid", ...preset }

  return AUTO
}
