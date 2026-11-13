# Handoff — 블로그를 `blog.haejunhyun.com`으로 이전

> 작성 2026-11-13 · 상태: **계획 확정 전, 아무것도 실행하지 않음**
> 이전이 끝나면 이 파일은 지운다(CLAUDE.md의 "문서는 둘뿐" 원칙에 대한 한시적 예외).

## 0. 목표

- `www.haejunhyun.com`(및 apex `haejunhyun.com`) → 향후 **포트폴리오**
- 블로그(이 저장소) → **`blog.haejunhyun.com`**
- 함께 처리: 옛 URL 검색 결과 자동 연결, Google Analytics 연계, GitHub 저장소 이름 변경, vault 폴더 이름 변경

---

## 1. 현재 상태 (2026-11-13 실측)

| 항목 | 값 | 위치 |
|---|---|---|
| 서빙 | Cloudflare **Pages**(Git 연동, 빌드 명령 없음, 출력 `public/`) | README §배포 구조 |
| 서버 함수 | `/api/stats` — GoatCounter 프록시, Pages Secret `GOATCOUNTER_TOKEN` 필요 | `functions/api/stats.ts` |
| 사이트 주소 | `baseUrl: haejunhyun.com`(apex). 사용자는 `www`로 접속 중 — 대시보드에서 대표 주소 확인 필요 | `quartz.config.yaml:10` |
| baseUrl 소비처 | sitemap(URL 166개), RSS `index.xml`, `og:url`·`og:image`, `404.html`, `public/CNAME`(cname 플러그인) | 빌드 산출물 |
| canonical | **`<link rel="canonical">` 없음.** `og:url`만 있음 | `public/**/*.html` |
| 댓글 | giscus, `repo: haden-hyun/haejunhyun.com`, `repoId: R_kgDONbw-1g`, **`data-mapping="url"`** | `quartz.config.yaml:431-440` |
| GitHub 링크 | `https://github.com/haden-hyun/haejunhyun.com` | `quartz.config.yaml:495`(social-links) |
| 방문 집계 | GoatCounter 사이트 `haejunhyun` — 경로만 기록, 도메인 무관 | `quartz.config.yaml:600-605`, `plugins/home-hero/src/components/HomeHero.tsx:24` |
| GA | 미사용. 코어는 지원(`configuration.analytics`) | `quartz/cfg.ts:7`, `quartz/plugins/emitters/componentResources.ts:93` |
| git remote | `https://github.com/haden-hyun/haejunhyun.com` | — |
| `content` 심링크 | **절대경로** `/Users/haejun/Documents/obsidian/00-Blog/content`, git에 mode 120000으로 추적 | `content` |
| Mac 저장소 경로 | `~/Developer/haejunhyun.com` — `quartz.lock.json`의 로컬 플러그인 10종 `resolved`에 절대경로로 박힘 | `quartz.lock.json:18,144,156,174,222,245,257,281,317,329` |
| 루트 URL 공간 | 루트 `.html` 209개(별칭 포함) + 폴더 9개 | `public/` |

---

## 2. 결정 필요 (실행 전에 정할 것)

| # | 결정 | 권장안 |
|---|---|---|
| D1 | 새 저장소 이름 | `blog` 또는 `blog.haejunhyun.com`. **포트폴리오 저장소에 `haejunhyun.com` 이름을 재사용할지**도 함께 정할 것(§5 함정 참고) |
| D2 | Pages 프로젝트 | **새 프로젝트를 만든다**(이름 예: `haejun-blog`). 프로젝트 이름은 바꿀 수 없고, 저장소 이름 변경 후 기존 연결이 유지되는지는 공식 문서로 보장되지 않는다 |
| D3 | 포트폴리오 대표 주소 | apex 또는 `www` 중 하나. 나머지는 대표 주소로 301 |
| D4 | giscus 기존 댓글 처리 | 매핑을 `pathname`으로 바꾼 뒤 확인하고, 안 잡히면 Discussion 제목 수정 |
| D5 | GA 도입 | GoatCounter와 병행(아래 §6) |
| D6 | vault 폴더 새 이름 | 예: `00-Blog` → `Blog`. URL에는 영향 없음 |

---

## 3. 실행 순서 한눈에

