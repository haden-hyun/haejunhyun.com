# haejunhyun.com 리디자인 Handoff — 개선안 A (Minimal Editorial)

> 작성일: 2026-07-29
> 대상: haejunhyun.com (Quartz 4 기반 Obsidian Digital Garden)
> 목적: 목업(`haejun-redesign.html`)을 Quartz 컴포넌트로 구현하기 위한 인수인계 문서

---

## 0. TL;DR

| 항목 | 내용 |
|---|---|
| 채택안 | **A — Minimal Editorial** (읽기 경험 중심 큐레이션) |
| 구현 범위 | 홈 레이아웃 재구성 + 노트 상세 3단 레이아웃 + 디자인 토큰 |
| 신규 컴포넌트 | 6개 (Hero, StatsStrip, Featured, TopicGrid, RecentList, RelatedNotes) |
| 수정 컴포넌트 | 3개 (ContentMeta, Comments, Graph) |
| 예상 작업량 | 컴포넌트 6~9개 + `custom.scss` 전면 재작성 |
| 선행 조건 | frontmatter에 `summary`, `featured`, `readingTime` 필드 확보 |

---

## 1. 현재 상태 진단

실제 사이트를 브라우저로 확인해 도출한 문제점이다.

| # | 영역 | 문제 | 심각도 |
|---|---|---|---|
| P1 | 콘텐츠 | 카드 요약이 `Summary API는 프로그램끼리...`처럼 **"Summary" 리터럴이 그대로 노출** | 높음 |
| P2 | 레이아웃 | 1568px 화면에서 본문 700px + 좌 240px + 우 210px → **양쪽 여백 과다** | 높음 |
| P3 | 첫인상 | 홈 히어로가 제목 + 한 줄뿐. **누구인지·무엇을 다루는지 알 수 없음** | 높음 |
| P4 | 죽은 UI | 홈 우측 Graph View가 **노드 1개짜리 빈 박스**로 렌더 | 높음 |
| P5 | 정보구조 | Interests 표가 **정적 텍스트**. 클릭 불가 → 카테고리 진입 실패 | 중간 |
| P6 | 소셜 증명 | `Today 0 · Total 129`, `0 reactions`, `0 comments` 노출이 신뢰도를 깎음 | 중간 |
| P7 | 위계 | 날짜·태그·카테고리가 비슷한 회색 톤 → **스캔 불가** | 중간 |
| P8 | 네비게이션 | breadcrumb 외 **태그 인덱스 / 아카이브 / About 진입점 부재** | 중간 |
| P9 | 폴더 페이지 | "3 items under this folder"에 제목만 나열. 설명·개수·최신 글 없음 | 낮음 |
| P10 | 공유 | OG 이미지 / 메타 태그 미설정 | 낮음 |

---

## 2. 디자인 토큰

`quartz/styles/custom.scss` 최상단에 CSS 변수로 정의한다.
Quartz 기본 `variables.scss`의 `--light`, `--dark` 등과 **병행 사용**하되, 신규 컴포넌트는 아래 토큰만 참조한다.

```scss
:root {
  /* Surface */
  --bg: #fbfbfa;
  --surface: #ffffff;
  --surface-2: #f4f4f2;

  /* Border */
  --border: #e6e5e1;
  --border-strong: #d4d3ce;

  /* Text */
  --text: #1a1a18;
  --text-2: #57564f;
  --text-3: #8b8a82;

  /* Brand */
  --accent: #c2703a;

  /* Category accents */
  --c-cs:   #4c6ef5;  /* computer-science  */
  --c-de:   #12b886;  /* data-engineering  */
  --c-ds:   #7950f2;  /* data-science      */
  --c-gis:  #f76707;  /* gis               */
  --c-prog: #e8590c;  /* programming       */
  --c-fin:  #0ca678;  /* finance-property  */
  --c-tool: #868e96;  /* tools             */

  /* Shape */
  --radius: 10px;
  --radius-lg: 16px;
  --shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04);
  --maxw: 1300px;

  /* Type */
  --font: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont,
          "Segoe UI", "Malgun Gothic", sans-serif;
  --mono: "JetBrains Mono", "SFMono-Regular", Consolas,
          "D2Coding", "Malgun Gothic", monospace;
}

[saved-theme="dark"] {
  --bg: #131312;
  --surface: #1b1b1a;
  --surface-2: #232322;
  --border: #2e2e2c;
  --border-strong: #3d3d3a;
  --text: #f0efec;
  --text-2: #a8a79f;
  --text-3: #75746d;
  --accent: #e0965c;
  --shadow: 0 1px 2px rgba(0,0,0,.3), 0 4px 16px rgba(0,0,0,.25);
}
```

