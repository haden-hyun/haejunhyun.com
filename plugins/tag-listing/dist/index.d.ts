import { QuartzPageTypePlugin } from '@quartz-community/types';
import { TagPageOptions } from '@quartz-community/tag-page';

/**
 * tag-page를 대체한다 — 가상 태그 페이지 생성·매칭·레이아웃("tag")은 업스트림 그대로, 본문 목록만 folder-listing 행으로.
 * 주의: 가상 페이지는 그것을 만든 pageType의 body로 렌더되므로 tag-page는 꺼 둬야 한다.
 */
declare const TagListingPage: QuartzPageTypePlugin<Partial<TagPageOptions>>;

export { TagListingPage };
