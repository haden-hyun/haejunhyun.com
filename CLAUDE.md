# CLAUDE.md

Obsidian vault를 **Quartz v5**로 빌드해 Cloudflare로 서빙하는 개인 블로그(haejunhyun.com).
현재 작업 브랜치 `redesign/v5-homepage`, 프로덕션 브랜치 `v5`.

**한국어로 응답한다.**

---

## 문서 지도 — 먼저 읽을 것

| 파일 | 역할 |
|---|---|
| `DESIGN-SYSTEM.md` | **디자인의 현재 상태.** 색·서체를 건드리기 전 §6(고칠 때 규칙) 필독 |
| `CHANGELOG.md` | "왜 이렇게 됐나"의 타임라인. 서사는 전부 여기 |
| `README.md` | 배포 구조 ⚠️ 로컬 플러그인 개수가 낡음(9종 → 실제 19종) |
| `haejun-redesign-palette.html` | 정적 목업. **빌드 없이 열리는 유일한 시각 검증 수단** |

**주석은 핵심 기능·커스텀 로직에만, 한 줄로.** `.scss`/`.yaml`/`.tsx` 어디든 동일 — "왜
이 값을 골랐는지" 서사·비교·근거 나열은 쓰지 않는다. 함정만 `⚠️` 한 줄. 히스토리·날짜·
세션 서사·디자인 근거는 주석에 남기지 말고 CHANGELOG.md/DESIGN-SYSTEM.md로 보낸다.

---

## 아키텍처 — 반드시 알아야 할 것

### 설정의 중심은 `quartz.config.yaml`

테마(폰트·컬러)·플러그인·레이아웃이 전부 여기 있다. **색의 단일 소스는 `theme.colors`.**

### `content/`는 심볼릭 링크다

Obsidian vault(`~/Documents/obsidian/00-Blog/content`)를 가리킨다. 이 저장소에 실제
원고 파일은 없다. 링크는 로컬에서만 유효해서 **원격 빌드가 불가능**하고, 그래서
빌드 결과물 `public/`을 커밋해 Cloudflare가 그대로 서빙한다.

### `public/`은 커밋 대상 배포본

`public/`을 갱신하지 않으면 **아무리 소스를 고쳐도 라이브에 반영되지 않는다.**

### 로컬 플러그인은 `dist/`가 커밋 대상

`plugins/*` 19종. 각각 독립 npm 패키지다.
**소스만 고치면 반영되지 않는다** — 해당 플러그인에서 `npm run build`(tsup) 필요.

### `custom.scss`는 비-레이어라 항상 이긴다

`quartz/styles/custom.scss`의 출력은 `@layer quartz-base` 밖이라 명시도와 무관하게
베이스/플러그인 스타일을 덮는다. 전역 요소 선택자(h1~h6, p 등)를 레이어 밖에 두면
플러그인 스타일이 깨진다.

### 코어는 건드리지 않는다

`quartz/` 아래는 `styles/custom.scss`와 `styles/syntax.scss` 외에는 수정하지 않는 것이 원칙.

---

## 빌드 ✅ (2026-08-05 기준 동작)

```bash
npx quartz plugin install   # .quartz/ 생성 (gitignore된 생성 디렉터리)
npx quartz build
```

`.quartz/`가 없으면 `quartz.ts:2`, `quartz/components/Head.tsx:7`의
`./.quartz/plugins` import가 해결되지 않는다 — 그때 첫 명령이 해결책이다.

- ⚠️ `npm run install-plugins`는 **YAML 설정 이전의 레거시 경로** — 쓰지 말 것.
- ⚠️ `.quartz/plugins/`에 **끊어진 symlink가 남으면 `plugin install`이 ENOENT로 죽는다**
  (`plugins/`에서 지운 플러그인의 링크가 남는다). 해당 링크만 지우면 된다.
- **사용자가 로컬 npm 실행을 원하지 않을 수 있다.** 빌드·설치를 돌리기 전에 확인할 것.

