// 홈 히어로 — 헤드라인·이름·설명·링크·메타 줄과 음표로 그린 색소폰.
// - 홈(slug "index")에서만 렌더한다. `condition: is-index`는 내장에 없어 내부 slug 가드로 거른다
// - 통계는 allFiles 런타임 집계(하드코딩 금지). 방문 수는 /api/stats(KST 기준), 실패하면 GoatCounter 공개 카운터로 total만 채우고 today는 "-"
// - 운지 키 7개 = 토픽 7개(편수 순, 최근 글이 있으면 눌린 키). 토픽 집계도 allFiles 런타임
// - 색소폰 정지 자세를 빌드 시 SVG(라이트·다크 두 장, 테마 속성으로 전환)로 미리 굽고, 클라이언트(client.ts)가 캔버스로 이어받는다
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { buildSax, rasterSax, fitSax, composeSax, SAX_REST, SAX_CFG } from "./sax"
import type { SaxFit, SaxModel } from "./sax"
import { heroClient } from "./client"
import style from "./styles/hero.scss"
import { isListedNote, topicName } from "../../../_shared/notes"
import { formatYmd, getListDate } from "../../../_shared/noteMeta"

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

const GOATCOUNTER_SITE = "haejunhyun"
// 글꼴 하위 집합(OFL 1.1, Google Fonts): Noto Music 음표·임시표 7자, Noto Sans Symbols 2 ✦✧◦· 4자.
const NOTO_MUSIC_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Music&text=%E2%99%A9%E2%99%AA%E2%99%AB%E2%99%AC%E2%99%AD%E2%99%AE%E2%99%AF&display=swap"
const NOTO_SYMBOLS_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%9C%A6%E2%9C%A7%E2%97%A6%C2%B7&display=swap"
const SAX_FONT = '"Noto Music", "Noto Sans Symbols 2", sans-serif'
const SAX_FONT_LOADS = [
  ['10px "Noto Music"', "♩♪♫♬♭♮♯"],
  ['10px "Noto Sans Symbols 2"', "✦✧◦·"],
]