> **주의:** Quartz는 다크모드를 `document.documentElement`의 `saved-theme` 속성으로 제어한다.
> 목업은 `data-theme`을 썼으므로 **셀렉터를 `[saved-theme="dark"]`로 치환**해야 한다.

### 타이포 스케일

| 용도 | size / weight / line-height / letter-spacing |
|---|---|
| Hero h1 | 40px / 780 / 1.22 / -0.035em |
| Post h1 | 34px / 770 / 1.28 / -0.035em |
| Section h3 | 19px / 720 / 1.4 / -0.02em |
| Post h2 | 21px / 720 / 1.4 / -0.025em |
| 본문 | 16.5px / 400 / 1.82 / 0 |
| 카드 제목 | 15.5px / 620~670 / 1.42 / -0.018em |
| 메타 | 12px / 400 / 1.5 / 0 — `--text-3` |
| 코드 | 13px / `--mono` / 1.7 |

### 폰트 로딩

Quartz `quartz.config.ts`의 `theme.fontOrigin`은 Google Fonts만 지원한다.
Pretendard는 CDN 셀프호스팅이 필요하므로 `quartz/static/`에 woff2를 두고 `custom.scss`에서 `@font-face`로 선언하거나, `quartz/components/Head.tsx`에 `<link>`를 추가한다.

---

## 3. 정보 구조

### 3.1 글로벌 네비게이션 (신규)

```
Home | Notes | Topics | Archive | About        [⌘K 검색]  [☾]
```

| 항목 | 경로 | 비고 |
|---|---|---|
| Home | `/` | `content/index.md` |
| Notes | `/notes` | 전체 노트 목록 (페이지네이션) |
| Topics | `/topics` | 7개 토픽 카드 그리드 |
| Archive | `/archive` | 연도별 타임라인 |
| About | `/about` | 신규 작성 필요 |

### 3.2 홈 섹션 순서

```
1. Hero          — 아이브로우 / 헤드라인 / 소개문 / CTA 3 / 아바타
2. StatsStrip    — 노트 수 · 토픽 수 · 최근 업데이트  (Hero 내부 하단)
3. Featured      — 대형 1 + 소형 3
4. TopicGrid     — 7 토픽 + Graph View 진입 카드 = 8칸 (4열 × 2행)
5. RecentList    — 최근 6개, 행 리스트 (날짜 / 제목+요약 / 태그)
```

### 3.3 노트 상세 레이아웃

```
┌────────┬──────────────────────┬────────┐
│ 196px  │   minmax(0, 1fr)     │ 208px  │   gap 40px, padding 44px 36px
│ 폴더    │   본문 max 720px      │ sticky │
│ 트리    │                      │ TOC    │
└────────┴──────────────────────┴────────┘
```

- 1080px 이하: 단일 컬럼, 좌우 사이드바 숨김
- **구현 중 발견한 함정:** 좌측 컬럼을 `1fr`로 두면 폭이 96px까지 찌그러진다. **반드시 고정 px**로 지정할 것.

---

## 4. 컴포넌트 명세

### 4.1 신규 컴포넌트

디렉터리: `quartz/components/`
각 컴포넌트는 `QuartzComponentConstructor` 패턴을 따르고, `.tsx` + `.inline.ts`(필요 시) + `styles/*.scss`로 구성한다.

