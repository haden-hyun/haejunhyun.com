import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import style from "./styles/socialLinks.scss"

export interface SocialLink {
  name: string
  url: string
  icon: string
}

export interface SocialLinksOptions {
  links: SocialLink[]
}

const defaultOptions: SocialLinksOptions = {
  links: [],
}

export default ((userOpts?: Partial<SocialLinksOptions>) => {
  const opts: SocialLinksOptions = { ...defaultOptions, ...userOpts }

  const SocialLinks: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts.links ?? []

    if (links.length === 0) {
      return <></>
    }

    return (
      <div class={`${displayClass ?? ""} social-links`}>
        <ul>
          {links.map((link) => (
            <li>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                title={link.name}
              >
                <span dangerouslySetInnerHTML={{ __html: link.icon }} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  SocialLinks.css = style
  return SocialLinks
}) satisfies QuartzComponentConstructor<Partial<SocialLinksOptions>>
