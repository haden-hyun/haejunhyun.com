---
title: (Python) 설치 및 설정
created: 2025-09-19
modified: 2025-09-19 14:42
cssclasses:
  - max
tags:
  - python/설치
  - python/설정
  - python/vscode
---
> [!summary] 요약
> - 로컬 PC 폴더 정리를 하면서 초기에 conda나 brew 등 다양하게 설치된 Python 을 정리하기 위함
> - 매번 설치할 때 마다 새롭고 찾아보는게 귀찮아서 한 번 가볍게 요약
> - 로컬 PC 운영체제는 `Mac`으로 `homebrew` 통해 Python 설치하고 vscode 기반 Cursor AI 사용

---
# 1. 기존 Python 제거
> [!warning] 주의!!
> - **Mac 내장 Python은 절대 제거 금지!!**
> - 경로: `/usr/bin/python3` 또는 3.9~3.10 버전
> - Why? 시스템에서 여러 기능과 앱이 의존 → 삭제 시 macOS 정상 작동 불가

## 1.1 경로 확인
- python 및 conda 설치된 경로 확인
- Mac 내장 Python은 건들지마!
```bash
which -a python python3
which -a conda
```
## 1.2 제거
### 1.2.1 Miniconda / Anaconda 완전 제거
- miniconda 나 anaconda 완전 제거
```bash
conda install anaconda-clean   # 없으면 생략 가능
anaconda-clean --yes           # 잔여 설정 삭제

rm -rf ~/anaconda3
rm -rf ~/miniconda3
```
### 1.2.2 homebrew 설치된 python 제거
```bash
brew list | grep python
brew uninstall python python@3
```
### 1.2.3 남은 경로 확인
- 내장 경로(`/usr/bin/python3`)만 존재해야돼 
```bash
which -a python3
```
---
# 2. Python 설치(homebrew 사용)
- 특정 버전 설치
- 설치 후 버전 확인
```bash
# 3.13 버전 설치
homebrew install python@3.13

python3 --version
which python3
```
---
# 3. 프로젝트 및 가상환경 설정
## 3.1 프로젝트 폴더 생성
- Python 프로젝트는 **루트 폴더를 기준으로 가상환경, 코드, 설정 파일을 관리**하는 것이 일반적
	- 예) `~/Projects/myproject/`
```bash
mkdir -p ~/Projects/<project_name>
cd ~/Projects/<project_name>
```
## 3.2 가상환경 생성 및 활성화
> Python 프로젝트마다 **독립적인 패키지 환경**을 유지하기 위함

가상환경을 생성하지 않고 Global 환경을 사용했을 때의 문제점은 크게 3가지다.
1. Python 패키지는 프로젝트마다 버전이 다를 수 있음
2. Global Python에 설치하면 프로젝트 간 충돌 발생 가능
	1. 예: 프로젝트 A는 `pandas==2.1`, 프로젝트 B는 `pandas==2.0` 필요
3. OS/Global Python을 직접 건드리면 macOS 기능이나 다른 프로젝트에 영향
    
위와 같은 문제점을 해결하기 위해서 프로젝트별 가상환경(`.venv`)를 생성하여 독립적인 Python 환경을 구성한다.
1. 패키지 충돌 방지
2. 프로젝트 이동/배포 용이
3. Global Python은 건드리지 않고 안전하게 개발 가능

> [!question] 왜 `.venv`라고 설정?
> `.venv`는 Python과 VSCode 간 사실상 표준 관례!
> 1. 가상환경명 앞에 `.`을 붙여 숨김 풀더로 활용한다. 이를 통해 `bash`에서 폴더 목록 조회시 숨길 수 있고 프로젝트 구조가 깔끔해짐
> 2. VSCode에서 `.venv` 폴더를 자동으로 Python Interpreter 후보로 인식!
> 3. 즉, 다른 이름도 가능하지만 표준화된 `.venv`를 사용함으로써 협업 시 혼동 최소화

### 3.2.2 적용

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---
>[!example] 참고사이트


