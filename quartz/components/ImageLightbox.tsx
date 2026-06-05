// @ts-ignore
import lightboxScript from "./scripts/imageLightbox.inline"
import style from "./styles/imageLightbox.scss"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ImageLightbox: QuartzComponent = () => <></>

ImageLightbox.css = style
ImageLightbox.beforeDOMLoaded = lightboxScript

export default (() => ImageLightbox) satisfies QuartzComponentConstructor
