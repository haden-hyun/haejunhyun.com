# Handoff: Obsidian Image Layouts → Quartz 5 퍼블리싱 지원

작성일: 2026-08-06
대상 독자: 이 작업을 이어받을 개발자 / 에이전트

---

## 1. 목적

Obsidian 노트에서 작성한 이미지 레이아웃/캐러셀을 Quartz 5로 빌드한 정적 사이트에 동일하게 렌더링한다.

**전략: 문법 계약(syntax contract) 분리**

노트 원문은 어느 렌더러에도 종속되지 않는 순수 텍스트로 유지하고, 편집 환경과 배포 환경이 각각 자기 렌더러로 같은 입력을 그린다.

| | 편집 (Obsidian) | 배포 (Quartz 5) |
| --- | --- | --- |
| 담당 | 실시간 미리보기 | 정적 HTML 생성 |
| 수단 | `obsidian-image-layouts` (기존 플러그인, 그대로 사용) | **신규 개발 대상** |
| 입력 | ` ```image-layout ` 코드펜스 | 동일 |
| 실행 시점 | 런타임 (앱 내부) | 빌드 타임 |

Obsidian 플러그인을 제거해도 노트는 깨지지 않고, Quartz 플러그인만 있으면 웹은 계속 동작한다.

---

## 2. 대상 플러그인 정보

- 저장소: https://github.com/vertis/obsidian-image-layouts
- 라이선스: **MIT**
- 현재 버전: 0.18.0, 16릴리스, 33k 다운로드, 최초 생성 4년 전, 최근 업데이트 4주 전
- 하위 호환 태도: 레거시 레이아웃과 레거시 메이슨리 레이아웃을 앞으로도 계속 지원한다고 명시 → **문법 계약이 흔들릴 위험이 낮다**

문서:
- Block Options Reference: `docs/options.md`
- Carousel: `docs/carousel.md`
- Overlay / Caption: `docs/text.md`
- Legacy: `docs/legacy-layouts.md`, `docs/legacy-masonry-layouts.md`

> MIT이므로 코드 참조가 법적으로 자유롭다. 다만 소스가 Obsidian API(`app.vault`, `registerMarkdownCodeBlockProcessor`)에 강결합되어 있어 **실질적 재사용 가치는 낮다.** CSS(레이아웃 grid 정의)와 파이프 판별 로직은 참조 가치가 있다.

---

## 3. 결정 사항과 근거

### 3.1 왜 Obsidian 플러그인을 그대로 쓸 수 없는가

`registerMarkdownCodeBlockProcessor`로 **Obsidian 앱 프로세스 안에서만** DOM을 생성한다. Quartz 빌드는 이 코드를 실행하지 않으므로, 아무 조치 없이 퍼블리시하면 ` ```image-layout ` 블록이 문법 강조된 코드블록으로 노출된다.

→ **렌더러는 재사용 불가. 작성 문법만 계약으로 차용한다.**

### 3.2 왜 Component가 아니라 Transformer인가

Quartz 5에서 **Component는 사이드바·헤더·푸터 등 레이아웃 슬롯 UI**를 뜻하는 별도 범주다. 본문 마크다운을 다른 마크업으로 바꾸는 것은 **Transformer**의 역할이다.

매니페스트 `category`는 `["transformer"]`. 컴포넌트 전용 플러그인은 팩토리 함수가 아니라 사이드이펙트 import로 로드되므로 잘못 지정하면 초기화부터 꼬인다.

### 3.3 왜 원시 HTML 문자열을 만들면 안 되는가 (가장 중요)

작업량의 대부분은 "문법 → HTML 변환"이 아니라 **경로 해석**에 있다. Obsidian은 `app.vault.getAbstractFileByPath()`로 끝나지만 Quartz에는 볼트가 없다. 직접 해결해야 하는 것:

