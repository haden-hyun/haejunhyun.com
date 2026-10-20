import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/readingProgress.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import readingProgressScript from "./scripts/readingProgress.inline.ts"
import { isRealNote } from "../../../_shared/notes"

const ReadingProgress: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  isRealNote(fileData.slug) ? <div id="reading-progress-bar" aria-hidden="true" /> : <></>

ReadingProgress.css = style
ReadingProgress.beforeDOMLoaded = readingProgressScript

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
