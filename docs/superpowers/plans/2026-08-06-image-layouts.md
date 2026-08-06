# Image Layouts 플러그인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Obsidian `obsidian-image-layouts` 플러그인의 ` ```image-layout ` 문법을 Quartz 빌드 타임에 렌더링해, 편집(Obsidian)과 배포(웹)가 같은 원고를 같은 모습으로 그린다.

**Architecture:** mdast `code` 노드를 잡아 **진짜 `image` 노드**를 포함한 서브트리로 교체한다. 컨테이너는 원시 HTML 문자열이 아니라 `data.hName`/`hProperties`로 표현한다. 이렇게 하면 이미지 경로 해석(중첩 슬러그·첨부폴더·`public/` 복사)을 CrawlLinks(order 60)와 Assets 이미터가 위키링크 이미지와 동일하게 처리해준다 — 이 설계의 존재 이유가 이것 하나다.

**Tech Stack:** TypeScript / unified·mdast / `unist-util-visit` / `yaml`(ESM) / tsup(esbuild) / sass / vitest

## Global Constraints

- **로컬 플러그인이다.** 경로 `plugins/image-layouts/`, 설정 등록은 `source: ./plugins/image-layouts`. 별도 GitHub 저장소를 만들지 않는다.
- **`order: 55`.** CrawlLinks(60)보다 **반드시 앞서야** 한다. 40/45/50은 이미 점유돼 있고 55가 비어 있다.
- **`package.json`의 `quartz.category`는 문자열 `"transformer"`** — 배열이 아니다(`crawl-links`, `obsidian-flavored-markdown`, `summary-description` 전부 문자열).
- **`dist/`를 커밋한다.** `.gitignore`에는 `node_modules`, `*.tsbuildinfo`만.
- **새 의존성은 ESM만.** `yaml@^2.9.0`(루트에 이미 있음)을 쓰고 `js-yaml`(CJS)은 쓰지 않는다. 빌드 후 `node -e "await import('./dist/index.js')"`로 로드 검증 필수 — CJS가 섞이면 에러가 아니라 `declares components but failed to load them` 경고 한 줄로 조용히 죽는다.
- **파서는 절대 throw 하지 않는다.** 알 수 없는 키·미지원 `layout`·깨진 YAML·비정형 그리드는 전부 조용히 폴백하고 빌드를 통과시킨다.
- **AA 4.5 예외 없음.** 텍스트로 렌더되는 모든 캡션이 대상. 순수 장식은 요구 없음.
- **색은 Quartz CSS 변수만 사용** (`--light`, `--dark`, `--lightgray`, `--gray`, `--secondary`). 하드코딩 hex와 `html[saved-theme="dark"]` 셀렉터 금지. **예외 없음.**
- **캡션은 항상 이미지 아래.** 사진 위에 얹는 오버레이는 쓰지 않는다 — 배경 명도를 통제할 수 없어 AA를 보장하려면 테마 밖 고정색 스크림이 필요해지고, 그건 색의 단일 소스 규칙을 깬다. `overlay: never`만 "캡션 숨김"으로 살리고(Obsidian과 결과가 일치한다) `hover`/`always`는 아래 표시로 수렴한다.
- **영역 이름은 `image-{n}`** — 프리셋과 custom 그리드가 이 명명을 공유하므로 CSS 경로가 하나로 합쳐진다. 원 플러그인과도 동일하다.
- 빌드·npm 실행 전 사용자에게 확인할 것(CLAUDE.md).

---

## 원본 대조로 확정한 사실 (추측 금지 — 전부 소스에서 확인함)

핸드오프 문서(`image-layout-handoff.md`)에 **틀린 내용이 있다.** 아래가 실제 값이다.

1. **ASCII 그리드는 공백으로 나눈다** — `line.split(/\s+/)`. 핸드오프 §4.4의 `AAB`/`AAC` 예시는 **틀렸다**(한 줄이 토큰 1개가 되어 1열 그리드가 된다). 정답은 `A A B` / `A A C`. `content/test.md:536`의 실제 원고도 공백 구분이다.
2. **영역 이름은 letter가 아니라 `image-{순번}`** — `image-0`, `image-1`… 등장 순서.
3. **파이프 판별 정규식은 `/^(\d+)(?:x(\d+))?$/`** — 숫자면 width(+height), 아니면 캡션. 핸드오프 §4.5와 일치. 파이프는 **여러 개 누적 가능**(`![[a.png|300|캡션]]`).
4. **`.`은 빈 셀**, 각 토큰은 **꽉 찬 직사각형**이어야 하고, 행마다 열 수가 같아야 하며, 최대 슬롯 20개.
5. **masonry는 modulo 분배** — `index % columns === colIndex`. 원본의 `grid-template-rows: masonry`는 어느 브라우저에서도 동작하지 않는 잔재이므로 이식하지 않는다.
6. **`fit` 기본값 `cover`**, `overlay`는 `never`/`hover`/`always`(기본 `hover`), `carouselHeight` 기본 `24rem`.

---

## File Structure

### 신규 생성 — `plugins/image-layouts/`

| 파일 | 책임 |
|---|---|
| `package.json` | `@haejunhyun/image-layouts`, `quartz.category: "transformer"`, `defaultOrder: 55` |
| `tsconfig.json` / `tsconfig.build.json` | `summary-description`에서 복사 |
| `tsup.config.ts` | **`reading-progress`에서 복사** — `.scss` → sass 컴파일, `.inline.ts` → esbuild 번들하는 로더가 이미 들어 있다 |
| `vitest.config.ts` | 파서 단위 테스트 |
| `types/globals.d.ts` | `*.scss` / `*.inline.ts` 모듈 선언 + `window.addCleanup` |
| `src/parse-grid.ts` | ASCII 그리드 → `grid-template-areas` (순수 함수) |
| `src/parse-block.ts` | fence 언어 + 본문 → `ParsedBlock` (순수 함수) |
| `src/layouts.ts` | 프리셋 표 + 레이아웃 이름 → `LayoutSpec` (순수 함수) |
| `src/build-nodes.ts` | `ParsedBlock` + `LayoutSpec` → mdast 서브트리 |
| `src/index.ts` | 트랜스포머 진입점, `externalResources` |
| `src/styles/imageLayouts.scss` | 그리드·figure·캡션·오버레이·캐러셀 |
| `src/scripts/carousel.inline.ts` | 캐러셀 화살표/썸네일 (점진적 향상) |
| `test/*.test.ts` | 파서 3종 단위 테스트 |
| `dist/` | 빌드 산출물, **커밋 대상** |

### 기존 파일 수정

