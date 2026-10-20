import { MarkdownRenderChild, Plugin, TFile, type MarkdownPostProcessorContext } from "obsidian"
import { parseSpec } from "@blog/parse"
import { mount, type Draw, type Host } from "./runtime"

/** 위젯 하나의 수명. 라이브 프리뷰에서 펜스를 고치거나 노트를 닫으면 Obsidian이 unload를 불러 루프·옵저버를 정리한다. */
class AnimChild extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    private plugin: AnimPreviewPlugin,
    private source: string,
    private sourcePath: string,
  ) {
    super(containerEl)
  }

  onload() {
    const result = parseSpec(this.source)
    if (!result.ok) return this.renderError(result.error)
    try {
      mount(this.containerEl, result.spec, this.host())
    } catch (e) {
      this.containerEl.empty()
      this.renderError((e as Error).message)
    }
  }

  // 블로그는 잘못된 펜스를 코드블록으로 남긴다. 미리보기에서는 원인을 같이 보여 줘야 고치기 쉽다.
  private renderError(message: string) {
    this.containerEl.createEl("p", { cls: "anim-error", text: `anim: ${message}` })
    this.containerEl.createEl("pre").createEl("code", { text: this.source })
  }

  private file(name: string): TFile | null {
    return this.plugin.app.metadataCache.getFirstLinkpathDest(name, this.sourcePath)
  }

  private host(): Host {
    const { app } = this.plugin
    return {
      register: (cleanup) => this.register(cleanup),
      resolveUrl: (name) => {
        const file = this.file(name)
        return file ? app.vault.getResourcePath(file) : undefined
      },
      loadDraw: async (src) => {
        const file = this.file(src)
        if (!file) throw new Error("볼트에서 파일을 찾지 못함")
        return importDraw(await app.vault.cachedRead(file))
      },
      onThemeChange: (fn) => this.registerEvent(app.workspace.on("css-change", fn)),
      onSourceChange: (src, fn) =>
        this.registerEvent(
          app.vault.on("modify", (changed) => {
            if (changed.path === this.file(src)?.path) fn()
          }),
        ),
    }
  }
}

/**
 * 주의: import(vault.getResourcePath(file))는 쓰지 않는다. Obsidian의 app:// 핸들러가 Content-Type을 붙이지 않아
 * 크로미움이 모듈 스크립트를 거부한다(probe/result.txt). 텍스트를 읽어 MIME을 지정한 Blob URL로 import한다.
 */
async function importDraw(code: string): Promise<Draw> {
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }))
  try {
    const mod = (await import(/* @vite-ignore */ url)) as { default?: unknown }
    if (typeof mod.default !== "function") throw new Error("default export draw 함수가 없다")
    return mod.default as Draw
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default class AnimPreviewPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("anim", (source, el, ctx: MarkdownPostProcessorContext) => {
      ctx.addChild(new AnimChild(el, this, source, ctx.sourcePath))
    })
  }
}
