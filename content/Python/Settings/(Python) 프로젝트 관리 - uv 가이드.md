---
title: (Python) 프로젝트 관리 - uv 가이드
created: 2026-03-14
modified: 2026-03-14 12:57
cssclasses:
  - max
tags:
  - python/project/uv
  - python/project/pip
  - python/project/poetry
---
> [!summary] 요약
> - uv는 패키지 설치, 가상환경, 파이썬 버전, 의존성 관리를 하나로 통합한 Rust 기반의 초고속 프로젝트 관리 툴
> - 기존의 번거로운 가상환경 수동 켜기와 패키지 의존성 꼬임 문제를 `pyproject.toml`과 `uv.lock` 파일을 통해 해결
> - 자주 쓰이던 Poetry보다 작업 속도가 압도적으로 빠르며 파이썬 자체 버전 관리와 기존 pip 생태계 호환까지 지원
> - 가상환경 활성화 없이 바로 코드를 실행할 수 있으며, 협업 시 단순한 명령어 한 줄 (`uv sync`)로 모든 팀원이 동일한 가상환경 구축이 가능함

---
# 0. 들어가며

파이썬 개발을 시작할 때 코딩 자체보다 우리를 괴롭히는 것은 바로 **'환경 세팅'** 이다. `pip`, `venv`, `pyenv`, `Poetry`, `Conda` 등 수많은 도구들이 혼재된 파이썬 생태계에서, 최근 압도적인 퍼포먼스와 편의성으로 표준을 재정의하고 있는 도구가 있는데 바로 **Astral에서 만든 `uv`** 다.

이 글은 기존의 수동 파이썬 환경 관리 방식의 한계를 짚어보고, 왜 `uv`를 선택해야 하는지, 그리고 실제 프로젝트에 어떻게 적용하는지 기초부터 실무 팁까지 총정리한다.

---

# 1. uv 란?

> **_`uv`는 패키지 설치, 가상환경 관리 등을 하나의 도구로 통합하는 도구로 Rust언어로 작성_**

## 1.1 주요 특징

- `uv`는 파이썬 패키지 설치(`pip`), 가상환경 관리(`venv`), 파이썬 버전 관리(`pyenv`), 프로젝트 의존성 관리(`Poetry`)를 **단 하나의 도구로 통합**한 차세대 프로젝트 관리 툴
- 가장 큰 특징은 내부가 C나 파이썬이 아닌 **Rust 언어**로 작성
- 이로 인해 패키지 설치 및 의존성 계산 속도가 기존 도구 대비 수십 배에서 최대 100배 이상 빠르며, 무거운 CI/CD 파이프라인의 시간을 획기적으로 단축

## 1.2 기존 수동 관리의 한계점

과거의 표준이었던 `pip`와 `requirements.txt` 기반의 관리는 다음과 같은 뚜렷한 한계가 존재

#### 번거로운 작업 흐름

- `python -m venv .venv`로 폴더를 만들고, `source`나 `activate` 스크립트로 매번 가상환경을 켜야만 작업이 가능

#### 의존성 꼬임

-  `requirements.txt`에는 내가 직접 설치한 '핵심 패키지'와 그 패키지가 작동하기 위해 몰래 따라온 '하위 패키지'가 뒤섞여 저장되서 특정 패키지를 지워도 일부가 남아서 셋팅 환경이 오염되기 쉬움

> [!hint] 💡 uv의 해결책
> - `pyproject.toml`를 통해 핵심 패키지만 명확히 관리
> - 복잡한 하위 패키지 버전은 `uv.lock`파일 내 보이지 않는 곳에서 통제
> - `uv run` 명령어를 통해 자동으로 가상환경 위에서 코드 실행하여 수동으로 가상환경 on/off 필요 없음

## 1.3 Poetry와 비교

> **_Poetry도 `pyproject.toml` 기반으로 최근 python 프로제트 관리 방법 중 자주 사용되는 도구_**

| 비교 항목  | uv                                          | Poetry                      |
| ------ | ------------------------------------------- | --------------------------- |
| 특징     | 빠른 속도와 통합성                                  | 안정적이고 성숙한 생태계               |
| 속도     | 압도적으로 빠름 (밀리초 단위)                           | 상대적으로 느림                    |
| 파이썬 관리 | `uv python install` 로 **파이썬 자체도 다운로드 및 관리** | `pyenv` 등 외부 버전 관리 도구 별도 필요 |
| 호환성    | 기존 `pip` 생태계 및 `requirements.txt`와 100% 호환  | 자체 명령어와 생태계 사용              |
| 추천 대상  | 쾌적한 속도, CI/CD 비용 절감, All-in-one 툴을 원하는 팀    | 보수적이고 엄격한 환경 관리가 최우선인 팀     |

> [!summary] 결론
> - 과거에는 강력한 의존성 잠금을 위해 Poetry를 많이 썼지만, 최근 `uv`가 프로젝트 관리 기능을 완벽히 흡수
> - ==따라서, 신규 프로젝트는 `uv`로 시작하는 것이 압도적으로 유리==

---

# 2. 설치 및 기초 사용법

## 2.1 설치

- 운영체제에 맞게 터미널에서 아래 명령어를 실행  (단, 설치 후 환경변수(PATH) 적용을 위해 터미널을 껐다가 다시 켜기)
#### Window

```powershell
powershell -c "irm <https://astral.sh/uv/install.ps1> | iex
```
#### macOS / Linux

```zsh
## homebrew 기반(추천)
brew install uv

## curl
curl -LsSf https://astral.sh/uv/install.sh | sh
```
## 2.2 기초 명령어

