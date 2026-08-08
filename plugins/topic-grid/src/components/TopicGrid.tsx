import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicGrid.scss"

/**
 * TopicGrid — 홈 전용. 클릭 가능한 토픽 카드.
 *
 * - 토픽별 색·이모지 없음. 식별은 라벨 타이포가 한다 (DESIGN-SYSTEM.md)
 * - 정렬은 노트 수 내림차순 + 카드 하단 비율 바
 *
 * 주의: TOPICS 배열은 topics-page와 중복이다. 토픽 변경 시 두 파일을 함께 고칠 것.
 */

interface Topic {
  key: string
  label: string
  subtext: string
}

const TOPICS: Topic[] = [
  {
    key: "computer-science",
    label: "Computer Science",
    subtext: "알고리즘 · 자료구조",
  },
  {
    key: "data-engineering",
    label: "Data Engineering",
    subtext: "Airflow · Docker · PostgreSQL",
  },
  {
    key: "data-science",
    label: "Data Science",
    subtext: "DL · ML · 통계 · 시각화",
  },
  { key: "gis", label: "GIS", subtext: "공간 데이터 분석" },
  {
    key: "programming",
    label: "Programming",
    subtext: "Python · SQL",
  },
  {
    key: "finance-property",
    label: "Finance & Property",
    subtext: "부동산 · 금융",
  },
  {
    key: "tools",
    label: "Tools",
    subtext: "Obsidian · 워크플로우",
  },
]

/** home-hero의 isRealNote와 동일 — 사유는 그쪽 주석 참고. */
function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  if (slug === "topics" || slug === "archive") return false
  return true
}

export interface TopicGridOptions {
  /** true면 헤더("Topics" + "전체 N개") 표시 */
  showHeader: boolean
}

const defaultOptions: TopicGridOptions = {
  showHeader: true,
}

export default ((userOpts?: Partial<TopicGridOptions>) => {
  const opts: TopicGridOptions = { ...defaultOptions, ...userOpts }

  const TopicGrid: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const files = allFiles as (QuartzPluginData & Record<string, unknown>)[]
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
      <section class={`${displayClass ?? ""} topic-grid-section`}>
        {opts.showHeader && (
          <div class="topic-grid-header">
            <h2>Topics</h2>
            <span class="topic-grid-total">
              전체 {totalCount}개 노트 · {topicsWithCounts.length}개 토픽
            </span>
          </div>
        )}
        <div class="topic-grid">
          {topicsWithCounts.map((t) => (
            <a
              class="topic-card"
              href={resolveRelative(fileData.slug!, t.key)}
            >
              <b class="topic-card-label">{t.label}</b>
              <span class="topic-card-subtext">{t.subtext}</span>
              <div class="topic-card-count">{t.count}개 노트</div>
              <div class="topic-card-share" aria-hidden="true">
                <div class="topic-card-share-fill" style={`width:${(t.count / maxCount) * 100}%`} />
              </div>
            </a>
          ))}
        </div>
      </section>
    )
  }

  TopicGrid.css = style
  return TopicGrid
}) satisfies QuartzComponentConstructor<Partial<TopicGridOptions>>
