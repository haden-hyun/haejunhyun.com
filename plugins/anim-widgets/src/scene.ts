// scene SVG 허용 목록 검증. 블로그 빌드는 이 문자열을 raw HTML로 그대로 넣으므로 막는 게 아니라 "허용한 것만" 통과시킨다.
// 주의: 정규식 차단 목록은 `<svg/onload=…>`처럼 HTML 파서와 해석이 갈리는 입력을 놓친다. 그래서 문자열 전체를
//       아래 토큰(텍스트·태그)으로 남김없이 소비할 수 있을 때만 통과시킨다.

const TAGS = new Set([
  "svg", "g", "path", "circle", "rect", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "title", "desc", "defs", "marker",
])

const ATTRS = new Set([
  "id", "class", "viewbox", "xmlns", "d", "points", "transform", "opacity",
  "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "dx", "dy", "width", "height",
  "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
  "text-anchor", "dominant-baseline", "font-size", "font-weight",
  "marker-start", "marker-mid", "marker-end", "refx", "refy", "markerwidth", "markerheight", "orient", "markerunits",
  "fill", "stroke",
])

// 태그: 이름 뒤에는 공백+따옴표 속성만, 끝은 `>` 또는 `/>`. 따옴표 없는 값·속성 사이 `/`는 받지 않는다.
const TAG = /<(\/?)([A-Za-z][A-Za-z0-9-]*)((?:\s+[A-Za-z][A-Za-z0-9:-]*\s*=\s*(?:"[^"<>]*"|'[^'<>]*'))*)\s*(\/?)>/y
const ATTR = /\s+([A-Za-z][A-Za-z0-9:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
// 텍스트: `<`·`>` 금지, 엔티티는 기본 5개만(숫자 엔티티로 `<`를 숨기지 못하게).
const TEXT = /^(?:[^<>&]|&(?:amp|lt|gt|quot|apos);)*$/
const MARKER_REF = /^url\(#[A-Za-z][\w-]*\)$/

function checkAttr(name: string, value: string): string | undefined {
  if (!ATTRS.has(name)) return `허용하지 않는 속성 ${name}`
  if (name === "xmlns") return value === "http://www.w3.org/2000/svg" ? undefined : "xmlns 값이 SVG 네임스페이스가 아니다"
  if (name === "fill" || name === "stroke") return value === "none" ? undefined : `${name}은 none만 쓸 수 있다(색은 테마 CSS가 칠한다)`
  if (name.startsWith("marker-")) return MARKER_REF.test(value) ? undefined : `${name}은 url(#id)만 쓸 수 있다`
  if (/[&\\]|url\(|script:/i.test(value)) return `${name} 값에 쓸 수 없는 문자열이 있다`
  return undefined
}

/** 통과하면 undefined, 아니면 이유. */
export function checkScene(scene: string): string | undefined {
  let pos = 0
  let depth = 0
  let first = true
  while (pos < scene.length) {
    const lt = scene.indexOf("<", pos)
    const text = scene.slice(pos, lt === -1 ? scene.length : lt)
    if (!TEXT.test(text)) return "텍스트에 `<`·`>`나 허용하지 않는 엔티티가 있다"
    if (lt === -1) break

    TAG.lastIndex = lt
    const m = TAG.exec(scene)
    if (!m) return `해석할 수 없는 태그: ${scene.slice(lt, lt + 30)}`
    const [whole, closing, rawName, attrs, selfClosing] = m
    const name = rawName!.toLowerCase()
    if (!TAGS.has(name)) return `허용하지 않는 요소 <${name}>`
    if (first && (closing || name !== "svg")) return "scene은 <svg>로 시작해야 한다"
    first = false
    if (closing && attrs) return `닫는 태그에 속성이 있다: </${name}>`

    for (const a of attrs!.matchAll(ATTR)) {
      const problem = checkAttr(a[1]!.toLowerCase(), a[2] ?? a[3] ?? "")
      if (problem) return problem
    }

    if (closing) depth--
    else if (!selfClosing) depth++
    if (depth < 0) return "닫는 태그가 남는다"
    if (depth === 0 && lt + whole.length < scene.length) return "scene은 <svg> 하나여야 한다"
    pos = lt + whole.length
  }
  if (first) return "scene은 <svg> 하나여야 한다"
  return depth === 0 ? undefined : "닫히지 않은 태그가 있다"
}