- 이미지가 `public/`으로 복사되는가 (Assets 이미터 관할)
- 중첩 슬러그(`/notes/a/b/`)에서 상대 경로가 올바른가
- Obsidian 첨부파일 폴더 설정(`assets/`, `attachments/` 등)이 반영되는가

문자열로 `<img src="...">`를 만드는 순간 CrawlLinks / Assets 파이프라인을 우회하게 되어 위 셋을 전부 직접 구현해야 한다.

→ **결론: mdast `image` 노드를 생성하고, 컨테이너는 `data.hName` / `hProperties`로 표현한다.**

이 플러그인을 택한 결정적 이유가 여기다. 이미지가 이미 위키링크 형식이므로, 파싱 결과를 그대로 `image` 노드에 넣으면 **위키링크 이미지와 완전히 동일한 취급**을 받는다.

### 3.4 왜 클라이언트 JS를 최소화할 수 있는가

레이아웃(masonry, custom grid 등)의 산출물은 정적 CSS grid다. 이미지 개수 부족 시 플레이스홀더, 초과 시 숨김도 전부 빌드 타임에 결정된다. 오버레이/캡션도 CSS로 재현된다.

**레이아웃 계열은 JS가 0이다.** 캐러셀만 최소한의 스크립트가 필요하며, 그마저도 CSS scroll-snap으로 상당 부분 대체 가능하다(10장 참조).

---

## 4. 문법 계약 (Scope)

### 4.1 레이아웃 블록

레이아웃명이 fence 언어에 인코딩되는 레거시 형태:

````markdown
```image-layout-a
![[photo-1.png|첫 번째 사진]]
![[photo-2.png|두 번째 사진]]
![[photo-3.png]]
```
````

블록 옵션 형태(신형, 권장):

````markdown
```image-layout
---
layout: custom
grid: |
  AAB
  AAC
caption: 여름 여행
---
![[photo-1.png|메인]]
![[photo-2.png]]
![[photo-3.png]]
```
````

### 4.2 캐러셀 블록

````markdown
```image-layout
---
layout: carousel
carouselShowThumbnails: true
carouselBackground: "#101014"
carouselHeight: 60vh
caption: Sailing trip, June
---
![[sunset.jpg|Sunset on the sea]]
![[anchorage.jpg|Our spot for the night]]
```
````

- 블록 레벨 `caption`은 캐러셀 **아래**에 렌더링된다.
- 개별 이미지 캡션은 위키링크 파이프 문법, 마크다운 alt 텍스트, 또는 `descriptions` 배열에서 오며 **현재 슬라이드 아래**에 표시된다.
- `carouselHeight`는 숫자(px) 또는 CSS 크기이며 기본값 `24rem`.
- `carouselBackground`는 임의 CSS 색상이며 기본값은 테마 배경색.

### 4.3 v1 지원 범위

| 항목 | 지원 | 비고 |
| --- | --- | --- |
| ` ```image-layout ` + 블록 프런트매터 | ✅ | 신형 문법 우선 |
| ` ```image-layout-* ` 레거시 fence | ✅ | `lang.startsWith("image-layout")` 로 매칭 |
| `![[file\|caption]]` 위키링크 | ✅ | 파이프 값 판별 규칙은 4.5 |
| `![](url)` 마크다운 링크 | ✅ | 로컬/원격 모두 |
| `layout: custom` + ASCII `grid` | ✅ | **최우선 구현** (4.4 참조) |
| `layout: carousel` | ✅ | 유일하게 JS 필요 |
| `caption` (블록 레벨) | ✅ | `figcaption` |
| 오버레이 `never` / `hover` / `always` | ✅ | 순수 CSS |
| `fit`, `align` | ✅ | `object-fit`, `object-position` |
| 프리셋 레이아웃 (a, b, ... masonry 1~6) | 🔶 부분 | **실제 사용 중인 것만** 이식 |
| `fromFolder` | ❌ v2 이후 | 4.6 참조 |
| `descriptions` 배열 | 🔶 | 파이프 캡션으로 대체 가능하면 후순위 |