| 파일 | 변경 |
|---|---|
| `quartz.config.yaml` | `./plugins/image-layouts` 항목 추가 (order 55) |
| `plugins/image-lightbox/src/components/scripts/imageLightbox.inline.ts` | **썸네일 클릭이 라이트박스를 열어버리는 충돌 차단** (Task 8) |
| `image-layout-handoff.md` | 위 "확정한 사실" 6건 정정 |
| `CHANGELOG.md` | 도입 서사 |
| `DESIGN-SYSTEM.md` | 오버레이 스크림이 테마 변수를 안 쓰는 근거 |
| `CLAUDE.md` / `README.md` | 로컬 플러그인 19종 → 20종 |

---

## Task 1: 플러그인 스캐폴딩

**Files:**
- Create: `plugins/image-layouts/package.json`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`, `vitest.config.ts`, `.gitignore`, `types/globals.d.ts`, `src/index.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `ImageLayoutsOptions { defaultLayout: string; carouselHeight: string; gap: string }`, default export `ImageLayouts`

- [ ] **Step 1: 기존 플러그인에서 빌드 설정을 복사**

```bash
cd /Users/haejun/Developer/haejunhyun.com
mkdir -p plugins/image-layouts/src/styles plugins/image-layouts/src/scripts \
         plugins/image-layouts/types plugins/image-layouts/test
cp plugins/summary-description/tsconfig.json plugins/summary-description/tsconfig.build.json \
   plugins/summary-description/.gitignore plugins/image-layouts/
# ⚠️ summary-description의 tsup.config.ts에는 scss/inline.ts 로더가 없다. reading-progress 것을 쓴다.
cp plugins/reading-progress/tsup.config.ts plugins/image-layouts/
cp plugins/reading-progress/types/globals.d.ts plugins/image-layouts/types/
```

- [ ] **Step 2: `tsup.config.ts`의 entry를 이 플러그인에 맞게 축소**

`reading-progress`는 컴포넌트가 있어 entry가 2개다. 이 플러그인은 트랜스포머 하나뿐이다.

```ts
  entry: {
    index: "src/index.ts",
  },
```

(`esbuildPlugins: [inlineScriptPlugin]`와 `SINGLETON_EXTERNALS`는 **그대로 둔다** — scss/inline.ts 로더가 거기 들어 있다.)

- [ ] **Step 3: `package.json` 작성**

```json
{
  "name": "@haejunhyun/image-layouts",
  "version": "0.1.0",
  "description": "Renders Obsidian image-layout code fences (grid presets, custom ASCII grids, masonry, carousel) at build time.",
  "type": "module",
  "license": "MIT",
  "private": true,
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@quartz-community/types": "github:quartz-community/types",
    "unist-util-visit": "^5.1.0",
    "yaml": "^2.9.0"
  },
  "devDependencies": {
    "@types/mdast": "^4.0.4",
    "@types/node": "^24.10.0",
    "sass": "^1.83.0",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.9"
  },
  "engines": { "node": ">=22" },
  "quartz": {
    "name": "image-layouts",
    "displayName": "Image Layouts",
    "category": "transformer",
    "version": "0.1.0",
    "quartzVersion": ">=5.0.0",
    "dependencies": [],
    "defaultOrder": 55,
    "defaultEnabled": true,
    "defaultOptions": {
      "defaultLayout": "single",
      "carouselHeight": "24rem",
      "gap": "0.5rem"
    }
  }
}
```

- [ ] **Step 4: `vitest.config.ts` 작성**

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    passWithNoTests: true,
    reporters: ["default"],
  },
})
```

- [ ] **Step 5: 최소 진입점 작성** (`src/index.ts`)

```ts
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
```

- [ ] **Step 6: 설치·빌드·ESM 로드 검증**

```bash
cd plugins/image-layouts && npm install && npm run build
node -e "import('./dist/index.js').then(m => console.log('OK', typeof m.default))"
```

Expected: `OK function`. 실패하면 CJS 의존성이 섞인 것이다 — 여기서 잡지 않으면 나중에 경고 한 줄로만 나타난다.

- [ ] **Step 7: 커밋**

```bash
cd /Users/haejun/Developer/haejunhyun.com
git add plugins/image-layouts
git commit -m "feat(image-layouts): 플러그인 스캐폴딩"
```

---

## Task 2: ASCII 그리드 파서

**Files:**
- Create: `plugins/image-layouts/src/parse-grid.ts`
- Test: `plugins/image-layouts/test/parse-grid.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `CustomGrid { columns: number; rows: number; slots: number; templateAreas: string }`, `parseCustomGrid(spec: unknown): CustomGrid | null`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from "vitest"
import { parseCustomGrid } from "../src/parse-grid"

describe("parseCustomGrid", () => {
  it("공백으로 나눈 행을 grid-template-areas로 바꾼다", () => {
    expect(parseCustomGrid("A A B\nA A C")).toEqual({
      columns: 3,
      rows: 2,
      slots: 3,
      templateAreas: `"image-0 image-0 image-1" "image-0 image-0 image-2"`,
    })
  })

  it("'.'은 빈 셀로 남긴다", () => {
    expect(parseCustomGrid("A .\nA B")?.templateAreas).toBe(`"image-0 ." "image-0 image-1"`)
  })

  it("행마다 열 수가 다르면 null", () => {
    expect(parseCustomGrid("A A B\nA A")).toBeNull()
  })

  it("직사각형이 아닌 영역은 null", () => {
    expect(parseCustomGrid("A A B\nB A A")).toBeNull()
  })

  it("빈 값·비문자열은 null", () => {
    expect(parseCustomGrid("")).toBeNull()
    expect(parseCustomGrid(undefined)).toBeNull()
    expect(parseCustomGrid(42)).toBeNull()
  })

  it("모든 셀이 '.'이면 null", () => {
    expect(parseCustomGrid(". .\n. .")).toBeNull()
  })

  it("슬롯이 20개를 넘으면 null", () => {
    const spec = Array.from({ length: 21 }, (_, i) => `x${i}`).join(" ")
    expect(parseCustomGrid(spec)).toBeNull()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd plugins/image-layouts && npx vitest run test/parse-grid.test.ts`
Expected: FAIL — `Failed to resolve import "../src/parse-grid"`

- [ ] **Step 3: 구현**

```ts
export interface CustomGrid {
  columns: number
  rows: number
  slots: number
  templateAreas: string
}

const MAX_SLOTS = 20

// ASCII 그리드 → grid-template-areas. 원 플러그인과 동일하게 행은 **공백**으로 나눈다.
// 실패는 전부 null — 빌드를 멈추지 않는다.
export function parseCustomGrid(spec: unknown): CustomGrid | null {
  if (typeof spec !== "string" || spec.trim() === "") return null

  const rows = spec
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => line.split(/\s+/))

  if (rows.length === 0) return null
  const columns = rows[0]!.length
  if (rows.some((row) => row.length !== columns)) return null

  const order: string[] = []
  for (const row of rows) {
    for (const cell of row) {
      if (cell !== "." && !order.includes(cell)) order.push(cell)
    }
  }
  if (order.length === 0 || order.length > MAX_SLOTS) return null

  // ⚠️ 각 영역이 꽉 찬 직사각형이 아니면 브라우저가 템플릿을 통째로 버린다
  for (const token of order) {
    let minRow = Infinity
    let maxRow = -1
    let minCol = Infinity
    let maxCol = -1
    let count = 0
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== token) return
        minRow = Math.min(minRow, r)
        maxRow = Math.max(maxRow, r)
        minCol = Math.min(minCol, c)
        maxCol = Math.max(maxCol, c)
        count++
      })
    })
    if (count !== (maxRow - minRow + 1) * (maxCol - minCol + 1)) return null
  }

  const templateAreas = rows
    .map(
      (row) =>
        `"${row.map((cell) => (cell === "." ? "." : `image-${order.indexOf(cell)}`)).join(" ")}"`,
    )
    .join(" ")

  return { columns, rows: rows.length, slots: order.length, templateAreas }
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd plugins/image-layouts && npx vitest run test/parse-grid.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: 커밋**

