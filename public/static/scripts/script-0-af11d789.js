
async function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const base = "https://haejunhyun.goatcounter.com/counter/TOTAL.json"
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