### 4.4 `layout: custom` 최우선 원칙

프리셋 레이아웃을 전부 이식하려 들면 CSS 물량에 압사한다. **ASCII 아트 그리드 → `grid-template-areas` 변환은 거의 1:1 기계적 매핑**이므로, 파서 하나로 무한한 레이아웃을 커버한다.

```
grid: |          →   grid-template-areas:
  AAB                  "A A B"
  AAC                  "A A C"
```

각 이미지는 등장 순서대로 `A`, `B`, `C`... 영역에 배정되고 `grid-area`를 인라인 스타일로 받는다. 프리셋은 이 위에 얹는 형태로 구현하면 코드 중복이 없다.

### 4.5 위키링크 파이프 값 판별 규칙 (주의)

Obsidian 표준에서 `![[img.png|300]]`의 파이프는 **크기**지만, 이 플러그인은 **캡션**으로도 쓴다. 파서 규칙:

- 순수 숫자(`300`) 또는 `가로x세로`(`300x200`) → **크기**로 해석
- 그 외 → **캡션**으로 해석

이 규칙은 원 플러그인 동작과 반드시 일치시켜야 한다. 불일치 시 Obsidian과 웹의 렌더링이 갈린다. 원 저장소가 MIT이므로 해당 로직을 직접 확인할 것.

### 4.6 미지원 옵션 처리 원칙 (중요)

두 구현은 별개이므로 원 플러그인이 업데이트되어도 Quartz 쪽은 자동으로 따라가지 않는다.

**파서는 알 수 없는 키를 만나면 조용히 무시해야 한다. 절대 throw 하지 않는다.** 지원하지 않는 `layout` 값을 만나면 기본 그리드로 폴백하고 빌드를 통과시킨다. Obsidian에서만 동작하는 옵션이 섞여도 사이트 빌드가 깨지면 안 된다.

`fromFolder`는 Node `fs`로 콘텐츠 디렉터리를 직접 훑어야 하는 유일한 옵션이다. 폴더 내 파일 **정렬 순서**를 Obsidian과 일치시키기 까다롭고, 어떤 노트에서도 링크되지 않은 이미지의 `public/` 복사 여부를 별도 검증해야 한다. v1에서 제외한다.

---

## 5. 구현 명세

### 5.1 저장소 구조

Quartz 5 플러그인은 **독립 저장소**다. v4처럼 `quartz/plugins/transformers/`에 파일을 추가하고 `index.ts`에 export하는 절차는 존재하지 않는다.

```
quartz-image-layouts/
├── src/
│   ├── index.ts                 # 트랜스포머 진입점
│   ├── parse-block.ts           # 펜스 본문 → { opts, images }
│   ├── parse-grid.ts            # ASCII grid → grid-template-areas
│   ├── build-nodes.ts           # mdast 서브트리 생성
│   ├── scripts/
│   │   └── carousel.inline.ts   # 캐러셀 전용 (레이아웃은 불필요)
│   └── styles/
│       └── image-layouts.scss
├── dist/                        # 커밋 필수 (.gitignore 금지)
├── tsup.config.ts
├── package.json
└── tsconfig.json
```

`package.json`:

```json
{
  "quartz": {
    "category": ["transformer"]
  }
}
```

