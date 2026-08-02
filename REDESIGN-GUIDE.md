# 리디자인 구현 가이드라인 — design-handoff.md 대조 검증 결과

> 작성일: 2026-08-02 · 브랜치: `redesign/v5-homepage`
> 대상 문서: `design-handoff.md` (2026-07-29), `haejun-redesign-abc.html` (A/B/C 목업)
> 목적: 핸드오프 문서의 전제를 **실제 코드베이스·실제 콘텐츠와 대조**하고, 어긋난 지점을 교정한 구현 지침을 제시한다.

---

## 0. 결론 요약

핸드오프의 **디자인 판단(A안 채택, P1~P10 진단, 정보구조)은 대체로 타당하다.**
문제는 **구현 전제**다. 문서가 가정한 Quartz 버전, 콘텐츠 규모, 데이터 스키마가 모두 실제와 다르다.

| #   | 항목           | 핸드오프 전제                                  | 실제                                                   | 영향                                 |
| --- | -------------- | ---------------------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| F1  | 아키텍처       | Quartz v4 (`.ts` config, `quartz/components/`) | **quartz-community v5** (YAML config, 플러그인 패키지) | 치명 — 구현 방식 전면 변경           |
| F2  | 콘텐츠 규모    | 129 노트, DS 최다(38)                          | **90 노트, Programming 최다(39)**                      | 치명 — Hero 문구·TopicGrid 전제 붕괴 |
| F3  | `summary` 필드 | "확보 필요"                                    | **frontmatter 0건 / `[!summary]` 콜아웃 84건(93%)**    | 치명 — 선행조건 재설계로 해결 가능   |
| F4  | 브랜드         | Pretendard + 테라코타 `#c2703a`                | 현행 Nanum Myeongjo + 슬레이트 블루 `#3d6b8e`          | 높음 — 토큰 병렬 정의 시 사이트 분열 |
| F5  | 신규 작업량    | 신규 6 / 수정 3                                | **3~4건은 YAML 1줄, 2건은 이미 존재**                  | 중간 — 작업량 과대 추정              |
| F6  | `custom.scss`  | "전면 재작성"                                  | 이미 문서화된 `@layer` 지뢰 존재                       | 높음 — 과거 버그 재발 위험           |

**권고: 핸드오프를 폐기하지 말고, 아래 F1~F7 교정을 반영한 v2로 갱신한 뒤 착수한다.**

---

## 1. F1 — 아키텍처 세대 불일치 (치명)

### 근거

핸드오프는 전 구간에서 Quartz v4 관례를 가정한다.

- §2 "`quartz/styles/custom.scss` 최상단에 CSS 변수 정의"
- §4.1 "디렉터리: `quartz/components/`, `QuartzComponentConstructor` 패턴"
- §6-3 "`quartz.layout.ts`의 `right` 배열에서 삭제"
- §2 폰트 "`quartz.config.ts`의 `theme.fontOrigin`"

실제 저장소는 **quartz-community v5 플러그인 아키텍처**다.

| 근거                                 | 위치                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| YAML 설정 (385줄), `.ts` config 없음 | `quartz.config.yaml:1` — `$schema=./quartz/plugins/quartz-plugins.schema.json`                |
| 플러그인 = 독립 npm 패키지           | `plugins/*/package.json`, `plugins/*/tsup.config.ts` (로컬 9개)                               |
| 원격 플러그인 설치 파이프라인        | `package.json` → `prebuild: npm run install-plugins` → `.quartz/plugins/` (40여 개)           |
| 레이아웃 = 플러그인별 선언           | `quartz.config.yaml:163` `layout: {position, priority, display}` + `:360` `layout.byPageType` |

로컬 플러그인 표준 구조 (`plugins/recent-notes-index/` 실측):

```
plugins/<name>/
├── package.json          # @quartz-community/* peer deps
├── tsup.config.ts        # dist 빌드 (필수 — dist 없으면 빌드 실패)
├── src/
│   ├── index.ts          # export { default as X } from "./components/X"
│   └── components/
│       ├── X.tsx         # QuartzComponent
│       └── styles/x.scss
└── dist/                 # 커밋 대상
```

### 교정 지침

1. **신규 컴포넌트는 전부 로컬 플러그인 패키지로 만든다.** `quartz/components/Hero.tsx` 같은 코어 디렉터리 직접 수정은 금지 — 업스트림(`remotes/upstream/v5`) 머지 때마다 충돌한다.
2. Hero + StatsStrip은 **한 패키지(`./plugins/home-hero`)로 묶는다.** 핸드오프도 StatsStrip을 Hero 내부 하단에 두므로 분리 이유가 없고, 패키지 수 = 빌드 대상 수다.
3. 권장 신규 패키지 3개 (핸드오프의 6개 → 축소, 근거는 F5):
   - `./plugins/home-hero` (Hero + StatsStrip)
   - `./plugins/topic-grid` (TopicGrid)
   - `./plugins/featured-notes` (Featured)
