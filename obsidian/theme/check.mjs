// 스니펫 값이 사이트 원본(quartz.config.yaml·syntax.scss·custom.scss)과 같은지 검사한다. 불일치 시 exit 1.
import { readFileSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)
const read = (p) => readFileSync(new URL(p, ROOT), "utf8")
const SNIPPET = "obsidian/theme/haejun-records.css"

// 사이트 토큰 → 스니펫 변수. theme.colors 키는 Quartz가 내보내는 CSS 변수 이름(--키)으로 적는다.
const MAP = {
  "--light": "--hr-light",
  "--lightgray": "--hr-lightgray",
  "--gray": "--hr-gray",
  "--darkgray": "--hr-darkgray",
  "--dark": "--hr-dark",
  "--secondary": "--hr-secondary",
  "--tertiary": "--hr-tertiary",
  "--highlight": "--hr-highlight",
  "--textHighlight": "--hr-text-highlight",
  "--syn-muted": "--hr-syn-muted",
  "--syn-key": "--hr-syn-key",
  "--syn-punct": "--hr-syn-punct",
  "--syn-value": "--hr-syn-value",
  "--syn-alert": "--hr-syn-alert",
  "--syn-name": "--hr-syn-name",
  "--syn-lit": "--hr-syn-lit",
  "--syn-ink": "--hr-syn-ink",
  "--accent-rgb": "--hr-accent-rgb",
  "--code-bg": "--hr-code-bg",
  "--code-chip-bg": "--hr-code-chip-bg",
  "--code-chip-border": "--hr-code-chip-border",
  "--highlight-ink": "--hr-highlight-ink",
  "--island-bg": "--hr-island-bg",
  "--cal-info": "--hr-cal-info",
  "--cal-good": "--hr-cal-good",
  "--cal-warn": "--hr-cal-warn",
  "--cal-bad": "--hr-cal-bad",
  "--cal-quote": "--hr-cal-quote",
  "--cal-ref": "--hr-cal-ref",
}
// fonts 플러그인 옵션 → 스니펫 변수(스니펫 body 블록).
const FONTS = { header: "--hr-font-header", body: "--hr-font-body", code: "--hr-font-code" }

// 0열에서 `header {`로 시작해 0열 `}`로 끝나는 블록들의 `--변수: 값;`을 순서대로 모은다.
function decls(text, header) {
  const out = {}
  let inside = false
  for (const line of text.split(/\r?\n/)) {
    if (line === `${header} {`) inside = true
    else if (inside && line === "}") inside = false
    else if (inside) {
      const m = line.match(/^\s*(--[\w-]+):\s*(.+?);/)
      if (m) out[m[1]] = m[2]
    }
  }
  return out
}

// shortcut: theme.colors·fonts 옵션만 줄 단위로 읽는다(저장소에 YAML 파서 의존성이 없다), 구조가 바뀌면 yaml 패키지로 교체.
function yamlColors(text) {
  const modes = { lightMode: {}, darkMode: {} }
  let mode = null
  for (const line of text.split(/\r?\n/)) {
    const head = line.match(/^ {6}(lightMode|darkMode):\s*$/)
    if (head) mode = head[1]
    else if (mode && /^ {0,6}\S/.test(line)) mode = null
    else if (mode) {
      const m = line.match(/^ {8}(\w+):\s*(?:"([^"]*)"|([^\s#]+))/)
      if (m) modes[mode][`--${m[1]}`] = m[2] ?? m[3]
    }
  }
  return modes
}

function yamlFonts(text) {
  const block = text.split("source: github:quartz-community/fonts")[1]?.split("  - source:")[0] ?? ""
  return Object.fromEntries(Object.keys(FONTS).map((k) => [k, block.match(new RegExp(`^ {6}${k}: '(.+)'$`, "m"))?.[1]]))
}

function resolve(value, vars) {
  let v = value
  for (let i = 0; i < 10 && /var\(--/.test(v); i++) v = v.replace(/var\((--[\w-]+)\)/g, (_, n) => vars[n] ?? `<${n} 없음>`)
  return v
}
const norm = (v) =>
  String(v)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(?<![#\w])\d*\.\d+/g, (n) => String(Number(n)))

function hsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  const h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60).toFixed(1), `${(s * 100).toFixed(1)}%`, `${(l * 100).toFixed(1)}%`]
}

const yaml = read("quartz.config.yaml")
const syntax = read("quartz/styles/syntax.scss")
const custom = read("quartz/styles/custom.scss")
const snippet = read(SNIPPET)
const colors = yamlColors(yaml)
const siteLight = { ...colors.lightMode, ...decls(syntax, ":root"), ...decls(custom, ":root") }
const site = {
  라이트: siteLight,
  다크: { ...siteLight, ...colors.darkMode, ...decls(syntax, ':root[saved-theme="dark"]'), ...decls(custom, ':root[saved-theme="dark"]') },
}
const snip = { 라이트: decls(snippet, ".theme-light"), 다크: decls(snippet, ".theme-dark") }

const fails = []
let ok = 0
const compare = (label, want, got) => (norm(want) === norm(got) ? ok++ : fails.push(`${label}: 사이트 ${want} ≠ 스니펫 ${got}`))

for (const mode of ["라이트", "다크"]) {
  for (const [token, name] of Object.entries(MAP)) {
    if (site[mode][token] === undefined) fails.push(`[${mode}] ${token}: 사이트 원본에서 못 찾음`)
    else if (snip[mode][name] === undefined) fails.push(`[${mode}] ${name}: 스니펫에 없음`)
    else compare(`[${mode}] ${token} → ${name}`, resolve(site[mode][token], site[mode]), resolve(snip[mode][name], snip[mode]))
  }
  const [h, s, l] = hsl(resolve(site[mode]["--secondary"], site[mode]))
  compare(`[${mode}] secondary HSL → --hr-accent-h/s/l`, `${h} ${s} ${l}`, ["h", "s", "l"].map((c) => snip[mode][`--hr-accent-${c}`]).join(" "))
}
const fonts = yamlFonts(yaml)
const snipBody = decls(snippet, "body")
// 스니펫의 "HR Inter"는 내장 Inter와 겹치지 않게 바꾼 이름일 뿐 사이트 "Inter"와 같은 파일이다.
for (const [k, name] of Object.entries(FONTS)) compare(`fonts.${k} → ${name}`, fonts[k], snipBody[name]?.replace('"HR Inter"', '"Inter"'))

if (fails.length) {
  console.error(fails.map((f) => `✗ ${f}`).join("\n"))
  console.error(`\n불일치 ${fails.length}건 (일치 ${ok}건)`)
  process.exit(1)
}
console.log(`✓ 값 ${ok}건 일치(라이트·다크 각 ${Object.keys(MAP).length + 1} + 서체 ${Object.keys(FONTS).length})`)
