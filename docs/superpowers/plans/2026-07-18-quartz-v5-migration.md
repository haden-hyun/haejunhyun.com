# Quartz v4 → v5 마이그레이션 실행 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** haejunhyun.com 블로그를 Quartz 4.5.2에서 v5로 업그레이드한다 — 로컬 테스트 폴더에서 완성 후 본 레포 `v5` 브랜치로 이식, Cloudflare 프로덕션 전환 (스펙: `docs/superpowers/specs/2026-07-18-quartz-v5-migration-design.md`).

**Architecture:** v5는 YAML 설정(`quartz.config.yaml`) + 커뮤니티 플러그인(`npx quartz plugin add`) + 로컬 플러그인 구조. 기존 커스텀 7종은 로컬 플러그인으로 재작성하고, 코어 수정분은 플러그인 옵션/`quartz.ts` 오버라이드로 흡수한다. 배포는 기존 방식(로컬 빌드 → `public/` 커밋 → Cloudflare 서빙) 유지.

**Tech Stack:** Node v22.16.0, Quartz v5, Preact/TSX, SCSS, Cloudflare, giscus, GoatCounter

## Global Constraints

- 운영 중인 v4 사이트는 Task 12 이전까지 절대 건드리지 않는다 (본 레포 v4 브랜치 read-only).
- 테스트 폴더: `~/Developer/haejunhyun-v5-test`. content는 심링크가 아닌 스냅샷 복사본 사용.
- 디자인 정체성 유지: header "Nanum Myeongjo" / body "Noto Sans KR" / code "JetBrains Mono", secondary `#3d6b8e` (Slate Blue), light `#fafaf8`.
- giscus 설정 유지: repo `haden-hyun/haejunhyun.com`, repoId `R_kgDONbw-1g`, category `Announcements`, categoryId `DIC_kwDONbw-1s4Cky-B`.
- ShareButtons는 이관하지 않는다 (레이아웃 미사용).
- 사용자 결정: 커스텀 이관은 우선순위 없이 진행, 전수 검증 게이트 없음 (빌드 성공 + 육안 확인만).
- v5 로컬 플러그인의 정확한 API는 Task 2에서 확보한 실제 v5 코드(`@quartz-community/types`, 설치된 커뮤니티 플러그인 소스)가 단일 기준이다. 이 계획의 스켈레톤 코드와 실제 API가 다르면 **실제 API를 따른다**.
- 커밋: 테스트 폴더는 자체 로컬 git으로 태스크마다 커밋. 본 레포는 Task 12부터.

---

### Task 1: Phase 0 — 백업 및 기준선 확보

**Files:**
- Create: `~/Developer/quartz-v5-migration-backup/content/` (레포 밖 백업)
- Create: `~/Developer/quartz-v5-migration-backup/sitemap-v4.xml`

**Interfaces:**
- Produces: content 스냅샷 백업 경로 `~/Developer/quartz-v5-migration-backup/content` (Task 2가 복사 원본으로 사용)

- [ ] **Step 1: content 스냅샷 백업 (심링크 역참조)**

```bash
mkdir -p ~/Developer/quartz-v5-migration-backup
cp -RL /Users/haejun/Developer/haejunhyun.com/content ~/Developer/quartz-v5-migration-backup/content
ls ~/Developer/quartz-v5-migration-backup/content
```

Expected: `_headers attachments computer-science data-engineering data-science finance-property gis index.md programming tools` 수준의 목록.

- [ ] **Step 2: 현재 sitemap 기준선 저장**

```bash
cp /Users/haejun/Developer/haejunhyun.com/public/sitemap.xml ~/Developer/quartz-v5-migration-backup/sitemap-v4.xml
grep -c "<loc>" ~/Developer/quartz-v5-migration-backup/sitemap-v4.xml
```

Expected: 페이지 수(숫자) 출력. 이 수치를 기록해 둔다.

