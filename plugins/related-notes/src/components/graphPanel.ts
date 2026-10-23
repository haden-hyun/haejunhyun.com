// 사이드바 로컬 그래프 패널을 걷어 ⌘G 전역 그래프 모달만 남긴다.
// graph 스크립트는 CDN 로드 뒤에 nav 리스너를 달아 이 리스너가 항상 먼저 돈다 — .graph-container가 없으면 로컬 렌더를 건너뛴다.
// 주의: .global-graph-outer(모달)는 .graph 안에 있어 패널 전체를 지우면 ⌘G도 죽는다.
export default `
const dropLocalGraph = () => {
  for (const outer of document.querySelectorAll(".sidebar .graph > .graph-outer")) outer.remove()
  for (const label of document.querySelectorAll(".sidebar .graph > h3")) label.remove()
}
dropLocalGraph()
document.addEventListener("nav", dropLocalGraph)
`
