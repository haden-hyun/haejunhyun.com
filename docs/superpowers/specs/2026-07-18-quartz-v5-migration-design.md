# Quartz v4 → v5 마이그레이션 설계 (A안: 로컬 테스트 폴더 + v5 브랜치 이관)

- 작성일: 2026-07-18
- 상태: 사용자 승인 완료 (A안 채택)
- 대상: haejunhyun.com (github.com/haden-hyun/haejunhyun.com, 현재 기본 브랜치 `v4`)

## 1. 목표와 원칙

- Quartz 4.5.2 기반 블로그를 Quartz v5로 업그레이드한다.
- 운영 중인 v4 사이트는 이관 완료·검증 전까지 **어떤 영향도 받지 않는다**.
- 실서비스 전환은 공식 마이그레이션 경로(같은 레포의 `v5` 브랜치)를 따르고, `v4` 브랜치를 롤백 지점으로 보존한다.
- 디자인 정체성(명조 헤딩 + 고딕 본문 + Slate Blue 포인트)을 그대로 유지한다.

## 2. 현재 시스템 (As-Is)

### 콘텐츠 파이프라인
- Obsidian vault `00-Blog/`: Bronze(초안) → Silver(변환) → content(발행) 3단계.
  발행 스킬: `blog-formatter` / `blog-editor` / `blog-draft` / `blog-publish`.
- 레포의 `content`는 `/Users/haejun/Documents/obsidian/00-Blog/content`로의 심볼릭링크.
  콘텐츠 파일은 git 밖이며 복구선은 Obsidian Sync뿐.
- 파일명·경로는 영문 kebab-case 강제 (v5의 URL 소문자화 영향 최소화 요인).

### 배포
- `scripts/deploy.sh`: 로컬 빌드 → `public/` 커밋 → `v4` push → Cloudflare가 커밋된 `public/` 서빙.
- `deploy-dev.sh`(로컬 프리뷰), `deploy-clean.sh`(캐시 삭제 재배포). 셋 다 `BRANCH="v4"` 하드코딩.
- GitHub Actions는 배포에 관여하지 않음. `content/_headers`로 Cloudflare 헤더 관리.
- Node v22.16.0 — v5 요구사항(Node 22+) 이미 충족.

### 커스텀 내역 (upstream 대비 27개 파일)
| 분류 | 내용 |
|---|---|
| 설정 | 폰트 3종(Nanum Myeongjo/Noto Sans KR/JetBrains Mono), 웜톤+Slate Blue 팔레트, locale en-US, GA(G-6XY03WD2ST), KaTeX, giscus(repoId R_kgDONbw-1g) |
| 신규 컴포넌트 8종 | SocialLinks, RecentNotesForIndex, ReadingProgress, BackToTop, PrevNext, ImageLightbox, VisitorCounter(GoatCounter), ShareButtons(레이아웃 미사용) |
| 코어 수정 | Explorer.tsx, Footer.tsx, Head.tsx, i18n/ko-KR.ts, util/og.tsx |
| 스타일 | `quartz/styles/custom.scss` 319줄 |

## 3. v5 핵심 변경사항 (이관 영향)

1. 설정이 TS → YAML(`quartz.config.yaml`)로 통합. `quartz.layout.ts` 제거, 레이아웃은 플러그인별 YAML 속성(position/condition)으로 선언. 복잡 로직은 `quartz.ts` 오버라이드.
2. 플러그인 독립 패키지화: `npx quartz plugin add github:quartz-community/<name>`, `.quartz/plugins/` 클론, `quartz.lock.json` 버전 고정. 사용 중인 Explorer·Graph·Search·Darkmode·Breadcrumbs·Backlinks·TOC·RecentNotes·Comments(giscus)·CustomOgImages·Latex(KaTeX) 모두 공식 커뮤니티 플러그인 존재 확인됨.
3. 커스텀 컴포넌트는 코어 수정이 아닌 로컬 플러그인(팩토리 함수 + `@quartz-community/types`)으로 작성.
4. URL 소문자 kebab-case 강제. 본 블로그 콘텐츠는 이미 kebab-case라 저위험이나 sitemap diff로 전수 검증. 변경분은 AliasRedirects가 301 처리.
5. `note-properties` 플러그인이 frontmatter 파싱에 사실상 필수. 빌드 재현성 때문에 `new Date()` 사용 제한 (참고: khy07181.github.io/2026/quartz-blog-version-up).
6. 빌드 전 `npx quartz plugin install` 단계 필요 → 배포 스크립트에 반영. Cloudflare 측은 `public/` 커밋 서빙 방식 유지로 무변경.

## 4. 이관 전략 (A안, 승인됨)

`~/Developer/haejunhyun-v5-test` 별도 폴더에서 v5를 테스트·완성한 뒤, 본 레포에 `v5` 브랜치를 만들어 이식하고 Cloudflare 프로덕션 브랜치를 전환한다.

- 대안 B(본 레포에서 바로 v5 브랜치 작업): 커스텀 재구현 기간 동안 운영 리스크 → 기각.
- 대안 C(신규 레포): 도메인·Cloudflare·giscus 재연결 비용, 히스토리 단절 → 기각.

## 5. 실행 단계 (7 Phase)

