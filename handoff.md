> 📦 **이관됨 (2026-08-04)** — 현재 상태는 [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md),
> 결정 이력은 [`CHANGELOG.md`](./CHANGELOG.md) 참고. 이 문서는 실행 이력으로 보존.

# handoff.md — haejunhyun.com UI/UX 개선 작업 인수인계

- **작성일**: 2026-07-29
- **대상 저장소**: https://github.com/haden-hyun/haejunhyun.com
- **대상 사이트**: https://haejunhyun.com
- **스택**: Quartz v5 (YAML 설정 기반) + Obsidian
- **진단 방법**: `quartz.config.yaml` / `custom.scss` / `base.scss` / `callouts.scss` 코드 대조 + 라이브 사이트 computed style·명도대비 실측 (라이트·다크 양쪽)

---

## 0. 이 문서를 읽는 사람에게

작업 대상 저장소는 **로컬에 클론되어 있지 않습니다.** 먼저 클론하세요.

```bash
git clone https://github.com/haden-hyun/haejunhyun.com.git
cd haejunhyun.com
```

수정 파일은 사실상 3개입니다.

| 파일 | 역할 |
|---|---|
| `quartz/styles/custom.scss` | 개선 항목 1~6, 10 (핵심) |
| `quartz.config.yaml` | 개선 항목 7, 8, 9 |
| `quartz/styles/variables.scss` | 개선 항목 11 |

**개선 항목 1~6은 전부 `custom.scss` 한 파일, 약 50줄입니다.** 배포 리스크가 낮고 체감 변화가 가장 큽니다.

---

## 1. 핵심 배경 — 왜 이런 문제가 생겼는가

### v4 → v5 이관 시 CSS 캐스케이드 레이어(@layer) 도입

Quartz v5는 `componentResources.ts`에서 base 스타일과 플러그인 스타일을 `@layer quartz-base`, `@layer quartz-fonts` 등으로 감싸 출력합니다. 반면 **`custom.scss`는 비레이어(non-layered)로 출력**됩니다.

CSS 명세상 **비레이어 선언은 명시도(specificity)와 무관하게 레이어 안의 모든 선언을 이깁니다.**

```
우선순위:  custom.scss (비레이어)  >  @layer quartz-fonts  >  @layer quartz-base
```

이 성질은 `custom.scss` 파일 상단 주석에 이미 정확히 기록되어 있고, `h1~h6` / `p` / `strong`은 `@layer quartz-base`로 감싸 해결된 상태입니다. **문제는 아직 감싸지지 않은 나머지 요소 선택자들입니다.**

아래 P0 버그 2건(폰트, 콜아웃)은 모두 이 하나의 원인에서 파생됐습니다.

---

## 2. 개선 항목 전체 목록

| # | 항목 | 성격 | 우선순위 | 파일 |
|---|---|---|---|---|
| 1 | 폰트 변수 강제 복구 | 🔴 버그 | P0 | `custom.scss` |
| 2 | 콜아웃 타입별 색상 복구 | 🔴 버그 | P0 | `custom.scss` |
| 3 | 인라인 코드 다크모드 대비 | 🔴 접근성 | P0 | `custom.scss` |
| 4 | TOC 가독성 + sticky | 🟠 접근성 | P1 | `custom.scss` |
| 5 | 헤딩 위계 재조정 | 🟠 가독성 | P1 | `custom.scss` |
| 6 | 본문 16 → 17px | 🟠 가독성 | P1 | `custom.scss` |
| 7 | 우측 레일 TOC 최상단 이동 | 🟡 정보구조 | P1 | `quartz.config.yaml` |
| 8 | 방문자 카운터 하단 이동 ✅확정 | 🟡 정보구조 | P2 | `quartz.config.yaml` |
| 9 | 사이드바 태그라인 추가 | 🟡 정보구조 | P2 | `quartz.config.yaml` |
| 10 | Explorer sticky | 🟡 레이아웃 | P2 | `custom.scss` |
| 11 | 상단 여백 6 → 4rem | 🟡 레이아웃 | P2 | `variables.scss` |
| 12 | frontmatter `description` 보강 | 🟡 콘텐츠·SEO | P2 | 콘텐츠 |