4. 홈 전용 렌더는 컴포넌트 내부 `slug === "index"` 가드가 아니라 **레이아웃 `condition`으로 처리**한다. `not-index`의 역인 `is-index` 조건을 등록해야 한다 (F5 참조).
5. 작업량 재추정: 핸드오프의 "컴포넌트 6~~9개"는 v5에서 **패키지 스캐폴딩 + tsup 설정 + dist 커밋 + YAML 등록**이 각각 붙는다. 컴포넌트당 실 작업량은 v4 대비 1.5~~2배로 잡는다.

> **관련 기존 지식:** `github:` 참조 플러그인은 dist 누락 시 빌드가 깨진 전례가 있다. 로컬 플러그인도 동일하게 `dist/`를 반드시 커밋한다.

---

## 2. F2 — 콘텐츠 실측이 목업과 다르다 (치명)

### 근거

`find -L content -name '*.md'` 실측 (심볼릭 링크 → Obsidian vault):

| 토픽             | 목업 값 | **실측** | 차이    |
| ---------------- | ------: | -------: | ------- |
| programming      |      14 |   **39** | +25     |
| data-engineering |      31 |   **19** | −12     |
| finance-property |       7 |    **8** | +1      |
| data-science     |      38 |    **7** | **−31** |
| computer-science |      24 |    **6** | **−18** |
| gis              |      12 |    **6** | −6      |
| tools            |       3 |    **4** | +1      |
| **합계**         | **129** |   **90** | **−39** |

핸드오프 §4.1은 "목업의 24/31/38 등은 총합 129에 맞춘 가정값"이라고 스스로 명시했지만, **총합 129 자체가 틀렸다.** Hero 소개문의 "129개의 기록"(`haejun-redesign-abc.html:455`)도 마찬가지다.

### 함의 — 단순 숫자 교체로 끝나지 않는다

1. **분포가 극단적이다.** Programming 39 vs Tools 4 = 약 10배. 핸드오프의 균등 4×2 카드 그리드는 "7개 토픽이 대등하다"는 시각적 거짓말을 한다. 목업이 그럴듯해 보였던 건 24/31/38로 평탄화했기 때문이다.
2. **주력 토픽이 뒤바뀐다.** 목업은 Data Science(38)를 최다로 그렸으나 실제는 7개로 5위다. "데이터 엔지니어링과 공간 데이터" 중심의 Hero 카피가 실제 콘텐츠(Programming 43%)와 어긋난다.
3. 90개는 "큐레이션이 필요한 규모"의 하한이다. Featured 4개 + Recent 6개 = 10개면 전체의 11%가 홈에 노출된다 — 밀도 판단을 다시 해야 한다.

### 교정 지침

1. **모든 숫자는 예외 없이 `allFiles` 런타임 집계.** 하드코딩 금지 (핸드오프 §4.1도 동의).
2. **TopicGrid를 분포 반영형으로 바꾼다.** 택 1:
   - (a) 노트 수 내림차순 정렬 + 상위 3개를 2칸 폭으로 (bento 변형)
   - (b) 균등 카드 유지 + 카드 하단에 전체 대비 비율 바 추가
   - **(a) 권장** — 방문자에게 "이 사람은 Programming/DE 사람"이라는 정보가 즉시 전달된다. 균등 그리드는 그 신호를 지운다.
3. **Hero 카피를 실제 분포에 맞춰 다시 쓴다.** "데이터 엔지니어링과 공간 데이터" → Programming·Data Engineering이 실제 주력임을 반영. 숫자는 집계값 바인딩.
4. 토픽 컬러(핸드오프 §2 `--c-*` 7종)는 카드 정렬이 바뀌어도 slug 고정 매핑을 유지한다.

---

## 3. F3 — `summary` 문제: 진단은 맞았고, 처방은 틀렸다 (치명·기회)

### 근거

핸드오프 §5는 `summary` frontmatter를 **선행 조건**으로 걸었다. 실측:

```
summary:     frontmatter 보유 노트 → 0건
description: frontmatter 보유 노트 → 0건
featured:    frontmatter 보유 노트 → 0건
[!summary]   콜아웃 보유 노트     → 84건 / 90건 (93%)
```

즉 **핸드오프대로라면 90개 노트에 요약을 수동 입력해야 착수 가능하다.** 이것이 현재 최대 병목이다.

P1의 정확한 원인 (핸드오프 §5는 "가능성이 크다"로 추정만 했다):

`content/computer-science/data-structure/stack-queue.md` 실측 —

```markdown
---
title: 스택과 큐 자료구조
...
---

> [!summary] Summary
>
> - 스택(Stack)은 후입선출(LIFO)로 동작하는 선형 자료구조이며, ...
```

`description` 플러그인(`quartz.config.yaml:95`)이 마크다운을 스트립한 뒤 앞 150자를 자른다 → 콜아웃 타이틀 리터럴 **"Summary"가 선두에 붙는다.** 추정이 아니라 확인된 사실이다.

### 교정 지침 — 콘텐츠 수정 0건으로 해결

