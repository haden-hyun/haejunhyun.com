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