- [x] **Step 3: Cloudflare 설정 확인 — 완료 (2026-07-18 사용자 확인)**

확인됨: 프로덕션 브랜치 `v4`, 빌드 출력 디렉토리 `public`. Task 16에서 이 설정을 전제로 전환한다.

---

### Task 2: v5 테스트 환경 구축 + v5 API 정찰

**Files:**
- Create: `~/Developer/haejunhyun-v5-test/` (v5 프로젝트 루트)

**Interfaces:**
- Consumes: Task 1의 content 백업
- Produces: 빌드 가능한 순정 v5 프로젝트. `quartz.config.yaml`(템플릿 생성본), `.quartz/plugins/`(커뮤니티 플러그인 소스 = 로컬 플러그인 작성 기준 API), 로컬 git 저장소

- [ ] **Step 1: v5 클론 및 설치**

```bash
cd ~/Developer
git clone -b v5 https://github.com/jackyzha0/quartz.git haejunhyun-v5-test
cd haejunhyun-v5-test
npm i
```

Expected: 에러 없이 설치 완료. (`npx quartz create`가 대화형이면 템플릿은 **obsidian** 선택.)

- [ ] **Step 2: 초기 설정 및 content 스냅샷 투입**

```bash
cd ~/Developer/haejunhyun-v5-test
npx quartz create
# 프롬프트: 템플릿 = obsidian, 콘텐츠 전략 = Copy → ~/Developer/quartz-v5-migration-backup/content 지정
# Copy 옵션이 없거나 실패하면 수동 복사:
rm -rf content && cp -R ~/Developer/quartz-v5-migration-backup/content content
```

- [ ] **Step 3: 순정 상태 빌드 확인 (커스텀 이관 전 기준선)**

```bash
npx quartz plugin install
npx quartz build
```

Expected: 빌드 성공, `public/` 생성. 실패 시 원인은 우리 커스텀이 아닌 v5×콘텐츠 호환성 문제이므로 여기서 먼저 해결한다 (frontmatter 파싱 문제면 `note-properties` 플러그인 설치 확인).

- [ ] **Step 4: v5 API 정찰 — 로컬 플러그인 작성 기준 확보**

```bash
ls .quartz/plugins/
cat quartz.config.yaml
```

`.quartz/plugins/` 안의 컴포넌트형 플러그인 하나(예: explorer)의 `src/index.ts`, `package.json`을 읽고 다음을 기록한다:
1. 컴포넌트 플러그인의 팩토리 함수 시그니처와 `@quartz-community/types` 임포트 방식
2. css / beforeDOMLoaded / afterDOMLoaded 스크립트 첨부 방식 (v4의 `Component.css = style` 패턴이 어떻게 바뀌었는지)
3. `quartz.config.yaml`에서 로컬 플러그인을 참조하는 방법 (예: `source: ./plugins/<name>` 형태 — 실제 문법 확인)
4. 레이아웃 position/condition 선언 문법

이 기록을 `~/Developer/haejunhyun-v5-test/MIGRATION-NOTES.md`로 저장한다. **Task 5~10은 이 파일을 먼저 읽고 시작한다.**

- [ ] **Step 5: 테스트 폴더 체크포인트 커밋**

```bash
git checkout -b migration
git add -A && git commit -m "chore: v5 baseline + content snapshot"
```

---

### Task 3: 설정 이관 — quartz.config.yaml + 커뮤니티 플러그인 + 레이아웃

**Files:**
- Modify: `~/Developer/haejunhyun-v5-test/quartz.config.yaml`

**Interfaces:**
- Consumes: Task 2의 순정 yaml, MIGRATION-NOTES.md의 레이아웃 문법
- Produces: 테마·플러그인·레이아웃이 선언된 `quartz.config.yaml` (Task 5~10이 이 파일에 로컬 플러그인 항목을 추가)

- [ ] **Step 1: 커뮤니티 플러그인 설치**

