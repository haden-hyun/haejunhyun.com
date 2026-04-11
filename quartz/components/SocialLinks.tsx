import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/socialLinks.scss"

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface Options {
  links: SocialLink[]
}

export default ((opts?: Options) => {
  const SocialLinks: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? []
    
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
}) satisfies QuartzComponentConstructor
