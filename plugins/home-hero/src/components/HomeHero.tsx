import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { buildSax, rasterSax, fitSax, composeSax, SAX_REST, SAX_CFG } from "./sax"
import type { SaxFit, SaxModel } from "./sax"
import { planShelf, SHELF_CFG } from "./shelf"
import { heroClient } from "./client"
import style from "./styles/hero.scss"
import { isListedNote, topicName } from "../../../_shared/notes"
import { formatYmd, getListDate, getNoteDates, readingMinutes } from "../../../_shared/noteMeta"
import { resolveRelative } from "../../../_shared/path"
import { seriesLabel } from "../../../_shared/series"

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

/**
 * 홈 히어로 — 헤드라인 + 이름 + 설명 + 링크 줄 + 메타 줄, 노트 선반(CATALOG), 음표로 그린 색소폰.
 *
 * - 홈 전용 렌더는 내부 slug 가드. `condition: is-index`는 내장에 없다
 * - 통계·선반·키 토픽은 전부 allFiles 런타임 집계. 하드코딩 금지
 * - 방문 수는 GoatCounter 공개 카운터(토큰 불필요). 사이트 설정의 visitor counter 허용이 꺼지면 "-"로 남는다
 */

const GOATCOUNTER_SITE = "haejunhyun"
// 음표 기호 5자만 받는 Noto Music 하위 집합(OFL 1.1, Google Fonts).
const NOTO_MUSIC_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Music&text=%E2%99%A9%E2%99%AA%E2%99%AB%E2%99%AC%E2%99%AD&display=swap"
// 선반 칸막이 탭 이름(토픽 폴더 → 짧은 대문자). 없으면 폴더 이름을 대문자로.
const TAB_NAMES: Record<string, string> = {
  programming: "PROG",
  "data-engineering": "DATA-ENG",
  "data-science": "DATA-SCI",
  "computer-science": "CS",
  gis: "GIS",
  "finance-property": "FINANCE",
  tools: "TOOLS",
}

// 헤드라인 sweep은 세션당 1회 — 첫 페인트 전에 판정해야 깜빡이지 않는다.
const sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`

// 주의: start/end는 UTC 자정이고 end는 배타적이다 — start=end면 항상 0. 날짜 단위만 받아 KST 하루는 표현 불가.
const heroScript = `
const heroLib = {
  buildSax: (${buildSax.toString()}),
  rasterSax: (${rasterSax.toString()}),
  fitSax: (${fitSax.toString()}),
  composeSax: (${composeSax.toString()}),
  planShelf: (${planShelf.toString()}),
  SAX_CFG: ${JSON.stringify(SAX_CFG)},
  SHELF_CFG: ${JSON.stringify(SHELF_CFG)},
  REST: ${JSON.stringify(SAX_REST)},
}
const heroClient = (${heroClient.toString()})

