# haejunhyun.com

Obsidian vault를 **Quartz v5**로 빌드해 **Cloudflare**로 서빙하는 개인 블로그.

- 사이트: https://haejunhyun.com
- 브랜치: `v5` (작업·프로덕션 겸용 — Cloudflare가 이 브랜치만 배포)
- 원고: Obsidian vault(`00-Blog/content`) — 이 저장소의 `content/`는 그 **심볼릭 링크**

## 배포 구조

```text
Obsidian vault (원본)
   │ 심볼릭 링크 content/
   ▼
로컬 빌드 (npx quartz build)
   ▼
public/ (정적 사이트) ── git push v5 ──▶ Cloudflare 서빙
```

- 심링크는 로컬에서만 유효 → **원격 빌드 불가**
- 그래서 빌드 결과물 `public/`을 커밋 → Cloudflare 빌드 명령은 비어 있음
- **`public/`을 갱신하지 않으면 소스를 고쳐도 라이브에 반영되지 않는다**

## 빌드

```bash
npx quartz plugin install   # .quartz/ 생성 (gitignore된 생성 디렉터리)
npx quartz build            # → public/
```

- `.quartz/`가 없으면 `quartz.ts`의 `./.quartz/plugins` import가 깨진다 — 첫 명령이 해결책
- 주의: **dev 서버(`deploy-dev.sh`)가 `public/`을 해시 없는 산출물로 덮어쓴다.**
  커밋 전 `public/index.html`이 `index-<해시>.css`를 참조하는지 확인 — `index.css`면 dev 빌드다
- 주의: dev 서버와 `build`를 겹쳐 돌리면 `public/`이 비워질 수 있다. 서버를 끄고 다시 구울 것
- 주의: `npm run install-plugins`는 YAML 설정 이전의 레거시 경로 — 쓰지 말 것

## 저장소 지도

| 경로                 | 역할                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `quartz.config.yaml` | **설정의 중심** — 테마(색·서체)·플러그인·레이아웃 전부           |
| `content/`           | 원고. vault 심볼릭 링크 (실제 파일 없음)                         |
| `public/`            | 빌드 결과물. **커밋 대상**                                       |
| `plugins/`           | 로컬 커스텀 플러그인 20종. 각각 독립 npm 패키지                  |
| `quartz/`            | 코어. `styles/custom.scss`·`styles/syntax.scss` 외 수정 금지     |
| `quartz/static/`     | 빌드에 실려 나가는 이미지(아바타, `bluegiant/` 히어로·푸터 소스) |
| `assets/`            | 배포되지 않는 원본 이미지(컷아웃·포스터 마스터)                  |
| `scripts/`           | 배포 스크립트 3종                                                |
| `quartz.ts`          | YAML로 표현 못 하는 오버라이드(OG 이미지 등)                     |
| `DESIGN-SYSTEM.md`   | 디자인의 현재 상태 — 색·서체를 건드리기 전 필독                  |
| `CLAUDE.md`          | 작업 규칙·함정 모음                                              |

## 로컬 플러그인

`quartz.config.yaml`에서 `source: ./plugins/<이름>`으로 참조한다.

| 갈래         | 플러그인                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| 홈           | `home-hero` · `featured-notes` · `topic-grid` · `recent-notes-index`              |
| 페이지 골격  | `global-nav` · `footer` · `topics-page` · `archive-page`                          |
| 노트 부속    | `note-specs` · `note-catalog` · `related-notes` · `prev-next` · `summary-description` |
| 읽기 보조    | `reading-progress` · `back-to-top` · `image-lightbox` · `image-layouts`           |
| 기타         | `social-links` · `visitor-counter` · `goatcounter-tracking`                       |

- **`dist/`가 커밋 대상** — 빌드는 저장소 상태를 그대로 읽으므로 **소스만 고치면 반영되지 않는다**
- 수정 후 해당 플러그인에서 `npm install && npm run build`(tsup)
- 새 플러그인은 기존 것(`plugins/home-hero/`)을 그대로 본뜨는 게 가장 정확하다
- 주의: `quartz.lock.json`의 `resolved`가 다른 저장소를 가리키면 이 저장소를 고쳐도 반영되지 않는다 — 락파일을 먼저 확인

## 배포 스크립트

| 스크립트          | 용도                                                    |
| ----------------- | ------------------------------------------------------- |
| `deploy-dev.sh`   | 로컬 프리뷰(localhost:8080) — `public/`을 덮어쓴다      |
| `deploy.sh`       | plugin install → build → `public/` 커밋 → push          |
| `deploy-clean.sh` | 캐시 삭제 후 전체 재빌드 배포                           |

Obsidian 단축키에 연결해 에디터에서 바로 실행한다.

---

Built with [Quartz v5](https://quartz.jzhao.xyz/) · Deployed on [Cloudflare](https://www.cloudflare.com/)
