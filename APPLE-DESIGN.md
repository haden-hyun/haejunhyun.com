# APPLE-DESIGN.md — Apple 감성 정제 작업 (진행 중)

브랜치 `feat/apple-design`(`v5`에서 분기). **목표: Blue Note 빈티지 정체성은 유지하고, 디자인과 움직임에 Apple식 정제를 더한다.**
이 문서는 작업이 끝나면 지운다. 확정된 값은 `DESIGN-SYSTEM.md`로 옮긴다.

시작 전에 `CLAUDE.md`·`DESIGN-SYSTEM.md`(§5 기각 기록)를 읽는다. 검토 기준은 `~/.claude/skills/apple-design`(Apple HIG 123쪽, 전역 설치됨)이고,
`references/hig/<page>.md`를 열어 `파일 › 헤딩`으로 인용하는 방식이다.

## 결정 (사용자 확정)

- 라이트 배경 **B 밝은 크림**: `light #fcfbf7`, `lightgray #e6e2d8`. 순백·쿨 화이트는 기각 — 크림×블루의 온도 대비가 빈티지의 핵심이고, 순백이면 일반 기술 블로그로 읽힌다. 쿨 화이트는 블루와 충돌하진 않지만 정체성이 바뀐다.
- 서체는 그대로. Pretendard 통째 교체는 §2.1에서 이미 기각됐다.
- 구현 범위는 아래 시안 5개 전부. **이번 라운드는 소스만 수정**했고 빌드는 하지 않았다(사용자 선택).
- 오버슈트·바운스·발광은 쓰지 않는다. 새 움직임은 감속 곡선만, 이동 ≤8px, 진입 ≤260ms.

## 상태

### 소스 수정 완료 (커밋 전, 빌드 안 함)

| 항목 | 위치 | 값 |
| --- | --- | --- |
| B 배경 | `quartz.config.yaml` lightMode, `obsidian/theme/haejun-records.css`, `plugins/series-roadmap/obsidian/src/theme-map.css` | `#fcfbf7` / `#e6e2d8`. `node obsidian/theme/check.mjs` 통과(63건) |
| 링크 밑줄 | `custom.scss` §1 `article a` | 1px 밑줄, hover 2px. 링크↔본문 대비가 1.62:1이라 색 외 단서 필요 |
| 타입 스케일 | `custom.scss` §1 | h2 1.375rem, h3 1.1875rem, 본문 1.0625rem(17px), 행간 1.8 |
| 상단 바 벨럼 | `custom.scss` §10.5 `.topbar::before` | 크림 94% + `blur(20px)`. 투명도 줄이기·고대비에선 불투명 |
| 포커스·눌림·등장 | `custom.scss` §12.5(신규) | `:where` 포커스 링, `:active` scale .97, 그래프 확대 창 `@starting-style` |
| 문서 | `DESIGN-SYSTEM.md` §2·§3.1·§4.x·§6 | 배경·island(`#f5f4ee`)·타입 스케일 반영 |

SCSS는 임시 폴더로 컴파일해 통과를 확인했다. `@starting-style`이 출력에 나온다.

### 남은 일 (우선순위)

1. **빌드·실측** — `npx quartz plugin install && npx quartz build` 후 `public/`을 서버로 띄워 computed style 확인. 사용자가 로컬 npm 실행을 허락한 뒤에만 한다.
   - **상단 바 벨럼 AA 실측 필수.** 계산상 α≥0.94 + 12px 이하 회색 텍스트는 `--darkgray`로 올려야 안전하다(`--gray`는 α0.92에서 4.49로 탈락). `.topbar::before`의 `inset: 0 -100vmax` + `body{overflow-x:clip}`에서 `backdrop-filter`가 정상인지도 본다.
   - 본문 17px 후 인라인 코드(0.85em)·콜아웃(1rem)·표 행 높이(65px/44px)·집중 모드 폭(56rem, 한 줄 약 56자)을 재확인. 집중 모드는 52rem 축소를 검토.
   - h2(1.375rem)와 홈·폴더 섹션 라벨(1.15rem)의 크기 격차 확인.
   - `.topic-graph-dialog`는 열 때 body로 옮겨지는 로직(§4.17)과 `display` 전환이 겹친다. 열림·닫힘 모션을 실측.
   - 눌림 선택자(`.prev-next-nav a`, `.series-pager-link`, `.hero-links a` 등)가 실제 마크업과 맞는지 `public/` HTML에서 확인.
2. **대비 수치 문서 갱신** — `DESIGN-SYSTEM.md`의 대비 표·island 위 수치(4.95 등)는 구 배경(`#f7f5ef`) 기준이다. B에서는 대부분 오른다(`--gray` 페이지 5.52, hover 위 4.75, island 위 5.19). 재계산해서 바꾼다. 코드블럭 배경·콜아웃 틴트 기준 대비도 재측정.
3. **Obsidian 미러 정합** — `haejun-records.css`의 본문 행간·글자 크기가 사이트(1.8 / 17px)와 다르다. `DESIGN-SYSTEM.md` §4.19 "같게 적용되는 것"의 "본문 행간 1.9"와 "본문 16px"을 사이트 값에 맞춰 고치거나 범위 밖으로 옮긴다.
4. **플러그인 재빌드 필요한 항목** (아직 안 함)
   - 그래프 진입 2.4초 → 약 1.1초: `plugins/topic-graph/src/.../topicGraph.inline.ts:201` `alphaDecay(0.045)` → `0.10`. 평형점이 빌드 좌표라 최종 상태는 같다. `npm run build` 후 §4.17의 "약 2.4초" 문구 수정.
   - 그래프 노드 Tab 정지점 약 68개 → 1개(로빙 tabindex): `TopicGraph.tsx:173`, 홈 `hero-key`와 같은 방식.
