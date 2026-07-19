import type {
  QuartzComponent,
  QuartzComponentConstructor,
} from "@quartz-community/types"
import style from "./styles/imageLightbox.scss"
// @ts-expect-error - Inline script loaded as text by esbuild plugin
import lightboxScript from "./scripts/imageLightbox.inline.ts"

const ImageLightbox: QuartzComponent = () => <></>

ImageLightbox.css = style
ImageLightbox.beforeDOMLoaded = lightboxScript

export default (() => ImageLightbox) satisfies QuartzComponentConstructor
