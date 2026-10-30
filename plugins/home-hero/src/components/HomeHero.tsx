// 홈 히어로 — 가운데 정렬 헤드라인("Blue Notes." 글자마다 음표 하나 + 색소폰)과 이름·설명·링크·메타 줄.
// - 홈(slug "index")에서만 렌더한다. `condition: is-index`는 내장에 없어 내부 slug 가드로 거른다
// - 통계는 allFiles 런타임 집계(하드코딩 금지). 방문 수는 /api/stats(KST 기준), 실패하면 GoatCounter 공개 카운터로 total만 채우고 today는 "-"
// - 악보(오선·음자리표·음표 11개)와 기울어진 회전 색소폰은 클라이언트(client.ts)가 글자 위치를 재서 그린다. 색소폰 슬롯 크기는 빌드 시 계산해 레이아웃 이동이 없다
// - 글자 수(공백 제외)가 HERO_NOTES보다 하나 적어야(색소폰이 마지막 음) 악보를 그린다. 아니면 제목만 렌더하고 빌드 경고를 낸다
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { buildSax, saxExtent, saxXf, SAX, HERO_NOTES } from "./sax"
import type { SaxExtent } from "./sax"
import { heroClient } from "./client"
import style from "./styles/hero.scss"
import { isListedNote } from "../../../_shared/notes"

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

const GOATCOUNTER_SITE = "haejunhyun"
// 글꼴 하위 집합(OFL 1.1, Google Fonts): Noto Music 음자리표(U+1D11E)·♭·♮·4/4(U+1D134) 4자. display=block — 대체 글꼴이 먼저 보이지 않게.
const NOTO_MUSIC_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Music&text=%F0%9D%84%9E%E2%99%AD%E2%99%AE%F0%9D%84%B4&display=block"
const FONT_LOADS = [
  ['10px "Noto Music"', "\u{1D11E}♭♮\u{1D134}"],
  ['900 10px "Hahmlet"', "Blue Notes."],
]

// 첫 진입 연출은 세션당 1회 — 첫 페인트 전에 판정해야 깜빡이지 않는다. data-hero-js: JS가 없으면 연출 전 숨김 상태를 걸지 않는다.
const sweptScript = `try { document.documentElement.setAttribute("data-hero-js", ""); if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`

// 주의: 공개 카운터 폴백은 UTC 일 단위라 KST today를 낼 수 없다 — 폴백에선 today를 채우지 않는다
const heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  saxXf: (${saxXf.toString()}),
  SAX: ${JSON.stringify(SAX)},
  NOTES: ${JSON.stringify(HERO_NOTES)},
  FONT_LOADS: ${JSON.stringify(FONT_LOADS)},
}
const heroClient = (${heroClient.toString()})

function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const set = (el, n) => { if (el && Number.isFinite(n)) el.textContent = n }
  fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (!d || !Number.isFinite(d.total) || !Number.isFinite(d.today)) return Promise.reject()
      set(total, d.total)
      set(today, d.today)
    })
    .catch(() =>
      fetch("https://${GOATCOUNTER_SITE}.goatcounter.com/counter/TOTAL.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && total) total.textContent = d.count })
        .catch(() => {}),
    )
}

function markHeroSwept() {
  const root = document.documentElement
  if (!document.querySelector(".home-hero") || root.hasAttribute("data-hero-swept")) return
  try { sessionStorage.setItem("hero-swept", "1") } catch {}
  window.addCleanup(() => root.setAttribute("data-hero-swept", ""))
}

function initHero() {
  if (!document.querySelector(".home-hero")) return
  heroLib.model = heroLib.model || heroLib.buildSax()
  heroClient(heroLib)
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  markHeroSwept()
  initHero()
})
`

type Link = { label: string; href: string }

export interface HomeHeroOptions {
  headline: string
  author: string
  description: string
  links: Link[]
}

const defaultOptions: HomeHeroOptions = {
  headline: "",
  author: "",
  description: "",
  links: [],
}

type FileData = QuartzPluginData & Record<string, unknown>

let ext: SaxExtent | undefined
/** 색소폰 슬롯 크기와 각도별 중심 표 — 빌드 시 한 번 계산한다. */
function getExtent(): SaxExtent {
  return (ext ??= saxExtent(buildSax()))
}

export default ((userOpts?: Partial<HomeHeroOptions>) => {
  const opts: HomeHeroOptions = { ...defaultOptions, ...userOpts }

  const HomeHero: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, allFiles, displayClass } = props
    if (fileData.slug !== "index") return <></>

    // 토픽 폴더 안의 노트만 센다 — 루트에 놓인 노트가 토픽 1개로 잡히지 않게.
    const files = (allFiles as FileData[]).filter(
      (f) => f.slug !== fileData.slug && isListedNote(f) && (f.slug ?? "").includes("/"),
    )
    const noteCount = files.length
    const topicCount = new Set(files.map((f) => (f.slug ?? "").split("/")[0] ?? "")).size
    const description =
      opts.description || ((fileData.frontmatter as { description?: string } | undefined)?.description ?? "")

    // 헤드라인 글자마다 span(--i = 음 번호). 공백은 그대로 둔다.
    const chars = [...opts.headline]
    const letterCount = chars.filter((c) => c.trim() !== "").length
    const notation = letterCount === HERO_NOTES.length - 1
    if (opts.headline && !notation) {
      console.warn(
        `[home-hero] 헤드라인 글자 수(${letterCount})가 음표 수(${HERO_NOTES.length - 1})와 달라 악보 연출을 건너뜁니다.`,
      )
    }
    let idx = 0
    const x = getExtent()

    return (
      <section class={classNames(displayClass, "home-hero")}>
        {notation && <link rel="stylesheet" href={NOTO_MUSIC_CSS} />}
        {notation ? (
          // 제목 이름은 aria-label로 준다(글자 span이 "B l u e"로 읽히지 않게). 악보 SVG는 h1 밖 래퍼에 둬 h1 텍스트에 음악 기호가 섞이지 않는다.
          <div class="hero-title">
            <h1 class="hero-headline" aria-label={opts.headline} data-notation="on">
              <span class="hero-letters" aria-hidden="true">
                {chars.map((c) =>
                  c.trim() === "" ? (
                    c
                  ) : (
                    <span class="hl" style={`--i:${idx++}`}>
                      {c}
                    </span>
                  ),
                )}
                <span
                  class="hero-sax"
                  style={`--i:${HERO_NOTES.length - 1};--sax-k:${x.k};--sax-ar:${x.ar}`}
                  data-ext={JSON.stringify(x)}
                >
                  <canvas />
                </span>
              </span>
            </h1>
          </div>
        ) : (
          <h1 class="hero-headline">{opts.headline}</h1>
        )}
        {opts.author && <p class="hero-author">{opts.author}</p>}
        {description && <p class="hero-description">{description}</p>}
        {opts.links.length > 0 && (
          <p class="hero-links">
            {opts.links.map((link) => (
              <a href={link.href}>{link.label}</a>
            ))}
          </p>
        )}
        <p class="hero-meta">
          {noteCount} notes · {topicCount} topics ·{" "}
          <span id="hero-visits-total" class="hero-num hero-num-total">
            -
          </span>{" "}
          visits ·{" "}
          <span id="hero-visits-today" class="hero-num">
            -
          </span>{" "}
          today
        </p>
      </section>
    )
  }

  HomeHero.css = style
  HomeHero.beforeDOMLoaded = sweptScript
  HomeHero.afterDOMLoaded = heroScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
