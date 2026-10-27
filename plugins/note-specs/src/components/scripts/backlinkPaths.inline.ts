// 글 끝 Backlinks 행에 폴더 경로를 단다 — 업스트림 컴포넌트는 제목 링크만 낸다. href는 `../`* + 전체 슬러그다.
document.addEventListener("nav", () => {
  for (const a of document.querySelectorAll<HTMLAnchorElement>(".page-footer .backlinks li > a")) {
    if (a.nextElementSibling?.classList.contains("backlink-path")) continue
    let href = a.getAttribute("href") ?? ""
    try {
      href = decodeURIComponent(href)
    } catch {}
    const dir = href.replace(/[?#].*$/, "").replace(/^(\.\.?\/)+/, "").split("/").slice(0, -1)
    if (!dir.length) continue
    const path = document.createElement("span")
    path.className = "backlink-path"
    path.textContent = dir.join(" / ")
    a.after(path)
  }
})
