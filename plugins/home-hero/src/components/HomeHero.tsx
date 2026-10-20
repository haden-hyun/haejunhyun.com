import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { buildSax, renderSax, SAX_REST } from "./sax"
import type { SaxModel } from "./sax"
import style from "./styles/hero.scss"
import { isRealNote } from "../../../_shared/notes"

// 주의: `@quartz-community/utils`를 쓰지 않고 인라인한 것은 의도적이다.
// github: 참조 의존성이라 fresh npm install에서 dist 없이 설치돼 빌드가 깨진다.
function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

/**
 * 홈 히어로 — 헤드라인 + 이름 + 설명 + 링크 줄 + 메타 줄, 우측 3D ASCII 색소폰.
 *
 * - 홈 전용 렌더는 내부 slug 가드. `condition: is-index`는 내장에 없다
 * - 통계는 전부 allFiles 런타임 집계. 하드코딩 금지
 * - 방문 수는 GoatCounter 공개 카운터(토큰 불필요). 사이트 설정의 visitor counter 허용이 꺼지면 "-"로 남는다
 */

const GOATCOUNTER_SITE = "haejunhyun"

// 헤드라인 sweep은 세션당 1회 — 첫 페인트 전에 판정해야 깜빡이지 않는다.
const sweptScript = `try { if (sessionStorage.getItem("hero-swept")) document.documentElement.setAttribute("data-hero-swept", "") } catch {}`

// 주의: start/end는 UTC 자정이고 end는 배타적이다 — start=end면 항상 0. 날짜 단위만 받아 KST 하루는 표현 불가.
const heroScript = `
const buildSax = (${buildSax.toString()});
const renderSax = (${renderSax.toString()});
const REST = ${JSON.stringify(SAX_REST)};
let saxModel = null;

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

function initHeroSax() {
  const box = document.querySelector(".hero-sax")
  const inkEl = box?.querySelector(".hero-sax-ink")
  const fxEl = box?.querySelector(".hero-sax-fx")
  if (!box || !inkEl || !fxEl) return
  saxModel = saxModel || buildSax()
  const buf = {}
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const m = { ay: REST.ay, ax: REST.ax, vy: 0, vx: 0, t: 0, drag: false, lx: 0, ly: 0, lt: 0 }
  let raf = 0, prev = 0, acc = 0, visible = false

  const draw = () => {
    const f = renderSax(saxModel, buf, m.ay, m.ax, m.t)
    inkEl.textContent = f.ink
    fxEl.textContent = f.fx
  }
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; prev = 0 }
  const schedule = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame) }
  // 자동 회전 → 손 떼면 관성 감쇠 + 기울기 복귀. 그리기는 30fps로 제한한다.
  function frame(now) {
    raf = 0
    const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60
    prev = now
    const spin = reduce ? 0 : 0.3
    if (!m.drag) {
      m.vy += (spin - m.vy) * (1 - Math.exp(-dt * 2.2))
      m.vx += (REST.ax - m.ax) * 30 * dt
      m.vx *= Math.exp(-dt * 5)
      m.ay += m.vy * dt
      m.ax += m.vx * dt
    }
    if (!reduce) m.t += dt
    acc += dt
    if (acc >= 1 / 30) { acc = 0; draw() }
    if (reduce && !m.drag && Math.abs(m.vy) < 0.001 && Math.abs(m.vx) < 0.001) { prev = 0; return }
    schedule()
  }

  const down = (e) => {
    m.drag = true; m.lx = e.clientX; m.ly = e.clientY; m.lt = performance.now(); m.vy = 0; m.vx = 0
    box.setPointerCapture?.(e.pointerId)
    box.classList.add("is-dragging")
    schedule()
  }
  const move = (e) => {
    if (!m.drag) return
    const now = performance.now(), dt = Math.max(0.008, (now - m.lt) / 1000)
    const dx = e.clientX - m.lx, dy = e.clientY - m.ly
    m.lx = e.clientX; m.ly = e.clientY; m.lt = now
    m.ay += dx * 0.012; m.ax += dy * 0.012
    m.vy = (dx * 0.012) / dt; m.vx = (dy * 0.012) / dt
  }
  const up = () => {
    if (!m.drag) return
    m.drag = false
    if (performance.now() - m.lt > 80) { m.vy = 0; m.vx = 0 }
    box.classList.remove("is-dragging")
    schedule()
  }
  const onVisibility = () => (document.hidden ? stop() : schedule())
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((en) => en.isIntersecting)
    visible ? schedule() : stop()
  })

  io.observe(box)
  box.addEventListener("pointerdown", down)
  box.addEventListener("pointermove", move)
  box.addEventListener("pointerup", up)
  box.addEventListener("pointercancel", up)
  document.addEventListener("visibilitychange", onVisibility)
  window.addCleanup(() => {
    stop()
    io.disconnect()
    box.removeEventListener("pointerdown", down)
    box.removeEventListener("pointermove", move)
    box.removeEventListener("pointerup", up)
    box.removeEventListener("pointercancel", up)
    document.removeEventListener("visibilitychange", onVisibility)
  })
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  markHeroSwept()
  initHeroSax()
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

let saxModel: SaxModel | undefined
let firstFrame: { ink: string; fx: string } | undefined

/** 클라이언트 첫 프레임과 같은 각도·시간으로 빌드 시 미리 그린다 — 빈칸·레이아웃 이동 방지. */
function getFirstFrame(): { ink: string; fx: string } {
  saxModel ??= buildSax()
  firstFrame ??= renderSax(saxModel, {}, SAX_REST.ay, SAX_REST.ax, 0)
  return firstFrame
}

export default ((userOpts?: Partial<HomeHeroOptions>) => {
  const opts: HomeHeroOptions = { ...defaultOptions, ...userOpts }

  const HomeHero: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, allFiles, displayClass } = props
    if (fileData.slug !== "index") return <></>

    // 토픽 폴더 안의 노트만 센다 — 루트에 놓인 노트가 토픽 1개로 잡히지 않게.
    const files = (allFiles as (QuartzPluginData & Record<string, unknown>)[]).filter(
      (f) => f.slug !== fileData.slug && isRealNote(f.slug) && (f.slug ?? "").includes("/"),
    )
    const noteCount = files.length
    const topicCount = new Set(files.map((f) => (f.slug ?? "").split("/")[0]).filter(Boolean)).size
    const frame = getFirstFrame()
    // 기본값 = summary-description의 홈 description(meta/og와 같은 문장).
    const description =
      opts.description || ((fileData.frontmatter as { description?: string } | undefined)?.description ?? "")

    return (
      <section class={classNames(displayClass, "home-hero")}>
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
        <figure class="hero-sax-figure hero-rise hero-rise-1" aria-hidden="true">
          <div class="hero-sax">
            <div class="hero-sax-ink">{frame.ink}</div>
            <div class="hero-sax-fx">{frame.fx}</div>
          </div>
        </figure>
      </section>
    )
  }

  HomeHero.css = style
  HomeHero.beforeDOMLoaded = sweptScript
  HomeHero.afterDOMLoaded = heroScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
