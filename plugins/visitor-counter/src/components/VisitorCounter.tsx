import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { classNames } from "@quartz-community/utils/lang"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import script from "./scripts/visitorCounter.inline.ts"

// 방문 수(Today · Total) 표시 — 비활성, 방문 수는 home-hero 메타 줄이 대신한다.
// 주의: 스크립트가 GoatCounter API 토큰을 클라이언트에 노출한다.

const VisitorCounter: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "visitor-counter")}>
      <span class="visitor-item">
        <span class="visitor-label">Today</span>
        <span id="visitor-today" class="visitor-count">-</span>
      </span>
      <span class="visitor-sep">·</span>
      <span class="visitor-item">
        <span class="visitor-label">Total</span>
        <span id="visitor-total" class="visitor-count">-</span>
      </span>
    </div>
  )
}

VisitorCounter.afterDOMLoaded = script

VisitorCounter.css = `
.visitor-counter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--gray);
  margin: 0.1rem 0 0.6rem 0;
}

.visitor-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.visitor-label {
  opacity: 0.65;
}

.visitor-count {
  font-weight: 600;
  color: var(--secondary);
}

.visitor-sep {
  opacity: 0.35;
}
`

export default (() => VisitorCounter) satisfies QuartzComponentConstructor