### 5.2 import 규칙

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types"
```

`@jackyzha0/quartz` 또는 `vfile`에서 **직접 import 금지**. 경로 유틸이 필요하면 `@quartz-community/utils/path`.

### 5.3 트랜스포머 핵심 로직

`markdownPlugins` 단계에서 `code` 노드를 잡아 mdast 서브트리로 교체한다.

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types"
import { visit } from "unist-util-visit"
import { parseBlock } from "./parse-block"
import { buildLayoutNode, buildCarouselNode } from "./build-nodes"

interface Options {
  defaultLayout: string
  carouselHeight: string
  placeholder: boolean
}

const defaults: Options = {
  defaultLayout: "custom",
  carouselHeight: "24rem",
  placeholder: true,
}

export const ImageLayouts: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  return {
    name: "ImageLayouts",
    markdownPlugins() {
      return [
        () => (tree: any) => {
          visit(tree, "code", (node: any, index: number, parent: any) => {
            if (!node.lang?.startsWith("image-layout")) return
            if (index == null || parent == null) return

            const block = parseBlock(node.lang, node.value)   // 5.4
            if (!block || block.images.length === 0) return   // 원본 유지

            parent.children[index] =
              block.layout === "carousel"
                ? buildCarouselNode(block, opts)
                : buildLayoutNode(block, opts)
          })
        },
      ]
    },

    externalResources() {
      return {
        css: [{ content: styles, inline: true }],
        js: [
          {
            script: carouselScript,
            loadTime: "afterDOMReady",
            contentType: "inline",
          },
        ],
      }
    },
  }
}
```

### 5.4 블록 파서 (`parse-block.ts`)

입력: fence 언어 문자열 + 본문. 출력: `{ layout, opts, images: { url, caption, size }[] }`.

처리 순서:

1. fence 언어에서 레거시 레이아웃명 추출 (`image-layout-a` → `a`)
2. 본문 선두의 `---` … `---` 블록을 YAML로 파싱 (없으면 빈 객체)
   - **노트 프런트매터와 혼동 금지.** 이건 코드펜스 *내부*의 별도 프런트매터다.
3. 옵션 키를 소문자로 정규화해 매칭 (`carouselShowThumbnails` == `carouselshowthumbnails`)
4. 나머지 라인에서 이미지 추출
   - `![[target|pipe]]` → `{ url: target, …파이프 판별(4.5) }`
   - `![alt](url)` → `{ url, caption: alt }`
   - 그 외 라인 무시
5. 알 수 없는 키 무시, 예외 던지지 않음

### 5.5 mdast 노드 생성 (`build-nodes.ts`)

```ts
const slide = (img: ParsedImage) => ({
  type: "paragraph",
  data: {
    hName: "figure",
    hProperties: {
      className: ["il-item"],
      ...(img.area ? { style: `grid-area:${img.area}` } : {}),
    },
  },
  children: [
    // ↓ 진짜 mdast image 노드. CrawlLinks가 경로를 변환한다.
    { type: "image", url: img.url, alt: img.caption ?? "" },
    ...(img.caption
      ? [{
          type: "paragraph",
          data: { hName: "figcaption", hProperties: { className: ["il-caption"] } },
          children: [{ type: "text", value: img.caption }],
        }]
      : []),
  ],
})
```

컨테이너:

```ts
export const buildLayoutNode = (block, opts) => ({
  type: "paragraph",
  data: {
    hName: "div",
    hProperties: {
      className: ["image-layout", `il-${block.layout}`],
      style: `grid-template-areas:${toAreas(block.grid)}`,
    },
  },
  children: block.images.map(slide),
})
```

`data.hName` / `hProperties` / `hChildren`은 remark-rehype가 임의 mdast 노드에 대해 해석해 주는 필드다. 원시 HTML 문자열 없이 원하는 마크업을 만들면서 이미지 URL은 파이프라인에 맡길 수 있다.

캐러셀 컨테이너는 여기에 `data-needs-init="true"`, `--il-carousel-height`, `--il-carousel-bg` CSS 변수를 추가하고 썸네일 트랙 노드를 덧붙인다.

### 5.6 캐러셀 클라이언트 스크립트 — SPA 대응 (필수)

Quartz 5는 micromorph 기반 SPA가 기본이다. `DOMContentLoaded`는 최초 1회만 발생하므로 그것만으로는 페이지 전환 후 초기화되지 않는다. 또한 리스너를 정리하지 않으면 **전환할수록 누적**된다.

