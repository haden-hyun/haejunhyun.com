// verify-anim의 정적 검사(AV2·AV3·AV5). 브라우저 없이 판정할 수 있는 것만 둔다.
import type { AnimSpec } from "../../src/parse"

export interface Issue {
  id: string
  level: "fail" | "warn"
  detail: string
}

// canvas 그리기 파일에서 금지하는 식별자. 루프·DOM·네트워크·비결정성은 런타임이 소유한다.
const FORBIDDEN = [
  "document", "window", "globalThis", "self", "location", "navigator", "localStorage", "sessionStorage",
  "fetch", "XMLHttpRequest", "WebSocket", "Worker", "postMessage", "eval", "Function", "import",
  "setTimeout", "setInterval", "requestAnimationFrame", "cancelAnimationFrame", "Date", "performance", "ownerDocument",
]
const COLOR_LITERAL = /["'`](?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^"'`]*\)|(?:red|green|blue|black|white|gray|grey|orange|purple|yellow|pink|brown|cyan|magenta))["'`]/
const MAX_BYTES = 16 * 1024

/** code는 주석을 걷어 낸 소스(호출하는 쪽이 esbuild transform으로 만든다). */
export function checkCanvasSource(code: string, rawBytes: number): Issue[] {
  const issues: Issue[] = []
  if (!/export\s+default\s+(?:function\b|\(|[A-Za-z_$][\w$]*\s*;?\s*$)/m.test(code))
    issues.push({ id: "AV3", level: "fail", detail: "default export draw 함수가 없다" })
  for (const name of FORBIDDEN) {
    if (new RegExp(`(?<![\\w$.])${name}(?![\\w$])`).test(code))
      issues.push({ id: "AV3", level: "fail", detail: `금지 식별자 ${name}` })
  }
  if (/Math\s*\.\s*random/.test(code)) issues.push({ id: "AV3", level: "fail", detail: "Math.random 금지 — util.rng(seed)를 쓴다" })
  if (/\.\s*canvas\b/.test(code)) issues.push({ id: "AV3", level: "fail", detail: "ctx.canvas 접근 금지 — width·height는 frame으로 받는다" })
  const color = code.match(COLOR_LITERAL)
  if (color) issues.push({ id: "AV3", level: "fail", detail: `색 리터럴 ${color[0]} — colors.*만 쓴다` })
  if (rawBytes > MAX_BYTES) issues.push({ id: "AV3", level: "fail", detail: `파일 크기 ${rawBytes}B > ${MAX_BYTES}B` })
  return issues
}

export function checkTiming(spec: AnimSpec, allow = false): Issue[] {
  const level = allow ? "warn" : "fail"
  const out: Issue[] = []
  const range = (name: string, v: number, lo: number, hi: number) => {
    if (v < lo || v > hi) out.push({ id: "AV5", level, detail: `${name}=${v} (허용 ${lo}~${hi})` })
  }
  if (spec.kind === "canvas") {
    range("cycle", spec.cycle, 3000, 10000)
    range("hold", spec.hold, 1500, 3500)
    range("height", spec.height, 160, 480)
  }
  if (spec.kind === "steps") {
    range("단계 수", spec.steps.length, 2, 6)
    range("interval", spec.interval, 1500, 3000)
    spec.steps.forEach((s, i) => {
      if ([...s.say].length > 40) out.push({ id: "AV5", level, detail: `steps[${i}].say ${[...s.say].length}자 > 40자` })
    })
  }
  return out
}

/** steps의 on·flow가 scene에 실재하는 id인지, 마지막 단계가 전체를 켜는 요약인지. */
export function checkStepRefs(spec: AnimSpec): Issue[] {
  if (spec.kind !== "steps") return []
  const ids = new Set([...spec.scene.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]!))
  const out: Issue[] = []
  spec.steps.forEach((s, i) => {
    for (const id of [...s.on, ...s.flow]) {
      if (!ids.has(id)) out.push({ id: "AV2", level: "fail", detail: `steps[${i}]의 id "${id}"가 scene에 없다` })
    }
  })
  const last = new Set(spec.steps.at(-1)!.on)
  const missing = [...ids].filter((id) => !last.has(id))
  if (missing.length)
    out.push({ id: "AQ3", level: "warn", detail: `마지막 단계가 요약이 아니다(꺼진 id: ${missing.join(", ")}) — 동작 줄이기 정지 화면이 이 장면이다` })
  return out
}

/** 노트 본문에서 ```anim 펜스 원문을 순서대로 뽑는다. */
export function extractFences(markdown: string): string[] {
  return [...markdown.matchAll(/^```anim[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)].map((m) => m[1]!)
}