---

# P0 — 의도한 디자인이 작동하지 않는 상태

## 1. 폰트 변수 강제 복구

### 배경

`quartz.config.yaml`에 아래와 같이 지정되어 있습니다.

```yaml
typography:
  header: Nanum Myeongjo
  body:   Noto Sans KR
  code:   JetBrains Mono
```

**그러나 브라우저 실측값은 Quartz 기본값입니다.**

```
--headerFont = Schibsted Grotesk   ← 기본값
--bodyFont   = Source Sans Pro     ← 기본값
--codeFont   = IBM Plex Mono       ← 기본값
```

### 원인

서빙되는 스타일시트에서 `:root`에 `--headerFont`를 선언하는 곳이 **두 군데**입니다.

| 순서 | 파일 | 값 | 레이어 |
|---|---|---|---|
| 1 | `index-*.css` (설정에서 생성) | `"Nanum Myeongjo", …` | `@layer quartz-base` |
| 2 | `resource-style-*.css` | `Schibsted Grotesk` | **`@layer quartz-fonts`** |

`quartz-community/fonts` 플러그인이 **설정을 읽지 않고 기본값을 하드코딩한 `:root` 블록**을 나중 레이어로 주입합니다. 레이어 순서상 뒤가 이깁니다.

실제 주입되는 내용:

```css
@layer quartz-fonts {
  :root {
    --titleFont: Schibsted Grotesk; --bodyFont: Source Sans Pro;
    --headerFont: Schibsted Grotesk; --codeFont: IBM Plex Mono;
    --font-text: Source Sans Pro; --font-monospace: IBM Plex Mono;
    --h1-font: Schibsted Grotesk; ... --h6-font: Schibsted Grotesk;
  }
}
```

### 부수 피해

- Nanum Myeongjo / Noto Sans KR / JetBrains Mono 웹폰트는 **다운로드는 되고 사용은 안 됨** → 낭비 트래픽
- 명조 헤딩이라는 디자인 컨셉 자체가 소실 (현재 전부 산세리프)
- 한글 본문이 Source Sans Pro → 한글 글리프 없어 **OS 기본 폰트로 폴백** (Windows/Mac/Android 제각각)

### 해결

`custom.scss`는 비레이어라 여기서 재선언하면 최종적으로 이깁니다. 파일 상단 `@use "./variables.scss" as *;` **바로 아래**에 추가하세요.

```scss
// ── 0. 폰트 변수 강제 복구 ─────────────────────────────────────────────────
// [2026-07-29] fonts 플러그인이 @layer quartz-fonts 로 기본값(:root)을 주입해
// 설정(quartz.config.yaml)의 typography 를 덮어쓴다.
// custom.scss는 non-layered라 여기서 재선언하면 레이어와 무관하게 최종 승리.
:root {
  --titleFont:  "Nanum Myeongjo", serif;
  --headerFont: "Nanum Myeongjo", serif;
  --bodyFont:   "Noto Sans KR", system-ui, sans-serif;
  --codeFont:   "JetBrains Mono", ui-monospace, monospace;

  // fonts 플러그인이 별도로 쓰는 별칭들도 함께 복구
  --font-text:      var(--bodyFont);
  --font-monospace: var(--codeFont);
  --h1-font: var(--headerFont);  --h2-font: var(--headerFont);
  --h3-font: var(--headerFont);  --h4-font: var(--headerFont);
  --h5-font: var(--headerFont);  --h6-font: var(--headerFont);
}

body { font-family: var(--bodyFont); }
```

### 기대효과

- 명조 헤딩 컨셉이 처음으로 실제 화면에 구현
- 한글 본문 폴백 제거 → **모든 OS에서 동일한 화면** 보장
- 이미 받고 있던 웹폰트 3종의 낭비 트래픽이 실사용으로 전환

### ⚠️ 결정 필요 사항

