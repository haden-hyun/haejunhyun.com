---
title: (Git) 명령어
created: 2025-10-31
modified: 2025-10-31 14:55
cssclasses:
  - max
tags:
  - git/명령어
---
> [!summary] 요약

---
# 1. 초기 설정
> 로컬 프로젝트에 원격 저장소 연결
- `origin` : 원격 저장소(remote repository)의 별칭
	- Git에서 기본 이름으로 사용
	- 관례
```bash
git init # 초기화
git remote add origin <URL>

# 현재 원격 저장소 이름 확인
git remote -v
```

## 1.1. fetch vs push

- `fetch`
	- 원격 -> 로컬
	- 원격 저장소의 변경 내용을 가져오지만, 병합하지는 않음
	- 변경 사항 확인 후 병합
	- 로컬에만 영향을 미침
```bash
git fetch origin # 원격 변경 내용 가져오기

# 2. 변경된 파일 목록 확인
## 내 브랜치(main)와 원격 브랜치(origin/main)의 변경 목록 확인
git diff --name-only main origin/main

# 3. 특정 파일만 병합 (선택적)
## 방안1
git checkout origin/main -- 경로/파일명
## 예) origin/main 에서 README.md만 내 브랜치로 가져옴
git checkout origin/main -- README.md
## 방안2
git restore --source=origin/main 경로/파일명
## 예. 
git restore --source=origin/main docs/guide.md

# 4. 병합 완료 후 커밋

```
- `push`

# 2. 브랜치 생성
## 2.1. 신규 브랜치 생성
```bash
git checkout -b <new_branch_name>
# 예
git checkout -b feature/generate_unit
```
---
>[!example] 참고사이트


