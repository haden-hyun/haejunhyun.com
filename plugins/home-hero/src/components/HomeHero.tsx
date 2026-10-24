// 홈 히어로 — 헤드라인·이름·설명·링크·메타 줄, 2단 노트 선반(24권), 노트 카드.
// - 홈(slug "index")에서만 렌더한다. `condition: is-index`는 내장에 없어 내부 slug 가드로 거른다
// - 통계·선반은 전부 allFiles 집계(하드코딩 금지). 선반은 SSR로 전부 그려 JS 없이도 보인다
// - 방문 수는 /api/stats(KST 기준). 실패하면 GoatCounter 공개 카운터로 total만 채우고 today는 "-"로 남긴다
// - 클라이언트(client.ts)는 hover 칩·노트 카드·방향키 이동만 얹는다
import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import { pickShelf } from "./shelf"
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

const GOATCOUNTER_SITE = "haejunhyun"

// 주의: 공개 카운터 폴백은 UTC 일 단위라 KST today를 낼 수 없다 — 폴백에선 today를 채우지 않는다
const heroScript = `
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

function initHero() {
  if (document.querySelector(".home-hero")) heroClient()
}

document.addEventListener("nav", () => {
  fillHeroVisits()
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

    // 선반 후보: 날짜는 posted → created. 선정·배치는 shelf.ts(순수 함수).
    const ymd = (d: Date | undefined) => (d ? formatYmd(d) : "")
    const cands = files.map((f) => {
      const fm = (f.frontmatter ?? {}) as Record<string, unknown>
      const text = (f.text as string | undefined) ?? ""
      const p = ymd(getListDate(f))
      const c = ymd(getNoteDates(f).created)
      return {
        slug: f.slug ?? "",
        topic: topicKey(f),
        date: p || c,
        t: (fm.title as string | undefined) ?? f.slug ?? "",
        tl: topicName(topicKey(f)),
        h: resolveRelative(fileData.slug!, f.slug!),
        p,
        c,
        m: readingMinutes(text),
        d: (fm.description as string | undefined) ?? "",
        sl: seriesLabel(f as Parameters<typeof seriesLabel>[0]) ?? "",
      }
    })
    const shelfRows = pickShelf(cands)
    const shelfCount = shelfRows.reduce((s, r) => s + r.length, 0)
    // 주의: </script> 조각이 데이터에 섞여도 태그가 닫히지 않게 꺾쇠를 이스케이프한다.
    const json = JSON.stringify({
      notes: shelfRows.flat().map((n) => ({ t: n.t, tl: n.tl, h: n.h, p: n.p, c: n.c, m: n.m, d: n.d, sl: n.sl, isNew: n.isNew })),
    }).replace(/</g, "\\u003c")

    return (
      <section class={classNames(displayClass, "home-hero")}>
        <div class="hero-text">
          <h1 class="hero-headline">{opts.headline}</h1>
          {opts.author && <p class="hero-author">{opts.author}</p>}
          {description && <p class="hero-description">{description}</p>}
          <div>
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
        <div class="hero-shelf" role="group" aria-label={`노트 ${shelfCount}편`}>
          {shelfRows.map((row) => (
            <div class="hero-row">
              {row.map((n) => (
                <a
                  class={classNames("hero-spine", n.isNew && "is-new", n.gap && "has-gap")}
                  href={n.h}
                  data-k={n.k}
                  aria-label={`${n.t} — ${n.tl}`}
                  style={`height:${n.hp}%`}
                >
                  <span class="hero-spine-t">{n.t}</span>
                </a>
              ))}
            </div>
          ))}
          <div class="hero-tip" aria-hidden="true" />
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
  HomeHero.afterDOMLoaded = heroScript
  return HomeHero
}) satisfies QuartzComponentConstructor<Partial<HomeHeroOptions>>
