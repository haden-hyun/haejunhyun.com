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
 */

export interface FooterOptions {
  links: Record<string, string>
}

export default ((opts?: FooterOptions) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
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