적용 후 **명조 헤딩 실물을 반드시 눈으로 확인**해야 합니다. 지금까지 본 화면은 전부 산세리프였으므로, 의도했던 디자인을 한 번도 보지 못한 상태입니다. 한글 명조는 화면에서 호불호가 갈리므로, 확인 후 산세리프로 갈 거면 `quartz.config.yaml`의 `typography.header`를 바꾸는 것이 맞습니다.

---

## 2. 콜아웃 타입별 색상 복구

### 배경

Obsidian에서 타입별로 구분되던 콜아웃이 웹에서는 전부 동일한 슬레이트 블루로 보입니다.

라이브 사이트에 8종 콜아웃을 임시 렌더링해 computed style을 읽은 **실측 결과**입니다.

| 타입 | Quartz가 준비한 `--color` | 실제 테두리 | 실제 배경 | 제목/아이콘 색 |
|---|---|---|---|---|
| note | `#448aff` 파랑 | `#3d6b8e` | 슬레이트 4% | 🔵 `#448aff` |
| abstract | `#00b0ff` 하늘 | `#3d6b8e` | 슬레이트 6% | 🔵 `#00b0ff` |
| tip | `#00bfa5` 청록 | `#3d6b8e` | 슬레이트 4% | 🟢 `#00bfa5` |
| warning | `#db8942` 주황 | `#3d6b8e` | 슬레이트 4% | 🟠 `#db8942` |
| danger | `#db4242` 빨강 | `#3d6b8e` | 슬레이트 4% | 🔴 `#db4242` |
| example | `#7a43b5` 보라 | `#3d6b8e` | 슬레이트 4% | 🟣 `#7a43b5` |

**정확히는 "모두 동일"이 아닙니다.** 제목 글자와 아이콘은 타입별로 정상 동작합니다. 그러나 시각적으로 압도적인 **왼쪽 세로 바와 배경 채움이 전부 슬레이트 블루로 통일**되어 눈에는 다 똑같아 보입니다.

### 원인 A (주범) — `blockquote` 규칙이 모든 콜아웃을 덮어씀

`custom.scss` 약 175행:

```scss
blockquote {
  border-left: 3px solid var(--secondary);   // ← 항상 슬레이트 블루
  background: rgba(61,107,142,0.04);         // ← 항상 슬레이트 4%
  ...
}
```

Obsidian 콜아웃은 파서가 mdast blockquote 노드에 클래스만 덧붙이므로 **`.callout`의 실제 루트 태그가 `<blockquote>`** 입니다. (이 사실은 파일 주석 170~174행에 이미 기록되어 있으나, 당시 "회귀 아님"으로 판단하고 넘어간 부분입니다.)

레이어가 겹칩니다.

```
callouts.scss  →  @layer quartz-base  →  .callout { border: 1px solid var(--border); background-color: var(--bg) }
custom.scss    →  non-layered         →  blockquote { border-left: …; background: … }
```

`blockquote`(명시도 0,0,1)가 `.callout[data-callout="tip"]`(0,2,0)보다 약한데도 이깁니다. 게다가 `background`는 단축 속성이라 `background-color: var(--bg)`를 통째로 날립니다.

> **증거**: `tip`은 `--callout-color`가 초록(50,130,80)으로 세팅돼 있는데도 테두리가 파랑으로 그려짐.

### 원인 B — v4 변수명을 그대로 사용 중

`custom.scss` 약 161~168행:

```scss
.callout[data-callout="abstract"] { --callout-color: 61, 107, 142; }
.callout[data-callout="note"]     { --callout-color: 61, 107, 142; }
.callout[data-callout="warning"]  { --callout-color: 180, 100, 30; }
.callout[data-callout="tip"]      { --callout-color: 50, 130, 80; }
```

**`--callout-color`는 Quartz v4 변수명입니다.** v5의 `callouts.scss`는 이 이름을 읽지 않고 3종으로 분리했습니다.

