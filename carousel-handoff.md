# Handoff: Obsidian Carousel → Quartz 5 퍼블리싱 지원

작성일: 2026-08-06
대상 독자: 이 작업을 이어받을 개발자 / 에이전트

---

## 1. 목적

Obsidian 노트에서 작성한 이미지 캐러셀을 Quartz 5로 빌드한 정적 사이트에 동일하게 렌더링한다.

**핵심 전략: 문법 계약(syntax contract) 분리**

노트 원문은 어느 렌더러에도 종속되지 않는 순수 텍스트로 유지하고, 편집 환경과 배포 환경이 각각 자기 렌더러로 같은 입력을 그린다.

| | 편집 (Obsidian) | 배포 (Quartz 5) |
| --- | --- | --- |
| 담당 | 실시간 미리보기 | 정적 HTML 생성 |
| 수단 | `xhuajin/obsidian-carousel` (기존 커뮤니티 플러그인) | **신규 개발 대상** |
| 입력 | ` ```carousel ` 코드펜스 | 동일 |
| 실행 시점 | 런타임 (앱 내부) | 빌드 타임 |

Obsidian 플러그인을 나중에 제거해도 노트는 깨지지 않고, Quartz 플러그인만 있으면 웹은 계속 동작한다.

---

## 2. 결정 사항과 그 근거

### 2.1 왜 Obsidian 플러그인을 그대로 쓸 수 없는가

`xhuajin/obsidian-carousel`은 `registerMarkdownCodeBlockProcessor`로 **Obsidian 앱 프로세스 안에서만** DOM을 생성한다. Quartz 빌드는 이 코드를 실행하지 않으므로, 아무 조치 없이 퍼블리시하면 ` ```carousel ` 블록이 문법 강조된 코드블록으로 그대로 노출된다.

→ **결론: 렌더러는 재사용 불가. 작성 문법(옵션 이름/형식)만 계약으로 차용한다.**

> ⚠️ 해당 저장소에는 LICENSE 파일이 없다(최종 릴리스 2024-10). 소스 코드 복사는 법적 회색지대이므로 **문법 명세만 참고하고 구현은 새로 작성**한다.

### 2.2 왜 Component가 아니라 Transformer인가

Quartz 5에서 **Component는 사이드바·헤더·푸터 등 레이아웃 슬롯 UI**를 뜻하는 별도 범주다. 본문 마크다운을 다른 마크업으로 바꾸는 것은 **Transformer**의 역할이다.

플러그인 매니페스트의 `category`는 반드시 `["transformer"]`여야 한다. 컴포넌트 전용 플러그인은 팩토리 함수가 아니라 사이드이펙트 import로 로드되므로, 잘못 지정하면 초기화 단계부터 꼬인다.

### 2.3 왜 원시 HTML 문자열을 만들면 안 되는가

**이 문서에서 가장 중요한 항목이다.** 작업량의 대부분은 "문법 → HTML 변환"이 아니라 **"경로 해석"** 에 있다.

Obsidian 플러그인은 `app.vault.getAbstractFileByPath()`로 볼트 API에 물어보면 끝이지만, Quartz에는 볼트가 없다. 직접 해결해야 하는 것:

- 해당 이미지가 `public/`으로 복사되는가 (Assets 이미터 관할)
- 중첩 슬러그(`/notes/a/b/`)에서 상대 경로가 올바른가
- Obsidian 첨부파일 폴더 설정(`assets/`, `attachments/` 등)이 반영되는가

문자열로 `<img src="...">`를 만드는 순간 CrawlLinks / Assets 파이프라인을 우회하게 되어 위 세 가지를 전부 직접 구현해야 한다.

→ **결론: mdast `image` 노드를 생성하고, 컨테이너는 `data.hName` / `hProperties`로 표현한다.** 그러면 위키링크 이미지와 완전히 동일하게 취급되어 경로 문제가 자동 해결된다.

---

## 3. 문법 계약 (Scope)

### 3.1 작성 예시

````markdown
```carousel
images: assets/photo-1.png, assets/photo-2.png, assets/photo-3.png
height: 24rem
loop: true
slidessize: 100%
arrowbutton: true
```
````

옵션 이름은 **대소문자를 구분하지 않는다** (원 플러그인 사양과 동일).

### 3.2 v1 지원 범위

