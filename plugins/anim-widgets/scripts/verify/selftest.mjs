// verify-anim 자체 검증: 위반 픽스처는 기대한 AV로 실패하고, 정상 픽스처는 통과해야 한다.
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const fx = path.resolve(here, "../../test/fixtures/verify")
const run = (note) => {
  const out = path.join(tmpdir(), `verify-selftest-${path.basename(note, ".md")}-${Date.now()}`)
  const r = spawnSync("node", [path.join(here, "../verify-anim.mjs"), "--note", path.join(fx, note), "--assets", path.join(fx, "assets"), "--attachments", path.join(fx, "assets"), "--out", out], { encoding: "utf8" })
  return { code: r.status, report: JSON.parse(readFileSync(path.join(out, "report.json"), "utf8")) }
}
const failed = (f) => new Set(f.results.filter((r) => r.level === "fail").map((r) => r.id))
const expectBad = [["AV3", "AV9"], ["AV6", "AV7"], ["AV5", "AV6", "AV7"], ["AV2", "AV5"], ["AV2"]]

let ok = true
const good = run("good.md")
if (good.code !== 0) { ok = false; console.error("✗ 정상 픽스처가 실패했다", JSON.stringify(good.report.fences.map(failed).map((s) => [...s]))) }
const bad = run("bad.md")
if (bad.code !== 1) { ok = false; console.error(`✗ 위반 픽스처 종료 코드 ${bad.code} (기대 1)`) }
expectBad.forEach((ids, i) => {
  const got = failed(bad.report.fences[i])
  const miss = ids.filter((id) => !got.has(id))
  if (miss.length) { ok = false; console.error(`✗ 위반 펜스 ${i + 1}: ${miss.join(", ")}를 잡지 못함 (잡은 것 ${[...got].join(", ")})`) }
  if (got.has("AV4")) { ok = false; console.error(`✗ 위반 펜스 ${i + 1}: 하니스 잡음 AV4`) }
})
console.log(ok ? "✓ selftest 통과" : "selftest 실패")
process.exit(ok ? 0 : 1)