```scss
&[data-callout="tip"] {
  --color:  #00bfa5;   // 제목·아이콘
  --border: #00bfa544; // 테두리
  --bg:     #00bfa510; // 배경
}
```

즉 위 4줄은 **어디서도 읽히지 않는 죽은 코드**입니다. 원인 A를 고쳐도 무효이므로 함께 정리해야 합니다.

> v4→v5 이관 시 `data-callout="summary"` → `"abstract"` 변경은 반영됐으나, 변수명 변경은 누락된 케이스입니다.

### 해결 (3단계 모두 적용 권장)

**① `blockquote`를 콜아웃에서 제외 — 필수**

```scss
// 순수 인용문에만 적용 (.callout도 <blockquote>이므로 반드시 제외)
blockquote:not(.callout) {
  border-left: 3px solid var(--secondary);
  background: rgba(61,107,142,0.04);
  padding: 0.7rem 1.2rem; border-radius: 0 6px 6px 0;
  margin: 1.2rem 0; color: var(--darkgray); font-style: normal;
  p:first-child { margin-top: 0; }
  p:last-child  { margin-bottom: 0; }
}
```

**② 왼쪽 세로 바 디자인을 유지하며 타입별 색상 반영**

①만 적용하면 Quartz 기본 스타일(1px 전체 테두리)로 돌아가 현재의 "왼쪽 굵은 바" 느낌이 사라집니다. 유지하려면 `--color` / `--bg`를 참조하도록 바꿉니다.

```scss
.callout {
  border-radius: 0 6px 6px 0;
  margin: 1.2rem 0;
  line-height: 1.75;

  // 타입별 색상을 왼쪽 바 + 배경에 반영
  border: none;
  border-left: 3px solid var(--color);
  background-color: var(--bg);

  & > .callout-title {
    font-family: var(--headerFont); font-weight: 700; font-size: 0.88rem;
    padding: 0.6rem 0.3rem 0.5rem; margin: 0;
  }
  & > .callout-content {
    padding: 0.5rem 0.3rem 0.7rem; font-size: 0.9rem;
    p:last-child { margin-bottom: 0; }
  }
}
```

**③ `--callout-color` 4줄 삭제 후, 브랜드 톤 커스텀이 필요하면 v5 변수로 교체**

```scss
// abstract(=Obsidian의 [!summary])는 사이트 액센트 컬러로 통일
.callout[data-callout="abstract"] {
  --color:  #3d6b8e;
  --border: #3d6b8e44;
  --bg:     #3d6b8e10;
}
.callout[data-callout="tip"]     { --color: #328250; --border: #32825044; --bg: #32825010; }
.callout[data-callout="warning"] { --color: #b4641e; --border: #b4641e44; --bg: #b4641e10; }
.callout[data-callout="danger"]  { --color: #c0392b; --border: #c0392b44; --bg: #c0392b10; }
```

> `--bg`의 끝 두 자리(`10`, `44`)는 8자리 hex의 알파 채널입니다. `10` ≈ 6% 불투명도, `44` ≈ 27%. 라이트/다크 양쪽에서 자동으로 자연스럽게 동작합니다.

### 기대효과

- warning(주황) / danger(빨강) / tip(청록) / example(보라)가 색으로 즉시 구분 → 기술 문서의 **정보 위계가 스캔만으로 파악**
- Obsidian 편집 화면과 배포 결과가 일치 → 작성 시점의 의도가 그대로 전달
- v4 잔재 코드 정리로 유지보수 혼선 제거

---

## 3. 인라인 코드 다크모드 대비

### 배경

`custom.scss` 약 102행에 `color: #8b4513`(SaddleBrown)이 **하드코딩**되어 다크모드 대응이 없습니다.

**실측 대비비 (WCAG AA 기준 4.5:1)**

| 요소 | 색상 | 배경 | 대비비 | 판정 |
|---|---|---|---|---|
| 인라인 코드 (다크) | `#8b4513` | `#1a1e24` | **2.36:1** | ❌ |

기술 블로그 본문에서 인라인 코드는 함수명·파라미터·키워드 등 **정확히 읽혀야 하는 텍스트**입니다.

