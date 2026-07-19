document.addEventListener("nav", () => {
  const btn = document.getElementById("back-to-top")
  if (!btn) return

  const onScroll = () => btn.classList.toggle("visible", window.scrollY > 300)
  const onClick = () => window.scrollTo({ top: 0, behavior: "smooth" })

  window.addEventListener("scroll", onScroll, { passive: true })
  btn.addEventListener("click", onClick)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    btn.removeEventListener("click", onClick)
  })
  onScroll()
})