| 단계 | 내용 | 다운타임 | 되돌리기 |
|---|---|---|---|
| P1 | GitHub 저장소 이름 변경 + 참조 갱신 | 없음 | 이름 원복 |
| P2 | 새 Pages 프로젝트 생성, `blog.haejunhyun.com` 연결 | 없음 | 프로젝트 삭제 |
| P3 | `baseUrl`·giscus·GA 반영 후 빌드·push | 없음 | 커밋 revert |
| P4 | www·apex → blog **전체 301** 전환 | 수 분 이내 | 규칙 끄기 + 도메인 재연결 |
| P5 | 검색엔진 사후 작업 | — | — |
| P6 | vault 폴더 이름 변경 (독립 작업) | 로컬만 | 이름 원복 + 심링크 재생성 |
| P7 | 포트폴리오 출시 시 301 규칙 축소 | 없음 | 규칙 원복 |
| P8 | 정리(옛 Pages 프로젝트 삭제, 이 파일 삭제) | — | — |

P1→P2→P3→P4는 순서대로 진행한다. P6은 언제 해도 되지만 **P1~P4와 같은 날 하지 않는다**(원인 구분이 어려워짐).

---

## 4. 단계별 상세

### P1. GitHub 저장소 이름 변경

1. GitHub → Settings → Repository name 변경(D1).
   - GitHub가 옛 이름 → 새 이름으로 웹·git 리다이렉트를 걸어 준다. **같은 계정에 옛 이름으로 새 저장소를 만드는 순간 이 리다이렉트는 사라진다.**
   - giscus 앱 설치는 저장소 ID 기준이라 유지된다. `repoId`도 그대로다.
2. 참조 갱신 (한 커밋으로)
   - `quartz.config.yaml` — comments `repo:` 값, social-links GitHub `url:`
   - `README.md` 제목·사이트 주소, `CLAUDE.md` 첫 줄
3. 각 클론에서 remote URL 갱신(Mac, Windows 모두). 리다이렉트 덕에 미뤄도 동작은 하지만 바로 갱신한다.
4. **Mac 로컬 폴더 이름(`~/Developer/haejunhyun.com`)도 바꾼다면**
   - `quartz.lock.json`의 절대경로 10곳을 먼저 고친다. `plugin install`은 락파일을 따르므로 링크를 지워도 옛 경로가 되살아난다(CLAUDE.md 경고).
   - `.quartz/`를 지우고 `npx quartz plugin install`로 다시 만든다. 끊어진 symlink가 남으면 ENOENT로 죽는다.
   - Obsidian 단축키(쉘 명령 플러그인)에 박힌 `scripts/deploy*.sh` 경로를 갱신한다. 스크립트 자체는 `dirname` 기준이라 수정할 필요 없다.
5. 검증: 테스트 push 후 기존 Pages 프로젝트가 새 커밋을 배포하는지 확인한다. 안 되면 P2로 해결된다.

### P2. 새 Cloudflare Pages 프로젝트

1. Workers & Pages → Create → Pages → Git 연결 → 새 이름의 저장소 선택
   - Production branch `v5`, Build command **비움**, Build output `public`
2. Settings → Variables and Secrets → `GOATCOUNTER_TOKEN` 추가(옛 프로젝트 값과 동일). 없으면 `/api/stats`가 503을 낸다.
3. Custom domains → `blog.haejunhyun.com` 추가(같은 존이면 CNAME·SSL 자동).
4. 검증: `blog.haejunhyun.com`에서 홈, 노트, 검색, `/api/stats`(JSON), 홈 통계 위젯이 정상인지 본다.
   - 이 시점까지 옛 프로젝트는 www/apex를 계속 서빙한다.

### P3. 빌드 설정 변경 → 배포

1. `quartz.config.yaml:10` `baseUrl` → `blog.haejunhyun.com`
2. giscus `mapping` → `pathname`(D4). 반영 후 기존 댓글이 있는 글 2~3개에서 댓글이 보이는지 확인한다.
   - 안 보이면 GitHub Discussions(`Announcements`)에서 기존 토론 제목을 새 매핑 형식에 맞게 고친다.
3. GA를 쓰기로 했다면 §6 설정을 반영한다.
4. `deploy.sh`로 빌드·커밋·push한다. 커밋 전 확인할 것:
   - `public/sitemap.xml`, `public/index.xml`, 노트 HTML의 `og:url`이 `https://blog.haejunhyun.com/…`인지
   - `public/CNAME`이 `blog.haejunhyun.com`인지(Cloudflare는 이 파일을 쓰지 않음, 무해)
   - `public/index.html`이 해시 붙은 CSS를 참조하는지(dev 빌드 덮어쓰기 방지, README 주의사항)
5. 선택 사항: 노트에 `<link rel="canonical">`을 추가하면 검색엔진에 주는 신호가 강해진다. 코어 `Head.tsx`는 수정 금지라 로컬 플러그인으로 넣어야 한다. 301만으로도 충분해서 필수는 아니다.

### P4. www·apex → blog 전체 301 (포트폴리오 출시 전 임시 형태)

포트폴리오가 아직 없으므로 **지금은 전부** 블로그로 보낸다. 출시 때 P7에서 범위를 좁힌다.