### 해결

```scss
:root                        { --inlineCode: #8b4513; }
:root[saved-theme="dark"]    { --inlineCode: #e0a878; }   // 대비 ≈ 7.4:1

code:not(pre code) {
  font-family: var(--codeFont); font-size: 0.85em;
  background: rgba(61,107,142,0.08);
  color: var(--inlineCode);          // ← #8b4513 하드코딩 대체
  padding: 0.15em 0.4em; border-radius: 4px;
  border: 1px solid rgba(61,107,142,0.15);
}
```

### 기대효과

- 다크모드 대비 2.36:1 → 약 7.4:1 (AA·AAA 충족)
- 야간 독서 환경에서 코드 식별자 오독 방지
- 색상 관리가 CSS 변수 한 곳으로 집중

---

# P1 — 가독성과 정보구조

## 4. TOC 가독성 + sticky

### 배경

**실측 대비비**

| 요소 | 색상 | 대비비 | 판정 |
|---|---|---|---|
| TOC 링크 (다크) | `#5a6478` | **2.81:1** | ❌ |
| TOC 링크 (라이트) | `#a09890` | **약 2.6:1** | ❌ |
| (참고) 본문 텍스트 | `#b8c4d4` | 9.47:1 | ✅ |

목차가 배경에 거의 녹아 판독이 어렵습니다. 우측 320px 패널의 존재 이유가 TOC인데 읽히지 않으면 공간 낭비입니다. 또한 sticky가 아니어서 19분 분량 긴 글에서 스크롤하면 목차가 사라집니다.

### 해결

```scss
.toc li a {
  font-size: 0.82rem;          // 0.78 → 0.82
  color: var(--darkgray);      // var(--gray) → var(--darkgray)
  opacity: 0.85;
  &:hover { color: var(--secondary); opacity: 1; }
}
.toc li a.in-view {
  color: var(--secondary); font-weight: 600; opacity: 1;
}

.toc {
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}
```

### 기대효과

- 대비 AA 충족으로 목차가 실제로 읽히는 상태가 됨
- 스크롤 중에도 목차 고정 + 현재 위치 하이라이트 → **긴 글에서 현재 위치 상시 인지**
- 우측 패널이 장식에서 실질 내비게이션으로 전환

---

## 5. 헤딩 위계 재조정

### 배경

**실측 폰트 크기**

```
h1  28.0px  (1.75rem)
h2  19.2px  (1.20rem)
h3  16.0px  (1.00rem)   ← 본문과 완전히 동일
본문 16.0px  (1.00rem)
```

**h3와 본문이 같은 크기**라 소제목이 굵은 문장처럼 보입니다. h1→h2 간극(1.46배) 대비 h2→h3(1.2배)가 좁아 리듬도 어긋납니다. 기술 블로그는 h3를 활발히 사용하므로(현재 글도 h3가 실제 소제목 역할) 스캔 가능성에 직접 타격입니다.

### 해결

기존 `@layer quartz-base { … }` 블록 안의 값을 교체합니다. (반드시 레이어 안에 유지 — Explorer 제목·breadcrumb 오염 방지, 파일 주석 26~32행 참조)

```scss
@layer quartz-base {
  h1 { font-size: 2rem; }        // 28 → 32px
  h2 { font-size: 1.5rem; }      // 19.2 → 24px
  h3 { font-size: 1.2rem; }      // 16 → 19.2px (본문과 분리)
  h4 { font-size: 1.05rem; font-weight: 600; }
}
```

### 기대효과

- h1 32 / h2 24 / h3 19.2 / h4 17px의 일관된 스케일 확보
- 목차 없이 스크롤만으로 문서 구조 파악 (scannability 개선)
- 항목 7의 `maxDepth: 3`과 결합해 h3가 TOC에도 노출

---

## 6. 본문 16 → 17px

### 배경

현재 16px는 2026년 기술 블로그 표준(17~18px) 대비 작습니다. 본문 폭 850px 기준 한 줄 약 53자로 한글 최적 구간(40~50자)을 초과합니다.

