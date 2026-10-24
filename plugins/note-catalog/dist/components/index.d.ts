import { QuartzComponent } from '@quartz-community/types';

interface NoteCatalogOptions {
    title: string;
    /** Topics 페이지면 현재 토픽 섹션 앵커(`#topic-<key>`)를 붙인다. */
    moreHref: string;
    moreLabel: string;
    /** 현재 노트 앞뒤로 보일 편 수. 폴더 처음·끝에선 반대쪽을 더 보여 2·radius+1행을 채운다. */
    radius: number;
}
/**
 * 좌측 패널 — 전체 파일 트리 대신 현재 노트의 형제 노트만 보여준다.
 * 길이가 형제 수에만 비례하므로 노트가 늘어도 한 화면을 넘지 않고,
 * 펼침 상태가 없어 explorer의 localStorage 누적 문제가 발생하지 않는다.
 */
declare const _default: (userOpts?: Partial<NoteCatalogOptions>) => QuartzComponent;

export { _default as NoteCatalog };
