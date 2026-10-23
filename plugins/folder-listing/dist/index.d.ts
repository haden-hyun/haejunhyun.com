import { QuartzPageTypePlugin } from '@quartz-community/types';
import { FolderPageOptions } from '@quartz-community/folder-page';

/**
 * folder-page를 대체한다 — 가상 폴더 페이지 생성·매칭·레이아웃("folder")은 업스트림 그대로, 본문 목록만 로컬.
 * 주의: 가상 페이지는 그것을 만든 pageType의 body로 렌더되므로 folder-page는 꺼 둬야 한다.
 */
declare const FolderListingPage: QuartzPageTypePlugin<FolderPageOptions>;

export { FolderListingPage };
