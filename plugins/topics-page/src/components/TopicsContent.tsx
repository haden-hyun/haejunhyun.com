import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicsContent.scss"

/**
 * design-handoff.md §3.1 글로벌 네비게이션 스펙의 "Topics" 라우트.
 * 홈의 TopicGrid(./plugins/topic-grid)와 동일한 데이터·카드 디자인을
 * 독립 페이지로 제공한다 — nav에서 링크할 대상이 필요했기 때문.
 *
 * 코드는 topic-grid의 TopicGrid.tsx와 의도적으로 거의 동일하다(같은 TOPICS
 * 상수, 같은 집계 로직, 같은 카드 마크업). 두 플러그인이 서로를 import하려면
 * 워크스페이스 링크가 필요해 복잡도가 늘고, 카드 하나 보여주는 로직을 위해
 * 그런 결합을 만들 이유가 없다고 판단해 작은 중복을 선택했다. 토픽 목록이
 * 바뀌면(신규 토픽 추가 등) 두 파일을 함께 갱신해야 한다.
 */

type FileData = QuartzPluginData & Record<string, unknown>

interface Topic {
  key: string
  label: string
  subtext: string
  colorVar: string
}

// [2026-08-03] 이모지 제거 — topic-grid와 동일한 결정, 이유는 그쪽 주석 참고.
const TOPICS: Topic[] = [
  {
    key: "computer-science",
    label: "Computer Science",
    subtext: "알고리즘 · 자료구조",
    colorVar: "--c-cs",
  },
  {
    key: "data-engineering",
    label: "Data Engineering",
    subtext: "Airflow · Docker · PostgreSQL",
    colorVar: "--c-de",
  },
  {
    key: "data-science",
    label: "Data Science",
    subtext: "DL · ML · 통계 · 시각화",
    colorVar: "--c-ds",
  },
  { key: "gis", label: "GIS", subtext: "공간 데이터 분석", colorVar: "--c-gis" },
  {
    key: "programming",
    label: "Programming",
    subtext: "Python · SQL",
    colorVar: "--c-prog",
  },
  {
    key: "finance-property",
    label: "Finance & Property",
    subtext: "부동산 · 금융",
    colorVar: "--c-fin",
  },
  {
    key: "tools",
    label: "Tools",
    subtext: "Obsidian · 워크플로우",
    colorVar: "--c-tool",
  },
]

function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  if (slug === "topics" || slug === "archive") return false
  return true
}

export default (() => {
  const TopicsContent: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = (fileData.slug as string) ?? "topics"
    const files = allFiles as FileData[]
    const counts = new Map<string, number>()
    for (const f of files) {
      const slug = (f.slug as string | undefined) ?? ""
      if (!isRealNote(slug)) continue
      const key = slug.split("/")[0]
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const topicsWithCounts = TOPICS.map((t) => ({ ...t, count: counts.get(t.key) ?? 0 })).sort(
      (a, b) => b.count - a.count,
    )
    const maxCount = Math.max(1, ...topicsWithCounts.map((t) => t.count))
    const totalCount = topicsWithCounts.reduce((sum, t) => sum + t.count, 0)

    return (
      // <h1>은 여기서 렌더하지 않는다 — article-title 플러그인이 이미
      // frontmatter.title("Topics", pageType.ts의 VirtualPage.title)로 페이지
      // 상단에 렌더한다(folder-page의 FolderContent와 동일 패턴, h1 중복 방지).
      <article class={`${displayClass ?? ""} topics-page-content popover-hint`}>
        <p class="topics-page-sub">
          전체 {totalCount}개 노트 · {topicsWithCounts.length}개 토픽
        </p>
        <div class="topics-page-grid">
          {topicsWithCounts.map((t) => (
            <a
              class="topics-page-card"
              href={resolveRelative(currentSlug, t.key)}
              style={`--topic-color: var(${t.colorVar});`}
            >
              <i class="topics-page-bar" aria-hidden="true" />
              <b class="topics-page-label">{t.label}</b>
              <span class="topics-page-subtext">{t.subtext}</span>
              <div class="topics-page-count">{t.count}개 노트</div>
              <div class="topics-page-share" aria-hidden="true">
                <div
                  class="topics-page-share-fill"
                  style={`width:${(t.count / maxCount) * 100}%`}
                />
              </div>
            </a>
          ))}
        </div>
      </article>
    )
  }

  TopicsContent.css = style
  return TopicsContent
}) satisfies QuartzComponentConstructor
