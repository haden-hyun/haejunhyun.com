import { QuartzComponent } from '@quartz-community/types';

type Link = {
    label: string;
    href: string;
    primary?: boolean;
};
interface HomeHeroOptions {
    /** \n으로 줄바꿈 */
    headline: string;
    description: string;
    links: Link[];
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