```ts
let cleanup: (() => void)[] = []

document.addEventListener("prenav", () => {
  cleanup.forEach((fn) => fn())
  cleanup = []
})

document.addEventListener("nav", () => {
  document
    .querySelectorAll<HTMLElement>('.il-carousel[data-needs-init="true"]')
    .forEach((el) => {
      const dispose = initCarousel(el)
      el.removeAttribute("data-needs-init")
      cleanup.push(dispose)
    })
})
```

`nav` 이벤트는 최초 로드를 포함해 매 페이지 전환마다 발생한다.

**레이아웃 계열 블록은 이 스크립트와 무관하다.** 캐러셀이 없는 페이지에서는 아무것도 실행되지 않는다.

### 5.7 스타일

`tsup` 설정에 SCSS 로더가 구성돼 있는지 먼저 확인한다. 확실하지 않으면 CSS를 템플릿 문자열로 인라인하는 편이 안전하다.

다크모드는 Quartz CSS 변수(`--light`, `--dark`, `--lightgray`, `--secondary`)를 쓰면 자동 대응된다. 하드코딩 hex와 `html[saved-theme="dark"]` 셀렉터를 직접 쓰지 않는다. 단 `carouselBackground`가 명시되면 그 값이 우선한다.

### 5.8 빌드 및 배포

- `dist/`를 **저장소에 커밋**한다. `.gitignore`에 넣지 않는다.
- 커밋 전 `npm run build` 실행.
- `dist/`가 없으면 Quartz가 전체 install/build 사이클로 폴백하므로, 로컬 개발 중에는 심링크로 붙여 테스트하는 편이 빠르다.

---

## 6. Quartz 프로젝트 측 설정

```yaml
plugins:
  - source: github:<계정>/quartz-image-layouts
    enabled: true
    order: 20        # CrawlLinks / Assets보다 먼저 실행되어야 함
    options:
      carouselHeight: 24rem
      placeholder: true
```

**`order` 값이 핵심이다.** 이 플러그인이 생성한 mdast `image` 노드가 CrawlLinks의 경로 변환을 타야 하므로 CrawlLinks보다 **앞선** order여야 한다. 현행 `quartz.config.yaml`에서 CrawlLinks의 실제 order를 확인하고 그보다 작은 값을 지정할 것.

```bash
npx quartz plugin add github:<계정>/quartz-image-layouts
npx quartz build --serve
```

---

## 7. 빌드 파이프라인 단계별 추적 (캐러셀 예시)

디버깅 시 **어느 단계에서 깨졌는지** 판별하기 위한 기준 문서다.

### 입력: `content/travel/sailing.md`

````markdown
---
title: Sailing Trip
---

6월의 항해 기록.

```image-layout
---
layout: carousel
carouselShowThumbnails: true
carouselHeight: 60vh
caption: Sailing trip, June
---
![[sunset.jpg|Sunset on the sea]]
![[anchorage.jpg|Our spot for the night]]
```
````

이미지 실제 위치: `content/assets/sunset.jpg`, `content/assets/anchorage.jpg`
(Obsidian 첨부폴더가 `assets/`로 설정되어 있어 위키링크에 경로가 생략됨)

---

### STEP 0 — Obsidian (빌드와 무관)

`registerMarkdownCodeBlockProcessor("image-layout", …)`가 앱 내부에서 DOM을 그린다. **이 결과물은 파일에 저장되지 않는다.** 디스크의 `.md`는 위 원문 그대로다.

→ Quartz가 보는 것은 항상 원문 텍스트다.

---

### STEP 1 — 파일 읽기 & 노트 프런트매터

Quartz가 `.md`를 읽어 vfile을 만들고, FrontMatter 트랜스포머가 **문서 최상단** `---` 블록만 소비한다.

```
frontmatter: { title: "Sailing Trip" }
```

