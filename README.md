# haejunhyun.com

**Obsidian** vault를 **Quartz v5**로 빌드해 **Cloudflare**로 배포하는 개인 블로그 저장소입니다.

- 🌐 사이트: https://haejunhyun.com
- 📝 원본 글: Obsidian vault (`00-Blog/content`) — 이 저장소의 `content/`는 vault를 가리키는 심볼릭 링크
- 🚀 배포: 로컬에서 빌드한 `public/`을 커밋하면 Cloudflare가 빌드 없이 그대로 서빙 (프로덕션 브랜치: `v5`)

## 배포 구조

```text
Obsidian Vault (원본)
   │ 심볼릭 링크 (content/)
   ▼
Quartz v5 빌드 (로컬, npx quartz build)
   │
   ▼
public/ (완성된 정적 사이트)
   │ git push (v5 브랜치)
   ▼
Cloudflare ── haejunhyun.com 서빙
```

심볼릭 링크는 로컬에서만 유효하므로 원격 빌드는 불가능합니다. 그래서 빌드를 로컬에서 수행하고 결과물(`public/`)만 커밋하는 구조를 사용합니다. Cloudflare의 빌드 명령은 비워져 있습니다.

## 디렉토리 구조

| 경로                                   | 역할                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/`                             | 블로그 원고. Obsidian vault(`~/Documents/obsidian/00-Blog/content`)로의 **심볼릭 링크** — 이 저장소에는 실제 파일이 없다 |
| `public/`                              | 빌드 결과물(정적 사이트). **커밋 대상**이며 Cloudflare가 이 폴더를 그대로 서빙한다                                       |
| `plugins/`                             | 로컬 커스텀 플러그인 20종. 각각 독립 npm 패키지로, 자체 install/빌드가 필요하다                                          |
| `scripts/`                             | 배포 스크립트 3종 (아래 참고)                                                                                            |
| `quartz/`                              | Quartz v5 코어. `quartz/styles/custom.scss` 외에는 수정하지 않는 것이 원칙                                               |
| `docs/`                                | Quartz 공식 문서 (upstream 그대로)                                                                                       |
| `quartz.config.yaml`                   | **설정의 중심.** 테마(폰트·컬러)·플러그인·레이아웃이 전부 이 파일에 있다                                                 |
| `quartz.ts` / `og-image.overrides.tsx` | YAML로 표현할 수 없는 고급 오버라이드 (OG 이미지 등)                                                                     |
| `DESIGN-SYSTEM.md`                     | 타이포그래피·컬러·컴포넌트 등 디자인 시스템의 현재 상태 (디자인 문서는 이 하나)                                          |

### 로컬 플러그인 (`plugins/`)

코어를 수정하는 대신 독립 패키지로 분리한 커스텀 컴포넌트들입니다. `quartz.config.yaml`에서 `source: ./plugins/<이름>`으로 참조합니다.

`social-links` · `recent-notes-index` · `prev-next` · `reading-progress` · `back-to-top` · `image-lightbox` · `visitor-counter` · `footer` · `goatcounter-tracking`

작성 규약(디렉토리 구조, `package.json` 형태, 빌드 명령)은 기존 플러그인 하나를
그대로 본뜨는 것이 가장 정확합니다 — 예: `plugins/home-hero/`. 각 패키지는
`npm install && npm run build`(tsup)로 `dist/`를 만들며, **`dist/`는 커밋 대상**입니다
(빌드 시 저장소 상태 그대로 로드되므로 소스만 고치면 반영되지 않습니다).

### 배포 스크립트 (`scripts/`)

| 스크립트          | 용도                                                            |
| ----------------- | --------------------------------------------------------------- |
| `deploy-dev.sh`   | 로컬 프리뷰 (localhost:8080)                                    |
| `deploy.sh`       | Quick Publish — 플러그인 install → 빌드 → `public/` 커밋 → push |
| `deploy-clean.sh` | Clean Publish — 캐시 삭제 후 전체 재빌드 배포                   |

Obsidian 단축키에 연결해 에디터에서 바로 실행합니다.

## 커스터마이징 규칙

- **CSS**: `quartz/styles/custom.scss`만 편집한다. 첫 줄 `@use "base"`는 절대 삭제 금지.
- **테마 컬러**: `quartz.config.yaml`의 `secondary` 값 하나로 전체 포인트 컬러가 연동된다.
- **플러그인 옵션**: YAML의 `options:`는 해당 엔트리에 `layout:` 블록이 있어야 컴포넌트에 전달된다.
- **코어(`quartz/**`)**: custom.scss 외 수정 금지 — upstream 업데이트 충돌을 막기 위한 v5 이관의 핵심 원칙.

## 만드는 과정

블로그 구축 과정은 사이트의 [Quartz 블로그 시리즈](https://haejunhyun.com)에 기록되어 있습니다.

---

Built with [Quartz v5](https://quartz.jzhao.xyz/) · Deployed on [Cloudflare](https://www.cloudflare.com/)
