import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicGrid.scss"
import { buildTopicIndex, folderNameResolver } from "../../../_shared/topicIndex"

/**
 * TopicGrid — 홈 전용. 토픽 이름 · 점선 · 노트 수의 색인 목록.
 *
 * - 토픽별 색·이모지 없음. 식별은 라벨 타이포가 한다 (DESIGN-SYSTEM.md)
 * - 정렬은 노트 수 내림차순
 * - 부제는 그 토픽의 1단 폴더 표시명(런타임 집계) — 토픽 표는 `_shared/topics.ts` 하나
 */

export interface TopicGridOptions {
  /** true면 섹션 라벨 표시 */
  showHeader: boolean
}

const defaultOptions: TopicGridOptions = {
  showHeader: true,
}

export default ((userOpts?: Partial<TopicGridOptions>) => {
  const opts: TopicGridOptions = { ...defaultOptions, ...userOpts }

  const TopicGrid: QuartzComponent = ({
    ctx,
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const topics = buildTopicIndex(
      allFiles as (QuartzPluginData & Record<string, unknown>)[],
      folderNameResolver((ctx as { trie?: unknown } | undefined)?.trie),
    )

    return (
      <section
        class={`${displayClass ?? ""} topic-grid-section`}
        aria-labelledby={opts.showHeader ? "topic-grid-h" : undefined}
      >
        {opts.showHeader && (
          <h2 id="topic-grid-h" class="topic-grid-label">
            Topics
          </h2>
        )}
        <ul class="topic-index">
          {topics.map((t) => (
            <li>
              <a class="topic-entry" href={resolveRelative(fileData.slug!, t.key)}>
                <span class="topic-entry-name">
                  {t.label}
                  <small>{t.folders.map((f) => f.title).join(" · ")}</small>
                </span>
                <span class="topic-entry-leader" aria-hidden="true" />
                <span class="topic-entry-count">{t.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  TopicGrid.css = style
  return TopicGrid
}) satisfies QuartzComponentConstructor<Partial<TopicGridOptions>>
