import { QuartzComponent } from '@quartz-community/types';

interface NoteCatalogOptions {
    title: string;
    moreHref: string;
    moreLabel: string;
}
/**
 * 좌측 패널 — 전체 파일 트리 대신 현재 노트의 형제 노트만 보여준다.
 * 길이가 형제 수에만 비례하므로 노트가 늘어도 한 화면을 넘지 않고,
 * 펼침 상태가 없어 explorer의 localStorage 누적 문제가 발생하지 않는다.
 */
declare const _default: (userOpts?: Partial<NoteCatalogOptions>) => QuartzComponent;

export { _default as NoteCatalog };
