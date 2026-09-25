import { QuartzComponent } from '@quartz-community/types';

interface FeaturedNotesOptions {
    /** recent-notes-index의 options.limit과 같은 값으로 유지할 것. */
    recentExcludeCount: number;
    /** Featured 노트 슬러그. 쓴 순서가 표시 순서(번호)고, 첫 항목이 크게 표시된다. */
    slugs: string[];
}
declare const _default: (userOpts?: Partial<FeaturedNotesOptions>) => QuartzComponent;

export { _default as FeaturedNotes, type FeaturedNotesOptions };
