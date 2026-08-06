import { parseOptions } from "./parse-options"

export interface ParsedImage {
  url: string
  caption?: string
  width?: number
  height?: number
}

export interface ParsedBlock {
  layout: string
  opts: Record<string, unknown>
  images: ParsedImage[]
}

const FENCE_PREFIX = "image-layout"
const BLOCK_FRONTMATTER = /^\s*---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/
const SIZE = /^(\d+)(?:x(\d+))?$/
const WIKILINK = /!?\[\[([^\]]+)\]\]/
const MD_IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/

// 파이프는 여러 개 올 수 있다. 숫자(또는 WxH)면 크기, 나머지는 캡션 — 원 플러그인 규칙.
function parseWikilink(body: string): ParsedImage {
  const [target, ...rest] = body.split("|")
  const image: ParsedImage = { url: target!.trim() }
  const captionParts: string[] = []

  for (const part of rest) {
    const trimmed = part.trim()
    const size = trimmed.match(SIZE)
    if (size) {
      image.width = Number(size[1])
      if (size[2]) image.height = Number(size[2])
    } else if (trimmed) {
      captionParts.push(trimmed)
    }
  }

  if (captionParts.length > 0) image.caption = captionParts.join(" ")
  return image
}

export function parseBlock(lang: string, value: string): ParsedBlock | null {
  if (!lang?.startsWith(FENCE_PREFIX)) return null

  const legacyLayout = lang.slice(FENCE_PREFIX.length).replace(/^-/, "").trim()

  let body = value
  let opts: Record<string, unknown> = {}
  const frontmatter = value.match(BLOCK_FRONTMATTER)
  if (frontmatter) {
    body = value.slice(frontmatter[0].length)
    opts = parseOptions(frontmatter[1]!)
  }

  const images: ParsedImage[] = []
  for (const line of body.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "") continue

    const wiki = trimmed.match(WIKILINK)
    if (wiki) {
      images.push(parseWikilink(wiki[1]!))
      continue
    }

    const md = trimmed.match(MD_IMAGE)
    if (md) {
      images.push({ url: md[2]!.trim(), ...(md[1] ? { caption: md[1] } : {}) })
    }
  }

  const layout = String(opts.layout ?? legacyLayout ?? "").trim()
  return { layout, opts, images }
}