1. **규칙을 먼저 만든다.** Cloudflare 존 → Rules → Redirect Rules
   - 조건: 호스트가 `www.haejunhyun.com` 또는 `haejunhyun.com`
   - 동작: 동적 리다이렉트, 대상은 `https://blog.haejunhyun.com` + 원래 경로, **301**, 쿼리스트링 유지
2. 옛 Pages 프로젝트에서 www·apex 커스텀 도메인을 뗀다.
   - 주의: Redirect Rule은 **프록시된(주황 구름) DNS 레코드**가 있어야 동작한다. 도메인을 떼면서 DNS 레코드가 사라지면 프록시된 자리표시 레코드(예: AAAA `100::`)를 www·apex에 남겨 둔다.
3. 검증
   - 옛 노트 URL, 루트 별칭 페이지, `/tags/…`, `/index.xml`, `/` 각각이 같은 경로의 blog로 **301** 되는지
   - 한글 슬러그(퍼센트 인코딩) 경로도 확인
4. 되돌리기: 규칙을 끄고 옛 프로젝트에 도메인을 다시 붙인다.

### P5. 검색엔진 사후 작업 — "옛 URL 검색 결과의 자동 연결"

- **자동 연결의 실체는 P4의 301이다.** 검색 결과의 옛 링크를 눌러도 같은 글로 간다. Google은 301을 따라 몇 주에 걸쳐 색인을 새 URL로 교체한다.
- Search Console
  - 기존 속성이 **도메인 속성**(DNS 인증)이면 `blog.` 서브도메인도 포함된다. URL 접두어 속성이면 `https://blog.haejunhyun.com/`을 새로 추가한다.
  - `https://blog.haejunhyun.com/sitemap.xml`을 제출한다.
  - 주요 노트는 URL 검사 → 색인 요청으로 앞당긴다.
  - "주소 변경(Change of Address)" 도구는 **쓰지 않는다.** 서브도메인 이동은 이제 지원되지만, 옛 사이트 홈이 새 사이트로 301 돼야 하는데 포트폴리오가 `/`를 차지하면 그 조건이 깨진다.
- 301 규칙은 **최소 1년 유지**한다. 지우면 외부 백링크와 색인이 끊긴다.
- Naver Search Advisor를 쓰고 있다면 같은 방식으로 사이트를 추가하고 sitemap을 제출한다.
- GoatCounter: 경로 기준이라 통계는 이어진다. 대시보드 설정에 사이트 도메인 표기가 있으면 갱신한다.

### P6. vault 폴더 이름 변경 (`00-Blog` → D6)

영향 목록:

| 대상 | 조치 |
|---|---|
| `content` 심링크(절대경로, git 추적) | Mac에서 새 경로로 다시 만들고 커밋 |
| `plugins/series-roadmap/obsidian/src/view.ts:8-9,89` | `00-Blog/content/`, `00-Blog/01-Bronze/`, `00-Blog/02-Silver/`, `"00-Blog/".length` 를 새 이름으로 → `npm run build` → `npm run install-vault` → Obsidian에서 플러그인 껐다 켜기 |
| `plugins/*/obsidian/esbuild.config.mjs` | vault 루트(`Documents/obsidian`)만 쓰므로 vault 루트를 바꾸지 않으면 수정 불필요 |
| Obsidian 내부 | **Finder가 아니라 Obsidian 안에서** 이름을 바꿔야 내부 링크가 자동 갱신된다. 템플릿 폴더, 첨부 폴더, 쉘 명령 등 플러그인 설정의 경로도 확인 |
| 문서 | `README.md:7`, `CLAUDE.md` §`content/` |
| URL | 영향 없음. 슬러그는 `content/` 아래 경로라 vault 폴더 이름과 무관하다 |

검증: `ls content/`가 원고를 보이는지, `npx quartz build` 결과의 페이지 수가 변경 전과 같은지 확인한다.

### P7. 포트폴리오 출시 시

1. 포트폴리오는 별도 저장소와 별도 Pages 프로젝트로 만든다. 경로는 **짧은 접두사 몇 개**로 묶는다(예: `/`, `/projects/*`, `/about`, `/assets/*`).
2. P4 규칙에 "경로가 포트폴리오 접두사가 아님" 조건을 추가해 범위를 좁힌다. 블로그 경로를 나열하는 방식은 루트 슬러그가 209개라 비현실적이다.
3. 포트폴리오 프로젝트에 www·apex를 연결하고 자리표시 DNS 레코드를 정리한다.
4. 포트폴리오에서 집계가 필요하면 GoatCounter 사이트를 **따로** 만든다(같은 코드를 쓰면 `/` 통계가 섞인다). GA는 같은 속성을 써도 된다(§6).

