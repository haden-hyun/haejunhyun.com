// 펜스 하나를 볼트 메타데이터로 그린다. obsidian 모듈에 기대지 않아 jsdom에서도 돈다.
import { isListedNote } from "../../../_shared/notes"
import { getSeriesEntries, seriesIndexOf, seriesOf, type SeriesFile } from "../../../_shared/series"
import { initRoadmap } from "../../src/core/client"
import { buildRoadmap, currentNoteOf, toPublished, type RNode, type RText } from "../../src/core/render"
import { parseSpec } from "../../src/parse"

export const CONTENT = "00-Blog/content/"
const DRAFT_DIRS = ["00-Blog/01-Bronze/", "00-Blog/02-Silver/"]
// 주의: quartz.config.yaml ignorePatterns와 같게 둘 것(content 기준)
const IGNORED = [/^private\//, /^templates\//, /^\.obsidian\//, /^attachments\/_staging\//, /^attachments\/archive\//, /^test\.md$/]

export interface NoteMeta {
  path: string
  frontmatter: Record<string, unknown>
}

export interface ViewDeps {
  notes: NoteMeta[]
  seriesTitles: Record<string, string>
  register: (cleanup: () => void) => void
  /** 펜스가 놓인 노트의 프론트매터(현재 편 판정용) */
  current?: Record<string, unknown>
  openLink: (path: string, newLeaf: boolean) => void
}

const isDraft = (fm: Record<string, unknown>) => fm.draft === true || fm.draft === "true"

/** 블로그가 빌드하는 발행본만: content 아래, ignorePatterns·draft 제외, slug는 content 기준 경로. */
function publishedFiles(notes: NoteMeta[]): SeriesFile[] {
  return notes.flatMap((n) => {
    if (!n.path.startsWith(CONTENT) || !n.path.endsWith(".md")) return []
    const rel = n.path.slice(CONTENT.length)
    if (IGNORED.some((re) => re.test(rel)) || isDraft(n.frontmatter)) return []
    const file = { slug: rel.slice(0, -3), filePath: n.path, frontmatter: n.frontmatter } as unknown as SeriesFile
    return isListedNote(file) ? [file] : []
  })
}

function toDom(node: RNode | RText, doc: Document): Node {
  if (node.type === "text") return doc.createTextNode(node.value)
  const el =
    node.tagName === "svg" ? doc.createElementNS("http://www.w3.org/2000/svg", "svg") : doc.createElement(node.tagName)
  for (const [key, value] of Object.entries(node.properties)) {
    if (value === undefined) continue
    const name =
      key === "className" ? "class" : key === "tabIndex" ? "tabindex" : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    el.setAttribute(name, Array.isArray(value) ? value.join(" ") : String(value))
  }
  for (const child of node.children) el.appendChild(toDom(child, doc))
  return el
}

/** el을 비우고 로드맵·경고 줄을 그린다. 펜스가 잘못됐으면 블로그처럼 코드를 남기고 원인을 함께 보인다. */
export function renderRoadmap(el: HTMLElement, source: string, deps: ViewDeps) {
  const doc = el.ownerDocument
  el.replaceChildren()
  el.classList.add("series-roadmap")
  const warnings: string[] = []
  const warnList = () => {
    if (warnings.length === 0) return
    const ul = doc.createElement("ul")
    ul.className = "rm-warnings"
    for (const w of warnings) ul.appendChild(doc.createElement("li")).textContent = w
    el.appendChild(ul)
  }

  const result = parseSpec(source)
  if (!result.ok) {
    warnings.push(`series-roadmap: ${result.error}`)
    warnList()
    el.appendChild(doc.createElement("pre")).appendChild(doc.createElement("code")).textContent = source
    return
  }
  const { spec } = result
  const files = publishedFiles(deps.notes)
  const published = toPublished(getSeriesEntries(spec.series, files), (f) => String(f.filePath))
  const title = deps.seriesTitles[spec.series]?.trim() || spec.series
  const page = { frontmatter: deps.current ?? {} } as unknown as SeriesFile
  const nav = buildRoadmap(spec, title, published, (id) => id, (m) => warnings.push(m), currentNoteOf(page))

  const shown = new Set([...published.map((p) => p.index), ...spec.outline.map((o) => o.index)])
  for (const n of deps.notes) {
    const dir = DRAFT_DIRS.find((d) => n.path.startsWith(d))
    if (!dir) continue
    const file = { frontmatter: n.frontmatter } as unknown as SeriesFile
    const index = seriesIndexOf(file)
    if (seriesOf(file) !== spec.series || index === undefined || index === 0 || shown.has(index)) continue
    warnings.push(`원고는 있으나 로드맵에 없음: ${index}편 (${n.path.slice("00-Blog/".length)})`)
  }

  if (nav) {
    const navEl = toDom(nav, doc) as HTMLElement
    navEl.removeAttribute("data-roadmap-init")
    el.appendChild(navEl)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]")
      if (!a || !navEl.contains(a)) return
      e.preventDefault()
      deps.openLink(a.getAttribute("href")!, e.metaKey || e.ctrlKey)
    }
    navEl.addEventListener("click", onClick)
    deps.register(() => navEl.removeEventListener("click", onClick))
    initRoadmap(navEl, deps.register)
  }
  warnList()
}