```bash
cd ~/Developer/haejunhyun-v5-test
for p in note-properties obsidian-flavored-markdown explorer graph search darkmode breadcrumbs backlinks table-of-contents latex custom-og-images alias-redirects comments recent-notes; do
  npx quartz plugin add "github:quartz-community/$p" || echo "MISSING: $p"
done
```

Expected: 대부분 설치 성공. `MISSING`으로 표시된 것은 `npx quartz tui`(레지스트리 검색)에서 정확한 이름을 찾아 재시도. 템플릿에 이미 포함된 플러그인은 중복 설치하지 않는다.

- [ ] **Step 2: configuration 섹션 이관**

`quartz.config.yaml`의 configuration을 다음 값으로 수정 (키 이름은 템플릿 생성본의 실제 스키마를 따르되 값은 아래 그대로):

```yaml
configuration:
  pageTitle: "☀️ haejun"
  enableSPA: true
  enablePopovers: true
  analytics:
    provider: google
    tagId: G-6XY03WD2ST
  locale: en-US
  baseUrl: haejunhyun.com
  ignorePatterns: ["private", "templates", ".obsidian"]
  defaultDateType: published
  theme:
    fontOrigin: googleFonts
    cdnCaching: true
    typography:
      header: Nanum Myeongjo
      body: Noto Sans KR
      code: JetBrains Mono
    colors:
      lightMode:
        light: "#fafaf8"
        lightgray: "#e8e4de"
        gray: "#a09890"
        darkgray: "#3d3833"
        dark: "#1a1612"
        secondary: "#3d6b8e"
        tertiary: "#6a9ab8"
        highlight: "rgba(61,107,142,0.10)"
        textHighlight: "#fde68a88"
      darkMode:
        light: "#1a1e24"
        lightgray: "#2a3040"
        gray: "#5a6478"
        darkgray: "#b8c4d4"
        dark: "#e8edf5"
        secondary: "#7aaed4"
        tertiary: "#9cc4e4"
        highlight: "rgba(122,174,212,0.15)"
        textHighlight: "#b3aa0288"
```

주의: v5 스키마가 lightMode/darkMode 구분 없이 단일 colors 맵이면 MIGRATION-NOTES.md에 기록된 실제 스키마에 맞춰 값만 이식한다.

- [ ] **Step 3: 플러그인 옵션 + 레이아웃 선언**

각 플러그인 항목에 v4 대응 옵션과 위치를 선언한다 (문법은 MIGRATION-NOTES.md 기준):

- created-modified-date(또는 내장): `priority: [frontmatter, git, filesystem]`
- syntax highlighting: `theme: {light: catppuccin-latte, dark: github-dark}`, `keepBackground: true`
- latex: `renderEngine: katex`
- crawl-links(또는 내장): `markdownLinkResolution: shortest`
- comments: `provider: giscus`, repo/repoId/category/categoryId는 Global Constraints 값
- 레이아웃 배치 목표 (v4 quartz.layout.ts와 동일):
  - left: PageTitle → (VisitorCounter) → (SocialLinks) → Search → Darkmode → Explorer(desktop-only)
  - beforeBody: Breadcrumbs → ArticleTitle → ContentMeta → TagList
  - right: Graph → TableOfContents(desktop-only) → Backlinks
  - afterBody: (ReadingProgress) → (BackToTop) → (ImageLightbox) → (PrevNext) → (RecentNotesForIndex) → Comments
  - 괄호 항목은 Task 5~10에서 로컬 플러그인 완성 후 추가된다.

- [ ] **Step 4: 빌드 + 프리뷰 확인**

```bash
npx quartz build --serve
```

