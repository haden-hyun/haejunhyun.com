import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/readingProgress.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import readingProgressScript from "./scripts/readingProgress.inline.ts"
import { isRealNote } from "../../../_shared/notes"

// 읽기 진행바 — 노트 페이지에만, 스크롤 비율을 rAF로 그린다(스크립트).

const ReadingProgress: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  isRealNote(fileData.slug) ? <div id="reading-progress-bar" aria-hidden="true" /> : <></>

ReadingProgress.css = style
ReadingProgress.beforeDOMLoaded = readingProgressScript

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
