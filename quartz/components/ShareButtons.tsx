// @ts-ignore
import shareScript from "./scripts/shareButtons.inline"
import style from "./styles/shareButtons.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const ShareButtons: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (!fileData.slug || fileData.slug === "index") return <></>

  return (
    <div class="share-buttons">
      <span class="share-label">Share</span>
      <a
        id="share-twitter"
        class="share-btn"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        id="share-linkedin"
        class="share-btn"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  )
}

ShareButtons.css = style
ShareButtons.beforeDOMLoaded = shareScript

export default (() => ShareButtons) satisfies QuartzComponentConstructor