// 헤드라인 sweep은 세션당 1회 — 첫 페인트 전에 판정해야 깜빡이지 않는다.
const sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`

// 주의: 공개 카운터 폴백은 UTC 일 단위라 KST today를 낼 수 없다 — 폴백에선 today를 채우지 않는다
const heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  rasterSax: (${rasterSax.toString()}),
  fitSax: (${fitSax.toString()}),
  composeSax: (${composeSax.toString()}),
  SAX_CFG: ${JSON.stringify(SAX_CFG)},
  REST: ${JSON.stringify(SAX_REST)},
  FONT: ${JSON.stringify(SAX_FONT)},
  FONT_LOADS: ${JSON.stringify(SAX_FONT_LOADS)},
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
  heroLib.fit = heroLib.fit || heroLib.fitSax(heroLib.model, heroLib.rasterSax, heroLib.REST, heroLib.SAX_CFG.rows)
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

let saxModel: SaxModel | undefined
let saxFit: SaxFit | undefined
const prerender: Partial<Record<"light" | "dark", ReturnType<typeof composeSax>>> = {}

/** 정지 자세를 테마별로 빌드 시 미리 굽는다 — JS 없이도 보이고, 캔버스가 뜨기 전 빈칸·레이아웃 이동이 없다. */
function getPrerender(theme: "light" | "dark") {
  saxModel ??= buildSax()
  saxFit ??= fitSax(saxModel, rasterSax, SAX_REST, SAX_CFG.rows)
  prerender[theme] ??= composeSax(saxModel, rasterSax, {}, saxFit, SAX_CFG, SAX_REST.ay, SAX_REST.ax, () => 0, theme === "dark")
  return { fit: saxFit, ...prerender[theme]! }
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
    const topicKey = (f: FileData) => (f.slug ?? "").split("/")[0] ?? ""
    // 키 = 토픽: 편수 순. p = 토픽의 가장 최근 posted(클라이언트가 오늘 기준으로 "최근 글" 재판정)
    const byTopic = new Map<string, { n: number; p: string }>()
    for (const f of files) {
      const k = topicKey(f)
      const p = getListDate(f) ? formatYmd(getListDate(f)!) : ""
      const cur = byTopic.get(k) ?? { n: 0, p: "" }
      byTopic.set(k, { n: cur.n + 1, p: p > cur.p ? p : cur.p })
    }
    const topics = [...byTopic.entries()]
      .map(([k, v]) => ({ k, label: topicName(k), n: v.n, p: v.p }))
      .sort((a, b) => b.n - a.n || a.k.localeCompare(b.k))
    const topicCount = topics.length
    const buildNow = Date.now()
    const isRecent = (p: string) => !!p && (buildNow - Date.parse(p)) / 864e5 <= 45
    // 주의: </script> 조각이 데이터에 섞여도 태그가 닫히지 않게 꺾쇠를 이스케이프한다.
    const json = JSON.stringify({ topics }).replace(/</g, "\\u003c")
    const description =
      opts.description || ((fileData.frontmatter as { description?: string } | undefined)?.description ?? "")

    const pre = getPrerender("light")
    const W = pre.fit.cols * SAX_CFG.cw
    const H = SAX_CFG.rows * SAX_CFG.ch
    // 단마다 <text> 하나(x·y 목록)로 줄여 HTML을 작게 둔다.
    const levels = (g: typeof pre.glyphs) => {
      const by = new Map<number, { x: string[]; y: string[]; chs: string }>()
      for (const [x, y, ch, k] of g) {
        const e = by.get(k) ?? { x: [], y: [], chs: "" }
        e.x.push(x.toFixed(1))
        e.y.push(y.toFixed(1))
        e.chs += ch
        by.set(k, e)
      }
      return [...by.entries()].sort((a, b) => a[0] - b[0])
    }
    const keyMarks = pre.keys.map(([x, y], i) => {
      const pressed = !!topics[i] && isRecent(topics[i]!.p)
      const music = i === 0
      return (
        <>
          {SAX_CFG.keyRing && <circle class={classNames("kr", pressed && "is-pressed")} cx={x.toFixed(1)} cy={y.toFixed(1)} r={pressed ? 7 : 6} />}
          <text class={classNames("k", pressed && "is-pressed", music && "is-music")} x={x.toFixed(1)} y={(y + (music ? 0 : 0.5)).toFixed(1)}>
            {SAX_CFG.keyChars[i]}
          </text>
        </>
      )
    })
    const preSvg = (theme: "light" | "dark") => (
      <svg class={`hero-sax-pre on-${theme}`} viewBox={`0 0 ${W.toFixed(1)} ${H.toFixed(1)}`} aria-hidden="true">
        {levels(getPrerender(theme).glyphs).map(([k, e]) => (
          <text class={`s${k}`} x={e.x.join(" ")} y={e.y.join(" ")}>
            {e.chs}
          </text>
        ))}
        {keyMarks}
      </svg>
    )

    return (
      <section class={classNames(displayClass, "home-hero")}>
        <link rel="stylesheet" href={NOTO_MUSIC_CSS} />
        <link rel="stylesheet" href={NOTO_SYMBOLS_CSS} />
        <div class="hero-text">
          <h1 class="hero-headline">{opts.headline}</h1>
          {opts.author && <p class="hero-author hero-rise hero-rise-1">{opts.author}</p>}
          {description && <p class="hero-description hero-rise hero-rise-2">{description}</p>}
          <div class="hero-rise hero-rise-3">
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
          </div>
        </div>
        <div
          class="hero-sax hero-rise hero-rise-1"
          style={`--sax-w:${W.toFixed(1)}px;--sax-ar:${(W / H).toFixed(4)};--box-h:${H.toFixed(1)}px`}
        >
          {preSvg("light")}
          {preSvg("dark")}
          <canvas class="hero-sax-cv" aria-hidden="true" />
          <div class="hero-keys" role="group" aria-label="색소폰 키 = 토픽" />
          <div class="hero-keytip" role="tooltip" hidden />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <i class={`hero-tone s${k}`} />
          ))}
          <i class="hero-tone tk" />
          <i class="hero-tone tp" />
        </div>
        <script type="application/json" class="hero-data" dangerouslySetInnerHTML={{ __html: json }} />
      </section>
    )
  }

  HomeHero.css = style
  HomeHero.beforeDOMLoaded = sweptScript
  HomeHero.afterDOMLoaded = heroScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