`line-height: 1.9`와 `word-break: keep-all`은 한글 조판의 정석이므로 **크기만 조정하면 됩니다.**

### 해결

```scss
@layer quartz-base {
  p, li {
    font-size: 1.0625rem;   // 16 → 17px
    line-height: 1.85;
  }
}
```

### 기대효과

- 한 줄 53자 → 약 48자로 최적 구간 진입
- 장문 읽기 피로도 감소 (체류시간 직결)
- 레이아웃 폭 변경 없이 해결 → 부작용 최소

---

## 7. 우측 레일 TOC 최상단 이동

### 배경

현재 우측 상단은 Graph View가 차지하고, TOC는 화면 중간(y≈338)부터 시작합니다. 그런데 **Graph View는 홈에서 점 1개, 글 페이지에서 점 2개**뿐입니다. 문서 129개 대비 wikilink 밀도가 낮아 현재로서는 시각적 소음에 가깝습니다.

기술 블로그의 우측 레일 1순위는 TOC입니다. 또한 `maxDepth: 2`라 h3가 목차에 잡히지 않아 현재의 h3 활용 패턴과 불일치합니다.

### 해결

`quartz.config.yaml` — Quartz는 `priority`가 낮을수록 위에 배치됩니다.

```yaml
  - source: github:quartz-community/table-of-contents
    enabled: true
    order: 50
    options:
      maxDepth: 3          # 2 → 3
    layout:
      position: right
      priority: 10         # 30 → 10 (최상단)
      display: desktop-only

  - source: github:quartz-community/graph
    enabled: true
    layout:
      position: right
      priority: 40         # 10 → 40 (TOC/backlinks 아래로)
```

### 기대효과

- 첫 화면에서 문서 전체 구조 즉시 파악
- `maxDepth: 3`으로 목차 해상도가 실제 문서 구조와 일치
- Graph View는 유지하되 하단 배치 → wikilink 축적 시 자연스럽게 가치 회복

---

# P2 — 정보 우선순위와 여백

## 8. 방문자 카운터 하단 이동 ✅ 확정

### 배경

현재 좌측 패널에서 **타이틀 바로 아래**, 즉 사이드바에서 시선이 가장 먼저 닿는 자리를 `Today 0 · Total 129` 카운터가 차지하고 있습니다.

이 정보는 운영자에게는 의미가 있으나 **방문자에게는 행동 가치가 없고**, "오늘 0"이라는 숫자가 첫인상에 노출되면 오히려 역효과입니다. 이 자리는 "이 블로그가 무엇인가"를 알리는 데 쓰여야 합니다.

### 해결

`quartz.config.yaml` (현재 `priority: 11`):

```yaml
  - source: ./plugins/visitor-counter
    enabled: true
    options: {}
    order: 15
    layout:
      position: left
      priority: 90         # 11 → 90 (사이드바 최하단)
```

**권장 최종 순서**: 타이틀 → 태그라인 → 소셜 → 검색/다크모드 → Explorer → *(맨 아래)* 방문자 카운터

### 기대효과

- 프라임 위치가 정체성 전달(타이틀·태그라인·소셜)로 회수
- 카운터는 유지되므로 운영 지표 확인 기능은 그대로
- 항목 9와 결합 시 사이드바 상단이 **"누구의, 무엇에 관한 블로그인가"** 로 완결

---

## 9. 사이드바 태그라인 추가

### 배경

"기록하고, 가끔 정리하고, 어쩌다 블로그가 된 곳."이라는 좋은 한 줄이 **홈 본문에만** 있습니다. 검색·SNS를 통해 개별 글로 직접 유입된 방문자는 이 블로그의 정체를 알 수 없습니다. 기술 블로그 트래픽 대부분이 개별 글 직접 유입임을 감안하면 손실이 큽니다.

### 해결