Expected: 빌드 성공. localhost:8080에서 폰트(명조 헤딩/고딕 본문), Slate Blue 링크, Explorer/Graph/Search/다크모드/giscus 동작 육안 확인.

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: v4 설정 이관 (테마/플러그인/레이아웃)"
```

---

### Task 4: 로컬 플러그인 스캐폴드 규약 확립 + SocialLinks 이관

**Files:**
- Create: `~/Developer/haejunhyun-v5-test/plugins/social-links/` (index.ts, styles.scss 등 — 구조는 MIGRATION-NOTES.md의 실제 규약)
- Modify: `~/Developer/haejunhyun-v5-test/quartz.config.yaml` (플러그인 등록)
- 원본: 본 레포 `quartz/components/SocialLinks.tsx`(45줄), `quartz/components/styles/socialLinks.scss`(68줄)

**Interfaces:**
- Consumes: MIGRATION-NOTES.md의 컴포넌트 플러그인 API
- Produces: **로컬 플러그인 폴더 규약** `plugins/<kebab-name>/` — Task 5~10이 동일 구조를 복제해 사용. SocialLinks 옵션 시그니처: `{ links: { name: string, url: string, icon: string }[] }` (v4와 동일)

- [ ] **Step 1: v4 원본 확보**

```bash
cd ~/Developer/haejunhyun-v5-test && mkdir -p plugins/social-links
cp /Users/haejun/Developer/haejunhyun.com/quartz/components/SocialLinks.tsx /tmp/v4-SocialLinks.tsx
cp /Users/haejun/Developer/haejunhyun.com/quartz/components/styles/socialLinks.scss plugins/social-links/styles.scss
```

- [ ] **Step 2: v5 로컬 플러그인으로 재작성**

`.quartz/plugins/`의 컴포넌트 플러그인(예: explorer) `src/index.ts`를 골격으로 삼아, v4 SocialLinks의 JSX(GitHub/LinkedIn/Instagram 링크 리스트 렌더링 — 링크 3개 데이터는 v4 `quartz.layout.ts:80-97`에서 복사)를 이식한다. 스크립트 없음, css만 첨부하는 가장 단순한 케이스라 규약 확립용 1번 타자로 적합하다.

- [ ] **Step 3: 설정 등록 + 빌드 확인**

`quartz.config.yaml`에 로컬 플러그인 등록(문법은 MIGRATION-NOTES.md, 예: `source: ./plugins/social-links`), 위치는 left의 Darkmode 앞. 이후:

```bash
npx quartz build --serve
```

Expected: 좌측 사이드바에 소셜 아이콘 3개 렌더링, 클릭 시 새 탭 이동.

- [ ] **Step 4: 규약을 MIGRATION-NOTES.md에 기록 후 커밋**

작동이 확인된 최종 폴더 구조·등록 문법을 MIGRATION-NOTES.md에 "로컬 플러그인 규약" 섹션으로 추가.

```bash
git add -A && git commit -m "feat: SocialLinks 로컬 플러그인 이관 (스캐폴드 규약 확립)"
```

---

### Task 5: RecentNotesForIndex 이관

**Files:**
- Create: `plugins/recent-notes-index/` | 원본: `quartz/components/RecentNotesForIndex.tsx`(115줄), `quartz/components/styles/recentNotes.scss`(수정본)

**Interfaces:**
- Consumes: Task 4의 로컬 플러그인 규약 (MIGRATION-NOTES.md)
- Produces: 옵션 `{ limit: number, showTags: boolean }` (v4 기본값 limit 6). **index 페이지에서만 렌더링** — v5 레이아웃의 `condition` 기능(예: index-only)이 있으면 그것을 쓰고, 없으면 v4처럼 컴포넌트 내부에서 `fileData.slug === "index"` 가드.

- [ ] **Step 1:** 규약대로 `plugins/recent-notes-index/` 생성, v4 소스의 정렬 로직(modified→created fallback)·태그 표시·`resolveRelative` 링크 생성을 이식. v5에서 `allFiles`/`QuartzPluginData` 대응 API는 설치된 recent-notes 커뮤니티 플러그인 소스를 참조. **커뮤니티 recent-notes가 limit/showTags/index-only를 모두 지원하면 재구현 대신 그것을 채택하고 이 태스크는 옵션 설정으로 종료.**
- [ ] **Step 2:** yaml 등록 (afterBody, PrevNext 뒤·Comments 앞) → `npx quartz build --serve` → index 페이지에만 최근 글 6개+태그 확인, 일반 글 페이지에는 없음 확인.
- [ ] **Step 3:** `git add -A && git commit -m "feat: RecentNotesForIndex 이관"`

---

### Task 6: PrevNext 이관

**Files:**
- Create: `plugins/prev-next/` | 원본: `quartz/components/PrevNext.tsx`(53줄), `quartz/components/styles/prevNext.scss`(47줄)

**Interfaces:**
- Consumes: Task 4 규약
- Produces: 옵션 없음. 같은 폴더(sibling) 글을 날짜순 정렬해 이전/다음 링크 렌더링, index 및 첫/마지막 글 가장자리 처리 포함 (로직은 v4 소스 그대로).

- [ ] **Step 1:** 규약대로 이식 (`getDate`/`resolveRelative` 대응 API는 MIGRATION-NOTES.md 참조).
- [ ] **Step 2:** yaml 등록 (afterBody) → 빌드 → 중간 순서의 글에서 이전/다음 링크, 폴더 첫 글에서 이전 없음 확인.
- [ ] **Step 3:** `git commit -m "feat: PrevNext 이관"`

---

### Task 7: ReadingProgress 이관

**Files:**
- Create: `plugins/reading-progress/` | 원본: `ReadingProgress.tsx`(13줄), `scripts/readingProgress.inline.ts`(14줄), `styles/readingProgress.scss`(11줄)

**Interfaces:**
- Consumes: Task 4 규약 (beforeDOMLoaded 스크립트 첨부 방식 포함)
- Produces: 옵션 없음. `#reading-progress-bar` 상단 진행바.