**`[!summary]` 콜아웃 본문을 추출해 `fileData.description`에 주입하는 transformer를 만든다.** 84개 노트가 즉시 요약을 갖는다.

구현 시 반드시 처리할 것 — 콜아웃 타이틀이 6종으로 갈린다 (실측):

| 타이틀                                 | 건수 |
| -------------------------------------- | ---: |
| `[!summary] Summary`                   |   60 |
| `[!summary] 요약`                      |   19 |
| `[!summary] Summary` (표기 변형)       |    3 |
| `[!summary] summary`                   |    1 |
| `[!summary] SELECT 문 구조`            |    1 |
| `[!summary] 결론: 신규 프로젝트는 ...` |    1 |

→ **타이틀 라인을 패턴 매칭하지 말고, 콜아웃 첫 줄 전체를 버리고 본문만 취한다.** "Summary"/"요약" 문자열 매칭은 뒤의 2건에서 실패한다.

추가 처리:

- 본문이 `- ` 불릿 리스트인 경우가 다수 → 카드 요약용으로는 **첫 불릿만** 취하고 마커 제거.
- 미보유 6개 노트 fallback: 기존 `description` 플러그인 결과 그대로 사용 (콜아웃이 없으므로 "Summary" 오염도 없다).
- 우선순위: `frontmatter.description` > `[!summary]` 추출 > `description` 플러그인 자동 생성.

**`featured` 필드는 별개 문제다.** 0건이므로 핸드오프 §Q2의 "수동 vs 자동"은 사실상 결정되어 있다 — **초기에는 자동(최근 노트 + 토픽 라운드로빈)으로 가고, 수동 `featured: true`는 오버라이드로만 지원**한다. 그래야 지금 착수할 수 있다.

---

## 4. F4 — 브랜드 토큰 병렬 정의 금지 (높음)

### 근거

|        | 현행 (`quartz.config.yaml:16-43`) | 핸드오프 §2        |
| ------ | --------------------------------- | ------------------ |
| 헤딩   | Nanum Myeongjo (명조)             | Pretendard         |
| 본문   | Noto Sans KR                      | Pretendard         |
| 액센트 | `#3d6b8e` 슬레이트 블루           | `#c2703a` 테라코타 |
| 배경   | `#fafaf8`                         | `#fbfbfa`          |

핸드오프 §2는 `--accent`, `--text`, `--bg`를 **Quartz 기본 변수와 "병행 사용"**하고 "신규 컴포넌트는 아래 토큰만 참조"하라고 지시한다.

**이것이 문제다.** `theme.colors`는 `--secondary`, `--dark`, `--light`로 컴파일되어 활성 플러그인 **30여 개 전부**(explorer, search, backlinks, graph, toc, callouts, syntax-highlighting, comments…)가 참조한다. 신규 3~6개 컴포넌트만 테라코타를 쓰면 **홈은 테라코타, 사이드바·검색·백링크·콜아웃은 블루**로 사이트가 두 브랜드로 쪼개진다. 리디자인이 아니라 부분 이식이 된다.

### 교정 지침

1. **단일 소스로 통일한다.** 새 팔레트는 `quartz.config.yaml`의 `theme.colors`에 넣고, `custom.scss`에서는 별칭만 정의한다:
   ```scss
   :root {
     --accent: var(--secondary);
     --text: var(--dark);
     --text-2: var(--darkgray);
     --border: var(--lightgray);
   }
   ```
   핸드오프 §2의 토큰 이름은 살리되 **값은 Quartz 변수를 가리키게** 한다. 신규/기존 컴포넌트가 같은 색을 쓴다.
2. 토픽 컬러 `--c-*` 7종은 Quartz에 대응 변수가 없으므로 이것만 원시값으로 둔다. **단, 다크모드 값이 핸드오프에 없다** — `[saved-theme="dark"]`에서 채도를 낮춘 대응 값을 반드시 추가해야 한다(§7 체크리스트의 "토큰 누락으로 인한 대비 실패"가 정확히 이 지점이다).
3. **`saved-theme` 지적은 정확하다.** 확인됨 — `.quartz/plugins/darkmode/dist/index.js:344`가 `document.documentElement.setAttribute("saved-theme", ...)`를 호출한다. 목업의 `data-theme`은 전량 치환.
4. **폰트 로딩은 핸드오프보다 쉽다.** `Head.tsx` 수정 불필요 — `fonts` 플러그인이 `fontOrigin: "local"`을 지원한다(README 확인). `quartz/static/`에 woff2를 두고 `custom.scss`에서 `@font-face` 선언 후, 플러그인 옵션에 패밀리명을 넘기면 된다.
5. **명조 → Pretendard는 디자인 결정이지 기술 문제가 아니다.** 현재 사이트의 한글 명조 헤딩은 뚜렷한 개성이고, 핸드오프에는 이를 버리는 근거가 없다. **대안 권고: 헤딩 명조 유지 + 본문/UI만 Pretendard.** "Minimal Editorial"이라는 채택안 성격에 세리프 헤딩이 오히려 부합한다. 전면 산세리프 전환은 별도 승인 사항으로 올린다.

