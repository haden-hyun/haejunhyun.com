import { QuartzComponent } from '@quartz-community/types';

type Link = {
    label: string;
    href: string;
};
interface HomeHeroOptions {
    headline: string;
    author: string;
    description: string;
    links: Link[];
}
declare const _default: (userOpts?: Partial<HomeHeroOptions>) => QuartzComponent;

export { _default as HomeHero, type HomeHeroOptions };
