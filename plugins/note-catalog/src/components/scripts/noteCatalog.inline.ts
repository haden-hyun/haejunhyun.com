// 형제가 많아 목록이 넘치면 현재 노트 행을 목록 가운데로 — 목록의 scrollTop만 바꾼다(scrollIntoView는 sticky 사이드바·페이지까지 움직인다).
// 로드·SPA 이동 때 한 번만 맞추고, 이동 없이 사용자가 스크롤하는 동안엔 손대지 않는다.
function centerActive() {
  for (const list of document.querySelectorAll<HTMLElement>(".note-catalog-list")) {
    const active = list.querySelector<HTMLElement>(".note-catalog-link.active")
    if (!active || list.scrollHeight <= list.clientHeight) continue
    const top = active.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
    const max = list.scrollHeight - list.clientHeight
    list.scrollTop = Math.max(0, Math.min(max, top - (list.clientHeight - active.offsetHeight) / 2))
  }
}
centerActive()
document.addEventListener("nav", centerActive)