> 참고: 디자인 DB 조회 결과는 이 사례에 대한 매칭이 약했다(뉴스레터 패턴 / 라틴 세리프 / 핑크 액센트 — 한글 디지털가든과 부적합). 위 권고는 DB 추천이 아니라 코드베이스 실측에 근거한다. DB에서 채택한 항목은 §8 체크리스트 2개뿐이며 해당 위치에 명시했다.

---

## 5. F5 — 작업량 재산정: 절반은 YAML 한 줄 (중간)

핸드오프 Phase 1의 상당수가 이미 해결되어 있거나 설정 변경으로 끝난다.

| 핸드오프 항목            | 실제 필요 작업                                                                                 | 근거                                                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P4 홈 Graph 제거         | `graph` 플러그인에 **`condition: not-index` 한 줄**                                            | `quartz/plugins/loader/conditions.ts:6`에 내장. `breadcrumbs`가 이미 `quartz.config.yaml:222`에서 사용 중                                                           |
| P6 `Today 0 / Total 129` | `./plugins/visitor-counter` **`enabled: false`**                                               | `quartz.config.yaml:342`                                                                                                                                            |
| P6 `0 comments`          | `comments`에 **`condition: not-index`**                                                        | 홈에서만 숨기면 충분                                                                                                                                                |
| P10 OG 이미지            | **작업 없음 — 핸드오프의 오진으로 확정**                                                       | 빌드 결과 `<slug>-og-image.webp` **147개 정상 생성**, `og:image` 메타도 정상. 렌더 이미지 육안 확인 완료 (`static/social-images/`가 아니라 각 페이지 옆에 생성된다) |
| RecentList 신규          | **신규 아님** — `./plugins/recent-notes-index` 존재 (limit 6, showTags, afterBody)             | `quartz.config.yaml:305`. 스타일·마크업 교체만                                                                                                                      |
| RelatedNotes 신규        | **부분 존재** — `backlinks` 플러그인 + `has-backlinks` 조건 내장, `./plugins/prev-next`도 존재 | `conditions.ts:11`. 아웃고잉 링크 병합만 추가                                                                                                                       |

**결과: 신규 패키지 6개 → 3개, Phase 1 5개 항목 중 4개가 설정 변경.**

### 단, 새로 필요한 것 — **검증 완료: 차단 요소 아님**

홈 전용 컴포넌트를 위한 `is-index` 조건. 내장 조건에는 `not-index`만 있다(`conditions.ts:5-19`).
초판에서 "막히면 홈 레이아웃 분기 전체가 막힌다"고 적었으나, **확인 결과 차단 요소가 아니다.**

- `registerCondition`은 `quartz/plugins/loader/loader.ts`에서 `export * from "./conditions"`로 공개되어 있다 → 로컬 플러그인에서 등록 가능.
- 등록에 실패하더라도 **빌드가 깨지지 않는다.** `config-loader.ts:928` `applyConditionWrapper`는 알 수 없는 조건 이름에 대해 경고만 출력하고 컴포넌트를 **항상 렌더**한다.
- 최악의 경우에도 핸드오프 §4.1의 컴포넌트 내부 `slug === "index"` 가드가 그대로 동작한다.

→ `condition` 방식을 우선 시도하되, 실패 시 내부 가드로 내려가면 된다. Phase 0에서 붙잡을 이유가 없다.

---

## 6. F6 — `custom.scss` 전면 재작성은 알려진 지뢰다 (높음)

### 근거

`quartz/styles/custom.scss:20-33`에 이미 기록된 사고다:

> custom.scss는 기본적으로 non-layered로 출력되어 명시도와 무관하게 `@layer` 안의 모든 플러그인 스타일을 이기는데, 그 결과 bare h2가 Explorer 제목을, bare p가 breadcrumb 구분자를 덮어써서 **"explorer 접으면 사라짐" / "breadcrumb ❯ 정렬 깨짐"** 버그를 일으켰다.

핸드오프 §0의 "`custom.scss` 전면 재작성"과 §2의 타이포 스케일 8종(Hero h1, Post h1, Section h3, Post h2, 본문…)은 전역 요소 선택자를 대량 도입한다 — **정확히 같은 버그를 재발시키는 경로다.**

### 교정 지침

1. **전역 요소 선택자(h1~h6, p, a, strong)는 예외 없이 `@layer quartz-base { }` 안에.** 기존 파일의 패턴을 그대로 따른다.
2. **컴포넌트 스코프 스타일은 `custom.scss`에 넣지 않는다.** 각 플러그인 패키지의 `src/components/styles/*.scss`로 분리 — 핸드오프 §8도 같은 방향을 제안했다.
3. `custom.scss`에는 **토큰 별칭(§4-1)과 전역 타이포만** 남긴다. "전면 재작성"이 아니라 **증분 수정**으로 접근한다.
4. 회귀 확인 필수 2종: **Explorer 폴더 접기·펼치기**, **breadcrumb `❯` 정렬**. 과거 이 둘이 깨졌다.

