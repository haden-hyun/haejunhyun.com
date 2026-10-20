document.addEventListener("nav", () => {
  const btn = document.getElementById("back-to-top")
  if (!btn) return

  // 1.5뷰포트를 지나야 나타난다.
  const onScroll = () => btn.classList.toggle("visible", window.scrollY > window.innerHeight * 1.5)
  const onClick = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  btn.addEventListener("click", onClick)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    btn.removeEventListener("click", onClick)
  })
  onScroll()
})