`./plugins/social-links` 패턴을 참고해 간단한 태그라인 플러그인을 추가하거나, `page-title` 컴포넌트 하단에 삽입합니다. 최소 구현은 `custom.scss`의 `.page-title::after` 활용도 가능하나, **다국어·마크다운 대응을 고려하면 플러그인 방식을 권장**합니다.

배치는 `position: left`, `priority: 12` (타이틀 10과 소셜 13 사이).

### 기대효과

- 모든 페이지에서 블로그 정체성 노출 → 개별 글 유입자의 **다른 글 탐색 전환율 상승**
- 항목 8로 비워진 프라임 위치의 자연스러운 활용

---

## 10. Explorer sticky

### 배경

좌측 사이드바 콘텐츠가 y=93~665에 뭉쳐 있고 그 아래는 비어 있습니다. Explorer가 sticky가 아니라 스크롤하면 함께 사라져, **긴 글을 읽는 동안 좌측 320px가 완전한 빈 칸**이 됩니다. 폴더 확대(`.explorer-content { font-size: 1.15rem }`) 설정 탓에 세로 길이도 길어진 상태입니다.

### 해결

```scss
.sidebar.left .explorer {
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}
```

### 기대효과

- 스크롤 중에도 문서 트리 유지 → 읽던 중 다른 글로 이동하는 경로 확보
- 좌우 사이드바 모두 sticky → **3단 레이아웃이 끝까지 3단으로 유지** (현재는 스크롤 시 사실상 1단)

---

## 11. 상단 여백 6 → 4rem

### 배경

`variables.scss`의 `$topSpacing: 6rem`(96px)로 브레드크럼이 y=87에서 시작합니다. 1080p 노트북(가용 높이 약 750px)에서 **첫 화면의 12%를 빈 공간이 소비**합니다.

### 해결

```scss
// quartz/styles/variables.scss
$topSpacing: 4rem;   // 6rem → 4rem
```

### 기대효과

- 스크롤 없이 보이는 본문 분량 증가 → 첫 화면에서 글이 실제로 시작
- 여백의 여유로운 톤은 유지 (4rem = 64px도 충분히 넉넉)

---

## 12. frontmatter `description` 보강

### 배경

홈 Recent Posts 카드 3개의 요약문이 모두 `Summary `로 시작합니다.

```
Summary API는 프로그램끼리 데이터를 주고받는 방법(=코드로 작성된…
Summary 부동산 경매는 서류의 용어를 아는 것을 넘어…
Summary 상호정보량(MI)은 피어슨 상관계수가…
```

모든 글이 `> [!summary]` 콜아웃으로 시작하는데, `description` 플러그인이 본문 첫 텍스트를 추출하면서 **콜아웃 제목 "Summary"가 그대로 섞여 들어갑니다.** 이 문자열은 카드뿐 아니라 **OG 이미지와 검색 결과 스니펫에도 동일하게 노출**됩니다.

### 해결

각 글 frontmatter에 `description:`을 명시합니다.

```yaml
---
title: API
description: API의 기본 개념부터 HTTP 프로토콜 구조, REST 설계 원칙까지 정리한다.
tags:
  - computer-science/network
---
```

### 기대효과

- 카드·OG·검색 스니펫에서 노이즈 제거
- 명시적 요약문으로 SEO 클릭률(CTR) 개선
- 자동 추출 의존 제거 → 콜아웃 구조를 바꿔도 요약이 깨지지 않음

---

# 후속 과제 — `custom.scss` 레이어 감사

### 배경

항목 1(폰트)과 2(콜아웃)는 **뿌리가 같은 문제**입니다. 둘 다 v4에서 정상 동작하던 CSS가 v5의 `@layer` 도입으로 승패가 뒤바뀐 케이스입니다.

`custom.scss`에서 요소 선택자를 쓰는 규칙들은 아직 비레이어 상태입니다.

