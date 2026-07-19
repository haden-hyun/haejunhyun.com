import type {
  QuartzComponent,
  QuartzComponentConstructor,
} from "@quartz-community/types"
import style from "./styles/backToTop.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import backToTopScript from "./scripts/backToTop.inline.ts"

const BackToTop: QuartzComponent = () => (
  <button id="back-to-top" aria-label="Back to top">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4l-8 8h5v8h6v-8h5z" />
    </svg>
  </button>
)

BackToTop.css = style
BackToTop.beforeDOMLoaded = backToTopScript

export default (() => BackToTop) satisfies QuartzComponentConstructor
