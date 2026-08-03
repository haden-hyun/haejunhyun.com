import { QuartzComponent } from '@quartz-community/types';

interface FeaturedNotesOptions {
    /** recent-notes-index의 options.limit과 동일하게 맞출 것 (자동 선정이
     * Recent Posts 상위 N개를 후보에서 제외해 중복 노출을 피한다). */
    recentExcludeCount: number;
}
declare const _default: (userOpts?: Partial<FeaturedNotesOptions>) => QuartzComponent;

export { _default as FeaturedNotes, type FeaturedNotesOptions };