⚠️ 코드펜스 **내부**의 `---` 블록은 건드리지 않는다. mdast에서 `code` 노드의 `value` 문자열 안에 그대로 남는다. 이게 우리가 직접 파싱해야 하는 이유다.

---

### STEP 2 — mdast 파싱

remark가 마크다운을 mdast로 변환한다. 이 시점의 우리 블록:

```js
{
  type: "code",
  lang: "image-layout",
  meta: null,
  value: "---\nlayout: carousel\ncarouselShowThumbnails: true\ncarouselHeight: 60vh\ncaption: Sailing trip, June\n---\n![[sunset.jpg|Sunset on the sea]]\n![[anchorage.jpg|Our spot for the night]]"
}
```

**중요: 코드펜스 내부는 파싱되지 않는다.** `![[…]]`는 아직 그냥 문자열이며, OFM의 위키링크 처리 대상이 아니다. 우리가 직접 꺼내야 한다.

---

### STEP 3 — ImageLayouts 트랜스포머 (order: 20) ← 우리 코드

`node.lang.startsWith("image-layout")` 매칭 → `parseBlock()`:

```js
{
  layout: "carousel",
  opts: { carouselShowThumbnails: true, carouselHeight: "60vh", caption: "Sailing trip, June" },
  images: [
    { url: "sunset.jpg",    caption: "Sunset on the sea" },      // 파이프가 비숫자 → 캡션
    { url: "anchorage.jpg", caption: "Our spot for the night" },
  ]
}
```

`code` 노드를 아래 서브트리로 **교체**:

```js
{
  type: "paragraph",
  data: {
    hName: "div",
    hProperties: {
      className: ["image-layout", "il-carousel"],
      "data-needs-init": "true",
      "data-thumbnails": "true",
      style: "--il-carousel-height:60vh",
    },
  },
  children: [
    { type: "paragraph",
      data: { hName: "div", hProperties: { className: ["il-viewport"] } },
      children: [
        { type: "paragraph",
          data: { hName: "figure", hProperties: { className: ["il-item"] } },
          children: [
            { type: "image", url: "sunset.jpg", alt: "Sunset on the sea" },   // ★
            { type: "paragraph",
              data: { hName: "figcaption" },
              children: [{ type: "text", value: "Sunset on the sea" }] },
          ] },
        /* anchorage.jpg 동일 구조 */
      ] },
    { type: "paragraph",
      data: { hName: "figcaption", hProperties: { className: ["il-block-caption"] } },
      children: [{ type: "text", value: "Sailing trip, June" }] },
  ],
}
```

★ 표시한 노드가 이 설계의 전부다. **`type: "image"` 이므로 이후 파이프라인이 위키링크 이미지와 동일하게 취급한다.**

---

### STEP 4 — ObsidianFlavoredMarkdown (order: 30)

OFM은 `text` 노드의 `![[…]]` 패턴을 찾아 `image` 노드로 바꾼다. 우리 노드는 **이미 `image` 타입**이므로 그대로 통과한다. 충돌 없음.

(order를 30보다 크게 잡아도 무방하다 — 코드펜스 내부는 OFM도 못 건드리므로. 하지만 **CrawlLinks보다는 반드시 앞서야 한다.**)

---

### STEP 5 — remark-rehype (mdast → hast)

`data.hName` / `hProperties`가 여기서 적용된다. `paragraph`가 `div`/`figure`/`figcaption`으로 치환된다.

```html
<div class="image-layout il-carousel" data-needs-init="true"
     data-thumbnails="true" style="--il-carousel-height:60vh">
  <div class="il-viewport">
    <figure class="il-item">
      <img src="sunset.jpg" alt="Sunset on the sea">
      <figcaption>Sunset on the sea</figcaption>
    </figure>
    …
  </div>
  <figcaption class="il-block-caption">Sailing trip, June</figcaption>
</div>
```

`src`가 아직 **원본 위키링크 타깃 그대로**임에 주목. 다음 단계에서 해결된다.

