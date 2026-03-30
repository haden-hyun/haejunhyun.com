---
title: (Git) Git 기본개념
created: 2025-11-01
modified: 2025-11-01 00:47
cssclasses:
  - max
tags:
  - git/github
  - git/명령어
---
> [!summary] 요약
> - 

---
# 1. Git

> [!hint] Git과 Github란?
> 1. Git: 비전 관리 도구로 변경된 내용만 관리하는 도구
> 2. Github: 코드 저장소로 Git에서 관리하는 코드를 저장

==Git==은 비전 관리 도구이다. 코드를 언제 누가 어디를 변경했는지 확인 가능하며, 코드를 합치거나 이전 버전으로 돌아갈 수 있다. 즉, **Git 코드의 변경된 내용만 관리하는 도구**이다.

Git 으로 관리한 코드를 `push` 를 통해서 Gihub에 업로드한다. 따라서, Github는 **Git에서 관리하는 코드를 저장하는 곳**이다.

---
# 2. 용어 정리

==Repository==(리포지토리)는 **특정 프로젝트의 저장소**를 의미한다. 작업한 코드를 업로드하기 위해서는 Repository 생성이 필요하다. 여기서 ==Local Repository==는 개인 컴퓨터에 저장된 로컬버전의 프로젝트의 저장소이다. ==Remote Repository==는 원격 서버에 저장되는 프로젝트 저장소로 여러 명과 공유하기 위한 저장소이다.

Branch는




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
>[!example] 참고사이트
>- 