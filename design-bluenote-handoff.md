# 🎺 Design System & Typography Handoff (v5-homepage)

> **Last Updated:** 2026-08-04  
> **Status:** Approved & Implemented  
> **Target:** Quartz v5 Renewal Architecture  

---

## 1. Brand Concept & Identity

### 🎯 Core Concept: "Chill & Blue Note"
본 블로그 리뉴얼은 거창하고 딱딱한 기술 포트폴리오(Nerd-style)에서 벗어나, **'무심하고 쿨한 아날로그 지식 아카이브'**를 지향한다. 

* **The Narrative (내가 '해준' 이야기):** 데이터 엔지니어링, GIS, 코드 등의 기술적 자산부터 이따금 튕기는 기타 연주와 필사까지. 각 잡힌 정규 앨범이 아닌, 가볍고 자연스럽게 모인 **B-side 트랙 / 데모 테이프(Demo Tape)**의 정서를 담는다.
* **The Visual Metaphor (HAEJUN RECORDS):** 50~60년대 하드밥 재즈의 거장 레이블 **'Blue Note Records'**와 영화 *<Blue Giant>* 특유의 아날로그 및 재즈 감성을 차용한다. 
* **Tone & Manner:** 
  * Eyebrow: `blue notes. 🎷` (소문자 + 마침표 + 이모지로 힘을 뺀 센스 연출)
  * Headline: *"어쩌다 보니 모인 관심사의 파편들"* (담백하고 건조한 태도)
  * Main CTA: `Play Notes` (음반을 재생하듯 노트를 탐색하는 위트)

---

## 2. Configuration & Typography Rationale

`quartz.config.yaml` 전역 설정 내 폰트 변경 사항 및 정당성(Rationale)은 다음과 같다.

```yaml
# quartz.config.yaml (Extract)
pageTitle: HAEJUN RECORDS
theme:
  typography:
    header: Gothic A1
    body: IBM Plex Sans KR
    code: JetBrains Mono
```

### 💬 `pageTitle: HAEJUN RECORDS`
* **근거:** 기존 `HYUNATLAS`의 발음 연음 문제(현애틀러스/휴나틀라스)와 지도(Atlas)라는 1차원적·딱딱한 은유를 폐기.
* **의미:** 본명인 '해준(HAEJUN)'과 '기록/음반(RECORDS)'의 중의적 결합. 도메인(`haejunhyun.com`) 및 전체 블로그의 아날로그 재즈 무드와 완벽하게 호응함.

### 📐 `header: Gothic A1`
* **기존:** `Nanum Myeongjo` (나눔명조)
* **문제점:** 명조체 특유의 예스럽고 진지한 문학적 톤이 모던하고 쿨한 음반사 컨셉과 충돌함.
* **변경 근거:** **`Gothic A1`**은 두께(Weight) 스펙트럼이 매우 넓고 단단한 기하학적 산세리프(Sans-serif) 폰트임. 영문과 한글 헤더가 함께 쓰일 때 50~60년대 재즈 포스터 특유의 묵직하고 모던한 타이포그래피를 가장 안정적으로 구현함.

### 📄 `body: IBM Plex Sans KR`
* **기존:** `Noto Sans KR`
* **문제점:** 가장 대중적인 범용 폰트이나, 특색이 없고 전형적인 웹사이트 템플릿 느낌(Default vibe)을 줌.
* **변경 근거:** **`IBM Plex Sans KR`**은 개발자의 기계적/논리적 정갈함(Tech)과 타자기 시절의 아날로그 감성(Retro)이 미묘하게 공존하는 폰트임. "데이터/코드"와 "기타/필사"가 교차하는 본문의 읽기 경험(Readability) 및 브랜드 무드와 완벽히 부합함.

---

## 3. Custom CSS (`custom.scss`) Rationale

Quartz 전역 산세리프 폰트와 별개로, 좌측 상단 브랜드 로고 브랜드인 `HAEJUN RECORDS`만 **블루 노트 앨범 커버의 타이포그래피(Reid Miles Style)**를 극대화하기 위해 커스텀 CSS를 적용함.

### 🎨 Implementation Code

```scss
/* quartz/styles/custom.scss */

/* 1. Google Fonts: Ultra-Bold Condensed Sans-serif 'Anton' Import */
@import url('[https://fonts.googleapis.com/css2?family=Anton&display=swap](https://fonts.googleapis.com/css2?family=Anton&display=swap)');

/* 2. Page Title Logo Styling (HAEJUN RECORDS) */
.page-header .page-title,
.page-title a {
  font-family: 'Anton', sans-serif !important;
  font-weight: 400 !important; /* Anton's default weight is natively Ultra-Bold */
  text-transform: uppercase;   /* 강렬한 대문자 고정 */
  letter-spacing: 0.05em;      /* 아날로그 LP 커버 특유의 여유 있는 자간 */
  font-size: 1.6rem;           /* 시각적 존재감 부여 */
  line-height: 1.1;
  
  /* Hover Interaction: Secondary Blue Accent Color Transition */
  transition: color 0.2s ease;
  &:hover {
    color: var(--secondary) !important;
  }
}
```

### 🔍 CSS Rationale
1. **`font-family: 'Anton'`**: 세로로 긴 축축 늘어난(Condensed) 대문자 구조를 가진 폰트로, 1950~60년대 블루 노트 재즈 앨범 커버를 상징하는 시그니처 폰트 스타일(Impact/Futura Bold계열)을 현대적 웹 폰트로 완벽히 재현함.
2. **`letter-spacing: 0.05em`**: 자간을 미세하게 확장하여 꽉 막힌 느낌을 없애고 힙스터 및 레트로 라이프스타일 매거진 같은 여백의 미를 형성함.
3. **`var(--secondary)`**: Quartz 전역 테마에 이미 세팅되어 있는 뮤트한 블루(`light: #3d6b8e` / `dark: #7aaed4`) 색상을 마우스 호버(Hover) 시 연동되게 하여, 브랜드 컬러의 일관성을 유지하고 인터랙티브한 재미를 제공함.