### 렌더 결과 검증 — 실측이 가장 빠르다

```bash
cd public && python3 -m http.server 8899   # 빌드본을 띄우고 computed style을 실측
```

SCSS에 규칙을 썼다고 적용된 게 아니다(§사실 확인 원칙). 색·크기·대비는
브라우저 computed style로 확인한다. ⚠️ 탭이 백그라운드면 IntersectionObserver가
안 돌아 TOC `in-view` 같은 게 "깨진 것처럼" 보인다 — 스크린샷으로 탭을 활성화한
뒤 재측정할 것. 색은 `transition` 진행 중에 재면 중간값이 나오므로 테마를 바꿀 땐
토글이 아니라 **새로 로드**해서 잰다.

### 빌드 없이 가능한 검증

```bash
npx sass --no-source-map quartz/styles/custom.scss <임시경로>   # SCSS 컴파일
python  # WCAG 대비 계산, HTMLParser 태그 균형, YAML 파싱
```

⚠️ Windows Git Bash에서 `sass ... /dev/null`을 쓰면 저장소 루트에 `nul` **파일이 생긴다.**
임시 디렉터리를 쓸 것.

---

## 절대 어기면 안 되는 것

1. **AA 4.5 예외 없음.** 텍스트로 렌더되는 모든 것(본문·링크·라벨·메타·콜아웃 제목·
   코드 토큰). 순수 장식(보더·얼룩·구분선)은 요구 없음. 큰 글씨(≥24px, ≥18.7px bold)와
   상태 표시 UI 경계는 3.0.
2. **색의 단일 소스는 `quartz.config.yaml`.** `custom.scss`는 별칭만 정의한다.
   플러그인이 자기 색 값을 병렬로 정의하면 사이트가 분열된다.
3. **`secondary`를 바꾸면 `--accent-rgb`도 같이.** 두 값이 같은 색이라는 보장이 문법에 없다.
4. **`blockquote:not(.callout)`의 `:not`을 빼지 말 것.** 콜아웃 루트도 `<blockquote>`라,
   빼면 모든 콜아웃이 파랑으로 납작해진다.
5. **코드 토큰 색은 `syntax.scss`에서 바꾼다.** `quartz.config.yaml`의 `theme`는
   오버라이드가 없는 토큰의 폴백일 뿐이다.
6. **`syntax.scss`의 기본색을 `--shiki-light/dark`로 되돌리지 말 것.** Shiki가 식별자에
   토큰 타입을 안 붙여서, 폴백을 Shiki에 맡기면 변수명이 통제 밖으로 나간다.
7. **대비는 코드블럭 배경 기준으로 잰다.** 페이지 배경으로 재면 어긋난다.
8. **목업을 같이 고친다.** `haejun-redesign-palette.html`은 손으로 쓴 마크업이라
   토큰 값을 바꿔도 자동으로 안 따라온다.
9. **콜아웃 형태는 Obsidian 규격을 유지한다.** 아이콘·둥근 모서리·좌측 바를 걷어내는
   "인쇄 조판" 안은 시도 후 되돌렸다(2026-08-06). 우리가 정의하는 건 **색이지 형태가 아니다.**
10. **패널 라벨 5종(SPECS/CATALOG/TOC/Backlinks/Graph)은 한 규칙으로 통일한다.**
   패널별로 색·조판을 나누면 라벨이 콘텐츠보다 시끄러워진다 — 시도 후 되돌림.

---

## 사실 확인 원칙 (이 저장소에서 반복적으로 필요했다)

**눈으로 어림한 값을 믿지 말고 실측한다.** 실제로 다음이 전부 틀린 채로 진행됐던 적이 있다.

- 목업이 가정한 노트 수(129) ↔ 실측 90 → **통계는 `allFiles` 런타임 집계, 하드코딩 금지**
- `frontmatter.title`이 있으면 실제 노트라는 휴리스틱 ↔ folder-page/tag-page 자동 생성
  페이지, 404, topics/archive 가상 페이지도 title이 있다 → **슬러그 패턴으로 거른다**