```bash
git add plugins/image-layouts/src/parse-grid.ts plugins/image-layouts/test/parse-grid.test.ts
git commit -m "feat(image-layouts): ASCII 그리드 파서"
```

---

## Task 3: 블록 파서

**Files:**
- Create: `plugins/image-layouts/src/parse-block.ts`
- Test: `plugins/image-layouts/test/parse-block.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `ParsedImage { url: string; caption?: string; width?: number; height?: number }`
  - `ParsedBlock { layout: string; opts: Record<string, unknown>; images: ParsedImage[] }`
  - `parseBlock(lang: string, value: string): ParsedBlock | null`
  - `opts`의 키는 **전부 소문자로 정규화**돼 있다 (`carouselShowThumbnails` → `carouselshowthumbnails`). 이후 태스크는 소문자 키로 읽는다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from "vitest"
import { parseBlock } from "../src/parse-block"

describe("parseBlock", () => {
  it("블록 프런트매터와 위키링크를 읽는다", () => {
    const block = parseBlock(
      "image-layout",
      "---\nlayout: carousel\ncarouselShowThumbnails: true\n---\n![[a.png|첫 장]]\n![[b.png]]",
    )
    expect(block).toEqual({
      layout: "carousel",
      opts: { layout: "carousel", carouselshowthumbnails: true },
      images: [{ url: "a.png", caption: "첫 장" }, { url: "b.png" }],
    })
  })

  it("숫자 파이프는 캡션이 아니라 크기다", () => {
    expect(parseBlock("image-layout", "![[a.png|300]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
    })
    expect(parseBlock("image-layout", "![[a.png|300x200]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
      height: 200,
    })
  })

  it("크기와 캡션이 함께 오면 둘 다 잡는다", () => {
    expect(parseBlock("image-layout", "![[a.png|300|바다]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
      caption: "바다",
    })
  })

  it("레거시 fence에서 레이아웃명을 뽑는다", () => {
    expect(parseBlock("image-layout-a", "![[a.png]]")?.layout).toBe("a")
  })

  it("마크다운 이미지도 읽는다", () => {
    expect(parseBlock("image-layout", "![바다](assets/a.png)")?.images[0]).toEqual({
      url: "assets/a.png",
      caption: "바다",
    })
  })

  it("깨진 YAML이어도 throw하지 않는다", () => {
    const block = parseBlock("image-layout", "---\nlayout: [unclosed\n---\n![[a.png]]")
    expect(block?.images).toHaveLength(1)
  })

  it("알 수 없는 키는 그대로 담고 무시할 수 있게 둔다", () => {
    const block = parseBlock("image-layout", "---\nsomeFutureKey: 1\n---\n![[a.png]]")
    expect(block?.opts.somefuturekey).toBe(1)
  })

  it("image-layout 계열이 아닌 fence는 null", () => {
    expect(parseBlock("python", "print(1)")).toBeNull()
  })

  it("이미지가 없으면 빈 배열", () => {
    expect(parseBlock("image-layout", "---\nlayout: a\n---\n")?.images).toEqual([])
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd plugins/image-layouts && npx vitest run test/parse-block.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

```ts
import { parse as parseYaml } from "yaml"

export interface ParsedImage {
  url: string
  caption?: string
  width?: number
  height?: number
}

export interface ParsedBlock {
  layout: string
  opts: Record<string, unknown>
  images: ParsedImage[]
}

const FENCE_PREFIX = "image-layout"
const BLOCK_FRONTMATTER = /^\s*---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/
const SIZE = /^(\d+)(?:x(\d+))?$/
const WIKILINK = /!?\[\[([^\]]+)\]\]/
const MD_IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/

// 파이프는 여러 개 올 수 있다. 숫자(또는 WxH)면 크기, 나머지는 캡션 — 원 플러그인 규칙.
function parseWikilink(body: string): ParsedImage {
  const [target, ...rest] = body.split("|")
  const image: ParsedImage = { url: target!.trim() }
  const captionParts: string[] = []

  for (const part of rest) {
    const trimmed = part.trim()
    const size = trimmed.match(SIZE)
    if (size) {
      image.width = Number(size[1])
      if (size[2]) image.height = Number(size[2])
    } else if (trimmed) {
      captionParts.push(trimmed)
    }
  }

  if (captionParts.length > 0) image.caption = captionParts.join(" ")
  return image
}

export function parseBlock(lang: string, value: string): ParsedBlock | null {
  if (!lang?.startsWith(FENCE_PREFIX)) return null

  const legacyLayout = lang.slice(FENCE_PREFIX.length).replace(/^-/, "").trim()

  let body = value
  let raw: Record<string, unknown> = {}
  const frontmatter = value.match(BLOCK_FRONTMATTER)
  if (frontmatter) {
    body = value.slice(frontmatter[0].length)
    try {
      const parsed = parseYaml(frontmatter[1]!)
      if (parsed && typeof parsed === "object") raw = parsed as Record<string, unknown>
    } catch {
      // 깨진 YAML로 사이트 빌드를 멈추지 않는다
    }
  }

  const opts: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(raw)) opts[key.toLowerCase()] = val

  const images: ParsedImage[] = []
  for (const line of body.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "") continue

    const wiki = trimmed.match(WIKILINK)
    if (wiki) {
      images.push(parseWikilink(wiki[1]!))
      continue
    }

    const md = trimmed.match(MD_IMAGE)
    if (md) {
      images.push({ url: md[2]!.trim(), ...(md[1] ? { caption: md[1] } : {}) })
    }
  }

  const layout = String(opts.layout ?? legacyLayout ?? "").trim()
  return { layout, opts, images }
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd plugins/image-layouts && npx vitest run test/parse-block.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: 커밋**