---

#### `Hero.tsx`

홈에서만 렌더. `fileData.slug === "index"` 가드 필요.

| Props | 타입 | 기본값 |
|---|---|---|
| `eyebrow` | `string` | `"Data Engineer · Seoul"` |
| `headline` | `string` | `"기록하고, 가끔 정리하고,\n어쩌다 블로그가 된 곳"` |
| `description` | `string` | 소개문 |
| `links` | `{label, href}[]` | GitHub / LinkedIn |
| `avatar` | `string \| null` | 없으면 이니셜 그라디언트 원 |

레이아웃: `display:grid; grid-template-columns:1fr auto; gap:48px; align-items:center`
아바타: 104px 원, `linear-gradient(140deg,#e8b98a,#c2703a 60%,#8a4a22)`

---

#### `StatsStrip.tsx`

`P6` 해결. `Today 0 / Total 129` 카운터를 대체한다.

```ts
// allFiles에서 집계
const noteCount  = allFiles.filter(f => !f.slug?.endsWith("/index")).length
const topicCount = new Set(allFiles.map(f => f.slug?.split("/")[0])).size
const lastUpdate = Math.max(...allFiles.map(f => f.dates?.modified?.getTime() ?? 0))
```

표시: `129 노트` / `7 토픽` / `Jul 26 최근 업데이트` — `display:flex; gap:40px`

---

#### `Featured.tsx`

레이아웃: `grid-template-columns: 1.35fr 1fr; gap:16px`
- 좌: 대형 카드 1개 — 카테고리 라벨 / 제목 26px / 요약 3줄 / 메타
- 우: 소형 카드 3개 세로 — 카테고리 라벨 / 제목 15.5px / 메타

**선정 로직 (택 1):**
1. frontmatter `featured: true` (권장 — 통제 가능)
2. `pinned` 태그
3. 각 토픽에서 최신 1개씩 라운드로빈

---

#### `TopicGrid.tsx`

`P5` 해결. 정적 표를 클릭 가능한 카드로 대체한다.

카드 구성: 좌측 3px 컬러바 / 이모지 19px / 토픽명 / 서브텍스트 / `N notes` (mono 11.5px)
그리드: `repeat(4, 1fr); gap:12px` → 1080px 이하 `repeat(2, 1fr)`
**8번째 칸은 Graph View 진입 카드** — `P4`에서 제거한 홈 그래프의 대체 진입점.

| slug | 이모지 | 라벨 | 서브텍스트 | 컬러 토큰 |
|---|---|---|---|---|
| `computer-science` | 💻 | Computer Science | 알고리즘 · 자료구조 · 네트워크 | `--c-cs` |
| `data-engineering` | 🛢 | Data Engineering | Airflow · Docker · PostgreSQL | `--c-de` |
| `data-science` | 📊 | Data Science | DL · ML · 통계 · 시각화 | `--c-ds` |
| `gis` | 🗺 | GIS | 공간 데이터 분석 | `--c-gis` |
| `programming` | 🐍 | Programming | Python · SQL | `--c-prog` |
| `finance-property` | 🏠 | Finance & Property | 부동산 · 금융 | `--c-fin` |
| `tools` | 🔧 | Tools | Obsidian · 워크플로우 | `--c-tool` |

> 노트 개수는 **`allFiles`에서 slug prefix로 실제 집계**할 것. 목업의 24/31/38 등은 총합 129에 맞춘 가정값이다.

---

#### `RecentList.tsx`

기존 `RecentNotes` 카드 그리드를 대체한다. `P7` 해결.

```
grid-template-columns: 96px 1fr auto;  gap:18px;  align-items:center
[날짜 mono 12px] [제목 15.5px/620 + 요약 1줄 clamp] [태그 mono 11px pill]
```

hover: `background: var(--surface-2)` + `padding-left: 14px` (미세 이동)
요약은 `-webkit-line-clamp: 1`로 1줄 고정.

