import { QuartzComponent } from '@quartz-community/types';

interface SocialLink {
    name: string;
    url: string;
    icon: string;
}
interface SocialLinksOptions {
    links: SocialLink[];
}
declare const _default: (userOpts?: Partial<SocialLinksOptions>) => QuartzComponent;

export { type SocialLink as S, _default as SocialLinks, type SocialLinksOptions as a };
