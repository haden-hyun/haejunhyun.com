import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { BlockContent, DefinitionContent, List, Paragraph, Root } from "mdast"
import { toString as mdastToString } from "mdast-util-to-string"
import { visit } from "unist-util-visit"

/**
 * P1 근본 원인 수정: `[!summary] Summary\n- ...` 콜아웃을 쓰는 노트에서
 * `description` 플러그인(order 70)이 렌더된 텍스트 전체를 앞에서부터 잘라
 * description을 만들다 보니 콜아웃 타이틀 리터럴("Summary"/"요약")이 카드
 * 요약·메타 태그·RSS·OG 이미지에 그대로 노출됐다.
 *
 * 이 플러그인은 obsidian-flavored-markdown(order 30) 다음, description(order 70)
 * 이전에 실행되어(order 35) 콜아웃의 **본문만** `frontmatter.description`에
 * 채워 넣는다. description 플러그인은 frontmatter.description이 있으면 그
 * 값을 그대로 쓰므로(자체 우선순위 로직 재사용), 여기서는 "아직 없을 때만
 * 채운다"는 조건 하나만 지키면 다음 우선순위가 자동으로 성립한다:
 *   frontmatter.description(수동) > [!summary] 콜아웃 추출(이 플러그인) > 자동 생성(description 플러그인)
 *
 * 함정: Obsidian의 콜아웃 타입 정규화 규칙상 `[!summary]`는 **"abstract"로
 * 캐너니컬라이즈된다** (obsidian-flavored-markdown dist의 calloutMapping:
 * `summary: "abstract", tldr: "abstract"`). 렌더된 HTML도 실측 결과
 * `<blockquote class="callout abstract" data-callout="abstract">`였다.
 * 즉 `data-callout="summary"`는 존재하지 않는다 — 반드시 "abstract"로 매칭해야
 * `[!summary]`(85건) + `[!abstract]`(1건) + `[!tldr]`(1건, 전부 "abstract"로
 * 귀결) 87건을 전부 잡는다.
 *
 * 콜아웃 타이틀 텍스트("Summary"/"요약"/문장형 등 6가지 변형)는 애초에 건드리지
 * 않는다 — 타이틀 paragraph는 무시하고 `callout-content` div 안쪽만 읽으므로
 * 타이틀 문구가 무엇이든 상관없다.
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

/**
 * 콜아웃 본문이 불릿 리스트면 카드 요약용으로 **첫 항목만** 취한다
 * (리스트 전체를 이어붙이면 한 문장처럼 뭉쳐져 카드에서 읽기 어렵다).
 * 리스트가 아니면(단락형 본문) 본문 전체를 그대로 쓴다.
 */
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

            // 콜아웃이 본문 없이 한 줄 요약(타이틀 옆 텍스트)만 갖는 경우의 fallback.
            // obsidian-flavored-markdown은 이때 titleHtml 다음에 일반 paragraph를 붙인다.
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
