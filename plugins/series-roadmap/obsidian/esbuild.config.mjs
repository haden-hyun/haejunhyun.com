// 블로그 series-roadmap의 공용 렌더(src/core)·parse.ts·roadmap.scss를 Obsidian 플러그인 하나로 묶는다.
// `--install`이면 빌드본을 볼트 .obsidian/plugins/series-roadmap-preview/로 복사한다(VAULT_DIR로 볼트 경로 지정).
import esbuild from "esbuild"
import { execFileSync } from "node:child_process"
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"

const PLUGIN = path.resolve("..")
const BLOG = path.resolve(PLUGIN, "../..")
const OUT = "dist/series-roadmap-preview"
const FILES = ["main.js", "styles.css", "manifest.json"]
mkdirSync(OUT, { recursive: true })

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  target: "es2022",
  platform: "browser",
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
  alias: { "js-yaml": path.resolve("src/yaml-shim.ts") },
  outfile: `${OUT}/main.js`,
  logLevel: "info",
})

// 블로그 로드맵 스타일을 컴파일하고 앞에 블로그 색 토큰 매핑을 붙인다.
const css = execFileSync(path.join(BLOG, "node_modules/.bin/sass"), ["--no-source-map", path.join(PLUGIN, "src/styles/roadmap.scss")], {
  encoding: "utf8",
})
writeFileSync(`${OUT}/styles.css`, readFileSync("src/theme-map.css", "utf8") + "\n" + css)
copyFileSync("manifest.json", `${OUT}/manifest.json`)

if (process.argv.includes("--install")) {
  const vault = process.env.VAULT_DIR ?? path.join(homedir(), "Documents/obsidian")
  const dest = path.join(vault, ".obsidian/plugins/series-roadmap-preview")
  mkdirSync(dest, { recursive: true })
  for (const f of FILES) copyFileSync(path.join(OUT, f), path.join(dest, f))
  console.log(`installed → ${dest} (Obsidian에서 플러그인을 껐다 켜야 반영된다)`)
}
