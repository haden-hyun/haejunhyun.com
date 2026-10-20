document.addEventListener("nav", () => {
  const bar = document.getElementById("reading-progress-bar")
  if (!bar) return

  let frame = 0
  const draw = () => {
    frame = 0
    const height = document.documentElement.scrollHeight - window.innerHeight
    const ratio = height > 0 ? Math.min(window.scrollY / height, 1) : 0
    bar.style.transform = `scaleX(${ratio})`
  }
  // 스크롤 이벤트는 프레임당 한 번만 그린다.
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(draw)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
    cancelAnimationFrame(frame)
  })
  draw()
})
