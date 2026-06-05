document.addEventListener("nav", () => {
  const bar = document.getElementById("reading-progress-bar")
  if (!bar) return

  const update = () => {
    const scrollTop = window.scrollY
    const height = document.documentElement.scrollHeight - window.innerHeight
    bar.style.width = height > 0 ? `${Math.min((scrollTop / height) * 100, 100)}%` : "0%"
  }

  window.addEventListener("scroll", update, { passive: true })
  window.addCleanup(() => window.removeEventListener("scroll", update))
  update()
})