| 명령어             | 기능                                    | 비고                                 |
| --------------- | ------------------------------------- | ---------------------------------- |
| `uv init`       | 프로젝트 설계도(`pyproject.toml`) 생성         | `venv`  따로 생성할 필요 없음               |
| `uv add <패키지명>` | 패키지 설치                                |                                    |
| `uv sync`       | 설계도 참고하여 동기화                          | 가상환경(`.venv`) 자동 생성                |
| `uv venv`       | 단순히 빈 가상환경 폴더만 만들고 싶을 때 쓰는 하위 호환용 명령어 | `python -m venv`와 같은 기능으로 사실상 필요없음 |

> [!warning]  `uv pip install` VS `uv add`
> - `uv pip install`로 설치한 패키지는 설계도(`uv.lock`)에 기록되지 않음
> - 이로 인해 향후 `uv sync`(동기화) 실행 시 비공식 패키지로 간주되어 가상환경에서 삭제
> - 따라서, 프로젝트의 정식 의존성은 반드시 `uv add`를 사용

| 구분                | `uv add <package>`                                  | `uv pip install <package>` |
| ----------------- | --------------------------------------------------- | -------------------------- |
| 목적                | 프로젝트에 계속 사용할 핵심 패키지 설치                              | 테스트 하고 지울 일회성 패키지 설치       |
| 동작 방식             | 가상환경(`.venv`)에 설치함과 동시에 설정 파일(`pyproject.toml`)에 등록 | 가상환경(`.venv`)에만 설치         |
| 기록                | `pyproject.toml`, `uv.lock` 에 정식 기록                 | 파일에 전혀 기록되지 않음             |
| 🚨 `uv sync` 실행 시 | 설계도 있으므로 안전하게 유지                                    | 설계도에 기록되지 않아서 삭제           |

---

## 2.3 기초 실행 흐름

> **_신규 프로젝트 생성시 기초 실행 흐름_**

```bash
# 1. 파이썬 버전을 지정하여 프로젝트 뼈대 생성 (pyproject.toml 생성)
uv init --python 3.12 my_project
cd my_project

# 2. 패키지 정식 추가 (이때 .venv 폴더와 uv.lock 파일이 자동 생성됨)
uv add fastapi

# 3. 가상환경 활성화 없이 바로 코드 실행!
uv run python hello.py
```

---

# 3. 상황별 실행 방법

> **_기존 `pip` 습관 때문에 `uv`를 처음 쓸 때 가장 많이 헷갈리는 상황들을 정리_**

## 3.1 Case 1: 파이썬 버전 뒤늦게 설정 및 변경

#### 상황 및 대처

-  이미 `uv init` 을 한 상황이지만 python 버전을 설정하고 싶은 상황
- `pyproject.toml`을 직접 수정해도 되지만, 가장 깔끔한 방법은 아래 명령어

```bash
uv python pin 3.12
```
#### 기능

- `.python-version` 파일이 생성/수정되며 프로젝트 버전이 고정
- 이후 `uv sync`를 치면 해당 버전에 맞춰 환경이 재구성
- 내 컴퓨터에 해당 파이썬 버전이 없다면 `uv`가 알아서 다운로드

## 3.2  Case 2: (취소방법) 실수로 엉뚱한 폴더(상위 폴더 등)에 init

#### 상황 및 대처

- `uv init`은 단순히 초기 파일 몇 개를 생성하는 행위로 **생성된 파일만 지워주면 원상복구**
- 탐색기에서 지우거나 터미널에서 아래 명령어 실행
```bash
# Windows (PowerShell)
rm pyproject.toml, .python-version, hello.py

# 패키지까지 설치했었다면 가상환경과 lock 파일도 삭제
rm -r .venv, uv.lock
```

## 3.3 Case 3: 기존 패키지 목록 uv로 옮기기

#### 상황 및 대처

- 기존 환경을 깨끗하게 밀고 마이그레이션
- 기존 수동으로 관리하던 패키지 목록(`requirements.txt`)를 `uv`로 옮기기

```bash
uv venv --clear       # 기존 .venv 내부 찌꺼기 싹 비우기
uv init --python <version> # 모던 프로젝트로 초기화
uv add -r requirements.txt  # 기존 목록을 바탕으로 설치 및 lock 파일 생성
rm requirements.txt # 기존 패키지 목록 제거
```

## 3.4 Case 4: (협업) Git Pull 이후 로컬 환경 동기화

#### 상황 및 대처

> **_Git에 반드시 올려야 하는 파일: `pyproject.toml`, `uv.lock`, `.python-version`_**

- gitlab(또는 github)에서 `pull` 받거나 `clone` 해왔다면, 다음 명령어 **단 한 줄**이면 세팅 끝
- ==`uv`가 `uv.lock` 파일을 분석하여 기존 작업자와 100% 동일한 가상환경(`.venv`)을 1초 만에 구성==

```bash
uv sync
```

---

# 4. 마치며

`uv`를 통해 python 프로젝트 관리를 하나의 도구로 통합했다. 이제 VS Code 기반인 Cursor에서 `uv` 와 최적화된 에디터 설정도 하면 좋다. 해당 내용은 [[💻 Programming/Python/Settings/(Python) Cursor(VS Code) 에디터 세팅|(Python) Cursor(VS Code) 에디터 세팅]] 글에서 다룬다.

---

> [!example] Reference
> - [PIP를 대체하는 uv 가이드](https://devocean.sk.com/blog/techBoardDetail.do?ID=167420&boardType=techBlog)
> - [github - astral-sh/uv](https://github.com/astral-sh/uv)
> - [[💻 Programming/Python/Settings/(Python) Cursor(VS Code) 에디터 세팅|Cursor(VS Code) 에디터 세팅]]
