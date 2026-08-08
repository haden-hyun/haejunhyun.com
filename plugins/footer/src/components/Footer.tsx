import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/footer.scss"

/**
 * 커스텀 footer — 기본 "Created with Quartz vX © year"를 통째로 대체한다.
 * 커뮤니티 footer 플러그인엔 문구 옵션이 없어 로컬 플러그인으로 교체.
 *
 * 방문자 카운터는 여기 없다 — home-hero(아바타 아래)가 렌더한다.
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