```bash
git add plugins/image-layouts/src/parse-block.ts plugins/image-layouts/test/parse-block.test.ts
git commit -m "feat(image-layouts): 블록 파서 — 프런트매터·위키링크·파이프 판별"
```

---

## Task 4: 레이아웃 해석기

**Files:**
- Create: `plugins/image-layouts/src/layouts.ts`
- Test: `plugins/image-layouts/test/layouts.test.ts`

**Interfaces:**
- Consumes: `parseCustomGrid` (Task 2)
- Produces: `LayoutSpec { kind: "grid" | "masonry" | "carousel"; templateColumns?: string; templateAreas?: string; columns?: number }`, `resolveLayout(layout: string, grid: unknown, fallback: string): LayoutSpec`
- `templateAreas`가 **없으면** 자동배치 폴백이라는 뜻이다. Task 5는 이때 `grid-area` 인라인 스타일을 붙이지 않는다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
import { describe, expect, it } from "vitest"
import { resolveLayout } from "../src/layouts"

describe("resolveLayout", () => {
  it("프리셋 a는 2열 그리드다", () => {
    expect(resolveLayout("a", undefined, "single")).toEqual({
      kind: "grid",
      templateColumns: "1fr 1fr",
      templateAreas: `"image-0 image-1"`,
    })
  })

  it("프리셋 d는 2행 구조다", () => {
    expect(resolveLayout("d", undefined, "single")).toEqual({
      kind: "grid",
      templateColumns: "2fr 1fr",
      templateAreas: `"image-0 image-1" "image-0 image-2"`,
    })
  })

  it("custom은 grid 옵션을 파싱한다", () => {
    expect(resolveLayout("custom", "A A B\nA A C", "single")).toEqual({
      kind: "grid",
      templateColumns: "repeat(3, 1fr)",
      templateAreas: `"image-0 image-0 image-1" "image-0 image-0 image-2"`,
    })
  })

  it("custom인데 grid가 깨졌으면 자동배치로 폴백한다", () => {
    expect(resolveLayout("custom", "A A B\nA A", "single")).toEqual({ kind: "grid" })
  })

  it("masonry-3은 3열이다", () => {
    expect(resolveLayout("masonry-3", undefined, "single")).toEqual({ kind: "masonry", columns: 3 })
  })

  it("carousel", () => {
    expect(resolveLayout("carousel", undefined, "single")).toEqual({ kind: "carousel" })
  })

  it("대소문자를 가리지 않는다", () => {
    expect(resolveLayout("Carousel", undefined, "single").kind).toBe("carousel")
  })

  it("빈 레이아웃명은 fallback을 쓴다", () => {
    expect(resolveLayout("", undefined, "a").templateColumns).toBe("1fr 1fr")
  })

  it("미지원 레이아웃은 자동배치로 폴백한다 (throw 금지)", () => {
    expect(resolveLayout("some-future-layout", undefined, "single")).toEqual({ kind: "grid" })
  })

  it("masonry는 2~6만 인정한다", () => {
    expect(resolveLayout("masonry-9", undefined, "single")).toEqual({ kind: "grid" })
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd plugins/image-layouts && npx vitest run test/layouts.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

```ts
import { parseCustomGrid } from "./parse-grid"

export interface LayoutSpec {
  kind: "grid" | "masonry" | "carousel"
  templateColumns?: string
  templateAreas?: string
  columns?: number
}

// 원 플러그인의 레거시 프리셋. 영역 이름이 custom 그리드와 같아 CSS 경로가 하나로 합쳐진다.
const PRESETS: Record<string, { templateColumns: string; templateAreas: string }> = {
  a: { templateColumns: "1fr 1fr", templateAreas: `"image-0 image-1"` },
  b: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1"` },
  c: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0"` },
  d: { templateColumns: "2fr 1fr", templateAreas: `"image-0 image-1" "image-0 image-2"` },
  e: { templateColumns: "1fr 2fr", templateAreas: `"image-1 image-0" "image-2 image-0"` },
  f: {
    templateColumns: "3fr 1fr",
    templateAreas: `"image-0 image-1" "image-0 image-2" "image-0 image-3"`,
  },
  g: {
    templateColumns: "1fr 3fr",
    templateAreas: `"image-1 image-0" "image-2 image-0" "image-3 image-0"`,
  },
  h: { templateColumns: "1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2"` },
  i: { templateColumns: "1fr 1fr 1fr 1fr", templateAreas: `"image-0 image-1 image-2 image-3"` },
  single: { templateColumns: "1fr", templateAreas: `"image-0"` },
}

const MASONRY = /^masonry-([2-6])$/

// templateAreas 없는 { kind: "grid" } = 자동배치 폴백. SCSS의 auto-fit 그리드가 받는다.
const AUTO: LayoutSpec = { kind: "grid" }

export function resolveLayout(layout: string, grid: unknown, fallback: string): LayoutSpec {
  const name = (layout || fallback).trim().toLowerCase()

  if (name === "carousel") return { kind: "carousel" }

  const masonry = name.match(MASONRY)
  if (masonry) return { kind: "masonry", columns: Number(masonry[1]) }

  if (name === "custom") {
    const parsed = parseCustomGrid(grid)
    if (!parsed) return AUTO
    return {
      kind: "grid",
      templateColumns: `repeat(${parsed.columns}, 1fr)`,
      templateAreas: parsed.templateAreas,
    }
  }

  const preset = PRESETS[name]
  if (preset) return { kind: "grid", ...preset }

  return AUTO
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd plugins/image-layouts && npx vitest run`
Expected: PASS (전체 26 tests)

- [ ] **Step 5: 커밋**

```bash
git add plugins/image-layouts/src/layouts.ts plugins/image-layouts/test/layouts.test.ts
git commit -m "feat(image-layouts): 프리셋·masonry·custom 레이아웃 해석기"
```

---

## Task 5: mdast 노드 생성 + 트랜스포머 배선

**Files:**
- Create: `plugins/image-layouts/src/build-nodes.ts`
- Modify: `plugins/image-layouts/src/index.ts`, `quartz.config.yaml`

**Interfaces:**
- Consumes: `ParsedBlock`/`ParsedImage` (Task 3), `LayoutSpec` (Task 4), `ImageLayoutsOptions` (Task 1)
- Produces: `buildLayoutNode(block, spec, opts)`, `buildMasonryNode(block, spec, opts)`, `buildCarouselNode(block, opts)` — 전부 mdast `Blockquote` 반환

- [ ] **Step 1: `build-nodes.ts` 작성**

⚠️ **mdast에는 `div`/`figure` 노드 타입이 없다.** OFM이 콜아웃에 쓰는 것과 같은 방식으로 **블록 컨테이너(`blockquote`)에 `hName`을 씌운다**. `paragraph`를 쓰면 안 된다 — `paragraph`의 자식은 phrasing content여야 해서 `paragraph` 안에 `paragraph`를 넣는 건 잘못된 mdast다. `blockquote`는 flow content를 받으므로 정당하다. 렌더 결과는 `<div>`라서 `blockquote:not(.callout)` 스타일과도 무관하다.

```ts
import type { Blockquote, Paragraph, RootContent } from "mdast"
import type { ImageLayoutsOptions } from "./index"
import type { LayoutSpec } from "./layouts"
import type { ParsedBlock, ParsedImage } from "./parse-block"

type Props = Record<string, unknown>

// mdast에 div/figure가 없어 블록 컨테이너에 hName을 씌운다 (OFM 콜아웃과 동일한 방식).
const container = (hName: string, hProperties: Props, children: RootContent[]): Blockquote =>
  ({ type: "blockquote", data: { hName, hProperties }, children }) as unknown as Blockquote

const textBlock = (hName: string, hProperties: Props, value: string): Paragraph =>
  ({
    type: "paragraph",
    data: { hName, hProperties },
    children: [{ type: "text", value }],
  }) as unknown as Paragraph

const cssSize = (value: unknown, fallback: string): string => {
  if (typeof value === "number") return `${value}px`
  const text = String(value ?? "").trim()
  return text === "" ? fallback : text
}

const OVERLAY_MODES = ["never", "hover", "always"]
const FIT_MODES = ["cover", "contain", "natural"]
const ALIGN_MODES = ["left", "center", "right", "full"]

// ★ 여기서 만드는 image 노드가 이 설계의 전부다.
//   진짜 mdast image라서 CrawlLinks(order 60)가 위키링크 이미지와 똑같이 경로를 고쳐준다.
function buildFigure(image: ParsedImage, index: number, withArea: boolean): Blockquote {
  const style: string[] = []
  if (withArea) style.push(`grid-area:image-${index}`)
  if (image.width) style.push(`max-width:${image.width}px`)

  const frame = {
    type: "paragraph",
    data: { hName: "div", hProperties: { className: ["il-frame"] } },
    children: [{ type: "image", url: image.url, alt: image.caption ?? "" }],
  } as unknown as Paragraph

  const children: RootContent[] = [frame]
  if (image.caption) {
    children.push(textBlock("figcaption", { className: ["il-caption"] }, image.caption))
  }

  return container(
    "figure",
    { className: ["il-item"], ...(style.length ? { style: style.join(";") } : {}) },
    children,
  )
}

function pick(value: unknown, allowed: string[], fallback: string): string {
  const text = String(value ?? "").trim().toLowerCase()
  return allowed.includes(text) ? text : fallback
}

function blockClassNames(block: ParsedBlock, variant: string): string[] {
  const className = [
    "image-layout",
    variant,
    `il-fit-${pick(block.opts.fit, FIT_MODES, "cover")}`,
    `il-overlay-${pick(block.opts.overlay, OVERLAY_MODES, "hover")}`,
  ]
  const align = pick(block.opts.align, ALIGN_MODES, "")
  if (align) className.push(`il-align-${align}`)
  return className
}

function blockCaption(block: ParsedBlock): RootContent[] {
  if (!block.opts.caption) return []
  return [
    textBlock("figcaption", { className: ["il-block-caption"] }, String(block.opts.caption)),
  ]
}

export function buildLayoutNode(
  block: ParsedBlock,
  spec: LayoutSpec,
  opts: ImageLayoutsOptions,
): Blockquote {
  const style = [`--il-gap:${opts.gap}`]
  if (spec.templateColumns) style.push(`grid-template-columns:${spec.templateColumns}`)
  if (spec.templateAreas) style.push(`grid-template-areas:${spec.templateAreas}`)

  const figures = block.images.map((image, i) => buildFigure(image, i, Boolean(spec.templateAreas)))

  return container(
    "div",
    { className: blockClassNames(block, "il-grid"), style: style.join(";") },
    [...figures, ...blockCaption(block)],
  )
}

// 원 플러그인과 같은 modulo 분배. 빌드 타임에 끝나므로 JS가 필요 없다.
export function buildMasonryNode(
  block: ParsedBlock,
  spec: LayoutSpec,
  opts: ImageLayoutsOptions,
): Blockquote {
  const columnCount = spec.columns ?? 3
  const columns = Array.from({ length: columnCount }, (_, col) =>
    container(
      "div",
      { className: ["il-column"] },
      block.images
        .filter((_, i) => i % columnCount === col)
        .map((image) => buildFigure(image, 0, false)),
    ),
  )

  return container(
    "div",
    {
      className: blockClassNames(block, "il-masonry"),
      style: `--il-gap:${opts.gap};grid-template-columns:repeat(${columnCount}, 1fr)`,
    },
    [...columns, ...blockCaption(block)],
  )
}

export function buildCarouselNode(block: ParsedBlock, opts: ImageLayoutsOptions): Blockquote {
  const style = [`--il-carousel-height:${cssSize(block.opts.carouselheight, opts.carouselHeight)}`]
  if (block.opts.carouselbackground) {
    style.push(`--il-carousel-bg:${String(block.opts.carouselbackground)}`)
  }

  const children: RootContent[] = [
    container(
      "div",
      { className: ["il-viewport"] },
      block.images.map((image) => buildFigure(image, 0, false)),
    ),
  ]

  if (block.opts.carouselshowthumbnails) {
    children.push(
      container(
        "div",
        { className: ["il-thumbs"] },
        block.images.map(
          (image) =>
            ({
              type: "paragraph",
              data: { hName: "div", hProperties: { className: ["il-thumb"] } },
              children: [{ type: "image", url: image.url, alt: "" }],
            }) as unknown as Paragraph,
        ),
      ),
    )
  }

  children.push(...blockCaption(block))

  return container(
    "div",
    {
      className: blockClassNames(block, "il-carousel"),
      "data-needs-init": "true",
      style: style.join(";"),
    },
    children,
  )
}
```

- [ ] **Step 2: `index.ts`에 배선**

`markdownPlugins()`를 실제 구현으로 교체하고 default export는 유지한다.

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types"
import type { Root } from "mdast"
import { SKIP, visit } from "unist-util-visit"
import { buildCarouselNode, buildLayoutNode, buildMasonryNode } from "./build-nodes"
import { resolveLayout } from "./layouts"
import { parseBlock } from "./parse-block"

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

  return {
    name: "ImageLayouts",
    markdownPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "code", (node, index, parent) => {
            if (!node.lang?.startsWith("image-layout")) return
            if (index === undefined || parent === null || parent === undefined) return

            const block = parseBlock(node.lang, node.value)
            if (!block || block.images.length === 0) return // 원본 코드블록을 그대로 둔다

            const spec = resolveLayout(block.layout, block.opts.grid, opts.defaultLayout)
            parent.children[index] =
              spec.kind === "carousel"
                ? buildCarouselNode(block, opts)
                : spec.kind === "masonry"
                  ? buildMasonryNode(block, spec, opts)
                  : buildLayoutNode(block, spec, opts)

            return SKIP
          })
        },
      ]
    },
  }
}

