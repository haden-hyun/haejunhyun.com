#!/usr/bin/env node
// verify-anim — ```anim 펜스를 블로그 빌드와 같은 코드로 렌더해 AV1~AV9를 판정한다.
//   node scripts/verify-anim.mjs --note <note.md> [--assets dir,dir] [--attachments dir] [--out dir] [--allow AV5] [--serve]
//   node scripts/verify-anim.mjs --fence <fence.yaml> --assets <dir> ...
// 종료 코드: 0 통과 · 1 AV 실패 · 2 환경 오류(Chrome 없음 등)
import esbuild from "esbuild"
import { createServer } from "node:http"
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const PLUGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BLOG = path.resolve(PLUGIN, "../..")

// ── 인자 ──
const argv = process.argv.slice(2)
const arg = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const flag = (name) => argv.includes(`--${name}`)
const notePath = arg("note") && path.resolve(arg("note"))
const fencePath = arg("fence") && path.resolve(arg("fence"))
if (!notePath && !fencePath) {
  console.error("사용법: verify-anim.mjs --note <note.md> | --fence <fence.yaml> [--assets dir,dir] [--attachments dir] [--out dir] [--allow AV5] [--serve]")
  process.exit(2)
}
const outDir = path.resolve(arg("out") ?? path.join(tmpdir(), `verify-anim-${Date.now()}`))
const allowTiming = (arg("allow") ?? "").split(",").includes("AV5")

function findAttachmentsRoot(start) {
  for (let d = start; d !== path.dirname(d); d = path.dirname(d)) {
    for (const c of [path.join(d, "content/attachments"), path.join(d, "attachments")]) if (existsSync(c)) return c
  }
  return undefined
}
const baseDir = path.dirname(notePath ?? fencePath)
const attachmentsRoot = arg("attachments") ? path.resolve(arg("attachments")) : findAttachmentsRoot(baseDir)
const assetDirs = (arg("assets") ? arg("assets").split(",").map((d) => path.resolve(d)) : [baseDir, attachmentsRoot]).filter(Boolean)

const filesNamed = (dir, name) => {
  if (!dir || !existsSync(dir)) return []
  return readdirSync(dir, { recursive: true })
    .map((p) => path.join(dir, String(p)))
    .filter((p) => path.basename(p) === name && !p.includes(`${path.sep}archive${path.sep}`) && statSync(p).isFile())
}

// ── 번들: 블로그 소스를 그대로 쓴다 ──
mkdirSync(outDir, { recursive: true })
const work = path.join(outDir, ".build")
mkdirSync(work, { recursive: true })
await esbuild.build({
  entryPoints: [path.join(PLUGIN, "scripts/verify/node-entry.ts")], bundle: true, platform: "node", format: "esm",
  outfile: path.join(work, "node-entry.mjs"), logLevel: "silent",
})
const lib = await import(pathToFileURL(path.join(work, "node-entry.mjs")).href)
const browserBundle = async (entry) =>
  (await esbuild.build({ entryPoints: [path.join(PLUGIN, entry)], bundle: true, format: "iife", platform: "browser", target: "es2020", write: false })).outputFiles[0].text
const runtimeJs = await browserBundle("src/scripts/anim.inline.ts")
const probeJs = await browserBundle("scripts/verify/probe.ts")
const sass = await import(pathToFileURL(path.join(PLUGIN, "node_modules/sass/sass.node.mjs")).href)
const animCss = sass.compile(path.join(PLUGIN, "src/styles/anim.scss")).css
const yaml = await import(pathToFileURL(path.join(PLUGIN, "node_modules/js-yaml/dist/js-yaml.mjs")).href)
const config = yaml.load(readFileSync(path.join(BLOG, "quartz.config.yaml"), "utf8"))
const themeColors = config.configuration.theme.colors
const fontOpts = config.plugins.find((p) => String(p.source).endsWith("/fonts"))?.options ?? {}

const vars = (c) => Object.entries(c).map(([k, v]) => `--${k}:${v};`).join("")
const harnessHtml = (figure) => `<!doctype html><html saved-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,">
<style>
:root{${vars(themeColors.lightMode)}--bodyFont:${fontOpts.body ?? "sans-serif"};--codeFont:${fontOpts.code ?? "monospace"}}
:root[saved-theme="dark"]{${vars(themeColors.darkMode)}}
body{margin:0;background:var(--light);color:var(--darkgray);font:16px/1.7 var(--bodyFont)}
main{max-width:720px;margin:0 auto;padding:40vh 16px}
</style><style>${animCss}</style></head><body><main>${figure}</main>
<script>window.addCleanup = () => {}</script>
<script>${probeJs}</script>
<script>${runtimeJs}
document.dispatchEvent(new CustomEvent("nav", { detail: { url: location.href } }))</script>
</body></html>`

