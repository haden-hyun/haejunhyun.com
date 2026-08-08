import type { Blockquote, Paragraph, RootContent } from "mdast"
import type { ImageLayoutsOptions } from "./index"
import type { LayoutSpec } from "./layouts"
import type { ParsedBlock, ParsedImage } from "./parse-block"

type Props = Record<string, unknown>

// mdast에 div/figure 노드 타입이 없어 블록 컨테이너에 hName을 씌운다 (OFM 콜아웃과 동일한 방식).
// 주의: paragraph를 쓰면 안 된다 — 자식이 phrasing content여야 해서 중첩이 잘못된 mdast가 된다.
const container = (hName: string, hProperties: Props, children: RootContent[]): Blockquote =>
  ({ type: "blockquote", data: { hName, hProperties }, children }) as unknown as Blockquote

const textBlock = (hName: string, hProperties: Props, value: string): Paragraph =>
  ({
    type: "paragraph",
    data: { hName, hProperties },
    children: [{ type: "text", value }],
  }) as unknown as Paragraph

const cssSize = (value: unknown, fallback: string): string => {
  if (typeof value === "number") return `${value}px`
  const text = String(value ?? "").trim()
  return text === "" ? fallback : text
}

const OVERLAY_MODES = ["never", "hover", "always"]
const FIT_MODES = ["cover", "contain", "natural"]
const ALIGN_MODES = ["left", "center", "right", "full"]

function pick(value: unknown, allowed: string[], fallback: string): string {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
  return allowed.includes(text) ? text : fallback
}

// ★ 여기서 만드는 image 노드가 이 설계의 전부다.
//   진짜 mdast image라서 CrawlLinks(order 60)가 위키링크 이미지와 똑같이 경로를 고쳐준다.
function buildFigure(image: ParsedImage, index: number, withArea: boolean): Blockquote {
  const style: string[] = []
  if (withArea) style.push(`grid-area:image-${index}`)
  if (image.width) style.push(`max-width:${image.width}px`)

  const frame = {
    type: "paragraph",
    data: { hName: "div", hProperties: { className: ["il-frame"] } },
    children: [{ type: "image", url: image.url, alt: image.caption ?? "" }],
  } as unknown as Paragraph

  const children: RootContent[] = [frame]
  if (image.caption) {
    children.push(textBlock("figcaption", { className: ["il-caption"] }, image.caption))
  }

  return container(
    "figure",
    { className: ["il-item"], ...(style.length ? { style: style.join(";") } : {}) },
    children,
  )
}

function blockClassNames(block: ParsedBlock, variant: string): string[] {
  const className = [
    "image-layout",
    variant,
    `il-fit-${pick(block.opts.fit, FIT_MODES, "cover")}`,
    `il-overlay-${pick(block.opts.overlay, OVERLAY_MODES, "hover")}`,
  ]
  const align = pick(block.opts.align, ALIGN_MODES, "")
  if (align) className.push(`il-align-${align}`)
  return className
}

function blockCaption(block: ParsedBlock): RootContent[] {
  if (!block.opts.caption) return []
  return [textBlock("figcaption", { className: ["il-block-caption"] }, String(block.opts.caption))]
}

export function buildLayoutNode(
  block: ParsedBlock,
  spec: LayoutSpec,
  opts: ImageLayoutsOptions,
): Blockquote {
  const style = [`--il-gap:${opts.gap}`]
  if (spec.templateColumns) style.push(`grid-template-columns:${spec.templateColumns}`)
  if (spec.templateAreas) style.push(`grid-template-areas:${spec.templateAreas}`)

  const figures = block.images.map((image, i) => buildFigure(image, i, Boolean(spec.templateAreas)))

  return container("div", { className: blockClassNames(block, "il-grid"), style: style.join(";") }, [
    ...figures,
    ...blockCaption(block),
  ])
}

// 원 플러그인과 같은 modulo 분배. 빌드 타임에 끝나므로 JS가 필요 없다.
export function buildMasonryNode(
  block: ParsedBlock,
  spec: LayoutSpec,
  opts: ImageLayoutsOptions,
): Blockquote {
  const columnCount = spec.columns ?? 3
  const columns = Array.from({ length: columnCount }, (_, col) =>
    container(
      "div",
      { className: ["il-column"] },
      block.images
        .filter((_, i) => i % columnCount === col)
        .map((image) => buildFigure(image, 0, false)),
    ),
  )

  return container(
    "div",
    {
      className: blockClassNames(block, "il-masonry"),
      style: `--il-gap:${opts.gap};grid-template-columns:repeat(${columnCount}, 1fr)`,
    },
    [...columns, ...blockCaption(block)],
  )
}

export function buildCarouselNode(block: ParsedBlock, opts: ImageLayoutsOptions): Blockquote {
  const style = [`--il-carousel-height:${cssSize(block.opts.carouselheight, opts.carouselHeight)}`]
  if (block.opts.carouselbackground) {
    style.push(`--il-carousel-bg:${String(block.opts.carouselbackground)}`)
  }

  const children: RootContent[] = [
    container(
      "div",
      { className: ["il-viewport"] },
      block.images.map((image) => buildFigure(image, 0, false)),
    ),
  ]

  if (block.opts.carouselshowthumbnails) {
    children.push(
      container(
        "div",
        { className: ["il-thumbs"] },
        block.images.map(
          (image) =>
            ({
              type: "paragraph",
              data: { hName: "div", hProperties: { className: ["il-thumb"] } },
              children: [{ type: "image", url: image.url, alt: "" }],
            }) as unknown as Paragraph,
        ),
      ),
    )
  }

  children.push(...blockCaption(block))

  return container(
    "div",
    {
      className: blockClassNames(block, "il-carousel"),
      "data-needs-init": "true",
      style: style.join(";"),
    },
    children,
  )
}
