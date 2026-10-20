import { describe, expect, it } from "vitest"
import { buildNode } from "../src/build-nodes"
import { parseSpec } from "../src/parse"
import { resolveAsset } from "../src/resolve"

describe("resolveAsset", () => {
  const all = ["index", "a/b/note", "attachments/a/b/note/demo.js", "attachments/x/dup.js", "attachments/y/dup.js"]

  it("중첩 슬러그에서 루트까지 올라가 자산을 가리킨다", () => {
    expect(resolveAsset("a/b/note", "demo.js", all)).toBe("../../attachments/a/b/note/demo.js")
    expect(resolveAsset("index", "demo.js", all)).toBe("./attachments/a/b/note/demo.js")
  })

  it("없거나 중복이면 undefined", () => {
    expect(resolveAsset("index", "none.js", all)).toBeUndefined()
    expect(resolveAsset("index", "dup.js", all)).toBeUndefined()
  })
})

const STEPS = `type: steps
alt: 순전파
caption: 계산 흐름
scene: |
  <svg viewBox="0 0 100 40"><circle id="x" cx="10" cy="20" r="5"/></svg>
steps:
  - say: 입력
    on: [x]
  - say: 출력
    on: x
    flow: [x]
`

describe("parseSpec", () => {
  it("steps를 파싱하고 기본값을 채운다", () => {
    const r = parseSpec(STEPS)
    expect(r.ok).toBe(true)
    if (!r.ok || r.spec.kind !== "steps") throw new Error("unreachable")
    expect(r.spec.steps).toEqual([
      { say: "입력", on: ["x"], flow: [] },
      { say: "출력", on: ["x"], flow: ["x"] },
    ])
    expect(r.spec.interval).toBe(1800)
    expect(r.spec.autoplay).toBe(true)
    expect(r.spec.caption).toBe("계산 흐름")
  })

  it("alt가 없으면 거부한다", () => {
    expect(parseSpec("type: video\nsrc: a.webm").ok).toBe(false)
  })

  it("scene의 script·이벤트 핸들러·색 지정을 거부한다", () => {
    for (const bad of [
      `<svg><script>x</script></svg>`,
      `<svg><circle onclick="x"/></svg>`,
      `<svg><circle fill="#f00"/></svg>`,
    ]) {
      const r = parseSpec(`type: steps\nalt: a\nscene: '${bad}'\nsteps: [{say: s}]`)
      expect(r.ok).toBe(false)
    }
    expect(parseSpec(`type: steps\nalt: a\nscene: '<svg><path fill="none"/></svg>'\nsteps: [{say: s}]`).ok).toBe(true)
  })

  it("canvas는 폴더 없는 kebab-case .js만 받는다", () => {
    expect(parseSpec("type: canvas\nalt: a\nsrc: queue-demo.js").ok).toBe(true)
    expect(parseSpec("type: canvas\nalt: a\nsrc: attachments/queue-demo.js").ok).toBe(false)
    expect(parseSpec("type: canvas\nalt: a\nsrc: Queue_Demo.js").ok).toBe(false)
    expect(parseSpec("type: canvas\nalt: a\nsrc: queue-demo.html").ok).toBe(false)
  })

  it("canvas hold: 0을 허용한다", () => {
    const r = parseSpec("type: canvas\nalt: a\nsrc: d.js\nhold: 0")
    expect(r.ok && r.spec.kind === "canvas" && r.spec.hold).toBe(0)
  })

  it("알 수 없는 type과 깨진 YAML을 거부한다", () => {
    expect(parseSpec("type: lottie\nalt: a").ok).toBe(false)
    expect(parseSpec("type: [").ok).toBe(false)
  })
})

describe("buildNode", () => {
  it("canvas 자산 경로를 resolve로 해석해 data-src에 넣는다", () => {
    const r = parseSpec("type: canvas\nalt: 큐 데모\nsrc: queue-demo.js\nheight: 300")
    if (!r.ok) throw new Error(r.error)
    const node = buildNode(r.spec, (n) => `../attachments/x/${n}`) as unknown as {
      data: { hName: string; hProperties: Record<string, unknown> }
    }
    expect(node.data.hName).toBe("figure")
    expect(node.data.hProperties.dataSrc).toBe("../attachments/x/queue-demo.js")
    expect(node.data.hProperties.style).toBe("--anim-height:300px")
  })
})
