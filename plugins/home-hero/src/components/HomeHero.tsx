import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import style from "./styles/hero.scss"

// [빌드 안정성] `@quartz-community/utils`는 github: 참조 의존성이라 dist가
// 커밋되어 있지 않을 때가 있다 — 실제로 fresh npm install에서 0.1.1이
// dist 없이 설치되어 빌드가 깨졌다(0.1.0 사본은 우연히 dist가 있었을 뿐).
// classNames/formatDate 둘 다 몇 줄짜리라 인라인으로 대체해 이 의존성
// 자체를 없앤다 (동작은 @quartz-community/utils/dist/{lang,date}.js와 동일).
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

function formatDate(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" })
}

/**
 * design-handoff.md §4.1 Hero + StatsStrip 스펙 구현. 두 컴포넌트를 하나의
 * 패키지로 묶은 이유는 REDESIGN-GUIDE.md §1 참고 (StatsStrip이 Hero 내부
 * 하단에 위치 — 분리할 이유가 없고, 패키지 수 = 빌드 대상 수).
 *
 * 홈 전용 렌더: `condition: is-index`는 내장되어 있지 않고(not-index의 역만
 * 있음), 등록에 실패해도 안전하지만("컴포넌트 항상 렌더"로 폴백) 실패 시
 * 모든 노트 페이지에 Hero가 뜨는 눈에 띄는 회귀가 생긴다. 위험을 감수할
 * 이유가 없어 recent-notes-index와 동일하게 컴포넌트 내부 가드를 쓴다.
 *
 * 통계는 전부 allFiles 런타임 집계 — 목업의 "129 노트"는 실측 결과 90으로
 * 틀렸음이 확인됨(REDESIGN-GUIDE.md F2). 하드코딩 금지.
 */

type Link = { label: string; href: string; primary?: boolean }

export interface HomeHeroOptions {
  eyebrow: string
  /** \n으로 줄바꿈 */
  headline: string
  description: string
  links: Link[]
  /** 실제 아바타 이미지 미정(design-handoff.md §Q1) — 이니셜 원으로 대체 */
  avatarInitial: string
}

const defaultOptions: HomeHeroOptions = {
  eyebrow: "",
  headline: "",
  description: "",
  links: [],
  avatarInitial: "?",
}

/**
 * [실측으로 정정] recent-notes-index가 쓰는 "frontmatter.title 있으면 실제
 * 노트"라는 휴리스틱은 틀렸다 — `folder-page`/`tag-page`가 자동 생성한
 * 페이지도 title이 채워진다(예: `computer-science/algorithm/index` →
 * title "algorithm"). 빌드된 `static/contentIndex.json` 실측: 총 147건 중
 * 실제 콘텐츠 노트는 87건, 나머지 60건이 `tags/` 하위(27) + `/index`로 끝나는 폴더
 * 페이지(33)다. 슬러그 패턴으로 걸러야 한다.
 */
function isRealNote(f: QuartzPluginData & Record<string, unknown>): boolean {
  const slug = (f.slug as string | undefined) ?? ""
  if (slug.startsWith("tags/")) return false
  if (slug === "index" || slug.endsWith("/index")) return false
  // 실측(DEBUG_HOME_HERO로 allFiles 덤프)에서 404 특수 페이지도 frontmatter.title이
  // 있어 위 조건을 통과해버림을 발견 — 별도 토픽("404")으로 잡혀 8토픽/88노트로
  // 집계됐었다.
  if (slug === "404") return false
  // Phase 6에서 추가된 가상 페이지(topics-page/archive-page)도 같은 이유로 제외.
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

  const HomeHero: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const files = (allFiles as (QuartzPluginData & Record<string, unknown>)[]).filter(
      (f) => f.slug !== fileData.slug && isRealNote(f),
    )
    const noteCount = files.length
    const topicCount = new Set(files.map((f) => (f.slug ?? "").split("/")[0]).filter(Boolean)).size
    const lastUpdateTime = files.reduce((max, f) => Math.max(max, getTime(f)), 0)
    const locale = cfg.locale ?? "en-US"

    return (
      <section class={classNames(displayClass, "home-hero")}>
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
        </div>
        <div class="hero-avatar" aria-hidden="true">
          {opts.avatarInitial}
        </div>
      </section>
    )
  }

  HomeHero.css = style
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