5. **구조 개선 (미착수)**: 본문 건너뛰기 링크(`global-nav` 맨 앞) / 태블릿 800~1200px 좌측 열 `clamp(220px, 28vw, 320px)`(본문이 443px까지 줄어듦) / 클릭 면적 보정(음수 마진 기법, 터치에서 44px) / 모바일 `Contents` 디스클로저 / 404에 상단 바 복구.
6. **모션 후속**: 테마·집중 모드 클립-리빌 View Transition(블렌딩 없어 AA 안전, 미지원 브라우저는 현행 컷). 검색 모달·팝오버·토스트 정착 등장, 접힘 통일(`::details-content`), 호버 속도 150ms 통일.
7. **소소한 것**: 작은 글자 11px 하한(px→rem), `gray` `#5f6773`→`#545c68` 검토(다크 값·Obsidian 미러·문서 동시 갱신 필요), 반경 3단(4/6/10) 토큰·그림자 1토큰, 코드 창 신호등 점 단색화, 언어(`<html lang>`)·라벨 대소문자 규칙, 단축키 힌트 OS별 표기.

### 사용자 판단이 필요했던 충돌 (아직 문서에 반영 안 됨)

- `DESIGN-SYSTEM.md` §4.12 "위치 옮기는 호버(scale 등) 금지": 이번에 넣은 `:active` scale은 호버가 아니라 눌림이라 문언상 저촉하지 않는다. §4.12에 "눌림 scale .97 허용" 한 줄을 보강해야 한다.
- AA 규칙과 **페이지 전환 본문 페이드**: 중간 opacity가 일시 상태라 저촉 소지가 있어 제외했다. 허용하려면 §4.13 같은 예외 조항이 필요하다.
- §4.18 "투명도로 숨기는 안 금지"는 패널을 숨기는 용도다. 벨럼·클립-리빌은 해당 없다.

## 검토 결과 요약 (3차원, 평가 Good · Critical 0)

보존할 것: 세 축 색 문법, AA 대비 체계, `--ease`(오버슈트 없음), reduced-motion 3중 방어, 집중 모드의 읽던 줄 복원, 코드 토큰 위계.
핵심 진단: **정체성은 뚜렷한데 손에 닿는 마감(링크 단서·포커스·눌림·등장·전환)이 비어 있다.**

- 시각: 링크 대비 1.62:1(High) / h3가 본문과 같은 크기 / 상단 바가 불투명 단색(Liquid Glass 원칙이 허용하는 유일한 자리) / 반경·그림자 토큰 밖 값 / 11px 미만 글자.
- 모션: `:active` 피드백 없음(High) / 검색·그래프 확대·팝오버·토스트가 컷으로 등장 / 페이지·모드 전환 하드 컷 / 그래프 진입 2.4초 / 포커스 링 불일치 / 접힘 타이밍 불일치.
- 구조: 키보드 Tab 약 90번 + 건너뛰기 없음 / 전역 포커스 링 없음 / 태블릿 본문 443px / 모바일에서 TOC·이웃 사라짐 / 28pt 미만 클릭 면적 / 404 막다른 길 / `lang="en"`인데 본문 한국어.

한계: 모든 수치는 CSS 선언값·hex 계산이다. 브라우저 computed style 실측은 하지 못했다. 구조 검토 워커는 Chrome이 로컬 서버에 연결되지 않아 중단했다.
상세 보고서 3편(시각·모션·구조)은 세션 임시 폴더에 있어 사라질 수 있다. 위 요약과 값이 이 문서의 정본이다.

## 시안

아티팩트(비공개): https://claude.ai/artifact/DqqRMJ73CzJYvAYs5j6BQn — 라이트 배경 4종 × 라이트/다크 × Apple 적용 ON/OFF를 전환해 비교한다. 폰에서 연다.

## 작업 규칙 (이 작업에서 지킬 것)

- AA 4.5 예외 없음. 색의 단일 소스는 `quartz.config.yaml`. 코어(`quartz/`)는 `custom.scss`·`syntax.scss` 외 수정 금지.
- 플러그인 소스를 고치면 해당 플러그인 `npm run build` 필요(`dist/` 커밋 대상). `_shared`를 고치면 가져다 쓰는 플러그인 전부 재빌드.
- 배포: `public/`을 재빌드해 커밋해야 라이브에 반영된다. `v5`가 프로덕션 브랜치이므로 머지 전까지 라이브에 영향 없다.
- 커밋 메시지는 저장소 관례(`feat`/`build`/`fix`/`refactor`/`docs` 접두사)를 따른다.
