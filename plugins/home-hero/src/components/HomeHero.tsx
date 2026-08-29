import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { VisitorCounter as VisitorCounterConstructor } from "@haejunhyun/visitor-counter/components"
import type { ComponentChildren } from "preact"
import style from "./styles/hero.scss"

// footer 플러그인과 동일한 이유로 인라인 구현 (@quartz-community/utils에 없음).
type StringResource = string | string[] | undefined
function concatenateResources(...resources: StringResource[]): string | string[] {
  return resources.filter((r): r is string | string[] => r !== undefined).flat()
}

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
// 동작은 utils/dist/{lang,date}.js와 동일.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

function formatDate(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" })
}

/**
 * Hero + StatsStrip + 방문자 카운터 — 홈 전용.
 *
 * - 홈 전용 렌더는 내부 slug 가드. `condition: is-index`는 내장에 없다
 * - 통계는 전부 allFiles 런타임 집계. 하드코딩 금지
 */

type Link = { label: string; href: string; primary?: boolean }

export interface HomeHeroOptions {
  eyebrow: string
  /** \n으로 줄바꿈 */
  headline: string
  description: string
  links: Link[]
  /** avatarImage가 없을 때만 쓰이는 폴백 (이니셜 원) */
  avatarInitial: string
  /** 아바타 이미지 경로(예: "./static/avatar.png"). 있으면 이니셜 원보다 우선. */
  avatarImage?: string
  /**
   * 히어로 배경 이미지. 있으면 밤 히어로(배경 + 베일 + 상단 통계 줄)가 되고
   * 아바타는 카운터만 남는다 — 두 모드 모두 적용된다(DESIGN-SYSTEM.md §3.3).
   */
  backgroundImage?: string
}

const defaultOptions: HomeHeroOptions = {
  eyebrow: "",
  headline: "",
  description: "",
  links: [],
  avatarInitial: "?",
}

/** 슬러그 패턴으로 거른다. 자동 생성 페이지도 title이 있어 title 유무로는 안 된다. */
function isRealNote(f: QuartzPluginData & Record<string, unknown>): boolean {
  const slug = (f.slug as string | undefined) ?? ""
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  if (slug === "404") return false
  if (slug === "topics" || slug === "archive") return false
  return true
}

function getTime(f: QuartzPluginData & Record<string, unknown>): number {
  return (
    (f as { dates?: { modified?: Date; created?: Date } }).dates?.modified?.getTime() ??
    (f as { dates?: { modified?: Date; created?: Date } }).dates?.created?.getTime() ??
    0
  )
}

export default ((userOpts?: Partial<HomeHeroOptions>) => {
  const opts: HomeHeroOptions = { ...defaultOptions, ...userOpts }
  // 방문자 카운터는 홈 아바타 아래에만 렌더한다(전 페이지 footer 아님).
  const VisitorCounter = VisitorCounterConstructor()

  const HomeHero: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, allFiles, displayClass, cfg } = props
    if (fileData.slug !== "index") return <></>

    const files = (allFiles as (QuartzPluginData & Record<string, unknown>)[]).filter(
      (f) => f.slug !== fileData.slug && isRealNote(f),
    )
    const noteCount = files.length
    const topicCount = new Set(files.map((f) => (f.slug ?? "").split("/")[0]).filter(Boolean)).size
    const lastUpdateTime = files.reduce((max, f) => Math.max(max, getTime(f)), 0)
    const locale = cfg.locale ?? "en-US"

    const backdrop = opts.backgroundImage

    // 밤 히어로에서는 상단으로 올라간다 — 하단에 두면 제목 블록이 히어로의 54%를 먹어
    // 배경 연주자(높이 60~100% 구간)가 글자와 베일에 함께 가린다.
    const stats = (
      <div class="hero-stats">
        <div class="hero-stat">
          <b>{noteCount}</b>
          <span>노트</span>
        </div>
        <div class="hero-stat">
          <b>{topicCount}</b>
          <span>토픽</span>
        </div>
        {lastUpdateTime > 0 && (
          <div class="hero-stat">
            <b>{formatDate(new Date(lastUpdateTime), locale)}</b>
            <span>최근 업데이트</span>
          </div>
        )}
      </div>
    )

    return (
      <section class={classNames(displayClass, "home-hero", backdrop ? "has-backdrop" : "")}>
        {backdrop && (
          <>
            <div
              class="hero-backdrop"
              style={`background-image:url("${backdrop}")`}
              aria-hidden="true"
            />
            <div class="hero-veil" aria-hidden="true" />
            <div class="hero-topbar">{stats}</div>
          </>
        )}
        <div class="hero-main">
          {opts.eyebrow && <div class="hero-eyebrow">{opts.eyebrow}</div>}
          <h1 class="hero-headline">
            {opts.headline.split("\n").map((line, i, arr) => (
              <>
                {line}
                {i < arr.length - 1 && <br />}
              </>
            ))}
          </h1>
          {opts.description && <p class="hero-description">{opts.description}</p>}
          {opts.links.length > 0 && (
            <div class="hero-cta">
              {opts.links.map((link) => (
                <a
                  class={classNames(undefined, "hero-btn", link.primary ? "hero-btn-primary" : "")}
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
          {!backdrop && stats}
        </div>
        {/* 주의: 아바타는 backdrop이 없을 때만 렌더한다. CSS로 숨기면 브라우저가
            avatar.png(695KB)를 그대로 내려받는다 — 밤 히어로에선 영영 안 보이는데도. */}
        <div class="hero-avatar-col">
          {!backdrop &&
            (opts.avatarImage ? (
              <img class="hero-avatar-img" src={opts.avatarImage} alt="" aria-hidden="true" />
            ) : (
              <div class="hero-avatar" aria-hidden="true">
                {opts.avatarInitial}
              </div>
            ))}
          {/* 주의: JSX 태그(`<VisitorCounter />`)로 쓰면 dts 빌드가 실패한다 —
              preact가 QuartzComponent를 유효한 JSX 엘리먼트로 인식하지 못한다.
              함수 호출 + 캐스트가 유일하게 통과하는 형태. */}
          <div class="hero-visitor-counter">
            {VisitorCounter(props) as unknown as ComponentChildren}
          </div>
        </div>
      </section>
    )
  }

  HomeHero.css = concatenateResources(style, VisitorCounter.css)
  HomeHero.afterDOMLoaded = VisitorCounter.afterDOMLoaded
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
