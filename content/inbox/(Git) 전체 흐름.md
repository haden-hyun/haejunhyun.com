---
title: (Git) 전체 흐름
created: 2025-11-13
modified: 2025-11-13 23:54
cssclasses:
  - max
tags:
---
> [!summary] 요약
> - 

---

# Git 로컬 ↔ 원격 저장소 동기화 가이드

## 1. 레포지토리 최신 상태 가져오기 (`git fetch`)

`git fetch`는 원격 저장소의 최신 커밋 정보를 로컬로 가져오는 명령어입니다.  
- 로컬 파일은 변경되지 않음 (다운로드만)  
- 원격과 로컬 비교 및 병합 준비용

```bash
git fetch origin
```

실행 결과 예시:
```bash
From http://10.10.12.203:35000/happy2/industry_code
   6958da7..c73a9af  main -> origin/main
```
- origin/main 최신 커밋: c73a9af
- 로컬 브랜치 main: 이전 커밋 6958da7
- 결과: 로컬과 원격 상태 불일치

## 2. 로컬과 원격의 일치 여부 확인

- 파일 단위 비교

```bash
git diff --name-status origin/main
```
- 출력 예시:
```bash
A    README.md
M    script.py
D    old_config.json
```
- 의미:

| 기호  | 의미                 | 조치                |
| --- | ------------------ | ----------------- |
| A   | 원격에 새로 추가됨 (로컬 없음) | git pull로 가져오기    |
| M   | 동일 파일 내용 변경됨       | 병합 시 충돌 가능, 수동 확인 |
| D   | 원격에서 삭제됨 (로컬에는 존재) | 필요 시 삭제 또는 유지     |

- 동일 파일 내용이 다를 때 해결 방법:
로컬 변경 사항 임시 저장

``` bash
git add .
git commit -m "local backup before merge"
```

원격 병합
```bash
git pull origin main
```

충돌 발생 시 VSCode에서 해결 후
```bash
git add .
git commit -m "resolve merge conflict"
```
## 3. 원격 브랜치 기준으로 로컬 동기화 (백업 포함)
안전한 백업 절차:
### 현재 로컬 상태 백업용 브랜치 생성
```bash
git checkout -b backup_YYYYMMDD
```

### 메인 브랜치로 돌아오기
```bash
git checkout main
```

### 원격 최신 상태 가져오기

```bash
git fetch origin
```

### 원격 기준으로 로컬 병합
```bash
git merge origin/main
```

로컬 변경 사항을 완전히 버리고 동기화:
⚠️ 주의: 로컬 변경 사항 모두 삭제 → 반드시 백업 후 사용

```bash
git fetch origin
git reset --hard origin/main
```

## 4. 단계별 요약

| 단계 | 목적 | 명령어 | 특징 |
|------|------|--------|------|
| ① | 원격 최신 상태 확인 | git fetch origin | 안전, 병합 없음 |
| ② | 로컬과 원격 비교 | git diff --name-status origin/main | 파일 차이 확인 |
| ③ | 병합/동기화 | git pull origin main | 실제 반영 |
| ④ | 충돌 해결 | VSCode에서 수동 병합 후 git commit | 필요 시 |
| ⑤ | 백업 브랜치 | git checkout -b backup_YYYYMMDD | 원본 보존 |


---
>[!example] 참고사이트
>- 