// ── 펜스 수집과 정적 검사 ──
const sources = notePath ? lib.extractFences(readFileSync(notePath, "utf8")) : [readFileSync(fencePath, "utf8")]
if (sources.length === 0) { console.error("anim 펜스가 없다"); process.exit(1) }

const assets = new Map() // 하니스 URL 이름 → 파일 경로
const pages = new Map() // 하니스 경로 → HTML
const fences = sources.map((source, i) => {
  const n = i + 1
  const results = []
  const add = (id, ok, detail = "", level = "fail") => results.push({ id, ok, level: ok ? "pass" : level, detail })
  const rendered = lib.renderFigure(source, (name) => `/assets/${name}`)
  if (!rendered.ok) { add("AV1", false, rendered.error); return { n, results, spec: null } }
  add("AV1", true)
  const spec = rendered.spec
  for (const it of [...lib.checkStepRefs(spec), ...lib.checkTiming(spec, allowTiming)]) add(it.id, false, it.detail, it.level)
  for (const name of [spec.src, spec.poster].filter(Boolean)) {
    const found = assetDirs.flatMap((d) => filesNamed(d, name))
    const unique = new Set(attachmentsRoot ? filesNamed(attachmentsRoot, name) : [])
    for (const f of found) unique.add(f)
    if (found.length === 0) add("AV2", false, `${name}을(를) 찾지 못함 (${assetDirs.join(", ")})`)
    else if (unique.size > 1) add("AV2", false, `${name}이(가) 여러 곳에 있다 — 파일명은 attachments 전체에서 유일해야 한다: ${[...unique].join(", ")}`)
    else assets.set(name, found[0])
  }
  if (spec.kind === "canvas" && assets.has(spec.src)) {
    const raw = readFileSync(assets.get(spec.src), "utf8")
    const stripped = esbuild.transformSync(raw, { loader: "js", legalComments: "none" }).code
    const issues = lib.checkCanvasSource(stripped, Buffer.byteLength(raw))
    for (const it of issues) add(it.id, false, it.detail)
    if (!issues.length) add("AV3", true)
  }
  if (!results.some((r) => r.id === "AV2" && !r.ok)) add("AV2", true)
  if (!results.some((r) => r.id === "AV5" && !r.ok)) add("AV5", true)
  pages.set(`/fence-${n}.html`, harnessHtml(rendered.html))
  return { n, results, spec, alt: spec.alt }
})

// ── 하니스 서버 ──
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".webm": "video/webm", ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml" }
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname)
  if (pages.has(url)) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(pages.get(url)) }
  const name = url.startsWith("/assets/") ? url.slice(8) : null
  if (name && assets.has(name)) { res.writeHead(200, { "content-type": TYPES[path.extname(name)] ?? "application/octet-stream" }); return res.end(readFileSync(assets.get(name))) }
  res.writeHead(404); res.end()
})
await new Promise((r) => server.listen(0, "127.0.0.1", r))
const base = `http://127.0.0.1:${server.address().port}`

// ── 브라우저 검사 ──
let chromium
try { ({ chromium } = await import("playwright-core")) } catch { console.error("playwright-core가 없다: npm install"); process.exit(2) }
let browser
try { browser = await chromium.launch({ channel: "chrome" }) } catch (e) { console.error(`Chrome 실행 실패: ${e.message.split("\n")[0]}`); process.exit(2) }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function open(n, opts) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()) })
  page.on("pageerror", (e) => errors.push(String(e)))
  page.on("requestfailed", (r) => errors.push(`요청 실패 ${r.url()}`))
  await page.goto(`${base}/fence-${n}.html`, { waitUntil: "load" })
  await page.locator("figure.anim").scrollIntoViewIfNeeded()
  return { ctx, page, errors }
}
const savePng = (file, dataUrl) => writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"))
const setTheme = (page, theme) => page.evaluate((t) => {
  document.documentElement.setAttribute("saved-theme", t)
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }))
}, theme)