- "가장 진한 색은 식별자" ↔ 그 토큰 타입은 사이트 전체에 37개뿐이었다
- 빌드 실패 원인을 "순환 의존"으로 기록 ↔ 실제로는 생성 디렉터리 부재
- **플러그인 옵션이 설정에 있다고 동작하는 건 아니다** ↔ explorer의 `useSavedState`는
  `Explorer.tsx`가 `data-savestate`를 내보내지만 `explorer.inline.ts`가 그 속성을
  읽지 않아 no-op이었다 → **옵션을 믿기 전에 런타임에서 소비되는지 grep으로 확인**
- 우리 SCSS가 있으니 적용된다는 가정 ↔ `.katex{font-size:1.05em}`은 CDN CSS가 뒤에
  링크돼 죽은 코드였다 → **computed style로 실측**해야 적용 여부를 안다
- "색이 안 먹는다" ↔ 콜아웃은 색이 정상 적용돼 있었고 **형태(Lucide 아이콘·둥근
  모서리·좌측 바)가 Obsidian이었다** → 증상이 색이라고 원인도 색인 건 아니다
- 설계한 타입이 원고에 있다는 가정 ↔ `[!reference]`는 원고에서 0회, 그 역할은
  `[!quote]` 70개 중 69개가 대신하고 있었다 → **설계 전에 원고를 세어볼 것**
- 로컬 플러그인 의존성은 ESM 번들 가능한 것만 ↔ `reading-time`(CJS)을 넣었더니
  `Dynamic require of "stream"`으로 **컴포넌트가 통째로 로드 실패**했다.
  에러가 아니라 `declares components but failed to load them` 경고 한 줄이라
  "빌드는 성공인데 안 보임"으로 나타난다 → 새 의존성은 `node -e "await import(dist)"`로 확인

렌더 결과는 `public/**/*.html`에서 직접 셀 수 있다(팔레트는 낡았지만 **구조는 유효**).

---

## 디자인 요약 (상세는 `DESIGN-SYSTEM.md`)

- 컨셉: **Blue Note / 빈티지 음반 레이블.** 기술 포트폴리오가 아니라 아날로그 지식 아카이브.
- 팔레트 "True Midnight" — 라이트 = 크림 인쇄지 `#f7f5ef` / 다크 = 잉크 네이비 `#0e1420`, accent H207.
- **색의 세 축**: 공간(블루 `#1c5f95`, 링크·백링크·breadcrumb·CATALOG·h2) / 행위(브릭 `#b8442a`, CTA) /
  시간(Chitlins `#b03a7d`, 읽기 진행바·TOC 활성). 각 색이 답하는 질문이 달라 역할 침범이 없다.
- ⚠️ 팔레트의 블루는 **2색 × 2모드**다(True Midnight/Deeper Cut = 라이트, Stage Light/Rim Light = 다크).
  한 테마에서 쓸 수 있는 블루는 2개뿐. `--dark`(#141d28)는 검정이 아니라 H213의 가장 깊은 잉크다.
- **하이라이트·인라인 코드·bold는 색이 아니라 재질/무게로 구분한다.** 세 축에 속하지 않는
  신호라 네 번째 색을 만들면 축 체계가 무너진다.
- 서체: 로고 Anton / 헤딩 Hahmlet / 본문 Noto Sans KR / 코드 JetBrains Mono.
  ⚠️ `theme.typography`와 `fonts` 플러그인 옵션 **두 곳을 항상 같게** 유지(후자가 최종 결정).
- **토픽 컬러는 폐지됐다.** 색은 그룹핑엔 강하나 명명엔 약한데 토픽은 명명 문제다.
  식별은 라벨 타이포가 하고, 색은 현재 위치에만 쓴다. 되살리지 말 것.
- 콜아웃은 색을 쓴다 — 토픽(명명)과 달리 콜아웃은 *가치*라서 색이 맞는 부호다.