---

## 7. F7 — 그 외 확인 사항

- **3단 그리드 경고는 채택.** 핸드오프 §3.3의 "좌측 컬럼 `1fr` 금지, 고정 px" — 유효. 단 현재 explorer/toc가 모두 `display: desktop-only`(`quartz.config.yaml:166, 89`)이므로, v5 레이아웃 CSS가 이미 폭을 정하고 있다. **덮어쓰기 전에 `quartz/styles/base.scss`의 기존 그리드 정의를 먼저 읽을 것.**
- **이모지 아이콘.** 핸드오프 §4.1 TopicGrid는 💻🛢📊🗺🐍🏠🔧를 19px 아이콘으로 쓴다. 이는 UI/UX 우선순위 4의 명시적 안티패턴(이모지를 아이콘으로 사용)이다 — 플랫폼별 렌더 차이, 크기 불일치, 스크린리더 오독. **Lucide/Heroicons SVG 권장.** 다만 현재 `content/index.md`가 이미 같은 이모지를 쓰고 있어 사용자 취향일 수 있으므로 **결정 사항으로 올린다**(Q6).
- **접근성 — 핸드오프 §2 토큰에서 WCAG AA 위반 3건 확인.** 핸드오프 §7 체크리스트에 대비비 검증 항목이 없어 직접 계산했다:

  | 조합                                          |     대비비 | 판정      |
  | --------------------------------------------- | ---------: | --------- |
  | `--text-3 #8b8a82` on `--bg #fbfbfa` (라이트) | **3.35:1** | ✗ AA 미달 |
  | `--text-3 #75746d` on `--bg #131312` (다크)   | **3.96:1** | ✗ AA 미달 |
  | `--accent #c2703a` on `--bg #fbfbfa`          | **3.58:1** | ✗ AA 미달 |
  | `--text-2 #57564f` on `--bg #fbfbfa`          |     7.12:1 | ✓         |

  `--text-3`는 핸드오프 §2 타이포 스케일에서 **메타 텍스트 12px**에 지정되어 있어 조건이 가장 나쁘다(작은 글자 + 낮은 대비). `--accent`는 링크·CTA 색이므로 본문 링크에 쓰이면 그대로 위반이다.
  **조치:** `--text-3` 양쪽 모드 명도 조정, `--accent`는 텍스트용/배경용 값을 분리(텍스트용은 더 어둡게). 라이트/다크 각각 재측정 후 확정.

- **모바일.** 핸드오프 §6-5도 지적했듯 목업은 데스크톱 전용이다. `spacer` 플러그인이 `mobile-only`로 걸려 있고(`quartz.config.yaml:244`) explorer/toc가 desktop-only이므로, **모바일에서 홈의 실제 구성은 목업과 완전히 다르다.** 별도 와이어프레임이 필요하다.

---

## 8. 교정된 구현 순서

### Phase 0 — 착수 전 검증 (완료)

- [x] `is-index` 조건 등록 경로 검증 → **차단 요소 아님** (F5 말미)
- [x] `og-image` 실제 렌더 확인 → **정상 작동, P10은 오진** (F5 표)
- [x] 폰트 결정: **헤딩 Nanum Myeongjo 유지 + 본문 Pretendard** → 적용 완료 (§10)
- [ ] `base.scss` 기존 그리드 정의 확인 (F7)
- [x] 컬러 결정: **슬레이트 블루 유지** + 토픽 7색 유지·다크값 추가 (§11)

### Phase 1 — 설정 변경만 (컴포넌트 0개)

- [ ] `graph` → `condition: not-index` (P4)
- [ ] `visitor-counter` → `enabled: false` (P6)
- [ ] `comments` → `condition: not-index` (P6)

### Phase 2 — 데이터 계층 (병목 해소, 최우선)

- [ ] `[!summary]` 콜아웃 추출 transformer — 84개 노트 요약 확보 (F3, P1)
- [ ] 타이틀 변형 6종 처리 + 불릿 리스트 정규화 + 미보유 6개 fallback
- [ ] 토픽별 노트 수 집계 유틸 (F2)

### Phase 3 — 토큰

- [ ] `theme.colors` 팔레트 교체 (단일 소스)
- [ ] `custom.scss` 별칭 + `@layer quartz-base` 준수 (F4, F6)
- [ ] `--c-*` 다크모드 대응값 추가 (F4-2)
- [ ] `--text-3`(라이트/다크) · `--accent` 대비비 AA 위반 3건 교정 후 재측정 (F7)
- [ ] 회귀 확인: Explorer 접기 / breadcrumb 정렬 (F6-4)

### Phase 4 — 홈 컴포넌트

- [ ] `./plugins/home-hero` (Hero + StatsStrip, 집계값 바인딩)
- [ ] `./plugins/topic-grid` (분포 반영 정렬, F2-2)
- [ ] `./plugins/featured-notes` (자동 선정 + `featured` 오버라이드, F3)
- [ ] `recent-notes-index` 스타일 교체 (신규 아님, F5)