| 옵션 | 값 | 기본값 | 처리 방식 |
| --- | --- | --- | --- |
| `images` | 콤마 구분 경로 목록 | (필수) | mdast `image` 노드로 변환 |
| `height` | CSS 길이 | `25rem` | CSS 변수 `--carousel-height` |
| `loop` | `true` / `false` | `false` | Embla 옵션 |
| `slidessize` | `100%` / `50%` / `33.3%` | `100%` | CSS 변수 `--carousel-slide-size` |
| `arrowbutton` | `true` / `false` | `true` | 렌더 분기 |

### 3.3 v1에서 제외 — 그리고 그 이유

| 옵션 | 제외 사유 |
| --- | --- |
| `folder` | Node `fs`로 콘텐츠 디렉터리를 직접 훑어야 하는 유일한 옵션. 폴더 내 파일 **정렬 순서**를 Obsidian과 일치시키기가 까다롭다. v2 이후로 미룬다. |
| `autoplay`, `autoscroll` | Embla 별도 플러그인 패키지 필요. 우선순위 낮음. |
| `fade`, `dragfree`, `align`, `axis`, `direction`, `slidesToScroll` | Embla 옵션 전달만 하면 되어 난이도는 낮으나, v1 범위를 좁게 유지. |

### 3.4 미지원 옵션 처리 원칙 (중요)

두 구현은 별개이므로 원 플러그인이 업데이트되어도 Quartz 쪽은 자동으로 따라가지 않는다.

**파서는 알 수 없는 키를 만나면 조용히 무시해야 한다.** 절대 throw 하지 않는다. Obsidian에서만 동작하는 옵션이 노트에 섞여 있어도 빌드가 깨지지 않아야 한다.

---

## 4. 구현 명세

### 4.1 저장소 구조

Quartz 5 플러그인은 **독립 저장소**다. v4처럼 `quartz/plugins/transformers/`에 파일을 추가하고 `index.ts`에 export를 붙이는 절차는 존재하지 않는다.

```
quartz-carousel/
├── src/
│   ├── index.ts              # 트랜스포머 진입점
│   ├── parse.ts              # 코드펜스 설정 파서
│   ├── scripts/
│   │   └── carousel.inline.ts   # 클라이언트 초기화 (Embla)
│   └── styles/
│       └── carousel.scss
├── dist/                     # 커밋 필수 (.gitignore 금지)
├── tsup.config.ts
├── package.json
└── tsconfig.json
```

`package.json`의 quartz 매니페스트:

```json
{
  "quartz": {
    "category": ["transformer"]
  }
}
```