- [ ] **Step 1:** 규약대로 이식 — inline 스크립트(스크롤 진행률 계산)와 scss 첨부.
- [ ] **Step 2:** yaml 등록 → 빌드 → 긴 글 스크롤 시 상단 진행바 동작 확인. SPA 네비게이션 후에도 동작하는지 확인 (v5의 스크립트 라이프사이클 이벤트명은 MIGRATION-NOTES.md 참조 — v4의 `nav` 이벤트 대응).
- [ ] **Step 3:** `git commit -m "feat: ReadingProgress 이관"`

---

### Task 8: BackToTop 이관

**Files:**
- Create: `plugins/back-to-top/` | 원본: `BackToTop.tsx`(17줄), `scripts/backToTop.inline.ts`(15줄), `styles/backToTop.scss`(36줄)

**Interfaces:**
- Consumes: Task 4 규약
- Produces: 옵션 없음. `#back-to-top` 플로팅 버튼 (스크롤 시 표시, 클릭 시 최상단).

- [ ] **Step 1:** 규약대로 이식.
- [ ] **Step 2:** yaml 등록 → 빌드 → 스크롤 후 버튼 표시·클릭 동작 확인.
- [ ] **Step 3:** `git commit -m "feat: BackToTop 이관"`

---

### Task 9: ImageLightbox 이관

**Files:**
- Create: `plugins/image-lightbox/` | 원본: `ImageLightbox.tsx`(11줄), `scripts/imageLightbox.inline.ts`(33줄), `styles/imageLightbox.scss`(22줄)

**Interfaces:**
- Consumes: Task 4 규약
- Produces: 옵션 없음. 본문 이미지 클릭 시 라이트박스 오버레이 (DOM 렌더링 없음, 스크립트+css만).

- [ ] **Step 1:** 규약대로 이식.
- [ ] **Step 2:** yaml 등록 → 빌드 → 이미지 있는 글(attachments 사용 글)에서 클릭 확대·닫기 확인.
- [ ] **Step 3:** `git commit -m "feat: ImageLightbox 이관"`

