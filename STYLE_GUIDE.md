# haejunhyun.com 스타일 가이드

> Quartz v4 기본 테마에서 커스텀한 모든 변경 사항을 정리한 문서입니다.
> 이 문서만 읽으면 앞으로 혼자 수정·확장할 수 있도록 작성했습니다.

---

## 목차

1. [프로젝트 구조](#1-프로젝트-구조)
2. [로컬 개발 환경](#2-로컬-개발-환경)
3. [설정 파일 — quartz.config.ts](#3-설정-파일--quartzconfigts)
4. [레이아웃 — quartz.layout.ts](#4-레이아웃--quartzlayoutts)
5. [커스텀 컴포넌트](#5-커스텀-컴포넌트)
6. [스타일시트 — custom.scss](#6-스타일시트--customscss)
7. [컬러 시스템](#7-컬러-시스템)
8. [마크다운 작성 팁](#8-마크다운-작성-팁)
9. [배포 워크플로우](#9-배포-워크플로우)
10. [자주 하는 수정 패턴](#10-자주-하는-수정-패턴)

---

## 1. 프로젝트 구조

```
haejunhyun.com/
├── content/                  ← Obsidian vault (실제 글 작성 위치)
│   ├── index.md              ← 홈 화면 내용
│   ├── computer-science/
│   ├── data-engineering/
│   ├── data-science/
│   ├── gis/
│   ├── programming/
│   ├── finance-property/
│   └── tools/
│
├── quartz.config.ts          ← ★ 폰트·컬러·플러그인 설정
├── quartz.layout.ts          ← ★ 레이아웃 구조 (어디에 무엇을 배치할지)
│
├── quartz/
│   ├── components/           ← UI 컴포넌트 (TSX)
│   │   ├── BackToTop.tsx          ← [커스텀] 맨 위로 버튼
│   │   ├── ImageLightbox.tsx      ← [커스텀] 이미지 클릭 확대
│   │   ├── PrevNext.tsx           ← [커스텀] 이전/다음 글 탐색
│   │   ├── ReadingProgress.tsx    ← [커스텀] 스크롤 진행률 바
│   │   ├── RecentNotesForIndex.tsx← [커스텀] 홈 화면 카드 그리드
│   │   ├── ShareButtons.tsx       ← [커스텀] 공유 버튼 (현재 미사용)
│   │   ├── SocialLinks.tsx        ← [커스텀] 사이드바 소셜 링크
│   │   ├── scripts/               ← 컴포넌트에 붙는 브라우저 JS
│   │   └── styles/                ← 컴포넌트별 SCSS
│   │
│   ├── styles/
│   │   ├── base.scss             ← Quartz 기본 스타일 (수정 X)
│   │   ├── custom.scss           ← ★ 모든 커스텀 CSS 작성 위치
│   │   └── variables.scss        ← 반응형 브레이크포인트 변수
│   │
│   ├── i18n/locales/ko-KR.ts    ← 한국어 UI 레이블 (현재 en-US 사용)
│   └── util/og.tsx              ← OG 이미지 레이아웃
│
└── public/                   ← 빌드 결과물 (자동 생성, 직접 수정 X)
```

---

## 2. 로컬 개발 환경

```bash
# Node.js v20 필수 (nvm 사용 권장)
nvm use 20

# 개발 서버 실행 (localhost:8080)
npx quartz build --serve

# 빌드만 (배포용)
npx quartz build
```

> ⚠️ Node v25에서도 빌드는 되지만, 공식 권장은 v20 LTS입니다.

---

## 3. 설정 파일 — quartz.config.ts

Quartz 기본값과 현재 설정의 차이입니다.

### 3.1 폰트

| 항목 | Quartz 기본값 | 현재 설정 | 적용 위치 |
|---|---|---|---|
| `header` | `"Schibsted Grotesk"` | `"Nanum Myeongjo"` | h1~h3, 사이트 제목 |
| `body` | `"Source Sans Pro"` | `"Noto Sans KR"` | 본문 전체 |
| `code` | `"IBM Plex Mono"` | `"JetBrains Mono"` | 코드블록 |

**폰트 변경 방법:**
```ts
// quartz.config.ts
typography: {
  header: "원하는 구글폰트명",
  body:   "원하는 구글폰트명",
  code:   "원하는 구글폰트명",
}
```

### 3.2 로케일

```ts
// 기본값: "en-US"
// 현재: "en-US" (날짜 형식: Jun 5, 2026)
locale: "en-US",

// "ko-KR"로 바꾸면: 날짜가 "2026년 6월 5일"로 표시되지만 줄바뀜 발생
```

### 3.3 컬러 팔레트

`secondary` 값 하나만 바꾸면 링크·태그·코드블록 선·callout 등 포인트 컬러가 전부 연동됩니다.

```ts
// quartz.config.ts > colors.lightMode
secondary: "#3d6b8e",  // ← 이 값만 바꾸면 전체 포인트 컬러 변경
```

**추천 대체 컬러:**
| 컬러 | 코드 | 분위기 |
|---|---|---|
| Slate Blue (현재) | `#3d6b8e` | 차분한 기술 블로그 |
| Bright Blue | `#2563eb` | 모던 테크 |
| Burnt Orange | `#d44000` | 따뜻한 joshwcomeau 스타일 |
| Emerald Green | `#059669` | 자연/환경 |

### 3.4 코드 하이라이팅

```ts
Plugin.SyntaxHighlighting({
  theme: {
    light: "github-light",  // 변경 가능한 값들:
    dark:  "github-dark",   // "min-light", "catppuccin-latte", "one-light"
  },
  keepBackground: false,    // false = custom.scss 배경색 사용
})
```

---

## 4. 레이아웃 — quartz.layout.ts

### 4.1 타입 구조 이해

```
PageLayout   = beforeBody + left + right   (개별 페이지)
SharedLayout = head + header + afterBody + footer  (모든 페이지 공통)

⚠️ afterBody는 SharedLayout 전용입니다.
   PageLayout에 afterBody를 추가하면 TypeScript 오류가 발생합니다.
```

### 4.2 현재 레이아웃 배치도

```
┌─────────────────────────────────────────────────────┐
│  HEAD (SEO, 폰트, OG 이미지 메타태그)                │
├──────────────────────────────────────────────────────┤
│  HEADER (현재 비어있음)                              │
├──────────────┬────────────────────┬──────────────────┤
│  LEFT        │  BEFORE BODY       │  RIGHT           │
│  PageTitle   │  Breadcrumbs       │  Graph           │
│  SocialLinks │  ArticleTitle      │  TableOfContents │
│  Search      │  ContentMeta       │  Backlinks       │
│  Darkmode    │  TagList           │                  │
│  Explorer    │                    │                  │
│              │  [본문 Article]    │                  │
│              │                    │                  │
│              │  AFTER BODY (공통) │                  │
│              │  ReadingProgress   │                  │
│              │  BackToTop         │                  │
│              │  ImageLightbox     │                  │
│              │  PrevNext          │                  │
│              │  RecentNotes(홈만) │                  │
│              │  Comments (Giscus) │                  │
├──────────────┴────────────────────┴──────────────────┤
│  FOOTER                                              │
└──────────────────────────────────────────────────────┘
```

### 4.3 새 컴포넌트 추가하는 방법

```ts
// 1. quartz.layout.ts 상단에 import 추가
import MyComponent from "./quartz/components/MyComponent"

// 2. 원하는 슬롯에 배치
export const sharedPageComponents: SharedLayout = {
  afterBody: [
    MyComponent(),  // 모든 페이지에 표시
    ...
  ],
}

// 또는 특정 페이지 레이아웃에
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [MyComponent(), ...],  // 제목 위
  left: [MyComponent(), ...],        // 왼쪽 사이드바
  right: [MyComponent(), ...],       // 오른쪽 사이드바
}
```

---

## 5. 커스텀 컴포넌트

### 5.1 컴포넌트 목록

| 컴포넌트 | 파일 | 기능 | 표시 위치 |
|---|---|---|---|
| `SocialLinks` | `SocialLinks.tsx` | GitHub/LinkedIn/Instagram 아이콘 링크 | 왼쪽 사이드바 |
| `RecentNotesForIndex` | `RecentNotesForIndex.tsx` | 최신 6개 카드 그리드 | **홈 페이지 전용** |
| `PrevNext` | `PrevNext.tsx` | 같은 폴더 내 이전/다음 글 | 글 하단 |
| `ReadingProgress` | `ReadingProgress.tsx` | 상단 스크롤 진행률 바 | 모든 페이지 |
| `BackToTop` | `BackToTop.tsx` | 맨 위로 버튼 (스크롤 300px↑ 표시) | 모든 페이지 |
| `ImageLightbox` | `ImageLightbox.tsx` | 이미지 클릭 시 확대 오버레이 | 모든 페이지 |

### 5.2 RecentNotesForIndex — 홈 카드 그리드

홈 화면에서만 렌더링됩니다 (`fileData.slug === "index"` 체크).

**카드 구성 요소:**
- 상단 컬러 바 (카테고리별 고유 색상)
- 카테고리명 (COMPUTER SCIENCE / DATA ENGINEERING 등)
- 날짜
- 글 제목
- 설명 (본문 첫 문장 자동 추출, 2줄 클램프)
- 태그 (최대 3개)

**카테고리 컬러 맵 수정:**
```ts
// quartz/components/RecentNotesForIndex.tsx
const CATEGORY_NAMES: Record<string, string> = {
  "computer-science":  "Computer Science",  // 슬러그: 표시명
  "data-engineering":  "Data Engineering",
  // 새 카테고리 추가 시 여기에 추가
}
```

```scss
/* quartz/components/styles/recentNotes.scss */
.note-card {
  &[data-category="computer-science"]  { --cat-color: #3d6b8e; }
  &[data-category="data-engineering"]  { --cat-color: #2e7d62; }
  /* 새 카테고리 추가 시 여기에 추가 */
}
```

**표시 개수 변경:**
```ts
// quartz.layout.ts
RecentNotesForIndex({
  limit: 6,        // 원하는 숫자로 변경 (3의 배수 권장)
  showTags: true,
})
```

### 5.3 PrevNext — 이전/다음 글

같은 폴더 내 파일만 대상 (날짜 오름차순 기준).

```
computer-science/algorithm/dfs-bfs.md  → 같은 폴더: kde.md, balltree.md 등
computer-science/data-structure/...   → 별도 폴더로 분리됨
```

홈(`index`) 슬러그에서는 자동으로 숨겨집니다.

### 5.4 새 컴포넌트 만드는 패턴

```tsx
// quartz/components/MyComponent.tsx

// @ts-ignore  ← 인라인 스크립트 import 시 필요
import myScript from "./scripts/myComponent.inline"
import style from "./styles/myComponent.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const MyComponent: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  // 특정 페이지에서만 표시하려면:
  if (fileData.slug === "index") return <></>

  return <div class="my-component">내용</div>
}

MyComponent.css = style                  // SCSS 적용
MyComponent.beforeDOMLoaded = myScript  // JS 스크립트 삽입

export default (() => MyComponent) satisfies QuartzComponentConstructor
```

```ts
// quartz/components/scripts/myComponent.inline.ts
document.addEventListener("nav", () => {  // ← SPA 페이지 전환 대응
  const el = document.querySelector(".my-component")
  if (!el) return

  // 이벤트 리스너 등록
  el.addEventListener("click", handler)
  window.addCleanup(() => el.removeEventListener("click", handler))  // ← 반드시 cleanup
})
```

---

## 6. 스타일시트 — custom.scss

**⚠️ 첫 줄 `@use "base"` 절대 삭제 금지.**
없으면 Quartz 3컬럼 grid가 무너져 단컬럼으로 렌더링됩니다.

### 6.1 파일 구조

```scss
@use "base";   // ← 절대 삭제 금지

// 1. Typography     — h1~h3, p, a, strong
// 2. Code Blocks    — 행 번호 숨김, 언어 배지, pre/code 스타일
// 3. KaTeX          — 수식 블록
// 4. Callouts       — > [!note], > [!tip] 등
// 5. Tags           — a.tag-link 태그 칩
// 6. PageTitle      — 사이트 제목 크기/색상
// 7. Explorer       — 사이드바 폴더/파일 트리
// 8. TOC/Backlinks  — 목차, 백링크 링크 스타일
// 9. Table          — 테이블 카드 스타일
// 10. Card List     — 폴더/태그 목록 페이지
// 11. Utilities     — hr, 이미지 캡션, 스크롤바
```

### 6.2 CSS 변수 참조 (quartz.config.ts에서 설정)

| 변수 | 사용처 |
|---|---|
| `var(--light)` | 페이지 배경 |
| `var(--lightgray)` | 구분선, 테두리, 코드 배경 |
| `var(--gray)` | 날짜·메타 텍스트, 비활성 요소 |
| `var(--darkgray)` | 본문 텍스트 |
| `var(--dark)` | 제목(h1~h3), 강조 텍스트 |
| `var(--secondary)` | ★ 포인트 컬러 — 링크, 태그, 선 등 |
| `var(--tertiary)` | secondary hover 색상 |
| `var(--headerFont)` | header 폰트 (Nanum Myeongjo) |
| `var(--bodyFont)` | body 폰트 (Noto Sans KR) |
| `var(--codeFont)` | code 폰트 (JetBrains Mono) |

### 6.3 주요 CSS 변경 사항 (Quartz 기본 대비)

**코드블록 — 행 번호 숨김**
```scss
/* Quartz 기본: 모든 코드 줄에 번호 표시 */
/* 현재: 숨김 */
pre > code > [data-line]::before {
  display: none;
}
```

**코드블록 — 언어 배지**
```scss
/* Quartz 기본: 없음 */
/* 현재: 우상단에 언어명 자동 표시 (python, sql 등) */
pre[data-language]::before {
  content: attr(data-language);
  position: absolute;
  top: 0.45rem; right: 0.7rem;
  /* ... */
}
```

**제목 하단 구분선 — h2만 적용**
```scss
/* Quartz 기본: 없음 */
/* 현재: h2에만 하단 구분선 */
h2 {
  border-bottom: 1.5px solid var(--lightgray);
}
```

**사이드바 링크 스타일**
```scss
/* Quartz 기본: article a {}로 전체 a에 스타일 적용 → 사이드바까지 오염 */
/* 현재: article a {}로 범위 한정 */
article a {
  color: var(--secondary);
  border-bottom: 1px solid transparent;
  &:hover { border-bottom-color: var(--secondary); }
}
```

**Explorer 폴더 아이콘**
```scss
/* Quartz 기본: SVG 폴더 아이콘 */
/* 현재: 이모지 (📁 닫힘 / 📂 열림) */
.folder-button .folder-title::before { content: "📁 "; }
.folder-container:has(+ .folder-outer.open) .folder-title::before { content: "📂 "; }
```

---

## 7. 컬러 시스템

### 7.1 Light Mode 팔레트

```
#fafaf8  light       → 페이지 배경 (따뜻한 오프화이트)
#e8e4de  lightgray   → 구분선, 테두리 (베이지 계열)
#a09890  gray        → 날짜, 메타 (따뜻한 회갈색)
#3d3833  darkgray    → 본문 텍스트 (따뜻한 다크브라운)
#1a1612  dark        → 제목 텍스트 (거의 검정에 가까운 브라운)
#3d6b8e  secondary   → ★ 포인트 컬러 (Slate Blue)
#6a9ab8  tertiary    → hover/그래프 보조 (secondary 밝은 버전)
```

### 7.2 카드 카테고리 컬러

```
computer-science   #3d6b8e  Slate Blue    (= secondary)
data-engineering   #2e7d62  Teal Green
data-science       #6b5ea8  Muted Purple
gis                #b5722a  Warm Amber
programming        #c0554a  Muted Red
finance-property   #3a7a5a  Forest Green
tools              #7a8090  Steel Gray
```

---

## 8. 마크다운 작성 팁

### 8.1 Callout 문법

```markdown
> [!note] 제목 (선택)
> 내용

> [!tip]
> 팁 내용

> [!warning]
> 경고

> [!summary]
> 요약 블록 (파란 테두리 강조)
```

지원 타입: `note` `tip` `warning` `danger` `info` `success` `question` `failure` `bug` `example` `quote` `summary`

### 8.2 코드블록 — 언어 + 파일명

````markdown
```python title="main.py"
def hello():
    print("Hello")
```

```sql title="query.sql"
SELECT * FROM users;
```
````

- **언어명**: 코드블록 우상단에 자동 배지 표시
- **title**: 코드블록 상단에 파일명 탭 표시

### 8.3 수식

```markdown
인라인: $E = mc^2$

블록:
$$
\int_0^\infty f(x) \, dx
$$
```

### 8.4 이미지

```markdown
![설명|600](이미지.png)   ← 너비 600px
*캡션 텍스트*              ← 이탤릭 텍스트가 자동으로 캡션 스타일 적용
```

이미지 클릭 시 자동으로 Lightbox 확대됩니다.

### 8.5 내부 링크

```markdown
[[다른-노트]]              ← 내부 링크
[[다른-노트|표시할 이름]]  ← 별칭 링크
![[다른-노트]]             ← 해당 노트 내용 삽입 (트랜스클루전)
```

---

## 9. 배포 워크플로우

```bash
# 1. content/ 에서 글 작성 후

# 2. 빌드
npx quartz build

# 3. 커밋 & 푸시
git add quartz/ quartz.config.ts quartz.layout.ts  # 소스 파일
git add public/                                     # 빌드 결과물
git commit -m "Update: YYYY-MM-DD"
git push origin v4
```

GitHub Pages는 `public/` 폴더를 자동으로 서빙합니다.

---

## 10. 자주 하는 수정 패턴

### 포인트 컬러 바꾸기 (1분)

```ts
// quartz.config.ts
secondary: "#여기만_변경",   // lightMode
// darkMode의 secondary도 함께 변경 권장
```

### 홈 화면 카드 개수 바꾸기

```ts
// quartz.layout.ts
RecentNotesForIndex({ limit: 6 })  // 3의 배수 권장 (3×N 그리드)
```

### 새 카테고리 추가 시 카드 컬러 등록

```ts
// quartz/components/RecentNotesForIndex.tsx
const CATEGORY_NAMES = {
  "new-category": "New Category",  // 추가
}
```

```scss
/* quartz/components/styles/recentNotes.scss */
.note-card {
  &[data-category="new-category"] { --cat-color: #원하는색상; }
}
```

### 폰트 바꾸기

```ts
// quartz.config.ts
typography: {
  header: "새 폰트명",  // Google Fonts에서 찾기
  body:   "새 폰트명",
}
```

```scss
/* quartz/styles/custom.scss 에서 font-family 오버라이드도 확인 */
h1, h2, h3 { font-family: var(--headerFont); }
p           { font-family: var(--bodyFont); }
```

### 코드블록 문법 하이라이팅 테마 바꾸기

```ts
// quartz.config.ts
Plugin.SyntaxHighlighting({
  theme: {
    light: "catppuccin-latte",   // github-light / min-light / one-light
    dark:  "catppuccin-mocha",   // github-dark / tokyo-night / dracula
  },
})
```

### TOC/Backlinks 링크에 하단선 없애기

```scss
/* quartz/styles/custom.scss — 이미 적용됨 */
.toc li a, .backlinks ul li a {
  border-bottom: none !important;
}
```

---

## 알려진 이슈

| 이슈 | 원인 | 해결 |
|---|---|---|
| 레이아웃 단컬럼 붕괴 | `custom.scss`에서 `@use "base"` 삭제 | 첫 줄에 반드시 `@use "base"` 유지 |
| `afterBody`에 TypeScript 오류 | `PageLayout`에는 `afterBody` 없음 | `SharedLayout`(sharedPageComponents)에 배치 |
| Explorer 이모지 구버전 브라우저 오류 | CSS `:has()` 미지원 | `quartz/components/scripts/explorer.inline.ts`에 JS로 처리 필요 |
| 새 컴포넌트 스크립트가 SPA 전환 후 미작동 | `nav` 이벤트 미청취 | 스크립트를 `document.addEventListener("nav", () => {...})` 안에 작성 |
