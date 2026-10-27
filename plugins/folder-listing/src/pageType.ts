import type { QuartzPageTypePlugin } from "@quartz-community/types"
import { FolderPage, type FolderPageOptions } from "@quartz-community/folder-page"
import FolderListing from "./components/FolderListing"
import { folderDisplayName, folderPathOf, walkFolders, type TrieNode } from "./folderTree"

export interface FolderListingOptions extends FolderPageOptions {
  /** 폴더 경로 또는 마지막 세그먼트 → 표시명. 폴더 노트 title이 우선한다. */
  folderTitles: Record<string, string>
  /** 시리즈 키 → 표시명. quartz.config.yaml의 `&seriesTitles` 앵커 정의처다. */
  seriesTitles: Record<string, string>
}

/**
 * folder-page를 대체한다 — 가상 폴더 페이지 생성·매칭·레이아웃("folder")은 업스트림 그대로, 본문 목록만 로컬.
 * 주의: 가상 페이지는 그것을 만든 pageType의 body로 렌더되므로 folder-page는 꺼 둬야 한다.
 */
export const FolderListingPage: QuartzPageTypePlugin<Partial<FolderListingOptions>> = (opts) => {
  const base = FolderPage(opts)
  const folderTitles = opts?.folderTitles ?? {}
  return {
    ...base,
    name: "FolderListingPage",
    // 표시명을 가상 페이지 제목(H1·<title>)과 공유 trie(breadcrumb가 읽는다)에 함께 심는다.
    generate(args) {
      const trie = (args.ctx as { trie?: TrieNode }).trie
      const names = new Map<string, string>()
      if (trie) {
        walkFolders(trie, (node) => {
          const name = folderDisplayName(node, folderTitles)
          names.set(folderPathOf(node), name)
          node.displayName = name
        })
      }
      return (base.generate?.(args) ?? []).map((page) => {
        const name = names.get(page.slug.replace(/\/index$/, ""))
        return name ? { ...page, title: name } : page
      })
    },
    body: () => FolderListing(opts),
  }
}
