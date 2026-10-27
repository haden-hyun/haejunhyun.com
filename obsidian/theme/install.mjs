// 스니펫 원본을 볼트 .obsidian/snippets/로 복사한다(VAULT_DIR로 볼트 경로 지정 — anim-widgets/obsidian과 같은 방식).
import { copyFileSync, existsSync } from "node:fs"
import { homedir } from "node:os"
import path from "node:path"

const vault = process.env.VAULT_DIR ?? path.join(homedir(), "Documents/obsidian")
const dir = path.join(vault, ".obsidian/snippets")
if (!existsSync(dir)) {
  console.error(`볼트 snippets 폴더가 없다: ${dir} (VAULT_DIR을 확인할 것)`)
  process.exit(1)
}
const dest = path.join(dir, "haejun-records.css")
copyFileSync(new URL("./haejun-records.css", import.meta.url), dest)
console.log(`installed → ${dest} (Obsidian 설정 > 모양 > CSS 스니펫에서 켜져 있어야 반영된다)`)