---

### STEP 6 — CrawlLinks (htmlPlugins)

`a[href]`와 `img[src]`를 순회하며 슬러그 기준 상대 경로로 변환한다. 현재 페이지가 `/travel/sailing`이므로:

```html
<img src="../assets/sunset.jpg" alt="Sunset on the sea">
```

**이 한 줄이 이 설계 전체의 목적이다.** 원시 HTML로 만들었다면 `src="sunset.jpg"`가 그대로 남아 `/travel/sunset.jpg`를 찾다가 404가 났을 것이다.

> 검증 포인트: 루트 노트(`/note`)와 중첩 노트(`/a/b/note`) 양쪽에서 확인할 것. 여기가 가장 깨지기 쉬운 지점이다.

---

### STEP 7 — Assets 이미터

`content/assets/*.jpg`가 `public/assets/`로 복사된다. 위키링크로 참조되었으므로 정상 대상이다.

(`fromFolder`를 v1에서 뺀 이유가 여기다. 어떤 노트에서도 참조되지 않는 이미지는 이 단계의 동작을 별도로 검증해야 한다.)

---

### STEP 8 — externalResources 주입

`<head>`에 인라인 `<style>`, `afterDOMReady` 시점에 인라인 `<script>`가 삽입된다. 캐러셀 스크립트는 전 페이지에 실리므로 용량을 작게 유지해야 한다.

---

### STEP 9 — ContentPage 이미터 → 최종 HTML

`public/travel/sailing.html` 생성. 본문:

```html
<div class="image-layout il-carousel" data-needs-init="true"
     data-thumbnails="true" style="--il-carousel-height:60vh">
  <div class="il-viewport">
    <figure class="il-item">
      <img src="../assets/sunset.jpg" alt="Sunset on the sea">
      <figcaption>Sunset on the sea</figcaption>
    </figure>
    <figure class="il-item">
      <img src="../assets/anchorage.jpg" alt="Our spot for the night">
      <figcaption>Our spot for the night</figcaption>
    </figure>
  </div>
  <figcaption class="il-block-caption">Sailing trip, June</figcaption>
</div>
```

---

### STEP 10 — 브라우저 런타임

1. CSS가 `.il-viewport`에 `display:flex; overflow-x:auto; scroll-snap-type:x mandatory` 적용 → **JS 없이도 스와이프 동작**
2. `nav` 이벤트 발화 → `[data-needs-init="true"]` 탐색 → 화살표/썸네일/도트 바인딩 → `data-needs-init` 제거
3. 다른 페이지로 이동 시 `prenav` → 리스너 해제

**2번이 실패해도 1번 덕분에 캐러셀은 여전히 사용 가능하다.** 이 점진적 향상 구조를 유지할 것.

---

### 단계별 증상 대조표

| 증상 | 의심 단계 |
| --- | --- |
| 코드블록이 그대로 노출됨 | STEP 3 — `lang` 매칭 실패 (레거시 `image-layout-a` 형태 확인) |
| 컨테이너는 생겼는데 이미지가 없음 | STEP 3 — 위키링크 정규식 / 파이프 판별 |
| 이미지 404 (루트는 정상, 하위 경로만 실패) | STEP 6 — `order`가 CrawlLinks보다 뒤 |
| 이미지 404 (전부 실패) | STEP 7 — 파일이 `public/`에 없음 |
| 레이아웃이 안 잡힘 | STEP 5 — `hProperties.style` 누락 또는 CSS 미주입 |
| 첫 진입은 되는데 SPA 이동 후 안 됨 | STEP 10 — `nav` 이벤트 미사용 |
| 왕복할수록 느려짐 | STEP 10 — `prenav` 정리 훅 누락 |

---

## 8. 검증 체크리스트

