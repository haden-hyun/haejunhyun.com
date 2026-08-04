# CHANGELOG.md — 디자인 결정 이력

> "지금 상태"는 `DESIGN-SYSTEM.md`. 여기는 "왜 이렇게 됐는가"의 타임라인만.

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

## 폐기된 문서

- `design-bluenote-handoff.md` — Gothic A1/IBM Plex Sans KR 제안이
  기각되어 무효. 결정 내용은 `DESIGN-SYSTEM.md` §2로 대체.
- `handoff.md`, `REDESIGN-GUIDE.md` — 실행 이력은 이 문서로, 현재
  상태는 `DESIGN-SYSTEM.md`로 이관.