---

### Task 10: VisitorCounter 이관

**Files:**
- Create: `plugins/visitor-counter/` | 원본: `VisitorCounter.tsx`(54줄, css 인라인 문자열), `scripts/visitorCounter.inline.ts`(39줄, GoatCounter API 호출)

**Interfaces:**
- Consumes: Task 4 규약 (afterDOMLoaded 첨부 방식)
- Produces: 옵션 없음. Today/Total 방문자 수 표시 (`#visitor-today`, `#visitor-total`).

- [ ] **Step 1:** 규약대로 이식. GoatCounter 엔드포인트는 v4 inline 스크립트의 값을 그대로 사용.
- [ ] **Step 2:** yaml 등록 (left, PageTitle 아래) → 빌드 → 숫자 로딩 확인 (localhost에서는 CORS/도메인 제약으로 `-` 표시일 수 있음 — 스크립트 에러만 없으면 통과, 실배포 후 재확인 항목으로 MIGRATION-NOTES.md에 기록).
- [ ] **Step 3:** `git commit -m "feat: VisitorCounter 이관"`

---

### Task 11: 코어 수정분 흡수 (Explorer/Footer/Head/og/ko-KR)

**Files:**
- Modify: `quartz.config.yaml`, 필요 시 `quartz.ts` 오버라이드 생성
- 참조: 본 레포의 코어 수정 diff

**Interfaces:**
- Consumes: Task 3~10 완료 상태
- Produces: v4의 코어 수정 동작이 v5에서 재현됨

- [ ] **Step 1: v4 코어 수정 내용 열람**

```bash
cd /Users/haejun/Developer/haejunhyun.com
ROOT=$(git rev-list --max-parents=0 HEAD | head -1)
git diff $ROOT HEAD -- quartz/components/Explorer.tsx quartz/components/Footer.tsx quartz/components/Head.tsx quartz/util/og.tsx quartz/i18n/locales/ko-KR.ts
```

- [ ] **Step 2: 항목별 흡수**

diff에서 확인된 각 변경을 v5 방식으로 이식:
- Explorer 수정 → explorer 플러그인 옵션 또는 `quartz.ts`의 `mapFn`류 콜백
- Footer/Head 수정 → 해당 플러그인 옵션, 옵션으로 불가능하면 로컬 플러그인으로 대체
- og.tsx 수정 → custom-og-images 플러그인 옵션
- ko-KR 수정 → v5 i18n 구조 확인 후 대응 (locale이 en-US이므로 실사용 여부 먼저 판단, 미사용이면 이관 생략하고 MIGRATION-NOTES.md에 기록)

- [ ] **Step 3:** 빌드 → 푸터 문구·OG 이미지(`public/`의 og 이미지 산출물 확인)·Explorer 동작 육안 확인 → `git commit -m "feat: 코어 수정분 흡수"`

---

### Task 12: custom.scss 스타일 이관

**Files:**
- Modify: `~/Developer/haejunhyun-v5-test/quartz/styles/custom.scss` (v5에 해당 진입점이 없으면 MIGRATION-NOTES.md에 기록된 v5 커스텀 CSS 진입점 사용)
- 원본: 본 레포 `quartz/styles/custom.scss` 319줄

**Interfaces:**
- Consumes: Task 3~11 완료 (모든 컴포넌트가 렌더링된 상태여야 선택자 검증 가능)
- Produces: v4 디자인(카드 그리드·카테고리 칩·타이포 조정 등)이 v5 HTML 위에서 재현됨