### P8. 정리

- 옛 Pages 프로젝트 삭제(301 정상 동작을 1~2주 확인한 뒤)
- 이 `handoff.md` 삭제, 남길 가치가 있는 사실만 README/CLAUDE.md에 반영

---

## 5. 함정 모음

- **giscus `url` 매핑**: 도메인이 바뀌면 기존 댓글이 사라진 것처럼 보인다. P3-2를 빼먹지 말 것.
- **옛 저장소 이름 재사용**: 포트폴리오 저장소를 `haejunhyun.com`으로 만들면 GitHub 리다이렉트가 끊긴다. 그 전에 옛 이름 참조가 하나도 남지 않았는지 확인할 것.
- **Redirect Rule만 만들고 DNS가 없음**: 레코드가 없거나 회색 구름이면 규칙이 실행되지 않는다.
- **Pages 저장소 연결**: 공식 문서에 이름 변경 시나리오가 없다. 커뮤니티 보고상 연결 변경은 불가해 새 프로젝트를 만들어야 하고, GitHub 리다이렉트로 당분간 동작했다는 사례도 있다. 그래서 D2는 새 프로젝트다.
- **`quartz.lock.json` 절대경로**: Mac 폴더 이름을 바꾸면 "빌드는 되는데 옛 코드" 또는 ENOENT가 난다.
- **dev 빌드 커밋**: `deploy-dev.sh`가 `public/`을 덮어쓴다. push 전에 해시 CSS를 확인할 것.
- **GA 이중 집계**: §6의 "브라우저 기록 이벤트" 설정을 끄지 않으면 SPA 이동 1회가 page_view 2회로 잡힐 수 있다.

---

## 6. Google Analytics 연계 (Quartz v5 기본 지원)

- **코어에 내장되어 있다.** `quartz.config.yaml`의 `configuration`에 `analytics` 항목을 두고 provider를 `google`, `tagId`를 GA4 측정 ID(`G-…`)로 지정하면 된다(`quartz/cfg.ts:7` 타입 정의).
  - 지원 provider: plausible, google, umami, goatcounter, posthog, tinylytics, cabin, clarity, matomo, vercel, rybbit
- 동작(`componentResources.ts:93-113`): gtag를 지연 로드하고 `send_page_view: false`로 설정한 뒤, 첫 로드와 SPA `nav` 이벤트마다 page_view를 직접 보낸다. SPA 이동도 정상 집계된다.
- **GoatCounter와 병행 가능**: GoatCounter는 별도 로컬 플러그인(`goatcounter-tracking`)이라 `configuration.analytics`와 충돌하지 않는다. 홈 통계 위젯과 `/api/stats`는 GoatCounter 기반이라 그대로 둔다.
  - `quartz.config.yaml:8` 주석("방문 집계는 goatcounter-tracking 플러그인 하나만 쓴다")은 병행 시 갱신한다.
- GA4 쪽 설정
  - 데이터 스트림 → 향상된 측정 → "브라우저 기록 이벤트 기반 페이지 변경"을 **끈다**(Quartz가 직접 보내므로 이중 집계 방지).
  - 포트폴리오도 같은 측정 ID를 쓰면 gtag 기본 쿠키 도메인이 `haejunhyun.com`이라 서브도메인 간 사용자가 이어진다.
- 고려할 점: GA는 쿠키를 쓴다. 개인정보 처리 안내(푸터 링크 등)를 두는 것이 안전하다.
- 대안: Cloudflare Web Analytics(쿠키 없음, Pages 대시보드에서 켜면 됨, 코드 변경 없음). 상세 행동 분석은 GA가 낫다.
- 검증: 배포 후 GA 실시간 보고서에서 홈 → 노트 SPA 이동 시 page_view가 1회씩 찍히는지 확인한다.

---

## 7. 완료 체크리스트

- [ ] D1~D6 결정
- [ ] P1 저장소 이름 변경, 설정·문서·remote 갱신
- [ ] P2 새 Pages 프로젝트, Secret, `blog.` 도메인, `/api/stats` 확인
- [ ] P3 `baseUrl`·giscus·(GA) 반영, 산출물 주소 확인, push
- [ ] P4 Redirect Rule → 옛 프로젝트 도메인 해제 → 301 검증(한글 경로 포함)
- [ ] P5 Search Console 사이트맵 제출, 주요 노트 색인 요청
- [ ] P6 vault 폴더 이름 변경, 심링크·series-roadmap 미리보기 갱신
- [ ] P7 (포트폴리오 출시 시) 규칙 축소
- [ ] P8 옛 프로젝트, `handoff.md` 삭제
