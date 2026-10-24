// 인기 글 — /api/stats 최근 30일 상위 목록을 빌드 데이터(노트 슬러그 → 제목·링크)로 걸러 5편 채운다. 실패하면 hidden 유지.
const LIMIT = 5

type Meta = { t: string; h: string }
type Top = { path?: string; count?: number }

function row(rank: number, meta: Meta, count: number) {
  const a = document.createElement("a")
  a.className = "archive-page-row archive-page-pop-row"
  a.href = meta.h
  const r = document.createElement("span")
  r.className = "archive-page-rank"
  r.textContent = String(rank).padStart(2, "0")
  const t = document.createElement("span")
  t.className = "archive-page-title"
  t.textContent = meta.t
  const c = document.createElement("span")
  c.className = "archive-page-cat archive-page-count"
  c.textContent = `읽은 사람 ${count.toLocaleString("ko-KR")}명`
  a.append(r, t, c)
  return a
}

async function setup() {
  const section = document.querySelector<HTMLElement>(".archive-page-popular")
  const rows = section?.querySelector<HTMLElement>(".archive-page-rows")
  if (!section || !rows) return
  let notes: Record<string, Meta>
  try {
    notes = JSON.parse(section.dataset.notes ?? "{}")
  } catch {
    return
  }

  const ctrl = new AbortController()
  window.addCleanup(() => ctrl.abort())
  try {
    const res = await fetch("/api/stats", { signal: ctrl.signal })
    if (!res.ok) return
    const data = (await res.json()) as { top?: Top[] }
    if (ctrl.signal.aborted || !Array.isArray(data.top)) return
    const seen = new Set<string>()
    const picked: { meta: Meta; count: number }[] = []
    for (const { path, count } of data.top) {
      if (typeof path !== "string" || typeof count !== "number" || !(count > 0)) continue
      const slug = path.replace(/^\/+|\/+$/g, "")
      const meta = Object.prototype.hasOwnProperty.call(notes, slug) ? notes[slug] : undefined
      if (!meta || seen.has(slug)) continue
      seen.add(slug)
      picked.push({ meta, count })
    }
    picked.sort((a, b) => b.count - a.count)
    const top = picked.slice(0, LIMIT)
    if (!top.length) return
    rows.replaceChildren(...top.map((p, i) => row(i + 1, p.meta, p.count)))
    section.hidden = false
  } catch {}
}

document.addEventListener("nav", setup)