export default ImageLayouts
```

- [ ] **Step 3: `quartz.config.yaml`에 등록**

`github:quartz-community/github-flavored-markdown`(order 40) 항목 **뒤**에 넣는다. 파일 안의 위치는 무관하지만 order 순서대로 두면 읽기 쉽다.

```yaml
  - source: ./plugins/image-layouts
    enabled: true
    options:
      defaultLayout: single
      carouselHeight: 24rem
      gap: 0.5rem
    # ```image-layout 코드펜스 → 그리드/캐러셀.
    # ⚠️ order는 CrawlLinks(60)보다 **앞서야** 한다 — 우리가 만든 image 노드의
    #    경로를 CrawlLinks가 슬러그 기준으로 고쳐줘야 중첩 노트에서 404가 안 난다.
    order: 55
```

- [ ] **Step 4: 빌드 후 렌더 결과 확인**

⚠️ npm/빌드 실행 전 사용자에게 확인할 것.

```bash
cd plugins/image-layouts && npm run build && cd ../..
npx quartz plugin install && npx quartz build
grep -o 'class="image-layout[^"]*"' public/test.html
grep -o '<img src="[^"]*01_pipeline[^"]*"' public/test.html
```

Expected: `class="image-layout il-carousel il-fit-cover il-overlay-hover"`, `<img src="./attachments/01_pipeline.png"`
(코드블록 `<pre>`가 남아 있으면 STEP 3 `lang` 매칭 실패다.)

- [ ] **Step 5: 중첩 경로 검증 — 가장 깨지기 쉬운 지점**

`content/`의 하위 폴더 노트(예: `content/gis/concept/`) 하나에 임시로 같은 블록을 넣고 빌드해, `src`가 `../../attachments/…`처럼 **상대 경로로 올라가는지** 확인한다. 확인 후 임시 블록은 제거한다.

```bash
grep -o '<img src="[^"]*01_pipeline[^"]*"' public/gis/concept/crs.html
```

Expected: `src="../../attachments/01_pipeline.png"` — 루트와 하위 양쪽이 다 맞아야 통과다.

- [ ] **Step 6: 커밋**

```bash
git add plugins/image-layouts quartz.config.yaml
git commit -m "feat(image-layouts): mdast 노드 생성 + 트랜스포머 등록 (order 55)"
```

---

## Task 6: 스타일

**Files:**
- Create: `plugins/image-layouts/src/styles/imageLayouts.scss`
- Modify: `plugins/image-layouts/src/index.ts` (externalResources 추가)

**Interfaces:**
- Consumes: Task 5가 붙인 클래스 — `.image-layout`, `.il-grid`, `.il-masonry`, `.il-carousel`, `.il-column`, `.il-item`, `.il-frame`, `.il-caption`, `.il-block-caption`, `.il-thumbs`, `.il-thumb`, `.il-fit-*`, `.il-overlay-*`, `.il-align-*`
- Produces: 인라인 CSS 문자열 (default export)

- [ ] **Step 1: SCSS 작성**

캡션은 전부 이미지 **아래**에 평범한 텍스트로 놓는다. 사진 위 오버레이가 없으므로 모든 색이 테마 변수로 해결되고, 대비도 `--gray`(라이트 4.65:1 / 다크 5.12:1)로 이미 검증돼 있다.

```scss
.image-layout {
  margin: 1.5rem 0;

  &.il-grid,
  &.il-masonry {
    display: grid;
    gap: var(--il-gap, 0.5rem);
    // 미지원 layout·깨진 grid의 자동배치 폴백. 인라인 style이 있으면 그쪽이 이긴다.
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  &.il-align-left { justify-items: start; }
  &.il-align-center { justify-items: center; }
  &.il-align-right { justify-items: end; }
}

.il-column {
  display: flex;
  flex-direction: column;
  gap: var(--il-gap, 0.5rem);
}

// 캡션이 아래로 흐르므로 figure는 세로 flex — 프레임이 남는 높이를 채운다.
.il-item {
  display: flex;
  flex-direction: column;
  margin: 0;
  min-width: 0;
}

.il-frame {
  flex: 1;
  min-height: 0;
  margin: 0;
  overflow: hidden;
  border-radius: 4px;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
  }
}