for (const f of fences) {
  // 자산이 없으면 브라우저 검사는 의미가 없다(AV2가 이미 실패).
  if (!f.spec || !pages.has(`/fence-${f.n}.html`) || [f.spec.src, f.spec.poster].some((x) => x && !assets.has(x))) continue
  const dir = path.join(outDir, `fence-${f.n}`)
  mkdirSync(dir, { recursive: true })
  const add = (id, ok, detail = "", level = "fail") => f.results.push({ id, ok, level: ok ? "pass" : level, detail })
  const shots = (f.screenshots = [])
  const shot = async (loc, name) => { await loc.screenshot({ path: path.join(dir, name) }); shots.push(path.join(dir, name)) }
  const spec = f.spec
  const allErrors = []
  try {
    // 1) 데스크톱(라이트): 실제 런타임 동작
    const d = await open(f.n, { viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 })
    const fig = d.page.locator("figure.anim")
    if (spec.kind === "canvas") {
      await d.page.waitForFunction(() => window.__probe.runtimeCanvas() !== null, null, { timeout: 8000 })
      const r1 = await d.page.evaluate(() => window.__probe.runtimeCanvas())
      await sleep(400)
      const r2 = await d.page.evaluate(() => window.__probe.runtimeCanvas())
      const src = await fig.getAttribute("data-src")
      const o = { width: r1.width, height: r1.height, cycle: spec.cycle }
      const fr = (p, extra = {}) => d.page.evaluate(([s, opt]) => window.__probe.frame(s, opt), [src, { ...o, progress: p, ...extra }])
      const start = await fr(0.1), mid = await fr(0.5), mid2 = await fr(0.5), end = await fr(1)
      await setTheme(d.page, "dark")
      const endDark = await fr(1)
      await setTheme(d.page, "light")
      for (const [name, frm] of [["start.png", start], ["mid.png", mid], ["final-light.png", end], ["final-dark.png", endDark]]) { savePng(path.join(dir, name), frm.png); shots.push(path.join(dir, name)) }
      add("AV6", end.inked > 0.003 && endDark.inked > 0.003, `잉크 비율 라이트 ${(end.inked * 100).toFixed(1)}% · 다크 ${(endDark.inked * 100).toFixed(1)}%`)
      add("AV6", end.hash !== endDark.hash, end.hash !== endDark.hash ? "테마 전환 시 다른 색으로 그린다" : "라이트·다크 프레임이 같다 — colors.*를 읽지 않는다")
      add("AV7", start.hash !== end.hash, start.hash !== end.hash ? "progress 0.1과 1의 프레임이 다르다" : "progress가 바뀌어도 그림이 같다")
      add("AV7", r1.hash !== r2.hash, r1.hash !== r2.hash ? "런타임 루프가 움직인다" : "런타임 캔버스가 400ms 동안 변하지 않았다")
      add("AV9", mid.hash === mid2.hash, mid.hash === mid2.hash ? "같은 progress에서 같은 픽셀" : "같은 progress인데 픽셀이 다르다(비결정적)")
    } else if (spec.kind === "steps") {
      const n = spec.steps.length
      const btns = fig.locator(".anim-btn")
      add("AV6", (await btns.count()) === 3, `컨트롤 버튼 ${await btns.count()}개`)
      const index = async () => Number(((await fig.locator(".anim-say").textContent()) ?? "").split("/")[0])
      await btns.nth(0).click() // 이전: 자동재생을 멈춘다
      while ((await index()) !== 1) await btns.nth(2).click()
      const mismatch = []
      for (let k = 0; k < n; k++) {
        const got = await fig.evaluate((el) => [...el.querySelectorAll(".is-on")].map((e) => e.id).sort())
        const want = await fig.evaluate((el, ids) => ids.filter((id) => el.querySelector(`[id="${id}"]`)).sort(), spec.steps[k].on)
        if (JSON.stringify(got) !== JSON.stringify(want)) mismatch.push(`${k + 1}단계 켜짐 ${got.join(",")} ≠ ${want.join(",")}`)
        await shot(fig, `step-${k + 1}.png`)
        if (k < n - 1) await btns.nth(2).click()
      }
      add("AV6", mismatch.length === 0, mismatch.join(" · ") || "단계마다 on 요소가 정확히 켜진다")
      await setTheme(d.page, "dark")
      await sleep(400)
      await shot(fig, "final-dark.png")
    }
    allErrors.push(...d.errors)
    await d.ctx.close()

    // 2) 동작 줄이기: 마지막 장면이 정지 화면
    const r = await open(f.n, { viewport: { width: 900, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" })
    const rfig = r.page.locator("figure.anim")
    if (spec.kind === "canvas") {
      await r.page.waitForFunction(() => window.__probe.runtimeCanvas() !== null, null, { timeout: 8000 })
      await sleep(300)
      const rc = await r.page.evaluate(() => window.__probe.runtimeCanvas())
      const src = await rfig.getAttribute("data-src")
      const cmp = await r.page.evaluate(([s, o]) => window.__probe.compareRuntime(s, o), [src, { width: rc.width, height: rc.height, cycle: spec.cycle, progress: 1, reduced: true }])
      // 래스터 경로 차이(채널 ±2, 픽셀 0.5% 미만)만 같은 프레임으로 본다. 다른 장면이면 둘 다 크게 넘는다.
      const same = cmp?.sameSize && cmp.maxDelta <= 2 && cmp.diffRatio < 0.005
      const how = cmp ? `차이 픽셀 ${(cmp.diffRatio * 100).toFixed(2)}% · 최대 채널 차 ${cmp.maxDelta}` : "런타임 캔버스 없음"
      add("AV7", same, same ? `동작 줄이기 정지 화면 = progress 1 프레임 (${how})` : `동작 줄이기 화면이 마지막 프레임과 다르다 (${how})`)
      const hidden = await rfig.evaluate((el) => el.querySelector(".anim-overlay")?.hidden === true)
      add("AV7", hidden, hidden ? "동작 줄이기에서 일시정지 버튼 숨김" : "동작 줄이기인데 일시정지 버튼이 보인다")
    } else if (spec.kind === "steps") {
      const say1 = await rfig.locator(".anim-say").textContent()
      await sleep(spec.interval + 500)
      const say2 = await rfig.locator(".anim-say").textContent()
      const n = spec.steps.length
      add("AV7", say1 === say2, say1 === say2 ? "동작 줄이기에서 자동재생하지 않는다" : "동작 줄이기인데 단계가 넘어간다")
      add("AV7", (say1 ?? "").startsWith(`${n}/`), (say1 ?? "").startsWith(`${n}/`) ? "동작 줄이기는 마지막(요약) 단계에서 시작" : `동작 줄이기 시작 단계: ${say1}`)
    }
    await shot(rfig, "reduced.png")
    allErrors.push(...r.errors)
    await r.ctx.close()

    // 3) 모바일 375px
    const m = await open(f.n, { viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, reducedMotion: "reduce", isMobile: true })
    await sleep(500)
    const over = await m.page.evaluate(() => {
      const fig = document.querySelector("figure.anim")
      return { fig: fig.scrollWidth - fig.clientWidth, doc: document.documentElement.scrollWidth - window.innerWidth }
    })
    add("AV8", over.fig <= 1 && over.doc <= 1, over.fig <= 1 && over.doc <= 1 ? "375px에서 넘침 없음" : `넘침: figure ${over.fig}px, 페이지 ${over.doc}px`)
    await shot(m.page.locator("figure.anim"), "mobile.png")
    allErrors.push(...m.errors)
    await m.ctx.close()
  } catch (e) {
    add("AV4", false, `검사 중 예외: ${e.message.split("\n")[0]}`)
  }
  // 주의: 프로브의 getImageData 경고는 하니스가 만든 것이라 위젯 오류가 아니다.
  const relevant = allErrors.filter((e) => !/favicon|Multiple readback operations using getImageData/.test(e))
  add("AV4", relevant.length === 0, relevant.length ? relevant.slice(0, 5).join(" · ") : "콘솔 오류·예외·요청 실패 0")
}
await browser.close()

// ── 보고 ──
const report = { note: notePath ?? fencePath, out: outDir, fences: fences.map(({ n, alt, spec, results, screenshots }) => ({ n, kind: spec?.kind, alt, results, screenshots: screenshots ?? [] })) }
writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2))
let failed = false
for (const f of report.fences) {
  console.log(`\n[펜스 ${f.n}] ${f.kind ?? "?"} — ${f.alt ?? ""}`)
  for (const r of f.results) {
    const mark = r.level === "pass" ? "✓" : r.level === "warn" ? "!" : "✗"
    if (r.level === "fail") failed = true
    console.log(`  ${mark} ${r.id}${r.detail ? ` ${r.detail}` : ""}`)
  }
}
console.log(`\n결과: ${failed ? "실패" : "통과"} · 보고서 ${path.join(outDir, "report.json")}`)

if (flag("serve")) {
  console.log(`\n미리보기 서버 (Ctrl+C로 종료):`)
  for (const p of pages.keys()) console.log(`  ${base}${p}`)
} else {
  server.close()
  process.exit(failed ? 1 : 0)
}
