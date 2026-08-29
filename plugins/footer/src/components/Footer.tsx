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
 * 잉크 판(--stage) 위에 서는 무대형 푸터. figureImage는 배경이 투명한 컷아웃
 * 전제다 — 흰 옷이 크림 배경에서 1.06:1로 사라져 밝은 판 위에는 쓸 수 없다.
 *
 * 방문자 카운터는 여기 없다 — home-hero(아바타 아래)가 렌더한다.
 */

export interface FooterOptions {
  links: Record<string, string>
  /** 판 왼쪽 위 소문자 라벨 */
  eyebrow?: string
  /** 라벨 아래 한 줄 제목 */
  headline?: string
  /** 제목 아래 문단 */
  description?: string
  /** 맨 아래 저작권 줄 */
  meta?: string
  /** 오른쪽에 세울 컷아웃 경로(예: "./static/bluegiant/player.webp"). 없으면 판만 렌더한다. */
  figureImage?: string
  /** 판 배경 이미지. 잉크 베일 86%가 덮으므로 분위기만 남는다. */
  backgroundImage?: string
}

/**
 * "./static/…"의 `./`를 슬러그 깊이만큼의 `../`로 바꾼다.
 * 주의: footer는 전 페이지에 렌더되므로 `./`를 그대로 두면 하위 경로에서 404가 난다
 *   (home-hero의 avatarImage는 홈 전용이라 이 보정이 없어도 동작한다).
 */
function resolveFromRoot(path: string, slug: string): string {
  if (!path.startsWith("./")) return path
  const depth = slug.split("/").length - 1
  const prefix = depth === 0 ? "." : Array(depth).fill("..").join("/")
  return `${prefix}/${path.slice(2)}`
}

export default ((opts?: FooterOptions) => {
  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass, fileData } = props
    const links = opts?.links ?? {}
    const slug = (fileData.slug as string | undefined) ?? ""
    const figureSrc = opts?.figureImage ? resolveFromRoot(opts.figureImage, slug) : undefined
    const bgSrc = opts?.backgroundImage
      ? resolveFromRoot(opts.backgroundImage, slug)
      : undefined
    const hasText = Boolean(opts?.eyebrow || opts?.headline || opts?.description)

    return (
      <footer class={`${displayClass ?? ""} site-footer`}>
        <div class="sf-stage" style={bgSrc ? `--stage-image:url("${bgSrc}")` : undefined}>
          <div class="sf-body">
            {opts?.eyebrow && <div class="sf-eyebrow">{opts.eyebrow}</div>}
            {opts?.headline && <p class="sf-headline">{opts.headline}</p>}
            {opts?.description && <p class="sf-description">{opts.description}</p>}
            {!hasText && (
              <p class="sf-headline">
                Created by <a href="https://github.com/haden-hyun">haejun</a>
              </p>
            )}
            {Object.keys(links).length > 0 && (
              <ul class="sf-links">
                {Object.entries(links).map(([text, link]) => (
                  <li>
                    <a href={link}>{text}</a>
                  </li>
                ))}
              </ul>
            )}
            {opts?.meta && <div class="sf-meta">{opts.meta}</div>}
          </div>
          {figureSrc && <img class="sf-figure" src={figureSrc} alt="" aria-hidden="true" />}
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor<FooterOptions>
