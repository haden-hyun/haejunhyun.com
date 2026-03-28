---
title: (Obsidian) 이미지 자동 업로드
created: 2025-10-31
modified: 2025-10-31 16:43
cssclasses:
  - max
tags:
  - obsidian/plugin
  - obsidian/image
---
> [!summary] 요약
> - `image auto uploader` 플러그인과 Picgo를 통해 github에 사진을 자동 업로드하고 해당 사진의 raw 파일 url 경로를 가져오기

---
# 1. 설치 필요사항
## 1.1 Obsidian 플러그인

커뮤니티 플러그인에서 `Image auto uploader` 플러그인 설치(개발자 ==renmu==)
## 1.2 Github 리포지토리

### 1.2.1 Repository 생성

1. GitHub 접속: [https://github.com](https://github.com)
2. 우측 상단 **+ → New repository** 클릭
3. Repository 정보 입력
	1. **Repository name**: 예) `obsidian-image`
	2. **Public / Private**: Public 추천 (Raw URL 접근 가능)
4. **Create repository**

### 1.2.2 Personal Access Token 발급

1. GitHub 우측 상단 → **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. **Generate new token → Fine-grained token** 선택
3. 설정
	1. **Repository access**: 특정 repo 선택 (`obsidian-image`)
	2. **Permissions**: Read & write 권한
	3. **Expiration**: 무기한 추천        
4. **Generate token** 클릭 → 토큰 값 복사 (한 번만 표시됨)

> [!warning] 토큰 값은 **PicGo config.json**에 입력!!(노출되지 않도록 주의)

## 1.3 Node.js 및 PicGo 설치

> [!hint] Mac 환경에서 설치함

```bash
# 1) Homebrew로 Node 설치 (없으면)
brew install node

# 2) PicGo Core 설치
npm install -g picgo

# 3) 설치 확인
picgo -v

# 4) 설치 경로 확인 (Obsidian 플러그인에 필요)
which picgo
# 예시 출력: /opt/homebrew/bin/picgo
```
---
# 2. 환경설정

## 2.1 Picgo Github 업로더 설정

**config.json 생성 및 설정**

```bash
### .picgo 폴더 생성
mkdir -p ~/.picgo

### config.json 파일 생성
nano ~/.picgo/config.json

# 열기
cat ~/.picgo/config.json
```

- `repo`: Github 레퍼지스토리 경로
- `branch`: 브랜치명 (보통 `main`)
- `token`: 해당 레퍼지스토리 token
- `path`: 사진 저장된 폴더 경로
- `customUrl`: 사진 불러올 경로
	- 단, html 경로가 아닌 raw파일 url 경로를 가져와야함
```json
{
  "picBed": {
    "uploader": "github",
    "github": {
      "repo": "username/obsidian-image",
      "branch": "main",
      "token": "YOUR_PERSONAL_ACCESS_TOKEN",
      "path": "images/",
      "customUrl": "https://raw.githubusercontent.com/username/obsidian-image/main"
    }
  },
  "picgoPlugins": {}
}

```
# 2.2 플러그인 세팅

- Picgo-Core 로 설정
- Picgo-Core path 로컬 내 picgo 설치 경로
	- `which picgo` 로 경로 확인 가능
- image size suffix
	- 나는 가로 500, 세로 300 을 기본값으로 설정(`|500x300`)

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/image_auto_uploader_settings.png" width="600" height="600" />
</div>

---
# 3. html 코드로 변환

`![file.png](url)` 와 같이 경로를 자동으로 불러오지만, 웹 포스팅하면 크기나 정렬 문제가 있어 해당 경로를 html 코드로 자동 변환한다.

우선, 이를 자동으로 변환하는 templete 폴더 내 `.md` 파일 생성

```javascript
const editor = tp.file.cursor;
const selection = tp.file.selection();

if(!selection) {
    tR += "선택 영역이 없습니다.";
} else {
    // Markdown 이미지 정규식
    const pattern = /!\[.*?\|(\d+)x(\d+)\]\((.*?)\)/g;
    const converted = selection.replace(pattern, (match, width, height, url) => {
        return `<div align="center">\n  <img src="${url}" width="${width}" height="${height}" />\n</div>`;
    });
    tR += converted;
}
```
`![file.png|widthxheight](url)`를 선택한 후, 해당 템플릿 단축키 입력하면 아래와 같이 변환됨

```html
<div align="center">
  <img src="url" width="width" height="height" />
</div>
```
---
# 4. 활용

1. 로컬에서 이미지 복사 후 옵시디언 노트 내 붙여넣기
2. *image auto uploader* 으로 github에 이미지가 자동 업로드
3. github에 이미지 **raw파일 url 경로** 가져와서 다음과 같은 url 이미지 경로 생성 (`![file.png|widthxheight](url)`)
4. 웹 포스팅 및 커스터마이즈 편리성을 위해 html 형식으로 전환
5. 해당 이미지 경로 선택 후, *template* 플러그인 단축키 통해 설정한 `.md` 파일 선택
6. 자동으로 url과 너비 및 높이가 html 코드로 전환됨

---
>[!example] 참고사이트
>
