import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import style from "./styles/hero.scss"

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

/** 2026.09.13 — 메타 줄은 로케일과 무관하게 한 형식. */
function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/**
 * 홈 마스트헤드 — 메타 한 줄 + 헤드라인 + 설명 + 링크.
 *
 * - 홈 전용 렌더는 내부 slug 가드. `condition: is-index`는 내장에 없다
 * - 통계는 전부 allFiles 런타임 집계. 하드코딩 금지
 * - 방문 수는 GoatCounter 공개 카운터(토큰 불필요). 사이트 설정의 visitor counter 허용이 꺼지면 "-"로 남는다
 */

const GOATCOUNTER_SITE = "haejunhyun"

// 주의: start/end는 UTC 자정이고 end는 배타적이다 — start=end면 항상 0. 날짜 단위만 받아 KST 하루는 표현 불가.
const visitScript = `
async function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const base = "https://${GOATCOUNTER_SITE}.goatcounter.com/counter/TOTAL.json"
  const day = new Date().toISOString().slice(0, 10)
  const next = new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  const get = (url, el) =>
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && el) el.textContent = d.count })
      .catch(() => {})
  get(base, total)
  get(base + "?start=" + day + "&end=" + next, today)
}
document.addEventListener("nav", fillHeroVisits)
`

type Link = { label: string; href: string; primary?: boolean }

export interface HomeHeroOptions {
  /** \n으로 줄바꿈 */
  headline: string
  description: string
  links: Link[]
}

const defaultOptions: HomeHeroOptions = {
  headline: "",
  description: "",
  links: [],
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

  const HomeHero: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, allFiles, displayClass } = props
    if (fileData.slug !== "index") return <></>

    // 토픽 폴더 안의 노트만 센다 — 루트에 놓인 노트가 토픽 1개로 잡히지 않게.
    const files = (allFiles as (QuartzPluginData & Record<string, unknown>)[]).filter(
      (f) => f.slug !== fileData.slug && isRealNote(f) && (f.slug ?? "").includes("/"),
    )
    const noteCount = files.length
    const topicCount = new Set(files.map((f) => (f.slug ?? "").split("/")[0]).filter(Boolean)).size
    const lastUpdateTime = files.reduce((max, f) => Math.max(max, getTime(f)), 0)

    return (
      <section class={classNames(displayClass, "home-hero")}>
        <div class="hero-main">
          <div class="hero-meta">
            <span>
              <b>{noteCount}</b> NOTES
            </span>
            <span>
              <b>{topicCount}</b> TOPICS
            </span>
            <span>
              <b id="hero-visits-total">-</b> VISITS
            </span>
            <span>
              <b id="hero-visits-today">-</b> TODAY
            </span>
            {lastUpdateTime > 0 && (
              <span>
                UPDATED <b>{formatDate(new Date(lastUpdateTime))}</b>
              </span>
            )}
          </div>
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
                  class={classNames(undefined, link.primary ? "hero-btn-primary" : "hero-link")}
                  href={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  HomeHero.css = style
  HomeHero.afterDOMLoaded = visitScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