.il-fit-contain .il-frame img { object-fit: contain; }
.il-fit-natural {
  align-items: start;
  .il-frame { flex: 0 0 auto; }
  .il-frame img { height: auto; object-fit: contain; }
}

// 캡션은 항상 이미지 아래. 사진 위에 얹지 않으므로 테마 변수만으로 AA가 성립한다.
.il-caption {
  margin: 0.35rem 0 0;
  padding: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--gray);
}

// overlay: never만 살린다 — Obsidian에서도 캡션이 안 보이므로 결과가 일치한다.
.il-overlay-never .il-caption { display: none; }

// 블록 캡션은 본문 흐름 안의 평범한 텍스트 — 테마 변수로 AA를 만족한다.
.il-block-caption {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--gray);
  text-align: center;
}

.il-carousel {
  position: relative;
  background: var(--il-carousel-bg, var(--lightgray));
  border-radius: 4px;

  .il-viewport {
    display: flex;
    height: var(--il-carousel-height, 24rem);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }

  .il-item {
    flex: 0 0 100%;
    height: 100%;
    scroll-snap-align: center;
    border-radius: 0;
  }

  .il-frame img { object-fit: contain; }
}

.il-thumbs {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem;
  overflow-x: auto;
}

.il-thumb {
  flex: 0 0 auto;
  margin: 0;
  cursor: pointer;

  img {
    display: block;
    width: 3.5rem;
    height: 3.5rem;
    object-fit: cover;
    border-radius: 3px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
    margin: 0;
  }

  &:hover img,
  &.is-active img { opacity: 1; }
}

// 캐러셀 화살표는 JS가 만든다 (없어도 스크롤로 동작 — 점진적 향상)
.il-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--dark);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.85;

  &:hover { opacity: 1; }
  &.il-prev { left: 0.5rem; }
  &.il-next { right: 0.5rem; }
}

