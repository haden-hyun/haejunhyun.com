// 노트 조회 수(/api/stats) — 실패하면 행을 접는다. 응답은 5분 캐시라 SPA 이동마다 다시 받지 않고 한 번만 쓴다.
let stats: Promise<Record<string, number> | null> | undefined

function loadViews() {
  stats ??= fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && typeof d.views === "object" && d.views ? (d.views as Record<string, number>) : null))
    .catch(() => null)
  return stats
}

function viewPath() {
  let p = location.pathname
  try {
    p = decodeURIComponent(p)
  } catch {}
  return p.length > 1 ? p.replace(/\/+$/, "") : "/"
}

document.addEventListener("nav", () => {
  const row = document.querySelector<HTMLElement>(".note-specs-readers")
  const out = row?.querySelector<HTMLElement>(".note-specs-readers-count")
  if (!row || !out) return
  const path = viewPath()
  let alive = true
  window.addCleanup(() => {
    alive = false
  })
  loadViews().then((views) => {
    if (!alive) return
    if (!views) {
      row.hidden = true
      return
    }
    const n = views[path]
    out.textContent = (Number.isFinite(n) ? n : 0).toLocaleString("en-US") + "명"
    row.classList.add("ready")
  })
})
