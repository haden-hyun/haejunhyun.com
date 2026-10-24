import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { resolveRelative } from "../util/path"
import style from "./styles/topicsContent.scss"
import { formatYmd, getListDate } from "../../../_shared/noteMeta"
import { buildTopicIndex, folderNameResolver, type TopicFolder, type TopicSeries } from "../../../_shared/topicIndex"
import { topicAnchor } from "../../../_shared/topics"
import { episodeLabel } from "../../../_shared/series"

/**
 * 내비의 "Topics" 라우트 — 토픽마다 섹션 라벨 + 시리즈 행 + 1단 폴더 행(폴더 페이지 §4.16 문법).
 * 수치·부제는 전부 allFiles 런타임 집계, 토픽 표는 `_shared/topics.ts` 하나.
 */

export interface TopicsContentOptions {
  /** 시리즈 키 → 표시명. 주의: folder-listing·series-box·series-pager·series-roadmap 옵션과 같게 둘 것. */
  seriesTitles: Record<string, string>
}

type FileData = QuartzPluginData & Record<string, unknown>

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

function Ymd({ date }: { date?: Date }) {
  return date ? (
    <time class="tp-end tp-date" dateTime={formatYmd(date)}>
      {formatYmd(date)}
    </time>
  ) : (
    <span class="tp-end" />
  )
}

function SeriesRow(props: { series: TopicSeries; title: string; slug: string }) {
  const first = props.series.entries[0]!
  return (
    <li>
      <a class="tp-row is-series" href={resolveRelative(props.slug, first.file.slug as string)} data-no-popover="true">
        <span class="tp-kind">시리즈 · {props.series.entries.length}편</span>
        <span class="tp-title">{props.title}</span>
        <span class="tp-end tp-go">{episodeLabel(first.index)}부터 →</span>
        <span class="tp-desc">
          {episodeLabel(first.index)} {first.title}
        </span>
      </a>
    </li>
  )
}

/** 하위 폴더가 있으면 그 이름들, 없으면 최근 노트 제목 2편. */
const folderLine = (f: TopicFolder): string =>
  f.subs.length > 0
    ? f.subs.map((s) => s.title).join(" · ")
    : f.notes
        .slice(0, 2)
        .map((n) => String(n.frontmatter?.title ?? ""))
        .join(" · ")

function FolderRow(props: { folder: TopicFolder; slug: string }) {
  const { folder } = props
  return (
    <li>
      <a class="tp-row" href={resolveRelative(props.slug, `${folder.path}/index`)} data-no-popover="true">
        <span class="tp-kind">{plural(folder.count, "note")}</span>
        <span class="tp-title">{folder.title}</span>
        <Ymd date={folder.latest} />
        <span class="tp-desc">{folderLine(folder)}</span>
      </a>
    </li>
  )
}

function NoteRow(props: { file: FileData; slug: string }) {
  return (
    <li>
      <a class="tp-row" href={resolveRelative(props.slug, props.file.slug as string)} data-no-popover="true">
        <span class="tp-kind">노트</span>
        <span class="tp-title">{props.file.frontmatter?.title}</span>
        <Ymd date={getListDate(props.file)} />
      </a>
    </li>
  )
}

export default ((opts?: Partial<TopicsContentOptions>) => {
  const seriesTitles = opts?.seriesTitles ?? {}

  const TopicsContent: QuartzComponent = ({ ctx, fileData, allFiles, displayClass }: QuartzComponentProps) => {
    const slug = (fileData.slug as string) ?? "topics"
    const topics = buildTopicIndex(
      allFiles as FileData[],
      folderNameResolver((ctx as { trie?: unknown } | undefined)?.trie),
    ).filter((t) => t.count > 0)
    const total = topics.reduce((n, t) => n + t.count, 0)
    const folders = topics.reduce((n, t) => n + t.folders.length, 0)
    const series = topics.reduce((n, t) => n + t.series.length, 0)

    return (
      // 주의: <h1>은 article-title이 frontmatter.title로 렌더한다. <article>로 감싸면 custom.scss `article a`가 행에 붙는다.
      <div class={`${displayClass ?? ""} topics-index popover-hint`}>
        <p class="tp-meta">
          {plural(total, "note")} · {plural(topics.length, "topic")} · {plural(folders, "folder")} ·{" "}
          {series} series
        </p>
        <nav class="tp-jump" aria-label="토픽 바로가기">
          <ul>
            {topics.map((t) => (
              <li>
                <a href={`#${topicAnchor(t.key)}`} data-no-popover="true">
                  {t.label}
                  <span class="tp-jump-count">{t.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {topics.map((t) => (
          <section class="tp-section" aria-labelledby={topicAnchor(t.key)}>
            <div class="tp-label">
              <h2 id={topicAnchor(t.key)}>{t.label}</h2>
              <span class="tp-count">{plural(t.count, "note")}</span>
              <a
                class="tp-open"
                href={resolveRelative(slug, `${t.key}/index`)}
                aria-label={`${t.label} 주제 열기`}
                data-no-popover="true"
              >
                <span class="tp-open-word">주제&nbsp;</span>열기 →
              </a>
            </div>
            <ul class="tp-rows">
              {t.series.map((s) => (
                <SeriesRow series={s} title={seriesTitles[s.key] ?? s.key} slug={slug} />
              ))}
              {t.direct.map((f) => (
                <NoteRow file={f} slug={slug} />
              ))}
              {t.folders.map((f) => (
                <FolderRow folder={f} slug={slug} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    )
  }

  TopicsContent.css = style
  return TopicsContent
}) satisfies QuartzComponentConstructor<Partial<TopicsContentOptions>>
