# CHANGELOG.md — 디자인 결정 이력

> "지금 상태"는 `DESIGN-SYSTEM.md`. 여기는 "왜 이렇게 됐는가"의 타임라인만.

## 2026-08-05 — 코드 하이라이팅 재설계 ②: "종이 위의 잉크"

GitHub Light를 구조 참조로 삼은 게 **방향 오류**였다. 그건 순백(`#ffffff`)
배경용이고 우리 배경은 웜 크림(`#efebe0`)이다. 우리 배경 위에서 유명
테마들을 실측하니 전부 AA를 대량 미달했다 — Solarized Light 9/9,
Rosé Pine Dawn 6/8, Gruvbox Light 4/9, GitHub Light 3/7. **색 값을
차용할 대상이 애초에 없었다.**

문제는 대비가 아니라 조화였다. 이전안은 채도가 과했고(S77~87을 S6인
종이 위에), `function`의 `#7d3fb0`(H273 보라)은 브랜드 어디에도 없는
고아 색상이었으며, keyword(H11)와 alert(H350)가 21° 차라 둘 다 빨강으로
읽혔다.

Gruvbox Light가 웜 배경에서 호평받는 진짜 이유를 채도가 아니라
**어둡기(V≈60)**로 파악하고 그 구조만 가져왔다 — 화면 색이 아니라
인쇄 잉크로 읽히게. 유채색을 전부 눌렀다(function V69→49, value V58→38).

결과적으로 유채색 4종이 **전부 브랜드 색상에 1~5° 이내로 결합**됐다:
string=H206(공간·블루), keyword=H16(행위·브릭), function=H323(시간·Chitlins),
value=H167(딥 틸, 유일한 신규 잉크). 고아 색상이 사라졌다.

## 2026-08-05 — Shiki 폴백 버그: 변수명이 통제 밖에 있었다

"코드가 배경에 묻힌다"는 지적을 추적해 렌더 출력 7,598 토큰을 실측한
결과, **1,058개(13.9%)에 `data-token-type`이 없었다** — `hook`, `conn_id`,
`df` 같은 **변수명 전부**. 반면 내가 "가장 진하게"로 설계한 `normal`
타입은 **37개**뿐인 사실상 죽은 타입이었다.

즉 `--syn-ink`(13.59)는 거의 렌더되지 않았고, 실제 식별자는 폴백인
catppuccin-latte `#4C4F69`(6.70)로 떨어져 punct(5.88)·alert(6.64) 사이에
끼어 있었다. **내가 근거로 든 "스프레드 9.47"은 렌더되지 않는 값에 기댄
계산이었다.** 기본색을 `--syn-ink`로 바꿔 폴백을 없앴다.

같은 지적의 다른 절반은 목업 결함이었다 — `haejun-redesign-palette.html`이
`    hook = `을 통째로 `punctuation`으로 마크업하고 있었다. 실제 Shiki
출력에 맞게 수정.

## 2026-08-05 — 주석 압축 (config + 플러그인 소스 20파일)

