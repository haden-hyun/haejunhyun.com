import type { QuartzTransformerPlugin } from "@quartz-community/types"

export interface ImageLayoutsOptions {
  defaultLayout: string
  carouselHeight: string
  gap: string
}

const defaults: ImageLayoutsOptions = {
  defaultLayout: "single",
  carouselHeight: "24rem",
  gap: "0.5rem",
}

const ImageLayouts: QuartzTransformerPlugin<Partial<ImageLayoutsOptions>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }
  void opts

  return {
    name: "ImageLayouts",
    markdownPlugins() {
      return []
    },
  }
}

export default ImageLayouts