### Phase 5 — 노트 상세 / 신규 페이지

- 핸드오프 §6 Phase 4~5 유지. 단 `RelatedNotes`는 `backlinks` 확장으로 접근 (F5).

### 사전 인도 체크 (디자인 DB 인용 2건)

- [ ] 라이트/다크 모두 본문 대비 4.5:1 이상
- [ ] `prefers-reduced-motion` 대응 — 핸드오프 §4.1 RecentList의 hover `padding-left: 14px` 이동이 해당

---

## 9. 결정 필요 사항

핸드오프 §9의 Q1~Q5는 유효하다. 아래를 추가한다.

| #   | 항목           | 결정 필요                                     | 차단 범위         |
| --- | -------------- | --------------------------------------------- | ----------------- |
| Q6  | 토픽 아이콘    | 이모지 유지 vs SVG 전환 (F7)                  | TopicGrid         |
| Q7  | 헤딩 폰트      | Nanum Myeongjo 유지 vs Pretendard 전환 (F4-5) | Phase 3 전체      |
| Q8  | TopicGrid 형태 | 균등 그리드 vs 분포 반영 (F2-2)               | TopicGrid         |
| Q9  | Featured 선정  | 자동 우선 착수 승인 여부 (F3)                 | Phase 4 착수 시점 |
| Q10 | 모바일         | 별도 와이어프레임 작성 여부 (F7)              | 반응형 전 구간    |

**Q4(아이브로우 "Data Engineer · Seoul")는 F2 실측으로 재검토 대상이 되었다** — 실제 노트 분포는 Programming(39) > Data Engineering(19)이다.

---

## 10. 적용 완료 — 폰트 (2026-08-02)

**결정: 헤딩은 Nanum Myeongjo(명조) 유지, 본문만 Pretendard.** (Q7 해소)

### 10.1 작업 중 발견한 선행 버그 — 명조는 적용된 적이 없었다

가장 중요한 발견이다. `fonts` 플러그인이 **옵션 없이** 활성화되어 있었고, 그 결과:

- 플러그인이 자기 **기본값**(Schibsted Grotesk / Source Sans Pro / IBM Plex Mono)으로 CSS를 emit
- 그 파일(`static/resource-style-*.css`)이 코어 테마 CSS(`index-*.css`)보다 **뒤에** 로드
- → `configuration.theme.typography`의 Nanum Myeongjo를 통째로 덮어씀

즉 **사이트는 그동안 명조가 아니라 Schibsted Grotesk로 렌더되고 있었다.** 게다가 플러그인이 emit한 값에는 폴백 스택이 없어(`--bodyFont: Source Sans Pro;`) 한글은 브라우저 기본 폰트로 떨어졌다. 덤으로 미사용 3개 패밀리를 받는 **불필요한 2차 Google Fonts 요청**도 매 페이지 발생했다.

핸드오프가 "현행 = 명조"라고 기술한 것도, 내가 §4에서 그대로 옮긴 것도 실제 렌더가 아니라 설정값만 본 결과였다.

**조치:** `fonts` 플러그인에 의도한 값을 명시하고 `fontOrigin: local`(= 이 플러그인은 로딩하지 않음)로 고정. 2차 요청도 함께 제거됐다.

### 10.2 Pretendard 로딩 — 초판 §4-4의 오류 정정

초판에서 "`fonts` 플러그인이 `fontOrigin: local`을 지원하므로 핸드오프보다 쉽다"고 적었다. **틀렸다.** 실제 의미는:

| 값            | 실제 동작                                                                            |
| ------------- | ------------------------------------------------------------------------------------ |
| `local`       | **아무것도 로드하지 않음** (폰트가 이미 있다고 가정). "로컬 폰트 파일 사용"이 아니다 |
| `googleFonts` | Google Fonts에서 로드                                                                |
| `selfHosted`  | 이름과 달리 **Google Fonts에서 받아 재호스팅**. Google에 없는 폰트에는 무용          |

→ Pretendard는 **어느 경로로도 자동 로딩되지 않는다.** 별도 로더가 필요하다는 핸드오프 §2의 판단이 옳았다.

세 가지 대안 중 선택:

| 방법                                                     | 판정                                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `custom.scss`에 `@import url(...)`                       | **불가.** v5는 customStyles를 base 뒤에 이어붙이므로 `@import`가 CSS 중간에 위치 → 브라우저가 무시 |
| `Head.tsx`에 `<link>` 직접 추가                          | 가능하지만 **코어 파일 수정** → 업스트림 머지 시 충돌 (F1 위배)                                    |
| **로컬 플러그인 + `externalResources().additionalHead`** | **채택.** 코어 수정 없음. `goatcounter-tracking`이 이미 쓰는 검증된 패턴                           |

**신규: `./plugins/pretendard-font`** — jsDelivr의 dynamic-subset(92분할)을 `<link>`로 주입한다. 한글 페이지가 실제로 쓰는 서브셋만 내려받으므로 단일 variable 파일보다 전송량이 작다.

### 10.3 명조가 같이 죽지 않는 근거