@media (max-width: 600px) {
  .image-layout.il-grid,
  .image-layout.il-masonry {
    grid-template-columns: 1fr !important;
    grid-template-areas: none !important;
  }
  .il-item { grid-area: auto !important; }
}
```

- [ ] **Step 2: `index.ts`에 `externalResources` 추가**

import 두 줄을 파일 상단 import 블록에 추가하고, `markdownPlugins()` 뒤에 훅을 붙인다.

```ts
import styles from "./styles/imageLayouts.scss"
```

```ts
    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
      }
    },
```

- [ ] **Step 3: 빌드 후 computed style 실측**

SCSS에 규칙을 썼다고 적용된 게 아니다. 브라우저로 실측한다.

```bash
cd plugins/image-layouts && npm run build && cd ../.. && npx quartz build
cd public && python3 -m http.server 8899
```

브라우저로 `http://localhost:8899/test`를 열고 `.il-viewport`의 computed `scroll-snap-type`이 `x mandatory`, `display`가 `flex`인지 확인한다. ⚠️ 탭이 백그라운드면 측정이 어긋난다 — 탭을 활성화한 뒤 잰다.

- [ ] **Step 4: 커밋**

```bash
git add plugins/image-layouts
git commit -m "feat(image-layouts): 레이아웃·캡션·캐러셀 스타일"
```

---

## Task 7: 캐러셀 스크립트

**Files:**
- Create: `plugins/image-layouts/src/scripts/carousel.inline.ts`
- Modify: `plugins/image-layouts/src/index.ts`

**Interfaces:**
- Consumes: `.il-carousel[data-needs-init="true"]`, `.il-viewport`, `.il-item`, `.il-thumb` (Task 5·6)
- Produces: 인라인 JS 문자열

- [ ] **Step 1: 스크립트 작성**

⚠️ 리스너 정리는 `prenav`를 직접 구독하지 않는다. 이 저장소의 스크립트 5종이 전부 쓰는 **`window.addCleanup`**을 쓴다 — Quartz가 `prenav`에서 알아서 호출한다.

```ts
document.addEventListener("nav", () => {
  const carousels = document.querySelectorAll<HTMLElement>('.il-carousel[data-needs-init="true"]')

  for (const carousel of carousels) {
    const viewport = carousel.querySelector<HTMLElement>(".il-viewport")
    if (!viewport) continue

    const slides = Array.from(viewport.querySelectorAll<HTMLElement>(".il-item"))
    if (slides.length < 2) continue

    const thumbs = Array.from(carousel.querySelectorAll<HTMLElement>(".il-thumb"))
    const current = () => Math.round(viewport.scrollLeft / viewport.clientWidth)

    const goTo = (index: number) => {
      const slide = slides[Math.max(0, Math.min(slides.length - 1, index))]
      if (slide) viewport.scrollTo({ left: slide.offsetLeft - viewport.offsetLeft })
    }

    const syncThumbs = () => {
      const active = current()
      thumbs.forEach((thumb, i) => thumb.classList.toggle("is-active", i === active))
    }

    const makeButton = (cls: string, label: string, glyph: string, onClick: () => void) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = `il-nav ${cls}`
      button.setAttribute("aria-label", label)
      button.textContent = glyph
      button.addEventListener("click", onClick)
      carousel.appendChild(button)
      window.addCleanup(() => {
        button.removeEventListener("click", onClick)
        button.remove()
      })
    }

    makeButton("il-prev", "이전 이미지", "‹", () => goTo(current() - 1))
    makeButton("il-next", "다음 이미지", "›", () => goTo(current() + 1))

    thumbs.forEach((thumb, i) => {
      const onClick = () => goTo(i)
      thumb.addEventListener("click", onClick)
      window.addCleanup(() => thumb.removeEventListener("click", onClick))
    })

    viewport.addEventListener("scroll", syncThumbs, { passive: true })
    window.addCleanup(() => viewport.removeEventListener("scroll", syncThumbs))
    syncThumbs()

    carousel.removeAttribute("data-needs-init")
  }
})
```

- [ ] **Step 2: `index.ts`에 스크립트 주입**

import를 추가하고 `externalResources`의 반환값에 `js`를 더한다.

```ts
import carouselScript from "./scripts/carousel.inline.ts"
```

```ts
    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
        js: [{ script: carouselScript, loadTime: "afterDOMReady", contentType: "inline" }],
      }
    },
```

- [ ] **Step 3: SPA 동작 검증**

```bash
cd plugins/image-layouts && npm run build && cd ../.. && npx quartz build
cd public && python3 -m http.server 8899
```

1. `http://localhost:8899/test`를 **직접** 열어 화살표가 보이고 동작하는지 확인
2. 홈에서 링크를 눌러 SPA로 들어가도 화살표가 생기는지 확인 (`nav` 이벤트 미사용이면 여기서 실패)
3. 다른 페이지로 갔다가 3회 왕복한 뒤, DevTools에서 `.il-nav` 개수가 **2개인지** 확인 (누적되면 cleanup 누락)
4. JS를 끈 상태에서도 가로 스크롤로 넘어가는지 확인 (점진적 향상 유지)

- [ ] **Step 4: 커밋**

```bash
git add plugins/image-layouts
git commit -m "feat(image-layouts): 캐러셀 화살표·썸네일 (addCleanup 기반)"
```

---

## Task 8: image-lightbox 충돌 차단

**Files:**
- Modify: `plugins/image-lightbox/src/components/scripts/imageLightbox.inline.ts:20`

**Interfaces:**
- Consumes: Task 5가 만든 `.il-thumb` 마크업
- Produces: 없음

**왜 필요한가:** `image-lightbox`는 `article img` **전부**에 클릭 핸들러를 건다. 캐러셀 썸네일도 `<img>`라서, 썸네일을 누르면 슬라이드가 넘어가는 동시에 라이트박스가 열린다. 썸네일은 네비게이션 컨트롤이지 감상 대상이 아니다.

- [ ] **Step 1: 썸네일을 라이트박스 대상에서 제외**

`for (const el of document.querySelectorAll("article img")) {` 바로 다음 줄에 추가한다.

```ts
  for (const el of document.querySelectorAll("article img")) {
    const img = el as HTMLImageElement
    if (img.closest(".il-thumb")) continue // 썸네일은 캐러셀 네비게이션 컨트롤이다
    img.style.cursor = "zoom-in"
```

- [ ] **Step 2: 빌드**

```bash
cd plugins/image-lightbox && npm run build && cd ../.. && npx quartz build
```

- [ ] **Step 3: 동작 확인**

`http://localhost:8899/test`에서 썸네일 클릭 → 슬라이드만 이동하고 라이트박스는 **열리지 않아야** 한다. 본 슬라이드 이미지 클릭 → 라이트박스가 열려야 한다.

