---
title: (Oracle) Airflow 환경 Github 연동
created: 2026-01-15
modified: 2026-01-15 23:30
cssclasses:
  - max
tags:
  - cloud/github
---
> [!summary] 요약
> - 

---

# 0. 들어가며

Oracle Cloud를 통해 서버를 생성하고, Aiflow 및 Postgresql 까지 구축하였다. 

이제 ==서버 내 Airflow 프로젝트를 Github와 연동하여 관리==해보자.

서버가 Github에 들어갈 수 있게 서버용 SSH Key 를 생성해서 Gihub에 등록하는 작업이 필요하다.

# 1. SSH Key

#### 생성 및 복사

1. 프로젝트 폴더 접근: 저자는 `airflow` 내 폴더에서 프로젝트를 관리
2. 키 생성: `ed25519` 방식 활용
3. 키 복사: `ssh-ed25519 AAAAA...` 로 시작하는 문자열을 전체 복사

```bash
cd airflow
# 키 생성
ssh-keygen -t ed25519 -C "oracle-server-to-github"
# 키 복사
cat ~/.ssh/id_ed25519.pub
```

`ssh-keygen`을 통해 key를 생성한 후, `Enter` 키를 3번 누른다. 파일 이름 기본값, 비밀번호 없을으로 설정한다는 의미이다.

>[!question] `ed25519`란?
>- **현재 가장 추천되는 최신 암호화 방식**
>- 과거 `RSA` 방식은 길이가 너무 길고, 수학적으로 계산하여 리소스를 많이 잡아먹음
>- 이를 개선해서 나온 것이 `ed25519`(Edward-curve Digtal Signature Algorithm)으로 RSA보다 키 생성과 검증 속도가 훨씬 빠름

#### Github 등록

1. GitHub 웹사이트 $\rightarrow$ 설정(Settings) $\rightarrow$ **SSH and GPG keys**.
2. `New SSH key` 클릭.
3. Title: `Oracle Cloud Server`
4. Key: 복사한 내용 붙여넣기 $\rightarrow$ 저장.

# 2. Github 연동

#### 정보 등록 및 폴더 초기화

```bash
# 내 정보 등록
git config --global user.name "본인_깃허브_아이디"
git config --global user.email "본인_이메일"
# 프로젝트 폴더 초기화
cd ~/airflow
git init
git branch -M main
```

#### 보안 및 중요 파일 제외

- `.gitignore` 파일 생성 후 가상환경 파일에 올라가지 않도록 방어

```Plaintext
.env
.venv/
logs/
plugins/__pycache__/
dags/__pycache__/
__pycache__/
*.pyc
```

#### 연결 및 업로드

1. GitHub 웹사이트에서 New Repository를 눌러 저장소 생성
2. 서버와 연결 (Remote Add): 생성된 페이지의 SSH 탭에 있는 주소를 사용

```bash
# 레포지토리와 연결
git remote add origin git@github.com:아이디/레포지토리명.git
# 업로드
git add .
git commit -m "init: Airflow setup"
git push -u origin main
```
---
>[!example] 참고사이트
>- 