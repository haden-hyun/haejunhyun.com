import type {
  QuartzComponent,
  QuartzComponentConstructor,
} from "@quartz-community/types"
import style from "./styles/imageLightbox.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import lightboxScript from "./scripts/imageLightbox.inline.ts"

// 본문 이미지 클릭 확대 — 마크업 없이 스크립트가 오버레이를 만든다(캐러셀 썸네일 제외).

const ImageLightbox: QuartzComponent = () => <></>

ImageLightbox.css = style
ImageLightbox.beforeDOMLoaded = lightboxScript

export default (() => ImageLightbox) satisfies QuartzComponentConstructor
