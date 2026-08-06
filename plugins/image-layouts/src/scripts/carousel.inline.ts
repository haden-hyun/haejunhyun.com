// 캐러셀 화살표·썸네일. CSS scroll-snap이 이미 스와이프를 처리하므로 이건 순수 향상이다.
// ⚠️ 정리는 window.addCleanup에 맡긴다 — Quartz가 prenav에서 호출한다.
document.addEventListener("nav", () => {
  const carousels = document.querySelectorAll<HTMLElement>('.il-carousel[data-needs-init="true"]')

  for (const carousel of carousels) {
    const viewport = carousel.querySelector<HTMLElement>(".il-viewport")
    if (!viewport) continue

    const slides = Array.from(viewport.querySelectorAll<HTMLElement>(".il-item"))
    if (slides.length < 2) continue

    const thumbs = Array.from(carousel.querySelectorAll<HTMLElement>(".il-thumb"))
    const current = () => Math.round(viewport.scrollLeft / viewport.clientWidth)

    const goTo = (index: number) => {
      const slide = slides[Math.max(0, Math.min(slides.length - 1, index))]
      if (slide) viewport.scrollTo({ left: slide.offsetLeft - viewport.offsetLeft })
    }

    const syncThumbs = () => {
      const active = current()
      thumbs.forEach((thumb, i) => thumb.classList.toggle("is-active", i === active))
    }

    const addButton = (cls: string, label: string, glyph: string, onClick: () => void) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = `il-nav ${cls}`
      button.setAttribute("aria-label", label)
      button.textContent = glyph
      button.addEventListener("click", onClick)
      carousel.appendChild(button)
      window.addCleanup(() => {
        button.removeEventListener("click", onClick)
        button.remove()
      })
    }

    addButton("il-prev", "이전 이미지", "‹", () => goTo(current() - 1))
    addButton("il-next", "다음 이미지", "›", () => goTo(current() + 1))

    thumbs.forEach((thumb, i) => {
      const onClick = () => goTo(i)
      thumb.addEventListener("click", onClick)
      window.addCleanup(() => thumb.removeEventListener("click", onClick))
    })

    viewport.addEventListener("scroll", syncThumbs, { passive: true })
    window.addCleanup(() => viewport.removeEventListener("scroll", syncThumbs))
    syncThumbs()

    carousel.removeAttribute("data-needs-init")
  }
})
