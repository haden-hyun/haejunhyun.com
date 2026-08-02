import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { VisitorCounter as VisitorCounterConstructor } from "@haejunhyun/visitor-counter/components"
import style from "./styles/footer.scss"

// `@quartz-community/utils`에는 concatenateResources가 없다(quartz 코어
// `quartz/util/resources.tsx`에만 존재). 로직이 필터+flat 두 줄뿐이라 여기 인라인.
type StringResource = string | string[] | undefined
function concatenateResources(...resources: StringResource[]): string | string[] {
  return resources.filter((r): r is string | string[] => r !== undefined).flat()
}

/**
 * v4 parity: v4's `quartz/components/Footer.tsx` replaced the stock
 * "Created with Quartz vX © year" text with a custom attribution line and
 * dropped the version/year entirely, adding an `<hr />` divider above it.
 * The v5 `footer` community plugin has no option to customize that text, so
 * this local plugin replaces it wholesale (registered under the same
 * structural "footer" slot — see quartz.config.yaml).
 *
 * [2026-08-02] 방문자 카운터를 같은 줄에 배치. VisitorCounter는 원래
 * `left` 사이드바(첫 인상 자리, P6) → `afterBody`(페이지 최하단, 단독 줄)로
 * 두 차례 옮겼으나, "Created by haejun" 줄 우측에 나란히 두는 편이 더 낫다는
 * 판단으로 이 컴포넌트에 직접 합쳤다.
 *
 * `footer`는 left/right/beforeBody/afterBody와 달리 config-loader가 다루는
 * 위치 기반 그룹핑(layout.group) 대상이 아니라 **전용 단일 슬롯**이라
 * (`renderPage.tsx`가 `components.footer`를 별도로 꺼내 씀), 두 플러그인을
 * group으로 묶을 수 없다. 그래서 `@haejunhyun/visitor-counter`를 footer의
 * 일반 npm 의존성(file:)으로 물고 컴포넌트를 직접 렌더한다.
 * 이제 visitor-counter는 quartz.config.yaml에서 독립 위치를 갖지 않는다
 * (해당 설정의 주석 참고).
 */

export interface FooterOptions {
  links: Record<string, string>
}

export default ((opts?: FooterOptions) => {
  // 다른 로컬 플러그인과 동일한 패턴: named export는 컴포넌트가 아니라
  // "옵션 없는 생성자"(QuartzComponentConstructor)라 호출해서 컴포넌트를 얻는다.
  const VisitorCounter = VisitorCounterConstructor()

  const Footer: QuartzComponent = (props: QuartzComponentProps) => {
    const { displayClass } = props
    const links = opts?.links ?? {}
    return (
      <footer class={`${displayClass ?? ""}`}>
        <hr />
        <div class="footer-row">
          <p style="text-align: left;">
            Created by <a href="https://github.com/haden-hyun">haejun</a>
          </p>
          {/* JSX 태그(<VisitorCounter .../>)로 쓰면 preact 타입 정의가 QuartzComponent를
              유효한 JSX 엘리먼트 타입으로 인식하지 못해 dts 빌드가 실패한다.
              함수 호출로 대신하면 desugar 결과가 동일해 문제없다. */}
          {VisitorCounter(props)}
        </div>
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

  Footer.css = concatenateResources(style, VisitorCounter.css)
  Footer.afterDOMLoaded = VisitorCounter.afterDOMLoaded
  return Footer
}) satisfies QuartzComponentConstructor<FooterOptions>
