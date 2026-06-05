// @ts-ignore
import readingProgressScript from "./scripts/readingProgress.inline"
import style from "./styles/readingProgress.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ReadingProgress: QuartzComponent = () => {
  return <div id="reading-progress-bar" />
}

ReadingProgress.css = style
ReadingProgress.beforeDOMLoaded = readingProgressScript

export default (() => ReadingProgress) satisfies QuartzComponentConstructor
