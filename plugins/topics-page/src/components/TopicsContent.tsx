import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicsContent.scss"
import { isRealNote } from "../../../_shared/notes"

/**
 * 내비의 "Topics" 라우트 — 홈 TopicGrid와 같은 데이터·카드를 독립 페이지로.
 *
 * 주의: topic-grid의 TopicGrid.tsx와 의도적으로 중복되어 있다(TOPICS 상수,
 *    집계 로직, 카드 마크업 전부). 서로 import하려면 워크스페이스 링크가 필요해
 *    복잡도 대비 이득이 없다고 판단. 토픽을 바꾸면 두 파일을 함께 고칠 것.
 */

type FileData = QuartzPluginData & Record<string, unknown>

interface Topic {
  key: string
  label: string
  subtext: string
}

const TOPICS: Topic[] = [
  {
    key: "computer-science",
    label: "Computer Science",
    subtext: "Algorithms · Data Structures",
  },
  {
    key: "data-engineering",
    label: "Data Engineering",
    subtext: "Airflow · Docker · PostgreSQL",
  },
  {
    key: "data-science",
    label: "Data Science",
    subtext: "DL · ML · Statistics · Visualization",
  },
  { key: "gis", label: "GIS", subtext: "Spatial Data Analysis" },
  {
    key: "programming",
    label: "Programming",
    subtext: "Python · SQL",
  },
  {
    key: "finance-property",
    label: "Finance & Property",
    subtext: "Real Estate · Finance",
  },
  {
    key: "tools",
    label: "Tools",
    subtext: "Obsidian · Workflow",
  },
]

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
      // 주의: <h1>을 여기서 렌더하면 안 된다 — article-title 플러그인이 이미
      // frontmatter.title로 렌더한다(중복 방지, folder-page와 동일 패턴).
      <article class={`${displayClass ?? ""} topics-page-content popover-hint`}>
        <p class="topics-page-sub">
          {totalCount} notes · {topicsWithCounts.length} topics
        </p>
        <div class="topics-page-grid">
          {topicsWithCounts.map((t) => (
            <a
              class="topics-page-card"
              href={resolveRelative(currentSlug, t.key)}
            >
              <b class="topics-page-label">{t.label}</b>
              <span class="topics-page-subtext">{t.subtext}</span>
              <div class="topics-page-count">{t.count} notes</div>
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
