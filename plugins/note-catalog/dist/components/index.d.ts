import { QuartzComponent } from '@quartz-community/types';

interface NoteCatalogOptions {
    title: string;
    /** Topics 페이지면 현재 토픽 섹션 앵커(`#topic-<key>`)를 붙인다. */
    moreHref: string;
    moreLabel: string;
    /** 현재 노트 앞뒤로 보일 편 수. 폴더 처음·끝에선 반대쪽을 더 보여 2·radius+1행을 채운다. */
    radius: number;
}
declare const _default: (userOpts?: Partial<NoteCatalogOptions>) => QuartzComponent;

export { _default as NoteCatalog };