| 선택자 | 위치(대략) | 위험 |
|---|---|---|
| `blockquote` | 175행 | 콜아웃 오염 — **확인됨, 항목 2에서 해결** |
| `table` / `thead` / `tbody` | 301~305행 | 플러그인 테이블 스타일 잠식 가능 |
| `pre` | 107행 | 코드블록 플러그인 스타일 잠식 가능 |
| `hr` | 363행 | 구분선 관련 컴포넌트 오염 가능 |
| `code:not(pre code)` | 100행 | 상대적으로 안전(부정 선택자로 스코프됨) |

### 점검 방법

브라우저 콘솔에서 대상 요소의 computed style을 읽어, 플러그인이 의도한 CSS 변수값과 실제 렌더링값이 일치하는지 대조합니다. 항목 2의 진단에 사용한 방식과 동일합니다.

### 기대효과

- 같은 유형의 잠복 버그를 사후 대응이 아닌 **일괄 점검으로 선제 제거**
- 향후 플러그인 추가·업데이트 시 스타일 충돌 예측 가능

---

# 실행 순서

| 단계 | 범위 | 검증 방법 |
|---|---|---|
| **1차** | 1, 2, 3 (P0 버그) | 명조 헤딩 실물 확인 → 유지/전환 결정 · 콜아웃 5종 나란히 배치해 라이트·다크 확인 |
| **2차** | 4, 5, 6, 7 (가독성) | 긴 글(API)에서 스크롤하며 TOC 추종·헤딩 위계 확인 |
| **3차** | 8, 9, 10, 11 (레이아웃) | 1080p·와이드·모바일 3종 뷰포트 확인 |
| **4차** | 12 + 레이어 감사 | 홈 카드·OG 이미지·검색 스니펫 확인 |

**1차만 적용해도 "의도한 디자인이 실제로 보이는 상태"에 도달합니다.** 2·3차는 그 위에서 다듬는 작업입니다.

## 콜아웃 검증용 테스트 노트

1차 적용 후 아래 내용을 테스트 노트에 넣고 빌드하여 라이트·다크 양쪽을 확인하세요.

```markdown
> [!note] note
> 기본 콜아웃

> [!summary] summary (→ abstract로 정규화됨)
> 요약 콜아웃

> [!tip] tip
> 팁 콜아웃

> [!warning] warning
> 경고 콜아웃

> [!danger] danger
> 위험 콜아웃

> [!example] example
> 예시 콜아웃

> 일반 인용문 — 콜아웃이 아닌 순수 blockquote 스타일이 유지되어야 함
```

---

# 미해결 / 결정 대기 항목

| 항목 | 내용 |
|---|---|
| **모바일 미검증** | 브라우저 리사이즈가 뷰포트에 반영되지 않아 800px 이하 레이아웃(사이드바 상단 스택 구조, `variables.scss`의 `$mobileGrid`)은 **코드로만 확인**했습니다. 3차 단계에서 실기기 검증 필요 |
| **명조 헤딩 방향** | 항목 1 적용 후 실물 확인이 선행되어야 결정 가능 |
| **태그라인 구현 방식** | 플러그인 신규 작성 vs `custom.scss` 의사요소 — 항목 9 참조 |

---

# 참고 — 유지해야 할 강점

수정 과정에서 훼손하지 않도록 주의할 항목입니다.

- **컬러 팔레트** — 라이트 `#fafaf8`(순백 아닌 웜 페이퍼), 다크 `#1a1e24`(순흑 아닌 블루 그레이). 둘 다 눈의 피로를 줄이는 정석 선택
- **`word-break: keep-all` + `line-height: 1.9`** — 한글 조판의 핵심
- **코드블록 언어 배지** (`pre[data-language]::before`)
- **본문 링크에만 밑줄 적용** (`article a`) — 사이드바 오염 방지를 위한 정확한 스코핑
- **커스텀 플러그인 9종** — reading-progress / back-to-top / prev-next / image-lightbox 등 기술 블로그 필수 UX
- **giscus 댓글 + RSS + sitemap + OG 이미지** — 기능적 결손 없음
- **`MIGRATION-NOTES.md`(59KB)와 인라인 주석** — 유지보수 관점에서 상위 수준. **수정 시 주석도 함께 갱신할 것**
