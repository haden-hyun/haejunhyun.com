// B-tree 삽입(노드당 키 최대 2개): 리프에 넣고, 키가 3개로 넘치면 가운데 키를 부모로 올리며 둘로 나눈다.
// 루트가 넘치면 루트가 나뉘어 트리 높이가 1 늘어난다.
const KEYS = [30, 10, 50, 20, 40, 60, 70, 25]
const clone = (t) => JSON.parse(JSON.stringify(t))

const STATES = (() => {
  let root = { keys: [], children: [] }
  const out = []
  KEYS.forEach((key, ins) => {
    const path = [root]
    let node = root
    while (node.children.length) {
      let i = 0
      while (i < node.keys.length && key > node.keys[i]) i++
      node = node.children[i]
      path.push(node)
    }
    node.keys.push(key); node.keys.sort((a, b) => a - b)
    out.push({ ins, key, tree: clone(root), promoted: null })
    for (let d = path.length - 1; d >= 0 && path[d].keys.length > 2; d--) {
      const n = path[d], mid = n.keys[1]
      const left = { keys: [n.keys[0]], children: n.children.slice(0, 2) }
      const right = { keys: [n.keys[2]], children: n.children.slice(2) }
      if (d === 0) { root = { keys: [mid], children: [left, right] }; path[0] = root }
      else {
        const parent = path[d - 1], at = parent.children.indexOf(n)
        parent.children.splice(at, 1, left, right)
        parent.keys.splice(at, 0, mid)
      }
      out.push({ ins, key, tree: clone(root), promoted: mid })
    }
  })
  return out
})()

const KW = 26, NH = 26
function layout(tree) {
  // 리프를 왼쪽부터 놓고 부모는 자식들 가운데에 둔다
  const nodes = []
  let x = 0, depth = 0
  const place = (n, d) => {
    depth = Math.max(depth, d)
    const w = n.keys.length * KW
    if (!n.children.length) { const node = { n, d, x, w }; x += w + 14; nodes.push(node); return node }
    const kids = n.children.map((c) => place(c, d + 1))
    const cx = (kids[0].x + kids[kids.length - 1].x + kids[kids.length - 1].w) / 2
    const node = { n, d, x: cx - w / 2, w, kids }
    nodes.push(node)
    return node
  }
  place(tree, 0)
  return { nodes, span: x - 14, depth }
}

export default function draw(ctx, { progress, width, height, colors, util }) {
  const { text, clamp01 } = util
  const p = clamp01(progress)
  const s = Math.min(STATES.length - 1, Math.floor(p * STATES.length))
  const fade = util.lerp(0.35, 1, util.easeOut(clamp01((p * STATES.length - s) / 0.4))) // 이번 단계의 강조가 단계 앞부분에 나타난다
  const st = STATES[s]
  const finished = p >= 1
  const overflow = (n) => n.keys.length > 2
  const anyOverflow = (n) => overflow(n) || n.children.some(anyOverflow)
  const over = anyOverflow(st.tree)
  text(ctx, finished ? `키 ${KEYS.length}개 · 높이 3 · 모든 리프가 같은 깊이` : `삽입 ${st.ins + 1}/${KEYS.length}: ${st.key}${over ? " · 키 3개로 넘침 → 가운데 키를 부모로" : st.promoted ? ` · ${st.promoted}을(를) 부모로 올려 나눔` : ""}`, 0, 10, { size: 13, weight: 600, color: colors.dark })

  const L = layout(st.tree)
  const scale = Math.min(1, (width - 8) / L.span)
  const ox = (width - L.span * scale) / 2
  const top = 44, levelH = Math.min(70, (height - top - 50) / 2)
  const X = (v) => ox + v * scale
  const Y = (d) => top + d * levelH
  for (const node of L.nodes) {
    if (!node.kids) continue
    node.kids.forEach((kid, i) => {
      ctx.strokeStyle = colors.gray; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(X(node.x + Math.min(i, node.n.keys.length) * KW), Y(node.d) + NH); ctx.lineTo(X(kid.x + kid.w / 2), Y(kid.d)); ctx.stroke()
    })
  }
  // 강조(secondary)는 한 곳: 넘친 노드, 또는 방금 넣은 키(분할 중이면 부모로 올린 키), 끝 화면에서는 높이를 만든 새 루트
  for (const node of L.nodes) {
    const bad = overflow(node.n)
    const isRoot = finished && node.d === 0
    node.n.keys.forEach((k, i) => {
      const x = X(node.x + i * KW), y = Y(node.d), w = KW * scale
      const isNew = k === st.key && !finished && !st.promoted, isUp = (k === st.promoted && !finished) || isRoot
      ctx.fillStyle = colors.light
      ctx.fillRect(x, y, w, NH)
      if (isNew || isUp) { ctx.globalAlpha = fade; ctx.fillStyle = colors.highlight; ctx.fillRect(x, y, w, NH); ctx.globalAlpha = 1 }
      ctx.strokeStyle = bad || isNew || isUp ? colors.secondary : colors.gray; ctx.lineWidth = bad ? 2.5 : isNew || isUp ? 1.5 : 1
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, NH - 1)
      text(ctx, String(k), x + w / 2, y + NH / 2, { size: 12, weight: isNew || isUp ? 700 : 400, mono: true, color: isNew || isUp ? colors.secondary : colors.darkgray, align: "center" })
    })
    if (bad) text(ctx, "넘침", X(node.x + node.w) + 4, Y(node.d) + NH / 2, { size: 11, weight: 600, color: colors.secondary })
  }
  // 아래: 삽입 순서
  const by = height - 14
  text(ctx, "삽입 순서", 0, by, { size: 11, color: colors.gray })
  KEYS.forEach((k, i) => {
    const doneKey = i < st.ins || finished, curKey = i === st.ins && !finished
    text(ctx, String(k), 64 + i * 24, by, { size: 12, weight: curKey ? 700 : 400, mono: true, color: curKey ? colors.dark : doneKey ? colors.darkgray : colors.lightgray })
  })
}
