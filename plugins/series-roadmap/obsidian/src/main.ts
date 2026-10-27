import {
  App,
  debounce,
  MarkdownRenderChild,
  Plugin,
  PluginSettingTab,
  Setting,
  type MarkdownPostProcessorContext,
} from "obsidian"
import { renderRoadmap, type NoteMeta } from "./view"

interface Settings {
  seriesTitles: Record<string, string>
}

// 주의: 블로그 quartz.config.yaml의 &seriesTitles 앵커와 같게 시작한다
const DEFAULTS: Settings = {
  seriesTitles: {
    "deep-learning-basics": "딥러닝 기초",
    "obsidian-quartz-blog": "Obsidian과 Quartz로 블로그 만들기",
    "statistics-basics": "통계학 기초",
    "docker-basics": "Airflow를 위한 Docker 기초",
  },
}

/** 로드맵 하나의 수명. 다시 그릴 때와 unload 때 이전 렌더의 옵저버·리스너를 정리한다. */
class RoadmapChild extends MarkdownRenderChild {
  private cleanups: (() => void)[] = []

  constructor(
    containerEl: HTMLElement,
    private plugin: SeriesRoadmapPreview,
    private source: string,
    private sourcePath: string,
  ) {
    super(containerEl)
  }

  onload() {
    this.plugin.children.add(this)
    this.render()
  }

  onunload() {
    this.plugin.children.delete(this)
    this.flush()
  }

  private flush() {
    for (const fn of this.cleanups.splice(0)) fn()
  }

  render() {
    this.flush()
    const { app } = this.plugin
    renderRoadmap(this.containerEl, this.source, {
      notes: this.plugin.notes(),
      seriesTitles: this.plugin.settings.seriesTitles,
      register: (fn) => this.cleanups.push(fn),
      current: this.plugin.frontmatterOf(this.sourcePath),
      openLink: (path, newLeaf) => void app.workspace.openLinkText(path, this.sourcePath, newLeaf),
    })
  }
}

export default class SeriesRoadmapPreview extends Plugin {
  settings: Settings = structuredClone(DEFAULTS)
  children = new Set<RoadmapChild>()

  async onload() {
    this.settings = { seriesTitles: { ...DEFAULTS.seriesTitles, ...((await this.loadData()) as Settings | null)?.seriesTitles } }
    this.registerMarkdownCodeBlockProcessor("series-roadmap", (source, el, ctx: MarkdownPostProcessorContext) => {
      ctx.addChild(new RoadmapChild(el, this, source, ctx.sourcePath))
    })
    const rerender = debounce(() => this.rerenderAll(), 300, true)
    this.registerEvent(this.app.metadataCache.on("changed", rerender))
    this.registerEvent(this.app.metadataCache.on("resolved", rerender))
    this.addSettingTab(new TitlesTab(this.app, this))
  }

  notes(): NoteMeta[] {
    return this.app.vault.getMarkdownFiles().flatMap((f) => {
      const frontmatter = this.app.metadataCache.getFileCache(f)?.frontmatter
      return frontmatter?.series != null ? [{ path: f.path, frontmatter }] : []
    })
  }

  frontmatterOf(path: string): Record<string, unknown> | undefined {
    const file = this.app.vault.getFileByPath(path)
    return file ? this.app.metadataCache.getFileCache(file)?.frontmatter : undefined
  }

  rerenderAll() {
    for (const child of this.children) child.render()
  }

  async saveSettings() {
    await this.saveData(this.settings)
    this.rerenderAll()
  }
}

class TitlesTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: SeriesRoadmapPreview,
  ) {
    super(app, plugin)
  }

  display() {
    const { containerEl } = this
    const titles = this.plugin.settings.seriesTitles
    containerEl.empty()
    containerEl.createEl("p", {
      text: "시리즈 슬러그 → 로드맵 제목. 이름이 비어 있으면 슬러그를 쓴다. 블로그 quartz.config.yaml의 &seriesTitles 앵커와 같게 둘 것.",
    })
    for (const slug of Object.keys(titles)) {
      new Setting(containerEl)
        .setName(slug)
        .addText((t) =>
          t.setValue(titles[slug] ?? "").onChange(async (v) => {
            titles[slug] = v
            await this.plugin.saveSettings()
          }),
        )
        .addExtraButton((b) =>
          b.setIcon("trash").setTooltip("삭제").onClick(async () => {
            delete titles[slug]
            await this.plugin.saveSettings()
            this.display()
          }),
        )
    }
    let draft = ""
    new Setting(containerEl)
      .setName("시리즈 추가")
      .addText((t) => t.setPlaceholder("series 슬러그").onChange((v) => (draft = v.trim())))
      .addButton((b) =>
        b.setButtonText("추가").onClick(async () => {
          if (!draft || draft in titles) return
          titles[draft] = ""
          await this.plugin.saveSettings()
          this.display()
        }),
      )
  }
}
