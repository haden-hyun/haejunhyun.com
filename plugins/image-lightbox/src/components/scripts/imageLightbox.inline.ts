document.addEventListener("nav", () => {
  let overlay = document.getElementById("lightbox-overlay")
  if (!overlay) {
    overlay = document.createElement("div")
    overlay.id = "lightbox-overlay"
    const img = document.createElement("img")
    img.id = "lightbox-img"
    overlay.appendChild(img)
    document.body.appendChild(overlay)
  }

  const close = () => {
    overlay!.classList.remove("active")
    document.body.style.overflow = ""
  }

  overlay.addEventListener("click", close)
  window.addCleanup(() => overlay!.removeEventListener("click", close))

  for (const el of document.querySelectorAll("article img")) {
    const img = el as HTMLImageElement
    if (img.closest(".il-thumb")) continue // 캐러셀 썸네일은 감상 대상이 아니라 네비게이션 컨트롤
    img.style.cursor = "zoom-in"
    const open = () => {
      const lightboxImg = document.getElementById("lightbox-img") as HTMLImageElement
      lightboxImg.src = img.src
      lightboxImg.alt = img.alt
      overlay!.classList.add("active")
      document.body.style.overflow = "hidden"
    }
    img.addEventListener("click", open)
    window.addCleanup(() => img.removeEventListener("click", open))
  }
})