---

#### `RelatedNotes.tsx`

`P4` 해결. 홈 Graph View 제거의 보상.

노트 하단에 백링크 + 아웃고잉 링크를 합쳐 최대 4개, `1fr 1fr` 그리드로 표시.
데이터 소스: `fileData.links` (아웃고잉) + Quartz `Backlinks` 컴포넌트의 역인덱스.

```
┌──────────────────────┬──────────────────────┐
│ HTTP 프로토콜          │ 인증과 토큰            │
│ computer-science/…   │ computer-science/…   │
└──────────────────────┴──────────────────────┘
```

---

### 4.2 수정 컴포넌트

| 컴포넌트 | 변경 내용 | 대응 문제 |
|---|---|---|
| `ContentMeta.tsx` | `summary` frontmatter를 **callout 블록**으로 렌더. 좌측 3px `--accent` 보더 + `SUMMARY` 라벨 + `--surface-2` 배경. **"Summary" 리터럴이 본문에 섞이지 않도록 frontmatter 파싱 경로를 분리** | P1 |
| `Comments.tsx` | giscus를 `<details>`로 감싸거나, 카운트 0일 때 섹션 자체를 렌더하지 않음 | P6 |
| `Graph.tsx` | 홈(`index`)에서 제거. 노트 상세 우측 사이드에 **local graph만** 유지하고, 연결 노드가 2개 미만이면 렌더 생략 | P4 |

---

## 5. frontmatter 스키마

구현 전 콘텐츠 측에서 확보해야 하는 필드다.

```yaml
---
title: API
date: 2026-07-24
tags:
  - computer-science/network
summary: |
  API는 프로그램끼리 데이터를 주고받는 방법(=코드로 작성된 규칙)이며,
  호출자와 제공자 사이의 계약이다.
featured: false        # Featured 섹션 노출 여부
---
```

| 필드 | 필수 | 용도 | 현황 |
|---|---|---|---|
| `title` | O | 제목 | 확보됨 |
| `date` | O | 정렬 / 표시 | 확보됨 |
| `tags` | O | 카테고리 · 태그 | 확보됨 |
| `summary` | O | 카드 요약 · callout | **P1의 원인. 파싱 경로 점검 필요** |
| `featured` | X | Featured 선정 | **신규** |
| `readingTime` | X | `5분 읽기` | Quartz 플러그인 자동 산출 가능 |

**P1 조치:** 현재 요약 텍스트에 `Summary`가 접두로 붙는 것은 frontmatter가 아니라 본문 첫 줄의 `Summary ...`를 잘라 쓰고 있을 가능성이 크다. `quartz.config.ts`의 `Plugin.Description()` 동작을 먼저 확인할 것.

---

## 6. 구현 순서

### Phase 1 — 즉시 수정 (컴포넌트 신설 없이 가능)
1. `P1` "Summary" 리터럴 제거 — Description 플러그인 / frontmatter 파싱 경로 수정
2. `P6` `0 reactions` · `0 comments` · `Today 0` 조건부 숨김
3. `P4` 홈 Graph View 제거 (`quartz.layout.ts`의 `right` 배열에서 삭제)
4. `P10` OG 이미지 / 메타 태그 — Quartz `Plugin.CustomOgImages()` 활성화
5. 모바일 반응형 점검 (현재 데스크톱 기준으로만 검증됨)

### Phase 2 — 디자인 토큰
6. `custom.scss`에 §2 토큰 이식 (`data-theme` → `saved-theme` 치환)
7. Pretendard / JetBrains Mono 로딩
8. 기존 Quartz 기본 스타일과 충돌 구간 정리

### Phase 3 — 홈 재구성
9. `Hero` + `StatsStrip`
10. `TopicGrid`
11. `Featured`
12. `RecentList` (기존 `RecentNotes` 교체)
13. `quartz.layout.ts`의 `defaultContentPageLayout` → 홈 전용 레이아웃 분기