- [ ] **Step 4: 커밋**

```bash
git add plugins/image-lightbox
git commit -m "fix(image-lightbox): 캐러셀 썸네일을 라이트박스 대상에서 제외"
```

---

## Task 9: 검증 체크리스트 + 문서 갱신

**Files:**
- Modify: `image-layout-handoff.md`, `CHANGELOG.md`, `DESIGN-SYSTEM.md`, `CLAUDE.md`, `README.md`
- Modify(임시): `content/test.md`

- [ ] **Step 1: 전 레이아웃 렌더 확인용 블록을 test.md에 추가**

`content/test.md`는 전 기능 점검 문서다. 현재 carousel 블록 하나뿐이므로 프리셋·custom·masonry·레거시 fence를 덧붙인다. `content/attachments/`의 실존 이미지만 쓴다.

````markdown
```image-layout
---
layout: custom
grid: |
  A A B
  A A C
caption: custom ASCII 그리드
---
![[attachments/01_pipeline.png|파이프라인]]
![[attachments/04_knn.png]]
![[attachments/06_delaunay.png]]
```

```image-layout
---
layout: masonry-3
---
![[attachments/01_pipeline.png]]
![[attachments/04_knn.png]]
![[attachments/06_delaunay.png]]
```

```image-layout-a
![[attachments/01_pipeline.png|300]]
![[attachments/04_knn.png|왼쪽이 300px로 제한된다]]
```

```image-layout
---
layout: some-future-layout
someUnknownKey: true
---
![[attachments/01_pipeline.png]]
```
````

- [ ] **Step 2: 빌드 후 체크리스트 실행**

```bash
npx quartz build && cd public && python3 -m http.server 8899
```

- [ ] 루트 노트(`/test`)에서 이미지 로드
- [ ] **중첩 노트에서 이미지 로드** ← 최우선 (Task 5 Step 5에서 이미 확인)
- [ ] 레거시 fence(` ```image-layout-a `)와 신형 fence 양쪽 동작
- [ ] `![[img|300]]`이 캡션이 아니라 `max-width:300px`로 처리됨
- [ ] `layout: custom` ASCII 그리드가 2×2+1+1 배치로 잡힘
- [ ] masonry-3이 3열로 분배됨
- [ ] 미지원 `layout`/알 수 없는 키가 있어도 빌드 성공 + 자동배치로 렌더
- [ ] 캐러셀: JS 없이도 가로 스크롤 가능
- [ ] 캐러셀: SPA 전환으로 진입해도 초기화, 왕복해도 `.il-nav` 2개 유지
- [ ] 캡션이 이미지 **아래**에 표시되고 다크모드에서도 가독 (`overlay: never`면 숨김)
- [ ] 모바일 폭(600px 이하)에서 1열로 접힘
- [ ] Obsidian에서 같은 노트가 여전히 정상 렌더

- [ ] **Step 3: 핸드오프 문서 정정**

`image-layout-handoff.md`에 "구현 후 정정" 절을 추가하고 §4.4·§5.1·§5.5·§5.6·§6을 고친다. 정정 항목은 이 계획서 상단 "원본 대조로 확정한 사실" 6건 + `category` 문자열 + order 55 + `addCleanup` + `blockquote` 컨테이너.

- [ ] **Step 4: CHANGELOG·DESIGN-SYSTEM·CLAUDE·README 갱신**

- `CHANGELOG.md` — image-layouts 도입, 문법 계약 분리 전략, 핸드오프 문서 오류 정정 경위
- `DESIGN-SYSTEM.md` — **캡션을 이미지 위에 얹지 않는 근거**: 사진 위 텍스트는 배경 명도를 통제할 수 없어 AA를 보장하려면 테마 밖 고정색 스크림이 필요해지고, 그건 "색의 단일 소스" 규칙을 깬다. 캡션을 아래로 내리면 `--gray`(4.65:1 / 5.12:1)로 이미 검증된 대비를 그대로 쓴다. 이미지 위 오버레이는 시도하지 말 것.
- `CLAUDE.md` — `plugins/*` 19종 → **20종**
- `README.md` — 로컬 플러그인 개수 갱신 (현재 9종으로 낡아 있음 → 20종)

- [ ] **Step 5: `public/` 재빌드 후 전체 커밋**

`public/`을 갱신하지 않으면 라이브에 반영되지 않는다.

```bash
npx quartz build
git add -A
git status   # ⚠️ 커밋 전 포함 목록을 눈으로 확인
git commit -m "feat: image-layouts 플러그인 도입 — 문서 갱신 및 빌드본 반영"
```

---

## Self-Review

**스펙 커버리지** (`image-layout-handoff.md` §4.3 대조)

| 항목 | 태스크 |
|---|---|
| ` ```image-layout ` + 블록 프런트매터 | Task 3 |
| ` ```image-layout-* ` 레거시 fence | Task 3 |
| `![[file\|caption]]` 위키링크 | Task 3 |
| `![](url)` 마크다운 링크 | Task 3 |
| `layout: custom` + ASCII grid | Task 2·4 |
| `layout: carousel` | Task 5·6·7 |
| 프리셋 a~i, single, masonry-2~6 | Task 4·5 (사용자 결정으로 **전체** 이식) |
| `caption` (블록 레벨) | Task 5 |
| 오버레이 never/hover/always | Task 5·6 |
| `fit`, `align` | Task 5·6 |
| 미지원 키/레이아웃 무시 | Task 3·4 (테스트 있음) |
| SPA 대응 | Task 7 |
| `fromFolder` | **v1 제외** (§4.6 — Node `fs` 필요, 정렬 순서 일치 어려움, 미참조 이미지의 `public/` 복사 별도 검증 필요) |
| `descriptions` 배열 | **v1 제외** — 파이프 캡션으로 대체 가능 |
| `sortBy`/`reverse`/`limit` | **v1 제외** — `fromFolder` 전용 옵션이라 함께 미룬다 |

**타입 일관성**: `ParsedBlock`/`ParsedImage`(Task 3) → `resolveLayout(layout, grid, fallback)`(Task 4) → `buildLayoutNode(block, spec, opts)`(Task 5). `opts` 키는 Task 3에서 소문자로 정규화되고 Task 5가 `carouselheight`/`carouselshowthumbnails`/`carouselbackground`로 읽는다 — 일치. `LayoutSpec.templateAreas` 유무가 Task 5의 `withArea` 인자를 결정 — 일치.

**미해결 리스크 없음**: 캡션을 이미지 아래로 고정하기로 결정(2026-08-06)하면서 색 예외가 사라졌다. 모든 색이 `quartz.config.yaml`의 테마 변수에서 온다.
