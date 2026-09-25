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
 * 텍스트 콜로폰: 열(링크 목록 또는 문단) + 하단 한 줄. 이미지 없음.
 */

export interface FooterColumn {
  title: string
  /** 표시 텍스트 → 링크 */
  links?: Record<string, string>
  /** 링크 대신 문단 */
  text?: string
}

export interface FooterOptions {
  columns: FooterColumn[]
  /** 하단 줄 왼쪽 */
  brand?: string
  /** 하단 줄 오른쪽 저작권 */
  meta?: string
}

export default ((opts?: FooterOptions) => {
  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass } = props
    const columns = opts?.columns ?? []

    return (
      <footer class={`${displayClass ?? ""} site-footer`}>
        {columns.length > 0 && (
          <div class="sf-cols">
            {columns.map((col) => (
              <div class="sf-col">
                <div class="sf-col-title">{col.title}</div>
                {col.links && (
                  <ul class="sf-links">
                    {Object.entries(col.links).map(([text, link]) => (
                      <li>
                        <a href={link}>{text}</a>
                      </li>
                    ))}
                  </ul>
                )}
                {col.text && <p class="sf-text">{col.text}</p>}
              </div>
            ))}
          </div>
        )}
        {(opts?.brand || opts?.meta) && (
          <div class="sf-fine">
            {opts?.brand && <span>{opts.brand}</span>}
            {opts?.meta && <span>{opts.meta}</span>}
          </div>
        )}
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor<FooterOptions>
