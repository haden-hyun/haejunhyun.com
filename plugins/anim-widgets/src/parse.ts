import { load as parseYaml } from "js-yaml"
import { checkScene } from "./scene"

export interface AnimStep {
  say: string
  on: string[]
  flow: string[]
}

interface Base {
  alt: string
  caption?: string
}

export interface StepsSpec extends Base {
  kind: "steps"
  scene: string
  steps: AnimStep[]
  interval: number
  autoplay: boolean
}

export interface CanvasSpec extends Base {
  kind: "canvas"
  src: string
  height: number
  cycle: number
  hold: number
}

export interface VideoSpec extends Base {
  kind: "video"
  src: string
  poster?: string
}

export type AnimSpec = StepsSpec | CanvasSpec | VideoSpec

export type ParseResult = { ok: true; spec: AnimSpec } | { ok: false; error: string }

// 자산은 볼트 규약대로 폴더 없는 ASCII kebab-case 파일명만 받는다.
const ASSET_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/
const CANVAS_EXT = /\.m?js$/
const VIDEO_EXT = /\.(webm|mp4)$/
const POSTER_EXT = /\.(png|jpe?g|webp|avif|svg)$/

const fail = (error: string): ParseResult => ({ ok: false, error })

const toList = (value: unknown): string[] =>
  value === undefined || value === null
    ? []
    : (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean)

const toPositive = (value: unknown, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function asset(value: unknown, pattern: RegExp, key: string): string | ParseResult {
  const name = String(value ?? "").trim()
  if (!ASSET_NAME.test(name)) return fail(`${key}: 폴더 없는 ASCII kebab-case 파일명이어야 한다 (${name || "없음"})`)
  if (!pattern.test(name)) return fail(`${key}: 지원하지 않는 확장자 (${name})`)
  return name
}

export function parseSpec(source: string): ParseResult {
  let raw: unknown
  try {
    raw = parseYaml(source)
  } catch (e) {
    return fail(`YAML 파싱 실패: ${(e as Error).message.split("\n")[0]}`)
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail("YAML 매핑이 아니다")
  const data = raw as Record<string, unknown>

  const alt = String(data.alt ?? "").trim()
  if (!alt) return fail("alt는 필수다")
  const caption = data.caption === undefined ? undefined : String(data.caption).trim() || undefined
  const base = { alt, ...(caption ? { caption } : {}) }

  switch (data.type) {
    case "steps": {
      const scene = String(data.scene ?? "").trim()
      const sceneProblem = checkScene(scene)
      if (sceneProblem) return fail(`scene: ${sceneProblem}`)
      if (!Array.isArray(data.steps) || data.steps.length === 0) return fail("steps가 비었다")

      const steps: AnimStep[] = []
      for (const [i, item] of data.steps.entries()) {
        const step = (item ?? {}) as Record<string, unknown>
        const say = String(step.say ?? "").trim()
        if (!say) return fail(`steps[${i}].say는 필수다`)
        steps.push({ say, on: toList(step.on), flow: toList(step.flow) })
      }
      return {
        ok: true,
        spec: {
          kind: "steps",
          ...base,
          scene,
          steps,
          interval: toPositive(data.interval, 1800),
          autoplay: data.autoplay !== false,
        },
      }
    }
    case "canvas": {
      const src = asset(data.src, CANVAS_EXT, "src")
      if (typeof src !== "string") return src
      return {
        ok: true,
        spec: {
          kind: "canvas",
          ...base,
          src,
          height: toPositive(data.height, 280),
          cycle: toPositive(data.cycle, 4000),
          hold: data.hold === 0 ? 0 : toPositive(data.hold, 2000),
        },
      }
    }
    case "video": {
      const src = asset(data.src, VIDEO_EXT, "src")
      if (typeof src !== "string") return src
      let poster: string | undefined
      if (data.poster !== undefined) {
        const p = asset(data.poster, POSTER_EXT, "poster")
        if (typeof p !== "string") return p
        poster = p
      }
      return { ok: true, spec: { kind: "video", ...base, src, ...(poster ? { poster } : {}) } }
    }
    default:
      return fail(`알 수 없는 type: ${String(data.type ?? "없음")} (steps | canvas | video)`)
  }
}