### Phase 0 — 사전 준비 (운영 무영향)
- `cp -RL content <백업 경로>`로 content 스냅샷 백업 (심링크 역참조).
- 현재 `public/sitemap.xml` 및 URL 목록 저장 (검증 기준선).
- Cloudflare Pages 프로젝트의 프로덕션 브랜치·빌드 설정 확인·기록.

### Phase 1 — v5 테스트 환경 구축
- `~/Developer/haejunhyun-v5-test`에서 v5 `npx quartz create` (Obsidian 템플릿).
- content는 심링크가 아닌 스냅샷 복사본 사용 (발행 파이프라인과 격리).
- 순정 상태 빌드·프리뷰 성공을 먼저 확인한 뒤 커스텀 이관 시작.

### Phase 2 — 설정 이관 (난이도 하)
- `quartz.config.yaml`: 폰트 3종, 라이트/다크 18색, locale, GA, `baseUrl: haejunhyun.com`, ignorePatterns.
- 커뮤니티 플러그인 설치: note-properties(필수), obsidian-flavored-markdown, explorer, graph, search, darkmode, breadcrumbs, backlinks, toc, latex(katex), custom-og-images, alias-redirects, comments(giscus — 기존 repoId/categoryId 유지).
- 레이아웃 재선언: 좌(PageTitle→VisitorCounter→SocialLinks→Search→Darkmode→Explorer), 우(Graph→TOC→Backlinks), beforeBody(Breadcrumbs→ArticleTitle→ContentMeta→TagList), afterBody(ReadingProgress→BackToTop→ImageLightbox→PrevNext→RecentNotesForIndex→Comments).

### Phase 3 — 커스텀 컴포넌트 이관 (핵심 작업, 난이도 상)
- 7종 전체를 우선순위 구분 없이 **동시 진행**: SocialLinks, RecentNotesForIndex(index 한정은 v5 `condition` 활용 검토), PrevNext, ReadingProgress, BackToTop, ImageLightbox, VisitorCounter.
- ShareButtons: 현재 레이아웃 미사용 → **이관 제외** (필요 시 추후 재구현).
- 각 컴포넌트는 v5 로컬 플러그인으로 재작성하되, 커뮤니티 레지스트리(`npx quartz tui`)에 동등 기능 플러그인이 있으면 재구현 대신 채택.
- Explorer/Footer/Head/og.tsx 수정분은 해당 플러그인 옵션·`quartz.ts` 오버라이드로 흡수.

### Phase 4 — 스타일 이관
- `custom.scss` 319줄을 v5 HTML 구조에 맞춰 선택자 검증 후 이식.
- 기준: 명조+고딕 타이포그래피, Slate Blue 포인트, 웜톤 배경.

### Phase 5 — 확인 (게이트 아님, 사용자 결정으로 필수 검증 절차 없음)
- 빌드 성공 + 로컬 프리뷰 육안 확인 수준으로만 진행. sitemap diff 등 전수 검증은 생략.

### Phase 6 — 본 레포 이관 및 전환
1. `git remote add upstream https://github.com/jackyzha0/quartz.git` → `git fetch upstream v5` → `v5` 브랜치 생성 후 테스트 폴더의 config/로컬 플러그인/scss 이식.
2. `content` 심볼릭링크 재연결. v5 빌드가 심링크를 따라가는지 최종 확인 (실패 시 rsync 동기화로 대체).
3. 배포 스크립트 수정: `BRANCH="v5"`, 빌드 전 `npx quartz plugin install` 추가. `public/` 커밋 추적 유지 확인.
4. `deploy-dev.sh` 최종 확인 → `v5` push → Cloudflare 프로덕션 브랜치 v4→v5 전환 → GitHub 기본 브랜치 `v5` 변경.

### Phase 7 — 안정화 및 뒷정리
- `v4` 브랜치는 롤백 지점으로 최소 2~4주 보존. 문제 시 Cloudflare 브랜치 스위치로 즉시 복구.
- Obsidian `blog-publish` 스킬·`00-Blog/CLAUDE.md`·Claude 메모리의 v4 참조를 v5로 갱신.
- 테스트 폴더 폐기, 메모리에 v5 구조 기록.

## 6. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 커스텀 7종 재구현 공수 (최대 리스크) | 테스트 폴더에서 우선순위별 진행, 커뮤니티 플러그인 대체 우선 |
| custom.scss 선택자 전면 변경 | Phase 4에서 페이지별 비교 검증 |
| URL 변경 → giscus/SEO 단절 | 이미 kebab-case라 저위험. sitemap diff 전수 검증 + AliasRedirects |
| v5가 심링크 content를 못 따라갈 가능성 | Phase 6-2에서 검증, 실패 시 rsync 동기화 스크립트 |
| Cloudflare 설정 실수 | `public/` 커밋 방식 유지로 변경점 최소, 롤백은 브랜치 스위치 |

## 7. 참고 자료

- https://quartz.jzhao.xyz/getting-started/whats-new
- https://quartz.jzhao.xyz/getting-started/migrating
- https://quartz.jzhao.xyz/configuration
- https://quartz.jzhao.xyz/advanced/architecture
- https://khy07181.github.io/2026/quartz-blog-version-up (v4→v5 실전 후기)