### 4.2 import 규칙

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types"
```

`@jackyzha0/quartz` 또는 `vfile`에서 **직접 import 금지**. 반드시 `@quartz-community/*` 패키지를 쓴다.

경로 유틸이 필요하면 `@quartz-community/utils/path`.

### 4.3 트랜스포머 핵심 로직

`markdownPlugins` 단계에서 `code` 노드를 잡아 mdast 서브트리로 교체한다.

```ts
import type { QuartzTransformerPlugin } from "@quartz-community/types"
import { visit } from "unist-util-visit"

interface Options {
  height: string
  slidesSize: string
  arrowButton: boolean
}

const defaults: Options = {
  height: "25rem",
  slidesSize: "100%",
  arrowButton: true,
}

export const Carousel: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  return {
    name: "Carousel",
    markdownPlugins() {
      return [
        () => (tree: any) => {
          visit(tree, "code", (node: any, index: number, parent: any) => {
            if (node.lang !== "carousel") return
            if (index == null || parent == null) return

            const cfg = parseConfig(node.value)        // 4.4 참조
            if (cfg.images.length === 0) return        // 빈 블록은 건드리지 않음

            parent.children[index] = {
              type: "paragraph",
              data: {
                hName: "div",
                hProperties: {
                  className: ["quartz-carousel"],
                  "data-needs-init": "true",
                  "data-loop": String(cfg.loop),
                  style: [
                    `--carousel-height:${cfg.height ?? opts.height}`,
                    `--carousel-slide-size:${cfg.slidesSize ?? opts.slidesSize}`,
                  ].join(";"),
                },
              },
              children: [
                {
                  type: "paragraph",
                  data: {
                    hName: "div",
                    hProperties: { className: ["quartz-carousel-viewport"] },
                  },
                  children: cfg.images.map((p: string) => ({
                    type: "paragraph",
                    data: {
                      hName: "figure",
                      hProperties: { className: ["quartz-carousel-slide"] },
                    },
                    // ↓ 진짜 mdast image 노드. CrawlLinks가 경로를 정상 변환한다.
                    children: [{ type: "image", url: p, alt: "" }],
                  })),
                },
                ...(cfg.arrowButton ?? opts.arrowButton ? arrowNodes() : []),
              ],
            }
          })
        },
      ]
    },

    externalResources() {
      return {
        css: [{ content: carouselStyle, inline: true }],
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

**`data.hName` / `hProperties` / `hChildren`** 은 remark-rehype가 임의의 mdast 노드에 대해 해석해 주는 필드다. 이 덕분에 원시 HTML 문자열 없이 원하는 마크업을 만들면서 이미지 URL은 파이프라인에 맡길 수 있다.

버튼도 같은 방식으로 만든다:

```ts
const arrowNodes = () => [
  {
    type: "paragraph",
    data: {
      hName: "button",
      hProperties: {
        className: ["quartz-carousel-prev"],
        type: "button",
        "aria-label": "Previous slide",
      },
      hChildren: [{ type: "text", value: "‹" }],
    },
    children: [],
  },
  // next 버튼 동일
]
```

### 4.4 설정 파서 (`parse.ts`)

- 라인 단위로 `key: value` 분해
- **키는 소문자로 정규화** 후 매칭 (`SlidesSize` == `slidessize`)
- `images`는 콤마로 split 후 각각 trim, 빈 문자열 제거
- boolean은 `"true"` 문자열 비교
- **알 수 없는 키는 무시** (3.4 참조)
- 파싱 실패 시 예외를 던지지 말고 해당 블록을 원본 그대로 둔다

### 4.5 클라이언트 스크립트 — SPA 대응 (필수)

Quartz 5는 micromorph 기반 SPA가 기본이다. `DOMContentLoaded`는 최초 1회만 발생하므로 그것만으로는 페이지 전환 후 캐러셀이 초기화되지 않는다.

또한 리스너·모달을 `document.body`에 붙이는 구조는 **전환할수록 누적**되므로 반드시 정리 훅을 둔다.

```ts
let cleanup: (() => void)[] = []

document.addEventListener("prenav", () => {
  cleanup.forEach((fn) => fn())
  cleanup = []
})

document.addEventListener("nav", () => {
  document
    .querySelectorAll<HTMLElement>('.quartz-carousel[data-needs-init="true"]')
    .forEach((el) => {
      const embla = EmblaCarousel(
        el.querySelector(".quartz-carousel-viewport")!,
        { loop: el.dataset.loop === "true" },
      )
      el.removeAttribute("data-needs-init")
      cleanup.push(() => embla.destroy())
    })
})
```

`nav` 이벤트는 최초 로드를 포함해 매 페이지 전환마다 발생한다.

### 4.6 스타일

`tsup` 설정에 SCSS 로더가 구성돼 있는지 먼저 확인한다. 확실하지 않으면 **CSS를 템플릿 문자열로 인라인**하는 편이 안전하다 (v4 gist의 `import style from "...scss"` 방식은 v4 esbuild 설정에 의존한다).

다크모드는 Quartz CSS 변수(`--light`, `--dark`, `--lightgray`, `--secondary`)를 사용하면 자동 대응된다. 하드코딩된 hex 값과 `html[saved-theme="dark"]` 셀렉터를 직접 쓰지 않는다.

### 4.7 빌드 및 배포

- `dist/`를 **저장소에 커밋**한다. `.gitignore`에 넣지 않는다.
- 커밋 전 `npm run build` 실행.
- `dist/`가 없으면 Quartz가 전체 install/build 사이클로 폴백하므로, 로컬 개발 중에는 심링크로 붙여 테스트하는 편이 빠르다.

---

## 5. Quartz 프로젝트 측 설정

```yaml
plugins:
  - source: github:<계정>/quartz-carousel
    enabled: true
    order: 20        # CrawlLinks / Assets보다 먼저 실행되어야 함
    options:
      height: 24rem
      arrowButton: true
```

**`order` 값이 핵심이다.** 이 플러그인이 생성한 mdast `image` 노드가 CrawlLinks의 경로 변환을 타야 하므로, CrawlLinks보다 **앞선** order를 가져야 한다. 현재 프로젝트의 `quartz.config.yaml`에서 CrawlLinks의 실제 order를 확인하고 그보다 작은 값을 지정할 것.

설치:

```bash
npx quartz plugin add github:<계정>/quartz-carousel
npx quartz build --serve
```

---

## 6. 검증 체크리스트

기능이 완성됐다고 판단하기 전 아래를 모두 확인한다.

- [ ] 루트 노트(`/note`)에서 이미지가 정상 로드된다
- [ ] **중첩 노트(`/a/b/note`)에서도 이미지가 정상 로드된다** ← 경로 버그가 가장 잘 드러나는 지점
- [ ] 이미지 파일이 `public/` 출력에 실제로 복사되었다
- [ ] SPA 전환(다른 노트 → 캐러셀 노트)으로 진입해도 초기화된다
- [ ] 캐러셀 노트를 여러 번 왕복해도 리스너가 누적되지 않는다 (DevTools에서 확인)
- [ ] 다크모드에서 화살표·도트 대비가 적절하다
- [ ] 모바일에서 스와이프가 동작한다
- [ ] 알 수 없는 옵션(`autoplay: true` 등)이 포함돼도 빌드가 성공한다
- [ ] `images`가 비어 있거나 형식이 깨진 블록이 있어도 빌드가 성공한다
- [ ] 동일 노트가 Obsidian 미리보기에서도 정상 렌더링된다

---

## 7. 알려진 리스크

| 항목 | 영향 | 완화책 |
| --- | --- | --- |
| 두 구현의 문법 드리프트 | Obsidian에서만 되는 옵션 발생 | 미지원 키 무시 원칙, 지원 범위 문서화 |
| `xhuajin/obsidian-carousel` 유지보수 저조 | 최종 릴리스 2024-10 | 문법만 의존하므로 플러그인이 죽어도 웹 출력은 무사 |
| 라이선스 부재 | 코드 복사 시 법적 리스크 | 명세만 참고, 구현은 독자 작성 |
| Quartz 5 플러그인 API 변동 | v5가 비교적 신규 | `@quartz-community/types` 버전 고정, `quartz.lock.json` 관리 |
| Embla 번들 크기 | 초기 로드 증가 | v1 검증 후 필요 시 순수 CSS scroll-snap으로 대체 검토 |

---

## 8. 폴백 옵션

Embla + 트랜스포머 구성이 과하다고 판단되면, **CSS scroll-snap만으로도** 스와이프 가능한 캐러셀이 성립한다. 콜아웃(`> [!carousel]`) 안에 이미지를 넣고 CSS 20줄이면 끝나며, 빌드 파이프라인을 전혀 건드리지 않는다. 화살표 버튼과 도트 인디케이터가 필요 없다면 이쪽이 유지보수 비용이 훨씬 낮다.

단, 이 방식은 Obsidian 플러그인과 문법이 다르므로 3장의 문법 계약과는 별개 트랙이다.

---

## 9. 참고 자료

- Quartz 5 — 플러그인 제작: https://quartz.jzhao.xyz/advanced/making-plugins
- Quartz 5 — 컴포넌트 플러그인: https://quartz.jzhao.xyz/advanced/creating-components
- Quartz 5 — 설정: https://quartz.jzhao.xyz/configuration
- 문법 참조 (구현 참조 아님): https://github.com/xhuajin/obsidian-carousel
- v4 구조 참고 (SPA·경로 처리는 재작성 필요): https://gist.github.com/pinei/14545e81e8629eed72b55fce1cbd7822
- Embla Carousel: https://www.embla-carousel.com/

---

## 10. 다음 작업

1. 플러그인 템플릿으로 저장소 스캐폴딩
2. `parse.ts` 구현 + 단위 테스트 (특히 미지원 키·깨진 입력)
3. 트랜스포머 mdast 변환 구현 → **중첩 경로 검증 최우선**
4. Embla 초기화 스크립트 + SPA 정리 훅
5. SCSS 작성 (Quartz CSS 변수 기반)
6. `dist/` 빌드 후 커밋, 실제 사이트에 설치해 6장 체크리스트 수행
