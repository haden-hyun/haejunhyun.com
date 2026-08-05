import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { BlockContent, DefinitionContent, List, Paragraph, Root } from "mdast"
import { toString as mdastToString } from "mdast-util-to-string"
import { visit } from "unist-util-visit"

/**
 * `[!summary]` 콜아웃 **본문만** frontmatter.description으로 추출.
 * 없으면 description 플러그인이 렌더 텍스트를 앞에서부터 잘라 쓰는데,
 * 그러면 타이틀 리터럴("Summary"/"요약")이 카드·RSS·OG 이미지에 노출된다.
 *
 * order 35 = ofm(30) 이후, description(70) 이전. "아직 없을 때만 채운다"만
 * 지키면 우선순위가 자동 성립한다:
 *   수동 frontmatter > 이 플러그인 > description 자동 생성
 *
 * ⚠️ 반드시 `data-callout="abstract"`로 매칭할 것. Obsidian이 summary/tldr을
 *    전부 "abstract"로 캐너니컬라이즈하므로 `"summary"`는 **존재하지 않는다.**
 * ※ 타이틀 문구는 무엇이든 상관없다 — callout-content 안쪽만 읽는다.
 */

interface HastData {
  hName?: string
  hProperties?: { className?: string | string[]; [key: string]: unknown }
  [key: string]: unknown
}

type MdastParent = { children: (BlockContent | DefinitionContent)[] }

const WHITESPACE = /\s+/g

function hasClass(data: HastData | undefined, className: string): boolean {
  const cls = data?.hProperties?.className
  return Array.isArray(cls) ? cls.includes(className) : cls === className
}

function normalize(text: string): string {
  return text.replace(WHITESPACE, " ").trim()
}

/** 불릿 리스트면 **첫 항목만**(전체를 이어붙이면 한 문장처럼 뭉친다).
 *  단락형이면 본문 전체. */
function extractCardSummary(contentNode: MdastParent): string {
  const firstList = contentNode.children.find((child): child is List => child.type === "list")
  const source = firstList?.children[0] ?? contentNode
  return normalize(mdastToString(source))
}

const SummaryDescription: QuartzTransformerPlugin = () => {
  return {
    name: "SummaryDescription",
    markdownPlugins() {
      return [
        () => (tree: Root, file) => {
          const frontmatter = ((
            file.data as { frontmatter?: Record<string, unknown> }
          ).frontmatter ??= {})
          if (frontmatter.description) return

          let summaryText: string | undefined

          visit(tree, "blockquote", (node) => {
            if (summaryText) return
            const data = node.data as HastData | undefined
            if (data?.hProperties?.["data-callout"] !== "abstract") return

            const contentDiv = node.children.find((child) => {
              const cd = (child as { data?: HastData }).data
              return cd?.hName === "div" && hasClass(cd, "callout-content")
            }) as MdastParent | undefined

            if (contentDiv) {
              summaryText = extractCardSummary(contentDiv)
              return
            }

            // 본문 없이 타이틀 옆 한 줄만 있는 콜아웃 폴백
            // (ofm은 이때 titleHtml 다음에 일반 paragraph를 붙인다).
            const fallbackParagraph = node.children.find(
              (child) => child.type === "paragraph" && !(child as { data?: HastData }).data?.hName,
            ) as Paragraph | undefined
            if (fallbackParagraph) {
              summaryText = normalize(mdastToString(fallbackParagraph))
            }
          })

          if (summaryText) {
            frontmatter.description = summaryText
          }
        },
      ]
    },
  }
}

export default SummaryDescription
