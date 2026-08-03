import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/footer.scss"

/**
 * v4 parity: v4's `quartz/components/Footer.tsx` replaced the stock
 * "Created with Quartz vX © year" text with a custom attribution line and
 * dropped the version/year entirely, adding an `<hr />` divider above it.
 * The v5 `footer` community plugin has no option to customize that text, so
 * this local plugin replaces it wholesale (registered under the same
 * structural "footer" slot — see quartz.config.yaml).
 *
 * [2026-08-02] 방문자 카운터를 한때 같은 줄에 배치했었다(→ 2026-08-04에
 * home-hero로 재이전, 아래 참고).
 *
 * [2026-08-04] 방문자 카운터를 여기서 뺐다 — 사용자 요청으로 home-hero(아바타
 * 아래, beforeBody)로 옮겼다. 이유: "Created by haejun" 옆의 트래픽 숫자가
 * 노트 페이지 footer(afterBody, 전 페이지 공통)에 매번 뜨는 것보다, 홈의
 * 프로필 영역에 한 번 보이는 편이 자기소개 성격에 더 맞는다는 판단.
 * `@haejunhyun/visitor-counter` 의존성도 home-hero의 package.json으로
 * 옮겨감 — footer는 더 이상 그 패키지에 의존하지 않는다.
 */

export interface FooterOptions {
  links: Record<string, string>
}

export default ((opts?: FooterOptions) => {
  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass } = props
    const links = opts?.links ?? {}
    return (
      <footer class={`${displayClass ?? ""}`}>
        <hr />
        <p style="text-align: left;">
          Created by <a href="https://github.com/haden-hyun">haejun</a>
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor<FooterOptions>
