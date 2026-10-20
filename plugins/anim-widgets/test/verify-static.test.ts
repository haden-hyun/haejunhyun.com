import { transformSync } from "esbuild"
import { describe, expect, it } from "vitest"
import { parseSpec } from "../src/parse"
import { checkCanvasSource, checkStepRefs, checkTiming, extractFences } from "../scripts/verify/static"

const strip = (code: string) => transformSync(code, { loader: "js" }).code
const ids = (code: string) => checkCanvasSource(strip(code), code.length).map((i) => i.detail)

describe("checkCanvasSource", () => {
  it("정상 draw는 통과한다(주석 속 금지어는 무시)", () => {
    expect(ids(`// document·window는 주석이라 괜찮다\nexport default function draw(ctx, { colors, util }) { ctx.fillStyle = colors.secondary }`)).toEqual([])
  })
  it("금지 식별자·Math.random·ctx.canvas·색 리터럴을 잡는다", () => {
    const d = ids(`export default function draw(ctx){ ctx.fillStyle = "#fff"; window.x = Math.random() + performance.now(); ctx.canvas.width = 1 }`)
    expect(d.join("|")).toMatch(/window/)
    expect(d.join("|")).toMatch(/performance/)
    expect(d.join("|")).toMatch(/Math.random/)
    expect(d.join("|")).toMatch(/ctx.canvas/)
    expect(d.join("|")).toMatch(/색 리터럴/)
  })
  it("default export가 없으면 실패", () => {
    expect(ids(`export function draw() {}`).join("|")).toMatch(/default export/)
  })
  it("속성 이름 속 금지어(.document)는 오탐하지 않는다", () => {
    expect(ids(`export default function draw(ctx, f) { const a = f.window; return a }`)).toEqual([])
  })
})

describe("checkTiming·checkStepRefs", () => {
  const steps = parseSpec(`type: steps\nalt: a\ninterval: 500\nscene: '<svg><g id="a"><circle r="1"/></g><g id="b"><circle r="1"/></g></svg>'\nsteps:\n  - say: s\n    on: [a, ghost]\n  - say: t\n    on: [a]`)
  if (!steps.ok) throw new Error(steps.error)
  it("범위 밖 타이밍은 실패, --allow면 경고", () => {
    expect(checkTiming(steps.spec)[0]?.level).toBe("fail")
    expect(checkTiming(steps.spec, true)[0]?.level).toBe("warn")
  })
  it("없는 id는 실패, 요약 아닌 마지막 단계는 경고", () => {
    const r = checkStepRefs(steps.spec)
    expect(r.find((i) => i.id === "AV2")?.detail).toMatch(/ghost/)
    expect(r.find((i) => i.id === "AQ3")?.level).toBe("warn")
  })
})

describe("extractFences", () => {
  it("노트에서 anim 펜스만 순서대로 뽑는다", () => {
    const md = "앞\n```anim\ntype: video\n```\n```js\nx\n```\n```anim\ntype: steps\n```\n"
    expect(extractFences(md)).toEqual(["type: video\n", "type: steps\n"])
  })
})
