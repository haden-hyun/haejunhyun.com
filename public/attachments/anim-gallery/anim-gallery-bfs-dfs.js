// BFS와 DFS: 같은 트리를 큐(BFS)와 스택(DFS)으로 탐색해 방문 순서와 대기 목록이 어떻게 갈리는지 나란히 본다.
const POS = { A: [0.5, 0], B: [0.25, 1], C: [0.75, 1], D: [0.12, 2], E: [0.38, 2], F: [0.62, 2], G: [0.88, 2], H: [0.12, 3], I: [0.38, 3] }
const CHILD = { A: ["B", "C"], B: ["D", "E"], C: ["F", "G"], D: ["H"], E: ["I"], F: [], G: [], H: [], I: [] }
const NAMES = Object.keys(POS)

function run(kind) {
  const order = [], frontier = [], fr = ["A"]
  frontier.push([...fr])
  while (fr.length) {
    const v = kind === "bfs" ? fr.shift() : fr.pop()
    order.push(v)
    // 스택은 나중에 넣은 것이 먼저 나오므로 왼쪽 자식을 먼저 꺼내려면 거꾸로 넣는다
    fr.push(...(kind === "bfs" ? CHILD[v] : [...CHILD[v]].reverse()))
    frontier.push([...fr])
  }
  return { order, frontier }
}
const RUNS = [
  { name: "BFS", rule: "큐 · 먼저 넣은 것부터 꺼냄", word: "큐", ...run("bfs") },
  { name: "DFS", rule: "스택 · 나중에 넣은 것부터 꺼냄", word: "스택", ...run("dfs") },
]
const PARENT = {}
for (const [p, cs] of Object.entries(CHILD)) for (const c of cs) PARENT[c] = p

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const N = NAMES.length
  const k = Math.min(N, Math.floor(clamp01(progress) * (N + 1)))
  const stacked = width < 520
  const panels = stacked
    ? [{ x: 0, y: 0, w: width, h: height / 2 - 6 }, { x: 0, y: height / 2 + 6, w: width, h: height / 2 - 6 }]
    : [{ x: 0, y: 0, w: width / 2 - 12, h: height }, { x: width / 2 + 12, y: 0, w: width / 2 - 12, h: height }]

  const finished = k === N
  // 이번 단계에서 바뀐 것(방금 꺼낸 노드·새로 대기에 든 노드)은 단계 앞부분에 서서히 나타난다
  const fade = util.lerp(0.35, 1, util.easeOut(clamp01((clamp01(progress) * (N + 1) - k) / 0.4)))
  // 두 패널은 같은 뜻(방문·대기)을 같은 색으로 그린다. 방문 완료 = 옅은 secondary(0.4), 대기 = 점선 윤곽,
  // 강조(secondary)는 방금 꺼낸 노드 — 끝 화면에서는 결론인 방문 순서 줄 — 이고, 두 패널이 같은 자리를 짝으로 맞춘다.
  RUNS.forEach((run, side) => {
    const pn = panels[side]
    text(ctx, run.name, pn.x, pn.y + 10, { size: 13, weight: 600, color: colors.dark })
    text(ctx, run.rule, pn.x + 40, pn.y + 10, { size: 11, color: colors.gray })
    const r = Math.min(13, pn.w / 24, (pn.h - 70) / 9) // 세 층 간격이 지름보다 좁아지지 않게
    const top = pn.y + 32 + r, bottom = pn.y + pn.h - 40 - r
    const P = (v) => [pn.x + r + POS[v][0] * (pn.w - 2 * r), top + (POS[v][1] / 3) * (bottom - top)]
    const visited = run.order.slice(0, k)
    const front = run.frontier[k]
    const prevFront = k > 0 ? run.frontier[k - 1] : []

    for (const c of NAMES) {
      const p = PARENT[c]
      if (!p) continue
      const [x1, y1] = P(p), [x2, y2] = P(c)
      const used = visited.includes(c)
      ctx.strokeStyle = used ? colors.secondary : colors.gray
      ctx.globalAlpha = used ? 0.4 : 1
      ctx.lineWidth = used ? 1.5 : 1
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      ctx.globalAlpha = 1
    }
    for (const v of NAMES) {
      const [x, y] = P(v)
      const at = visited.indexOf(v)
      const inFront = front.includes(v)
      const cur = at === k - 1 && !finished
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = colors.light
      ctx.fill()
      if (at >= 0) { ctx.globalAlpha = cur ? fade : 0.4; ctx.fillStyle = colors.secondary; ctx.fill(); ctx.globalAlpha = 1 }
      ctx.strokeStyle = cur ? colors.secondary : inFront ? colors.darkgray : colors.lightgray
      ctx.lineWidth = cur ? 2.5 : inFront ? 1.5 : 1
      if (inFront && at < 0) { ctx.setLineDash([3, 2]); if (!prevFront.includes(v)) ctx.globalAlpha = fade }
      if (at < 0 || cur) ctx.stroke()
      ctx.setLineDash([]); ctx.globalAlpha = 1
      text(ctx, v, x, y, { size: 11, weight: 600, mono: true, color: cur && fade > 0.5 ? colors.light : at >= 0 ? colors.dark : colors.darkgray, align: "center" })
      // 순번은 부모 간선의 반대쪽 위에 둔다
      const left = PARENT[v] && POS[v][0] < POS[PARENT[v]][0]
      if (at >= 0) text(ctx, String(at + 1), left ? x - r - 2 : x + r + 2, y - r + 2, { size: 10, mono: true, color: colors.darkgray, align: left ? "right" : "left" })
    }
    const list = front.length ? front.join(" ") : "(비었음)"
    // 오른쪽 아래는 일시정지 버튼 자리라 비워 둔다
    text(ctx, `방문 ${visited.join(" ") || "-"}`, pn.x, pn.y + pn.h - 32, { size: 12, weight: finished ? 600 : 400, mono: true, color: finished ? colors.secondary : colors.darkgray })
    text(ctx, `${run.word}: ${list}`, pn.x, pn.y + pn.h - 16, { size: 12, mono: true, color: front.length ? colors.darkgray : colors.gray })
  })
}
