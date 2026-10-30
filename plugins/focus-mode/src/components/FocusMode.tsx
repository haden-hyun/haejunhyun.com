import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/focusMode.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import focusModeScript from "./scripts/focusMode.inline.ts"
import { isRealNote } from "../../../_shared/notes"

// 집중 모드 토글 — 노트 페이지에만. 상태·단축키·레일·툴팁 문구·토스트·첫 안내는 스크립트, 레이아웃은 custom.scss §8.6.
// 주의: custom.scss가 `> div:has(> .focus-toggle)`로 래퍼를 잡으므로 버튼을 한 겹 더 감싸지 말 것.

const FocusMode: QuartzComponent = ({ fileData }: QuartzComponentProps) =>
  isRealNote(fileData.slug) ? (
    <button
      type="button"
      class="focus-toggle"
      aria-pressed="false"
      aria-label="집중 모드"
      aria-describedby="focus-tip"
      aria-keyshortcuts={"Meta+\\ Control+\\"}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16M15 4v16" />
      </svg>
      <span id="focus-tip" class="focus-tip" role="tooltip">
        <b class="focus-tip-title">집중 모드 켜기</b>
        <span class="focus-tip-desc">패널 숨김 · 본문 확대</span>
        <span class="focus-tip-keys" aria-hidden="true">
          <kbd>⌘\</kbd>
        </span>
      </span>
    </button>
  ) : (
    <></>
  )

FocusMode.css = style
FocusMode.beforeDOMLoaded = focusModeScript

export default (() => FocusMode) satisfies QuartzComponentConstructor
