---
title: (Obsidian) 블로그 만들기
created: 2025-11-19
modified: 2025-11-19 23:10
cssclasses:
  - max
tags:
  - obsidian/quartz/blog
  - obsidian/cloudfare
  - obsidian/web
---
> [!summary] 요약
> - 옵시디언의 Quartz 플러그인과 Cloudflare를 이용하여 옵시디언 노트를 웹에 게시하기

---
> **우선, Github와 Cloudflare 계정 생성하기** 
> 1. [Github 계정 생성](https://github.com/signup) 
> 2. [Cloudflare 계정 생성](http://dash.cloudflare.com/sign-up)

# 1. Github와 Cloudflare 연동

#### Github 설정

Github의 [Quartz](https://github.com/jackyzha0/quartz) 페이지를 방문하여 해당 템플릿을 나만의 repository에 복사하여 새로운 저장소를 생성한다.

> **_'Use this template' → 'Create a new repository'_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step1.png" width="1000" height="300" />
</div>

> **_'Repository Name' 입력 → 'Public' 설정 → 'Create Repository'_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step2.png" width="500" height="300" />
</div>

#### Cloudflare 설정

> **_'빌드' → 'Workers 및 Pages' 탭 → '응용 프로그램 생성'_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step3.png" width="1000" height="300" />
</div>

> **_'Pages' 탭 → '기존 Git 리포지토리 가져오기'_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step4.png" width="500" height="300" />
</div>

> **_'Github' 탭 → 위에서 생성한 리포지토리 선택_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step5.png" width="500" height="350" />
</div>

> **_프로젝트 이름(`사이트명`) → 프로덕션 분기(`v4`) → 프레임워크 미리 설정(`없음`) → 빌드 명령(`npx quartz build`) → 빌드 출력 디렉터리(`public`) → 저장 및 배포_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step6.png" width="800" height="600" />
</div>

---
# 2. Obsidian에서 노트 게시

[Flowershow 플러그인](https://obsidian.md/plugins?id=flowershow)을 사용하면 옵시디언 노트를 깃허브 저장소에 업로드 한다. 해당 플러그인을 설치한 후 다음과 같이 Github 설정을 작성해야 한다. 

**그러나 그전에 Github 저장소에서 접근 토큰을 발급 받아야한다.**  [여기](https://github.com/settings/tokens/new)를 눌러 토큰을 생성한다.(단, `Tokens (classic)` 탭에서 작성한다.)

> **_Note(token 이름으로 사용자가 작성) → Expiration 은 기한 없이 설정(`No expiration`) → `repo` 전체 선택_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step8.png" width="800" height="400" />
</div>

> **_발급 받은 Token 키 발급 ==(1회만 확인할 수 있으므로 메모장이나 따로 저장할 것!!)==_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step9.png" width="600" height="200" />
</div>


> **_위에서 생성한 'Github 리포지토리 이름' → Github '사용자 이름' → 위에서 생성한 Github '접근 토큰'_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step7.png" width="500" height="250" />
</div>

> **_이제 옵시디언 노트 업로드 → 옵시디언 내 단축키 설정(`Flowershow: Publish all notes`) 또는 수동 업로드(`리본 아이콘 🌱` 클릭)_**

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step10.png" width="800" height="200" />
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Github_Quartz_step11.png" width="500" height="400" />
</div>

---
# 3. 홈페이지 설정

## 3.1 메인 페이지 설정

> [!error] _**“404 Either this page is private or doesn’t exist.”**_
> 위 과정을 진행하고 웹 접속시 에러 발생할 수 있으며, 이는 Github 내 Quartz 레포지토리에 파일을 추가해야 한다.

**`content`** 폴더 내부에 **`index.md`** 파일이 없는 경우 해당 파일을 수동으로 추가하거나 Obsidian에서 최상위경로에 `index` 라는 노트를 추가 작성하면 된다.

==이와 같이 옵시디언에서 작성한 모든 노트들은 사용자 Github repository의 `content` 폴더에 업로드 된다.==

## 3.2 config 수정

> [!hint] **`quartz.config.ts`** 파일 내 **`configuration`** 하위 항목들을 수정하여 아래와 같이 커스터마이징 가능

#### 홈 이름 설정

- 홈 이름 설정: **`pageTitle`** 항목에 문자열 값을 수정(해당 사이트는 **`🧠 디지털 가든`** 으로 설정)

#### 폰트 설정

- 사용자 언어 설정: **`locale`** 값을 **`ko-KR`** 로 변경(기본값은 `en-US`)
- 폰트 설정: **`fontOrigin`** 는 폰트 저장소를 의미하며 기본값인 **`googleFonts`** 유지하거나 사용자가 활용하고 싶은 폰트 저장소 수정 가능(참고: [구글 폰트 목록](https://fonts.google.com/))
	- **`theme`** 항목 내 **`typography`** 을 수정
	- **`header`, `body`** 는 제목과 본문에 대한 폰트 설정으로 해당 사이트는 **`Noto Sans KR`** 로 설정
	- **`code`** 는 코드 블럭과 같은 스타일로 해당 사이트는 **`JetBrains Mono`** 로 설정

#### 웹에 게시하지 않을 노트 설정

- 폴더 경로 설정: **`ignorePatterns`** 항목에 옵시디언 기준 폴더 및 파일명 추가 (==단, 웹에서만 게시되지 않을 뿐 Github에는 업로드된다.==)

아래는 해당 사이트 기준 설정한 **`quartz.config.ts`** 파일 예시이다.

```ts
configuration: {
    pageTitle: "🧠 디지털 가든",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-6XY03WD2ST",
    },
    locale: "ko-KR",
    baseUrl: "haejun.pages.dev",
    // ignorePatterns: 웹에 publish 하지 않는 content 하위 폴더 목록
    ignorePatterns: ["private", "templates", "attachments",".obsidian","필사"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Noto Sans KR",
        body: "Noto Sans KR",
        code: "JetBrains Mono",
      },

```

---
>[!example] 참고사이트
>- [Quartz를 이용해 옵시디언 노트를 웹에 게시하기](https://anpigon.pages.dev/%F0%9F%A7%B0-%EC%83%9D%EC%82%B0%EC%84%B1-%EB%8F%84%EA%B5%AC/%EC%98%B5%EC%8B%9C%EB%94%94%EC%96%B8-Obsidian/Quartz/%EC%98%B5%EC%8B%9C%EB%94%94%EC%96%B8-%EB%AC%B4%EB%A3%8C-%ED%8D%BC%EB%B8%94%EB%A6%AC%EC%8B%9C-%EB%B0%A9%EB%B2%95(Quartz)) 