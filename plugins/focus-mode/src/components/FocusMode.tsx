import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/focusMode.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import focusModeScript from "./scripts/focusMode.inline.ts"
import { isRealNote } from "../../../_shared/notes"

// 집중 모드 토글 — 노트 페이지에만. 상태·단축키·TOC 레일·토스트는 스크립트, 레이아웃은 custom.scss §8.6.

const FocusMode: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  isRealNote(fileData.slug) ? (
    <button
      type="button"
      class="focus-toggle"
      aria-pressed="false"
      aria-label="Focus mode"
      aria-keyshortcuts={"Meta+\\ Control+\\"}
      title={"Focus mode ⌘\\"}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16M15 4v16" />
      </svg>
    </button>
  ) : (
    <></>
  )

FocusMode.css = style
FocusMode.beforeDOMLoaded = focusModeScript

export default (() => FocusMode) satisfies QuartzComponentConstructor
