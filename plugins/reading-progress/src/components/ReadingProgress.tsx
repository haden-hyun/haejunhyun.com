import type {
  QuartzComponent,
  QuartzComponentConstructor,
} from "@quartz-community/types"
import style from "./styles/readingProgress.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import readingProgressScript from "./scripts/readingProgress.inline.ts"

const ReadingProgress: QuartzComponent = () => {
  return <div id="reading-progress-bar" />
}

ReadingProgress.css = style
ReadingProgress.beforeDOMLoaded = readingProgressScript

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
