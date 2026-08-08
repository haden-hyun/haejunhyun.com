/**
 * 코드펜스 안 `---` 블록을 읽는 최소 파서.
 *
 * 주의: 범용 YAML 파서를 쓰지 않는다. `yaml` 패키지는 node 조건에서 CJS로 해석돼
 * 번들에 `__require("process")` 셰임이 남고, 런타임에 플러그인이 통째로 죽는다.
 * 여기서 필요한 문법은 `key: 스칼라`와 `key: |` 블록 스칼라 둘뿐이다.
 */

/** 따옴표를 벗기고 bool/number로 좁힌다. 그 외는 문자열 그대로. */
function parseScalar(raw: string): unknown {
  const text = raw.trim()
  if (text === "") return ""

  const quoted = text.match(/^"(.*)"$|^'(.*)'$/)
  if (quoted) return quoted[1] ?? quoted[2] ?? ""

  if (text === "true") return true
  if (text === "false") return false
  if (text === "null" || text === "~") return null
  if (/^-?\d+$/.test(text)) return Number(text)
  if (/^-?\d*\.\d+$/.test(text)) return Number(text)

  return text
}

const KEY_LINE = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/

export function parseOptions(source: string): Record<string, unknown> {
  const opts: Record<string, unknown> = {}
  const lines = source.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue

    const match = line.match(KEY_LINE)
    if (!match) continue

    const key = match[1]!.toLowerCase()
    const value = match[2]!.trim()

    // 블록 스칼라: 뒤따르는 들여쓴 줄을 통째로 모은다 (grid가 이걸 쓴다)
    if (value === "|" || value === "|-" || value === ">" || value === ">-") {
      const collected: string[] = []
      let j = i + 1
      for (; j < lines.length; j++) {
        const next = lines[j]!
        if (next.trim() === "") {
          collected.push("")
          continue
        }
        if (!/^\s/.test(next)) break
        collected.push(next.replace(/^\s+/, ""))
      }
      while (collected.length > 0 && collected[collected.length - 1] === "") collected.pop()
      opts[key] = collected.join(value.startsWith(">") ? " " : "\n")
      i = j - 1
      continue
    }

    opts[key] = parseScalar(value)
  }

  return opts
}
