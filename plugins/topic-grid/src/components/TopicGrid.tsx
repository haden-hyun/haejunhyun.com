import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicGrid.scss"

/**
 * TopicGrid. content/index.md의 정적
 * "Interests" 표(P5)를 클릭 가능한 카드로 대체한다.
 *
 * 데이터: content/index.md의 기존 Interests 표 문구를 그대로 재사용(새로
 * 지어내지 않음). 색은 custom.scss §0에서 정의한 --c-* 토큰(장식용 —
 * 라벨 텍스트가 아니라 3px 바에만 쓰므로 -text 변형 불필요).
 *
 * 정렬: 초기 설계는 "노트 수 내림차순 + 상위 3개 2칸 폭(bento)"을 권장했다. 다만 7개 카드를 4열 그리드에서 일부만 2칸으로 스팬하면 브라우저
 * 실렌더로 줄바꿈 지점을 확인해야 하는데 이 세션엔 브라우저 자동화가
 * 연결되지 않아 검증 없이 넣기엔 레이아웃이 깨질 위험이 있다. 그래서
 * 균등 4열 그리드는 유지하되 (a) 정렬을 노트 수 내림차순으로 바꾸고
 * (b) 카드 하단에 전체 대비 비율 바를 추가해, 목업처럼 시각적 왜곡
 * (24/31/38로 평탄화) 없이 실제 분포(Programming 38 vs Tools 4)가 드러나게
 * 했다. 진짜 bento 스팬은 브라우저 검증 가능해지면 별도로 전환 가능.
 *
 * 아이콘: [2026-08-03 결정] 이모지 제거. 초판은 "브라우저 검증 없이 SVG
 * 새로 그려 넣기엔 리스크"라는 이유로 유지했었으나,
 * 사용자가 직접 제거를 요청해 결정됐다 — 플랫폼별 렌더 편차·스크린리더
 * 오독 문제(UI/UX 우선순위 4의 명시적 안티패턴)가 실제로 걷어낼 이유였다.
 * 대체 아이콘 없이 라벨 텍스트 + 컬러바만으로 토픽을 구분한다(라벨 글자
 * 크기를 키워 시각적 무게를 보완 — 아래 topicGrid.scss 참고).
 *
 * 홈 전용 렌더: home-hero와 동일하게 컴포넌트 내부 `fileData.slug !== "index"`
 * 가드. `is-index` 조건 미등록 폴백 위험 회피.
 *
 * Graph View 진입 카드(원안의 8번째 칸)는 포함하지 않았다
 * — 홈의 그래프 위젯을 다시 켤지 여부를 사용자가 보류했다("일단 두자").
 * 링크할 대상 자체가 아직 없어 추가하지 않음.
 */

interface Topic {
  key: string
  label: string
  subtext: string
  colorVar: string
}

// content/index.md "Interests" 표와 동일한 순서·문구.
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

/** home-hero의 isRealNote와 동일 로직 (실측: allFiles엔 folder-page/tag-page
 * 자동 생성 페이지와 404도 섞여 있어 슬러그 패턴으로 걸러야 한다). */
function isRealNote(slug: string): boolean {
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  // Phase 6에서 추가된 가상 페이지(topics-page/archive-page) — 이들도
  // frontmatter.title이 채워진 채로 생성되므로 슬러그로 명시 제외해야 한다.
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
              style={`--topic-color: var(${t.colorVar});`}
            >
              <i class="topic-card-bar" aria-hidden="true" />
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