function fillHeroVisits() {
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
  heroLib.shelfH = heroLib.SAX_CFG.rows * heroLib.SAX_CFG.ch - heroLib.SAX_CFG.glyphTop - heroLib.SAX_CFG.glyphBottom + 1
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
let prerender: { glyphs: ReturnType<typeof composeSax>["glyphs"]; keys: [number, number][] } | undefined

/** 정지 자세 한 장을 빌드 시 미리 굽는다 — JS 없이도 보이고, 캔버스가 뜨기 전 빈칸·레이아웃 이동이 없다. */
function getPrerender() {
  saxModel ??= buildSax()
  saxFit ??= fitSax(saxModel, rasterSax, SAX_REST, SAX_CFG.rows)
  prerender ??= composeSax(saxModel, rasterSax, {}, saxFit, SAX_CFG, SAX_REST.ay, SAX_REST.ax, () => 0)
  return { fit: saxFit, ...prerender }
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
    const topicKeys = [...new Set(files.map(topicKey).filter(Boolean))]
    const topicCount = topicKeys.length
    const description =
      opts.description || ((fileData.frontmatter as { description?: string } | undefined)?.description ?? "")

    // 선반·카드 데이터: posted → created → slug 순. 카탈로그 번호도 이 순서.
    const ymd = (d: Date | undefined) => (d ? formatYmd(d) : "")
    const rows = files
      .map((f) => {
        const fm = (f.frontmatter ?? {}) as Record<string, unknown>
        const text = (f.text as string | undefined) ?? ""
        return {
          slug: f.slug ?? "",
          t: (fm.title as string | undefined) ?? f.slug ?? "",
          h: resolveRelative(fileData.slug!, f.slug!),
          p: ymd(getListDate(f)),
          c: ymd(getNoteDates(f).created),
          m: readingMinutes(text),
          d: (fm.description as string | undefined) ?? "",
          tp: topicKey(f),
          len: text.replace(/\s+/g, "").length,
          series: (fm.series as string | undefined) ?? "",
          sidx: Number(fm.series_index ?? 0) || 0,
          sl: seriesLabel(f as Parameters<typeof seriesLabel>[0]) ?? "",
        }
      })
      .sort((a, b) => a.p.localeCompare(b.p) || a.c.localeCompare(b.c) || a.slug.localeCompare(b.slug))
    const notes = rows.map((r, i) => ({
      n: "HJ " + (4001 + i),
      t: r.t,
      h: r.h,
      p: r.p,
      c: r.c,
      m: r.m,
      d: r.d,
      tp: r.tp,
      len: r.len,
      topic: r.tp,
      posted: r.p,
      created: r.c,
      href: r.h,
      series: r.series,
      sidx: r.sidx,
      sl: r.sl,
    }))
    const tabs = Object.fromEntries(topicKeys.map((k) => [k, TAB_NAMES[k] ?? k.toUpperCase()]))
    const labels = Object.fromEntries(topicKeys.map((k) => [k, topicName(k)]))
    const topicOrder = Object.keys(TAB_NAMES).filter((k) => topicKeys.includes(k)).concat(topicKeys.filter((k) => !(k in TAB_NAMES)))
    const data = {
      notes,
      topics: topicOrder,
      tabs,
      labels,
      archive: resolveRelative(fileData.slug!, "archive"),
    }
    // 주의: </script> 조각이 데이터에 섞여도 태그가 닫히지 않게 꺾쇠를 이스케이프한다.
    const json = JSON.stringify(data).replace(/</g, "\\u003c")

    // 정지 자세 프리렌더(SVG). 최근 판정은 빌드 시점 기준이고, 클라이언트가 오늘 날짜로 다시 그린다.
    const pre = getPrerender()
    const W = pre.fit.cols * SAX_CFG.cw
    const H = SAX_CFG.rows * SAX_CFG.ch
    const byRow = new Map<string, { y: number; tier: number; xs: string[]; chs: string }>()
    for (const [x, y, ch, tier] of pre.glyphs) {
      const k = y + "|" + tier
      const g = byRow.get(k) ?? { y, tier, xs: [], chs: "" }
      g.xs.push(x.toFixed(1))
      g.chs += ch
      byRow.set(k, g)
    }
    const buildNow = Date.now()
    const keyTopics = topicKeys
      .map((k) => ({ k, n: files.filter((f) => topicKey(f) === k).length, recent: notes.some((n) => n.tp === k && (buildNow - Date.parse(n.p)) / 864e5 <= 45) }))
      .sort((a, b) => b.n - a.n)
    const shelfH = SAX_CFG.rows * SAX_CFG.ch - SAX_CFG.glyphTop - SAX_CFG.glyphBottom + 1

    return (
      <section class={classNames(displayClass, "home-hero")}>
        <link rel="stylesheet" href={NOTO_MUSIC_CSS} />
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
        <div class="hero-shelf-wrap hero-rise hero-rise-2">
          <nav class="hero-shelf" role="group" aria-label={`노트 카탈로그 ${noteCount}편`} style={`--shelf-h:${shelfH.toFixed(2)}px`}>
            {notes.map((n) => (
              <a class="hero-spine" href={n.h} title={n.t}>
                <span class="hero-spine-band" />
              </a>
            ))}
          </nav>
        </div>
        <div
          class="hero-sax hero-rise hero-rise-1"
          style={`--sax-w:${W.toFixed(1)}px;--sax-ar:${(W / H).toFixed(4)};--box-h:${shelfH.toFixed(2)}px;--g-top:${SAX_CFG.glyphTop}px`}
        >
          <svg class="hero-sax-pre" viewBox={`0 0 ${W.toFixed(1)} ${H.toFixed(1)}`} aria-hidden="true">
            {[...byRow.values()].map((g) => (
              <text class={`t${g.tier}`} x={g.xs.join(" ")} y={g.y.toFixed(1)}>
                {g.chs}
              </text>
            ))}
            {pre.keys.map(([x, y], i) => (
              <text class={classNames("k", keyTopics[i]?.recent && "is-pressed", i === 0 && "is-music")} x={x.toFixed(1)} y={(y + (i === 0 ? 0 : 0.5)).toFixed(1)}>
                {SAX_CFG.keyChars[i]}
              </text>
            ))}
          </svg>
          <canvas class="hero-sax-cv" aria-hidden="true" />
          <div class="hero-keys" role="group" aria-label="색소폰 키 = 토픽" />
          <div class="hero-keytip" role="tooltip" hidden />
          <i class="hero-tone t0" />
          <i class="hero-tone t1" />
          <i class="hero-tone t2" />
          <i class="hero-tone tb" />
        </div>
        <script type="application/json" class="hero-data" dangerouslySetInnerHTML={{ __html: json }} />
        <dialog class="hero-card" aria-labelledby="hero-card-title" aria-describedby="hero-card-desc">
          <div class="hero-card-in">
            <div class="hero-card-handle" aria-hidden="true" />
            <p class="hero-card-eyebrow" />
            <h2 class="hero-card-title" id="hero-card-title" tabindex={-1} />
            <p class="hero-card-meta" />
            <p class="hero-card-desc" id="hero-card-desc" />
            <div class="hero-card-actions">
              <button class="hero-card-prev" type="button" aria-label="이전 노트">
                ‹
              </button>
              <button class="hero-card-next" type="button" aria-label="다음 노트">
                ›
              </button>
              <span class="hero-card-gap" />
              <button class="hero-card-close" type="button">
                닫기
              </button>
              <a class="hero-card-dive" href="#" data-router-ignore>
                DIVE IN <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </dialog>
      </section>
    )
  }

  HomeHero.css = style
  HomeHero.beforeDOMLoaded = sweptScript
  HomeHero.afterDOMLoaded = heroScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
