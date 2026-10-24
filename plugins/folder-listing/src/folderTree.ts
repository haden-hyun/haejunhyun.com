// ctx.trie(폴더 노드) → 폴더 페이지 섹션 트리.
// - 표시명: 폴더 노트 title → folderTitles → 토픽 표 → Title Case
// - 사슬 접기("A / B")·한 단 펴기
import type { QuartzPluginData } from "@quartz-community/types"
import { folderTitle, isListedNote } from "../../_shared/notes"

export type PageEntry = QuartzPluginData & Record<string, unknown>

/** ctx.trie(코어 FileTrieNode)에서 쓰는 부분만. */
export interface TrieNode {
  isFolder: boolean
  children: TrieNode[]
  data: unknown
  slug: string
  displayName: string
  findNode(path: string[]): TrieNode | undefined
}

export interface FolderSection {
  /** 폴더 경로("programming/python"). 접힌 사슬이면 가장 깊은 폴더. */
  path: string
  title: string
  /** 폴더 노트(`{folder}/{folder}.md`처럼 index로 흡수된 노트). */
  intro?: PageEntry
  notes: PageEntry[]
  children: FolderSection[]
  /** 하위 전체 노트 수(폴더 노트 제외). */
  count: number
}

export const folderPathOf = (node: TrieNode): string => node.slug.replace(/\/?index$/, "")

function folderNote(node: TrieNode): PageEntry | undefined {
  const data = node.data as PageEntry | null
  return data && data.unlisted !== true && data.frontmatter?.unlisted !== true ? data : undefined
}

/** 표시명 = 폴더 노트 title → folderTitles → Title Case. */
export function folderDisplayName(node: TrieNode, overrides: Record<string, string>): string {
  const title = folderNote(node)?.frontmatter?.title
  if (typeof title === "string" && title.trim() !== "" && title !== "index") return title
  return folderTitle(folderPathOf(node), overrides)
}

export function walkFolders(node: TrieNode, fn: (folder: TrieNode) => void): void {
  for (const child of node.children) {
    if (!child.isFolder) continue
    fn(child)
    walkFolders(child, fn)
  }
}

/** 폴더 노드를 섹션 트리로. collapse면 노트·폴더 노트 없이 자식 폴더 1개뿐인 사슬을 "A / B" 한 섹션으로 접는다. */
export function buildSection(
  node: TrieNode,
  overrides: Record<string, string>,
  collapse: boolean,
): FolderSection {
  const notes = node.children
    .filter((c) => !c.isFolder && c.data && isListedNote(c.data as PageEntry))
    .map((c) => c.data as PageEntry)
  const children = node.children
    .filter((c) => c.isFolder)
    .map((c) => buildSection(c, overrides, true))
    .filter((s) => s.count > 0 || s.intro)
  let section: FolderSection = {
    path: folderPathOf(node),
    title: folderDisplayName(node, overrides),
    intro: folderNote(node),
    notes,
    children,
    count: notes.length + children.reduce((n, c) => n + c.count, 0),
  }
  while (collapse && section.notes.length === 0 && !section.intro && section.children.length === 1) {
    const only = section.children[0]!
    section = { ...only, title: `${section.title} / ${only.title}` }
  }
  return section
}

/** 하위 섹션을 한 단(들여쓰기 1단)으로 편다 — 더 깊은 폴더는 "B / C" 제목으로 이어 붙인다. */
export function flattenSections(sections: FolderSection[], prefix = ""): FolderSection[] {
  return sections.flatMap((s) => {
    const title = prefix ? `${prefix} / ${s.title}` : s.title
    return [{ ...s, title }, ...flattenSections(s.children, title)]
  })
}