`googleFontHref`(`quartz/util/theme.ts:88`)는 header/body/code 세 패밀리를 **URL 하나**로 합친다. body에 Google에 없는 이름이 들어가면 전체가 400날 위험이 있어 실제로 확인했다:

```
family=Nanum+Myeongjo&family=Pretendard+Variable&family=JetBrains+Mono
→ HTTP 200, @font-face 2개 (Nanum Myeongjo, JetBrains Mono)
```

Google은 **미지원 패밀리를 조용히 무시하고 나머지를 반환**한다. (`family=Pretendard` 단독은 400.) 따라서 `theme.typography.body`에 Pretendard를 두어도 명조·코드 로딩은 무사하다.

### 10.4 OG 이미지 폰트 경고 — 해결됨

한때 빌드마다 다음 경고가 떴다.

```
Warning: Failed to fetch font Pretendard Variable with weight 400, got Bad Request
```

**원인.** og-image 에미터는 satori 래스터화용 폰트를 Google Fonts에서 개별로 받는데, 무엇을 받을지 `theme.typography`에서 **직접** 읽는다(dist의 `emit()` → `getSatoriFonts`). `og-image.overrides.tsx`는 JSX의 `fontFamily` 문자열만 바꿀 뿐 **이 fetch 목록에는 관여하지 못한다.** 따라서 `theme.typography.body`에 Google에 없는 폰트를 두면 반드시 실패한다.

**해결 — 두 설정의 역할을 분리한다.** 이 둘은 이름이 비슷하지만 하는 일이 다르다.

| 설정                             | 역할                                               | 제약                                             |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| `configuration.theme.typography` | Google Fonts URL 구성 + og-image(satori) 폰트 로드 | **Google에 있는 폰트여야 함**                    |
| `fonts` 플러그인 `options`       | 실제 `--bodyFont` / `--headerFont` CSS 변수값      | 가장 뒤에 로드 = **최종 승자**. 아무 폰트나 가능 |

→ `theme.typography.body`는 Google에 있는 **Noto Sans KR**로 두고, 브라우저가 실제로 쓸 **Pretendard**는 `fonts` 플러그인에서 지정한다. 경고가 사라지고 브라우저 표시 폰트는 그대로 Pretendard다.

**비용 검증 — 초판의 "손해가 더 크다"는 판단은 틀렸다.**
초판에서 "브라우저가 쓰지도 않는 Noto Sans KR을 매번 받게 되어 손해"라고 적었으나 실측 결과:

- Noto Sans KR은 헤더/코드와 **같은 URL에 합쳐진다** → 추가 HTTP 요청 **0건**
- 응답 CSS 크기 932B → 1165B, 즉 **+233바이트**
- woff2 실파일은 해당 폰트로 렌더되는 텍스트가 있을 때만 내려받는다. `--bodyFont`가 Pretendard인 이상 **브라우저는 받지 않는다.** satori만 빌드 타임에 받는다.

사실상 무비용이다. 경고를 감수할 이유가 없었다.

**부수 효과(개선):** OG 이미지 본문이 명조가 아니라 한글 산세리프로 렌더된다.

### 10.4.1 별건 — OG 이미지의 한글 헤딩은 명조가 아니다

렌더 결과를 보면 한글 제목이 명조가 아닌 산세리프로 나온다. 원인은 og-image 플러그인의 `fetchTtf`가 Google Fonts CSS에서 **정규식으로 첫 번째 `.ttf` URL 하나만** 가져오기 때문이다(`urlRegex.exec(css)`). Google은 폰트를 unicode-range로 잘게 나눠 서빙하므로 그 첫 파일은 보통 latin 서브셋이고, 한글 글리프가 없어 satori가 body 폰트로 폴백한다.

- **이번 변경과 무관한 선행 이슈다.** 라틴 제목(예: `data-science`)은 정상적으로 명조로 렌더된다.
- 영향은 OG 이미지 한정이며 사이트 본문과는 무관하다. 우선순위 낮음.
- 고치려면 서브셋 URL을 전부 받아 satori에 여러 폰트로 넘기거나, 한글 커버리지가 있는 단일 TTF를 직접 지정해야 한다 → 플러그인 수정 필요.

**함께 확인된 것:** 이 OG 이미지의 설명문이 `Summary 스택(Stack)은 후입선출...`로 시작한다. **F3(P1)의 "Summary" 리터럴 오염이 OG 이미지·RSS·메타 태그까지 퍼져 있다는 증거다.** F3 transformer를 만들면 이쪽도 함께 해결된다.

### 10.5 검증 결과

```
빌드            성공 (90 files, 781 emitted) — 폰트 경고 없음
tsc --noEmit    통과
prettier        통과

최종 CSS (마지막 로드 파일 기준)
  --headerFont: "Nanum Myeongjo", serif
  --bodyFont:   "Pretendard Variable", system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif

<head> 폰트 요청 2건 (2차 Google 요청 제거됨)
  fonts.googleapis.com  → Nanum Myeongjo, Noto Sans KR(satori용), JetBrains Mono
  cdn.jsdelivr.net      → Pretendard Variable (dynamic-subset)

OG 이미지        147개 생성, 렌더 확인 완료
```