### Phase 4 — 노트 상세
14. 3단 그리드 (`196px / minmax(0,1fr) / 208px`)
15. sticky TOC 스타일
16. `summary` callout
17. `RelatedNotes`

### Phase 5 — 신규 페이지
18. `/about`, `/archive`, `/topics`
19. 글로벌 네비게이션 바

---

## 7. 검증 체크리스트

- [ ] 라이트 / 다크 양쪽 렌더 확인 (토큰 누락으로 인한 대비 실패)
- [ ] 1080px 이하: 사이드바 접힘 · 그리드 재배치 · 본문 가로 스크롤 없음
- [ ] 375px (모바일): Hero 헤드라인 줄바꿈 · CTA 버튼 44px 이상 터치 영역
- [ ] **3단 그리드 좌측 컬럼이 찌그러지지 않는지** (`1fr` 금지, 고정 px)
- [ ] 한글이 `--mono` 폰트에 걸릴 때 폴백 정상 (`D2Coding` / `Malgun Gothic` 포함 확인)
- [ ] `summary` 미작성 노트에서 카드 레이아웃이 깨지지 않는지
- [ ] `featured: true`가 0건일 때 Featured 섹션 fallback
- [ ] 노트 1개짜리 토픽에서 `N notes` 단복수 처리
- [ ] 키보드 탐색: `⌘K` 검색 · TOC 링크 포커스 링

---

## 8. 참고 파일

| 파일 | 위치 | 내용 |
|---|---|---|
| `haejun-redesign.html` | 세션 스크래치패드 | **A안 목업** — 홈 + 노트 상세, 라이트/다크 토글 |
| `haejun-bc.html` | 세션 스크래치패드 | B/C안 목업 + A·B·C 비교표 |

목업 HTML의 CSS는 그대로 SCSS로 옮길 수 있게 작성되어 있다. 컴포넌트별 스타일 블록이 주석으로 구분되어 있으니 해당 구간을 `quartz/components/styles/*.scss`로 분리하면 된다.

---

## 9. 미결정 사항

| # | 항목 | 결정 필요 |
|---|---|---|
| Q1 | Hero 아바타 | 실제 프로필 사진 사용 여부. 없으면 이니셜 원 유지 |
| Q2 | Featured 선정 | `featured: true` 수동 vs 자동 라운드로빈 |
| Q3 | About 페이지 | 이력 수준 상세도 (채용 맥락 고려 여부) |
| Q4 | 아이브로우 문구 | `Data Engineer · Seoul`이 실제 직함과 맞는지 |
| Q5 | 토픽 컬러 | 현재 카드 상단 컬러바에서 역산한 값. 브랜드 기준 재정의 여부 |

---

## 부록 — B / C안 요약 (미채택)

| 기준 | B — Dashboard Garden | C — Docs Knowledge Base |
|---|---|---|
| 핵심 | 축적 자산 시각화 (Graph 히어로 + KPI + 히트맵) | 학습 경로 안내 (선행 지식 / 이어서 읽기 / 순서) |
| 강점 | 포트폴리오·채용 맥락 임팩트 최대 | 시리즈 노트 완독률 상승 |
| 약점 | 숫자 정체 시 역효과, 글 자체 노출이 밀림 | 단발성 노트에서 빈 경로 발생, 큐레이션 수작업 |
| 필요 데이터 | 링크 그래프 · 커밋 히스토리 · 태그 인덱스 | `prerequisite` / `next` frontmatter 수동 입력 |
| 작업량 | 상 | 중상 |

**B안의 Graph 히어로**와 **C안의 학습 경로 블록**은 A안 구현 후 추가 모듈로 얹을 수 있다.
특히 통계 시리즈(`2. 기초 통계량과 스케일링`, `3. 분포 변환과 행렬`)처럼 번호가 붙은 연재 노트에는 C안의 경로 UI가 효과적이므로, Phase 5 이후 검토를 권한다.
