import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit: number
  linkToMore: SimpleSlug | false
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 5,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => {
    // 수정날짜 기준 내림차순 정렬
    const date1 = f1.dates?.modified ?? f1.dates?.created ?? new Date(0)
    const date2 = f2.dates?.modified ?? f2.dates?.created ?? new Date(0)
    return date2.getTime() - date1.getTime()
  },
})

export default ((userOpts?: Partial<Options>) => {
  const RecentNotesForIndex: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }
    const pages = allFiles
      .filter(opts.filter)
      .filter((f) => f.slug !== fileData.slug)
      .sort(opts.sort)
      .slice(0, opts.limit)

    const isIndex = fileData.slug === "index"
    
    if (!isIndex) {
      return <></>
    }

    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h2>{opts.title ?? "최근 작성한 글"}</h2>
        <ul class="recent-ul">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
            const tags = page.frontmatter?.tags ?? []

            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <h3>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {title}
                      </a>
                    </h3>
                  </div>
                  {page.dates && (
                    <p class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </p>
                  )}
                  {opts.showTags && tags.length > 0 && (
                    <ul class="tags">
                      {tags.map((tag) => (
                        <li>
                          <a
                            class="internal tag-link"
                            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                          >
                            #{tag}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        {opts.linkToMore && (
          <a href={resolveRelative(fileData.slug!, opts.linkToMore)}>
            {i18n(cfg.locale).components.recentNotes.seeRemainingMore({ count: allFiles.length - opts.limit })}
          </a>
        )}
      </div>
    )
  }

  RecentNotesForIndex.css = style
  return RecentNotesForIndex
}) satisfies QuartzComponentConstructor

export type { Options as RecentNotesOptions }
