---
title: 미완성 (Git) Git과 Github
created: 2024-06-29
tags:
  - git/github
  - git/branch
  - git/commit
  - git/repository
---






> [!hint] 작성 내용
> 1. Git과 Github 개념
> 2. 용어 개념 설명(`branch`, `repository`, `clone` 등)
> 3. git 기초 명령어 및 업로드 예시
# 1. Git과 Github
## Git(비전 관리 도구)
- **변경된 내용**만 관리하는 도구
- 코드를 언제 누가 어디를 변경했는지 확인 가능!!
- 코드를 합치거나, 이전 버전으로 돌아갈 수 있음
## Github(코드 저장소)
- Git으로 관리한 코드를 push 통해서 Github에 업로드
- Git: 코드 관리
- Github: 코드 저장
---
# 2. 용어 정리
## Repository(저장소)
- 특정 프로젝트의 저장소를 의미함
- **Local** Repository : <u>개인 컴퓨터</u>에 저장된 로컬버전의 프로젝트 저장소
- **Remote** Repository:  <u>원격 서버</u>에 저장되는 프로젝트 저장소로 여러 명과 공유하기 위한 저장소
## Branch(독립적인 작업 공간)
- Repository(저장소)의 공간에서 **독립적으로 어떤 작업을 하기 위한 공간**
- `default Branch` : 중심이 되는 Branch
- `remote Branch` : 원격 저장소(Remote Repository)에 있는 Branch
## Commit
- 업로드 시 업데이트한 내용을 기입
## Origin(원격 저장소)
- `origin` : **원격 저장소의 이름**
	- 예) `origin/hyunae` : 원격 저장소 안에 Branch 이름 = `hyunae`
- `HEAD` : **현재 나의 작업공간**
	- 예) `origin/HEAD` : 원격 저장소안에 현재 코드 상태를 의미함
## Clone
- 원격 저장소(Remote Repository)로부터 소스코드를 로컬 저장소(Local Repository)로 복제
---
# 3. Git 업로드
## 기초 명령어
1. **초기 작업**: 로컬 저장소 생성 및 원격 저장소와 연결
	1. `git init`: Local 환경에 Repository 생성(<u>Remote 환경에 Repository는 Github에서 생성</u>)
	2. `git remote add origin <url>`: 로컬 저장소와 원격 저장소(`origin`)를1 연결함
2. **git 저장**: push 할 파일 commit 및 메시지 작성
	1.  `git add <file>` : push할 특정 파일을 commit 함
	2. `git commit -m "<message>"`: commit시, 메시지 작성
	3. `git push -u origin <branch>`: 원격 저장소(`origin`)의 특정 `branch`에 업로드
3. **기타**
	1. `git branch`: 현재 branch 확인
	2. `git branch -M <new_branch>`: 기존 branch를 새로운 branch로 변경(예.`git branch -M main`: branch를 `main`으로 변경함)
	3. `git status`: 현재 git 상태 확인(commit 한 파일 확인)
## git 업로드
```bash
# 1. 초기 작업
git init
git remote add origin <url>

# 2. git 저장
git add <file>
git commit -m "<message>"
git push -u origin <branch_name>
```

^9c95fc