- [ ] 루트 노트(`/note`)에서 이미지 로드
- [ ] **중첩 노트(`/a/b/note`)에서 이미지 로드** ← 최우선
- [ ] 이미지가 `public/`에 실제 복사됨
- [ ] 레거시 fence(` ```image-layout-a `)와 신형 fence 양쪽 동작
- [ ] `![[img|300]]`이 캡션이 아니라 크기로 처리됨
- [ ] `layout: custom` ASCII 그리드가 의도대로 배치됨
- [ ] 캐러셀: JS 비활성 상태에서도 가로 스크롤 가능
- [ ] 캐러셀: SPA 전환으로 진입해도 초기화됨
- [ ] 캐러셀: 여러 번 왕복해도 리스너 누적 없음 (DevTools 확인)
- [ ] 다크모드 대비 적절
- [ ] 모바일 스와이프 동작
- [ ] 알 수 없는 옵션/미지원 `layout` 값이 있어도 빌드 성공
- [ ] 이미지가 없는 빈 블록이 있어도 빌드 성공
- [ ] 동일 노트가 Obsidian 미리보기에서도 정상 렌더링

---

## 9. 알려진 리스크

| 항목 | 영향 | 완화책 |
| --- | --- | --- |
| 두 구현의 문법 드리프트 | Obsidian에서만 되는 옵션 발생 | 미지원 키 무시 원칙, 지원 범위 문서화, 원 저장소 릴리스 노트 주기 확인 |
| 파이프 판별 규칙 불일치 | 캡션이 크기로(또는 반대로) 해석 | 원 플러그인 소스(MIT)에서 해당 로직 직접 확인 |
| 프리셋 레이아웃 수 | CSS 물량 폭증 | `layout: custom` 우선, 실사용 프리셋만 이식 |
| Quartz 5 플러그인 API 변동 | v5가 비교적 신규 | `@quartz-community/types` 버전 고정, `quartz.lock.json` 관리 |
| 캐러셀 스크립트 전역 주입 | 전 페이지 용량 증가 | 스크립트 최소화, CSS scroll-snap 우선 |

---

## 10. 폴백 옵션

캐러셀에 한해, **CSS scroll-snap만으로도** 스와이프 가능한 형태가 성립한다. 화살표·썸네일이 불필요하다면 5.6절 스크립트를 통째로 삭제해도 무방하다. 레이아웃 계열은 애초에 JS가 없으므로 폴백 개념이 필요 없다.

---

## 11. 참고 자료

- Quartz 5 — 플러그인 제작: https://quartz.jzhao.xyz/advanced/making-plugins
- Quartz 5 — 컴포넌트 플러그인: https://quartz.jzhao.xyz/advanced/creating-components
- Quartz 5 — 설정: https://quartz.jzhao.xyz/configuration
- Image Layouts (MIT, 문법·CSS 참조): https://github.com/vertis/obsidian-image-layouts
- Block Options Reference: https://github.com/vertis/obsidian-image-layouts/blob/main/docs/options.md
- Carousel 문서: https://github.com/vertis/obsidian-image-layouts/blob/main/docs/carousel.md
- v4 트랜스포머 구조 참고 (SPA·경로 처리는 재작성 필요): https://gist.github.com/pinei/14545e81e8629eed72b55fce1cbd7822

---

## 12. 다음 작업

1. 플러그인 템플릿으로 저장소 스캐폴딩 (`category: ["transformer"]` 확인)
2. `parse-block.ts` 구현 + 단위 테스트 (레거시 fence, 파이프 판별, 미지원 키, 깨진 입력)
3. `parse-grid.ts` — ASCII 그리드 → `grid-template-areas`
4. mdast 변환 → **7장 STEP 6 중첩 경로 검증 최우선**
5. SCSS (Quartz CSS 변수 기반, scroll-snap 우선)
6. 캐러셀 스크립트 + `nav` / `prenav` 훅
7. `dist/` 빌드 후 커밋, 실제 사이트 설치 후 8장 체크리스트 수행