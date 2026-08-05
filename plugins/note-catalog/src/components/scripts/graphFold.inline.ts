document.addEventListener("nav", () => {
  const graph = document.querySelector(".graph")
  if (!graph) return

  const header = graph.querySelector("h3") as HTMLElement | null
  if (!header) return

  // 페이지를 옮길 때마다 기본값(접힘)으로 되돌린다.
  graph.classList.add("folded")
  header.setAttribute("aria-expanded", "false")

  if (header.dataset.foldWired === "true") return
  header.dataset.foldWired = "true"
  header.setAttribute("role", "button")
  header.setAttribute("tabindex", "0")

  const toggle = () => {
    const folded = graph.classList.toggle("folded")
    header.setAttribute("aria-expanded", String(!folded))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    toggle()
  }

  header.addEventListener("click", toggle)
  header.addEventListener("keydown", onKey)
  window.addCleanup(() => {
    header.removeEventListener("click", toggle)
    header.removeEventListener("keydown", onKey)
  })
})