- [ ] **Step 1:** v4 `custom.scss`를 섹션 단위로 이식하되, 각 섹션의 선택자가 v5 HTML 구조에 존재하는지 빌드된 `public/index.html` 등에서 grep으로 확인하며 진행. `@use "base"` 유지 규칙은 v5 스타일 구조 기준으로 재확인.
- [ ] **Step 2:** 빌드 → index(카드 그리드), 글 페이지, 다크모드, 모바일 폭에서 v4 사이트(haejunhyun.com)와 나란히 비교 육안 확인.
- [ ] **Step 3:** `git commit -m "feat: custom.scss 이관"`

---

### Task 13: 테스트 사이트 최종 확인 (스펙 Phase 5 — 경량)

**Interfaces:**
- Consumes: Task 3~12 전체
- Produces: 이식 준비 완료 판정

- [ ] **Step 1:** `rm -rf public && npx quartz build` 클린 빌드 성공 확인.
- [ ] **Step 2:** sitemap 페이지 수를 기준선과 비교 (참고용, 게이트 아님):

```bash
grep -c "<loc>" public/sitemap.xml   # Task 1 Step 2의 수치와 비교
```

- [ ] **Step 3:** `npx quartz build --serve`로 대표 페이지 몇 개 육안 확인 후 `git commit -m "chore: v5 테스트 완료"` (변경 있을 시).

---

### Task 14: 본 레포 v5 브랜치 생성 및 이식

**Files:**
- 본 레포: `v5` 브랜치 신규 (quartz.config.yaml, plugins/, custom.scss, content 심링크, quartz.lock.json)

**Interfaces:**
- Consumes: 완성된 테스트 폴더
- Produces: 본 레포 `v5` 브랜치 — 심링크 content로 빌드 성공하는 상태

- [ ] **Step 1: v5 브랜치 생성**

```bash
cd /Users/haejun/Developer/haejunhyun.com
git remote add upstream https://github.com/jackyzha0/quartz.git 2>/dev/null
git fetch upstream v5
git checkout -b v5 upstream/v5
npm i
```

- [ ] **Step 2: 테스트 폴더 산출물 이식**

테스트 폴더에서 다음을 복사: `quartz.config.yaml`, `quartz.ts`(있으면), `plugins/` 전체, custom.scss(및 스타일 수정분), `quartz.lock.json`. 이후 `npx quartz plugin install`.

- [ ] **Step 3: content 심링크 확인 및 빌드**

```bash
ls -la content   # → /Users/haejun/Documents/obsidian/00-Blog/content 심링크 유지 확인
npx quartz build
```

Expected: 심링크 content로 빌드 성공. **실패(심링크 미추적) 시 대체안**: 심링크 제거 후 배포 스크립트에 `rsync -a --delete ~/Documents/obsidian/00-Blog/content/ content/` 단계 추가.

- [ ] **Step 4: .gitignore 확인 + 커밋**

`public/`이 ignore되어 있으면 제거(커밋 추적 유지가 배포 전제). 이후:

```bash
git add -A && git commit -m "feat: v5 마이그레이션 — 설정/로컬 플러그인/스타일 이식"
```

---

### Task 15: 배포 스크립트 갱신

**Files:**
- Modify: `scripts/deploy.sh`, `scripts/deploy-clean.sh` (`BRANCH="v4"` → `"v5"`, 빌드 전 plugin install), `scripts/deploy-dev.sh` (plugin install)

**Interfaces:**
- Consumes: Task 14의 v5 브랜치
- Produces: v5용 배포 스크립트 3종

- [ ] **Step 1:** 세 스크립트 수정 — 공통 변경 두 가지:

```bash
# 1) deploy.sh, deploy-clean.sh:
BRANCH="v5"
# 2) 세 스크립트 모두, `npx quartz build` 직전에 추가:
echo "플러그인 설치..."
npx quartz plugin install || return 5
```

(deploy-dev.sh는 return 대신 `|| exit 5`. Task 14 Step 3에서 rsync 대체안을 채택했다면 그 단계도 build 직전에 추가.)