주석 428줄 → 252줄(-41%). 날짜·세션 히스토리·목업 라인 참조·자기 정정
기록을 걷어내고 핵심 기능과 함정만 개조식으로 남겼다. **경고성 내용은
전부 보존**하고 `⚠️` 마커를 붙였다(예: "통계 하드코딩 금지", "플러그인에서
색 값 정의 금지", "position: header는 조용히 버려짐").

위의 "근거는 코드 주석으로 이관"(아래 항목)과 상충하지 않는다 — 이관된
것 중 **규칙**은 남기고 **서사**만 여기 CHANGELOG로 옮겼다.

정리 중 **틀린 주석 1건 발견**: `visitor-counter`가 "footer가 렌더한다"고
적혀 있었으나 실제로는 home-hero가 렌더한다.

## 2026-08-05 — 선행 문서 5종 삭제, 근거는 코드 주석으로 이관

`handoff.md` / `REDESIGN-GUIDE.md` / `design-handoff.md` /
`MIGRATION-NOTES.md` / `CODE_OF_CONDUCT.md` 삭제.

앞의 넷은 플러그인 소스 21곳에서 섹션 번호까지 찍어 참조되고 있었다
(`design-handoff.md` 12곳, `REDESIGN-GUIDE.md` 5곳, `MIGRATION-NOTES.md`
4곳). 그 주석들은 단순 출처 표기가 아니라 "무엇이 틀렸었는지"를 담고
있어서 — 예: "목업의 129 노트는 실측 90으로 틀렸음", "토큰 병렬 정의
금지" — 문서만 지우면 경고의 근거가 사라진다. **참조를 걷어내는 대신
각 문서가 갖고 있던 사실을 주석 안으로 옮겨 자체 완결되게 고쳤다.**
코드 변경은 없고 주석만 바뀌었다.

`CODE_OF_CONDUCT.md`는 fork로 딸려온 Quartz 커뮤니티의 문서로, 이
저장소(개인 블로그, 외부 기여 없음)와 무관해 삭제. `LICENSE.txt`는
fork 라이선스 의무이므로 유지.

## 2026-08-05 — 컬러 "True Midnight" 적용 (D안)

레퍼런스 커버 4장에서 픽셀 추출 → A/C/D 3안 비교 후 D안 확정.
라이트=크림 인쇄지(`#f7f5ef`), 다크=잉크 네이비(`#0e1420`), accent는
True Blue(H208)와 Midnight Blue(H202)의 중간값 `#1c5f95`(H207).

웜 액센트는 2종을 역할로 분리 — Chitlins(`#b03a7d`)=행동/CTA,
Brick(`#b8442a`)=기술 리터럴/인라인 코드. 두 색은 색상환 45° 간격.

작업 중 **AA 미달 2건을 발견해 함께 수정**: `--gray`(2.72:1)와
`--tertiary`(2.90:1). 후자는 링크 hover 텍스트 색이라 장식이 아니라
가독성 문제였고, hover 방향을 "밝아짐 → 진해짐"으로 바꿔 해결했다.

또한 `custom.scss`의 `rgba(61,107,142,·)` 하드코딩 15곳을 발견 —
"색의 단일 소스는 config"라는 원칙이 실제로는 깨져 있었다.
`--accent-rgb` 토큰으로 전부 치환.

기각: 다크모드 Hero 뒤 radial-gradient 광원(시안까지 만들었으나 제외).
보류: 토픽 컬러 10슬롯 AA 재계산, 코드블록 테마 웜 계열 교체.

## 2026-08-04 — Blue Note Bar/Blue Giant 컬러 비교 (§5.0)

도쿄 Blue Note Bar(네이비+베이지, 블루 네온 vs 브릭/가죽 온도 대비)와
Blue Giant(잉크 네이비→일렉트릭 블루 고채도 그라디언트) 팔레트를 현재
사이트 팔레트와 비교. 둘 다 몰입 환경용 색이라 본문에 그대로 쓰면
가독성·AA 대비가 깨져 전면 채택은 기각. 다크모드 배경/광원(Blue Note
Bar)과 인터랙션 순간(Blue Giant)에만 선택 반영하는 방향으로 §5 갱신.
아직 코드 미반영 — 방향 문서화만 완료.

## 2026-08-04 — 폰트 재결정: Gothic A1 → Hahmlet + Anton

Gothic A1(헤딩)+IBM Plex Sans KR(본문) 조합이 실물 확인 결과 가독성
저하로 판정 — 헤딩·본문이 같은 산세리프 계열이 되며 위계가 사라짐.
한글/라틴 이중언어 서체 Hahmlet(헤딩)으로 교체, 본문은 Noto Sans KR
유지. 로고는 Anton(브랜드 존 고립)으로 확정.

## 2026-08-04 — pageTitle: HYUNATLAS → HAEJUN RECORDS

GIS 메타포(Atlas)를 버리고 '기록'과 '인디 음반사'의 중의적 네이밍으로.
브랜드 컨셉을 Blue Note Records 무드로 전환.

## 2026-08-02 — 폰트 렌더링 버그 발견 및 수정

`fonts` 플러그인을 옵션 없이 켜두면 자기 기본값(Schibsted Grotesk 등)
으로 `configuration.theme.typography`를 덮어쓴다는 사실 확인 — 그동안
사이트는 의도한 명조가 아니라 기본 산세리프로 렌더되고 있었다. 옵션
명시로 해결.

## 2026-08-02 — design-handoff.md 검증 (REDESIGN-GUIDE.md 원본)

design-handoff.md가 가정한 아키텍처(Quartz v4)와 실제(v5 플러그인
체계)가 달라 F1~F7 교정 필요. 콘텐츠 규모도 목업(129)과 실측(90)이
어긋나 TopicGrid/Hero 카피 전면 재작성. 액센트 컬러는 핸드오프 제안
테라코타 대신 기존 슬레이트 블루 유지(AA 대비 우위).

## 2026-07-29 — handoff.md 원본 작성

폰트 변수 미적용, 콜아웃 색상 미분화, 인라인 코드 다크모드 대비 부족
등 P0~P2 12개 개선 항목 진단.

---

## 삭제된 문서

전부 2026-08-05에 삭제됨. 내용이 어디로 갔는지만 남긴다.

| 문서 | 내용의 행선지 |
|---|---|
| `handoff.md` | 진단 결과는 이 문서 타임라인, 현재 상태는 `DESIGN-SYSTEM.md` |
| `REDESIGN-GUIDE.md` | F1~F7 교정 사항은 해당 플러그인 소스 주석 |
| `design-handoff.md` | §3.1/§4.1/§4.2 스펙은 각 플러그인 소스 주석 |
| `MIGRATION-NOTES.md` | v5 API 함정은 이를 참조하던 4개 소스 주석 |
| `design-bluenote-handoff.md` | Gothic A1/IBM Plex Sans KR 제안 기각(2026-08-04 항목). 이미 삭제돼 있었음 |
| `CODE_OF_CONDUCT.md` | fork 잔재, 이 저장소와 무관 — 대체 없이 삭제 |

`docs/superpowers/plans/2026-07-18-quartz-v5-migration.md`에 남은
`MIGRATION-NOTES.md` 언급은 완료된 계획서의 기록이고 외부 경로
(`~/Developer/haejunhyun-v5-test/`)를 가리키므로 그대로 둔다.
