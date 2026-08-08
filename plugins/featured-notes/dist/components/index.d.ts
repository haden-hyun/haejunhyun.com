import { QuartzComponent } from '@quartz-community/types';

interface FeaturedNotesOptions {
    /** recent-notes-index의 options.limit과 같은 값으로 유지할 것. */
    recentExcludeCount: number;
    /** Featured 노트 슬러그. 쓴 순서가 표시 순서고, 첫 항목이 대형 카드다. */
    slugs: string[];
}
declare const _default: (userOpts?: Partial<FeaturedNotesOptions>) => QuartzComponent;

export { _default as FeaturedNotes, type FeaturedNotesOptions };