- [ ] **Step 2:** `bash scripts/deploy-dev.sh`로 로컬 프리뷰 정상 동작 확인 (push 없음, 안전).
- [ ] **Step 3:** `git add scripts && git commit -m "chore: 배포 스크립트 v5 전환"`

---

### Task 16: 프로덕션 전환 및 뒷정리

**Interfaces:**
- Consumes: Task 14~15
- Produces: haejunhyun.com이 v5로 서빙, v4 브랜치 롤백 지점 보존

- [ ] **Step 1: v5 push (아직 서비스 영향 없음 — Cloudflare는 v4를 봄)**

```bash
git push -u origin v5
```

- [ ] **Step 1.5: 브랜치 프리뷰 URL에서 실환경 검증 (사용자 승인된 방식)**

push 후 Cloudflare Pages가 자동 생성하는 프리뷰 배포(`v5.<프로젝트명>.pages.dev` — 대시보드의 해당 배포 상세에서 URL 확인)에 접속해 확인:
1. giscus 댓글 위젯 로딩 (기존 댓글 표시 여부)
2. VisitorCounter 숫자 로딩 (GoatCounter가 pages.dev 도메인을 거부하면 실전환 후 재확인 항목으로 기록)
3. OG 이미지 산출물 접근 (`/static/og-images/` 등 실제 경로)
4. 전반적 렌더링 (폰트/컬러/카드 그리드/다크모드)

주의: `baseUrl`이 haejunhyun.com이므로 프리뷰에서 sitemap/RSS의 절대 URL·SPA 일부 동작은 어긋날 수 있다 — 이는 프리뷰 한계이며 결함 아님. 위 4개 항목만 보고 판단한다.

- [ ] **Step 2: 전환 (사용자 수동 작업 — 안내 후 확인 대기)**

1. Cloudflare 대시보드: 프로덕션 브랜치 `v4` → `v5` 변경
2. GitHub Settings → Default branch → `v5`
3. haejunhyun.com 접속해 v5 렌더링 확인. **문제 시 롤백 = Cloudflare 프로덕션 브랜치를 v4로 되돌리기 (1분).**

- [ ] **Step 3: 첫 실배포 및 확인**

```bash
bash scripts/deploy.sh
```

Expected: `[OK] 배포 완료`. 실사이트에서 giscus 댓글 로딩(기존 댓글 유지 여부), VisitorCounter 숫자, OG 이미지(카톡/트위터 미리보기 디버거) 확인.

- [ ] **Step 4: 뒷정리**

1. Obsidian `00-Blog/CLAUDE.md`·`blog-publish` 스킬의 v4 참조 → v5 갱신 (배포 스크립트 경로는 동일하므로 브랜치 언급만 수정)
2. Claude 메모리 `project_quartz_blog.md` → v5 구조로 갱신 (로컬 플러그인 목록, yaml 설정 위치)
3. `~/Developer/haejunhyun-v5-test`는 안정화 기간(2~4주) 후 폐기, `v4` 브랜치는 같은 기간 보존
4. v4 브랜치의 스펙·플랜 문서(`docs/superpowers/`)를 v5 브랜치에 체리픽 또는 복사

---

## Self-Review 결과

- 스펙 커버리지: Phase 0→Task 1, Phase 1→Task 2, Phase 2→Task 3, Phase 3→Task 4~11, Phase 4→Task 12, Phase 5(경량)→Task 13, Phase 6→Task 14~16 Step 1-3, Phase 7→Task 16 Step 4. ShareButtons 제외·검증 게이트 부재 반영됨.
- 타입/이름 일관성: 로컬 플러그인 폴더명 kebab-case (`plugins/social-links` 등), 규약 SSOT는 Task 4가 기록하는 MIGRATION-NOTES.md.
- 알려진 불확실성 (의도적): v5 로컬 플러그인 정확한 API·yaml 문법은 Task 2 정찰로 확보하는 것이 SSOT — 계획의 스켈레톤과 다르면 실제 코드를 따른다 (Global Constraints 명시).