**미검증:** 브라우저 실렌더 확인은 하지 않았다. 로컬 서버를 띄워 라이트/다크 양쪽에서 본문이 실제로 Pretendard로 보이는지 눈으로 확인하는 절차가 남아 있다.

---

## 11. 적용 완료 — 컬러 토큰 (2026-08-02)

**결정: 액센트는 현행 슬레이트 블루 유지. 토픽 7색은 핸드오프 값 유지 + 다크모드 대응값 신규 정의.**

### 11.1 액센트 — 테라코타를 채택하지 않은 이유

계산해보니 **접근성은 결정 요인이 아니었다.** 현행 블루는 이미 AA를 전부 통과한다.

|                                   | 라이트       | 다크         |
| --------------------------------- | ------------ | ------------ |
| 현행 accent `#3d6b8e` / `#7aaed4` | **5.44:1 ✓** | **7.04:1 ✓** |
| 현행 본문                         | 11.09:1 ✓    | 9.47:1 ✓     |
| 핸드오프 테라코타 `#c2703a`       | **3.58:1 ✗** | 7.69:1 ✓     |

즉 순수 브랜드 판단이었고, 다음 근거로 유지를 택했다.

- 핸드오프에 테라코타 채택 근거가 없다. 스스로 §Q5에서 "브랜드 기준 재정의 여부"를 미결로 남겼다.
- 리디자인의 실제 문제(P1~P10)는 색이 아니라 정보구조·데이터다. 색 전환은 30여 개 플러그인에 동시 영향을 주는 리스크만 추가한다.
- 레이아웃·타이포·홈 구성이 전면 개편되므로 "달라진 느낌"은 색 없이도 충분하다.

**초판 §4의 "토큰 병렬 정의 금지" 지침은 그대로 적용했다.** `--accent` 등은 값을 새로 정의하지 않고 Quartz 변수의 별칭으로 둔다:

```scss
:root {
  --accent: var(--secondary);
  --text: var(--dark);
  --border: var(--lightgray);
  ...
}
```

### 11.2 토픽 컬러 — 장식용/텍스트용 2단 분리

핸드오프 §2의 7색을 텍스트에 그대로 쓰면 **7개 중 6개가 AA 미달**이다(라이트 `#fafaf8` 기준).

| 토픽 | 원본      |   대비 | 텍스트용 보정 |   대비 |
| ---- | --------- | -----: | ------------- | -----: |
| cs   | `#4c6ef5` | 4.14 ✗ | `#4266f4`     | 4.53 ✓ |
| de   | `#12b886` | 2.44 ✗ | `#0d835f`     | 4.54 ✓ |
| ds   | `#7950f2` | 4.74 ✓ | (원본 유지)   | 4.74 ✓ |
| gis  | `#f76707` | 2.91 ✗ | `#c05005`     | 4.58 ✓ |
| prog | `#e8590c` | 3.43 ✗ | `#c64c0a`     | 4.53 ✓ |
| fin  | `#0ca678` | 2.98 ✗ | `#09825e`     | 4.60 ✓ |
| tool | `#868e96` | 3.18 ✗ | `#6c747d`     | 4.53 ✓ |

목업이 이 색들을 `<span class="cat c-fin">`처럼 **글자에** 쓰기 때문에 실제로 문제가 된다.

**해결: 토큰을 2단으로 나눈다.**

- `--c-*` — 원본 값. 3px 컬러바·아이콘 등 **장식 전용** (대비 요구 없음)
- `--c-*-text` — 보정값. 카테고리 라벨 **텍스트 전용**

핸드오프 7색의 시각적 인상을 그대로 유지하면서 라벨 가독성을 확보한다.
**구현 규칙: 색을 글자에 쓰는 자리에는 반드시 `-text` 쪽을 참조할 것.**

### 11.3 다크모드

핸드오프 §2에는 `--c-*` 다크값이 **아예 없었다**(§7 체크리스트의 "토큰 누락으로 인한 대비 실패"가 정확히 이 지점). 다크 배경 `#1a1e24`에서 cs·ds만 미달이라 그 2색의 명도를 올렸다. 나머지 5색은 원본 그대로 통과한다.

셀렉터는 `:root[saved-theme="dark"]`를 쓴다 — 목업의 `data-theme`은 동작하지 않는다.

### 11.4 검증

```
빌드              성공 (781 emitted)
컴파일된 CSS      --accent:var(--secondary) ✓
                  --c-fin:#0ca678 / --c-fin-text:#09825e ✓
다크 셀렉터       [saved-theme=dark]{--c-cs-text:#5d7cf6; …} ✓
회귀              Explorer·breadcrumb 구조 정상
```

**미검증:** 브라우저 실렌더(라이트/다크 토글). `--c-*`는 아직 참조하는 컴포넌트가 없어 정의만 된 상태다 — Phase 4에서 실제 사용된다.
