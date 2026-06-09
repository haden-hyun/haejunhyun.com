const GOATCOUNTER_SITE = "haejunhyun"
const GOATCOUNTER_TOKEN = "fnmzzot0m9xa23gw3qwdgjm6b12vqwp1dpka7r1g0efk22pxtnc"

async function updateVisitorCounts() {
  const todayEl = document.getElementById("visitor-today")
  const totalEl = document.getElementById("visitor-total")
  if (!todayEl && !totalEl) return

  const today = new Date().toISOString().split("T")[0]

  if (todayEl) {
    try {
      const res = await fetch(
        `https://${GOATCOUNTER_SITE}.goatcounter.com/api/v0/stats/total?start=${today}&end=${today}`,
        { headers: { Authorization: `Bearer ${GOATCOUNTER_TOKEN}` } },
      )
      if (res.ok) {
        const data = await res.json()
        todayEl.textContent = String(data.total ?? 0)
      }
    } catch {}
  }

  if (totalEl) {
    try {
      const res = await fetch(
        `https://${GOATCOUNTER_SITE}.goatcounter.com/counter/TOTAL.json`,
      )
      if (res.ok) {
        const data = await res.json()
        totalEl.textContent = data.count ?? "0"
      }
    } catch {}
  }
}

document.addEventListener("nav", () => {
  updateVisitorCounts()
})
