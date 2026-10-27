// 노트 독자 수(/api/stats) — 실패하면 항목을 숨긴다. 응답은 5분 캐시라 SPA 이동마다 다시 받지 않고 한 번만 쓴다.
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
    const n = Number.isFinite(views[path]) ? views[path]! : 0
    out.textContent = `${n.toLocaleString("en-US")} reader${n === 1 ? "" : "s"}`
    row.classList.add("ready")
  })
})
