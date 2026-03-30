---
title: (Python) Vscode 기반 사용자 세팅
created: 2026-01-22
modified: 2026-01-22 23:28
cssclasses:
  - max
tags:
  - python/vscode
  - python/setting
---
> [!summary] 요약
> - VS Code(또는 Cursor AI)에서 Python 프로젝트를 진행할 때 반복되는 번거로움을 줄이기 위한 `settings.json` 환경 설정 가이드를 제공함.
> - 운영체제(Windows/Mac)에 맞춰 가상환경(`.venv`)이 존재할 경우 프로젝트 열람과 동시에 터미널에서 자동으로 접속되도록 설정하여 개발 준비 시간을 단축함.
> - 코드 실행 시 `IPython`이 있다면 우선 구동하고 들여쓰기 오류를 방지하는 옵션을 주입하며, `__pycache__` 등 불필요한 파일을 탐색기에서 숨기고 감시 대상에서 제외해 시스템 리소스를 최적화함.
> - 또한 Git 커밋 및 푸시 과정을 간소화하고 시작 화면을 깔끔하게 초기화하는 등 전반적인 개발 워크플로우의 효율성을 높이는 구체적인 JSON 코드를 포함하고 있음.

---

# 0. 들어가며

저자는 Python 개발 툴로 Vscode 기반인 Cursor AI를 사용하고 있는 중이다. (과거 Pycharm에서 사용하다가 넘어왔다.) 

이때, 프로그램을 사용하면서 프로젝트마다 가상환경(`.venv`)을 켜고, 지저분한 파일들을 숨기느라 귀찮아서 방법을 찾고 있었다.

그래서, 다음과 같은 목적으로 환경 세팅 설정 방법을 소개한다. Window 및 Mac 환경 모두 고려하였다.

환경 세팅은 `Preferences: Open User Settubgs (JSON)`의 `settings.json` 을 수정한다.

1. 프로젝트를 열자마자 가상환경 자동 접속 (단, 가상환경이 존재 해야함)
2. 깔끔한 파일 탐색기 및 성능 최적화
3. Git 기능 강화
4. 시작화면 초기화

---
# 1. 가상환경 자동 접속 및 터미널 초기화

> **_목적: 가상환경(`.venv`) 존재 시 자동으로 접속하고, 과거 터미널 세션을 기억하지 못하게 하여 매번 새로운 환경을 로드_**

> [!warning] 주의사항
> - 자동 실행하는 가상환경 이름은 `.venv`로 지정.
> - 프로젝트 내 `IPython` 설치를 추천.
#### 주요기능

- **`python.defaultInterpreterPath`**:  Python 인터프리터의 기본 탐색 경로
	- Mac: `.venv/bin/python`
	- Win: `.venv/Scripts/python.exe`
	- _(역할: 프로젝트를 열 때, 이 경로에 가상환경이 있다면 VS Code가 이를 자동으로 잡음.)_
- **`python.terminal.activateEnvironment`** : 가상환경 자동 접속 기능 (Python 확장 프로그램 담당)
	- `true` : 터미널이 열린 **직후**, VS Code가 자동으로 `source activate` 명령어를 입력해 가상환경 접속
	- _(Mac에서는 해당 설정만으로도 가상환경 접속이 원활)_
- **`terminal.integrated.profiles.windows`**: Windows 전용 터미널 프로필 (사용자 커스텀)
	- PowerShell 실행 시 **강제로** `.venv` 유무를 체크하고 접속하는 스크립트를 심음.
	- _(이유: Windows에서는 `activateEnvironment` 기능이 종종 씹히거나 느리게 반응하여, 터미널 차원에서 강제하는 것이 더 안정적이기 때문.)_
- **`python.terminal.launchArgs`** : 코드 실행(Run) 시 작동 방식 설정
	- `Shift + Enter` 등을 눌러 코드를 터미널로 보낼 때의 옵션.
	- **핵심 기능 1:** `ipython` 유무를 체크하여, 있으면 IPython 실행, 없으면 일반 Python 실행.
	- **핵심 기능 2:** `--no-autoindent` 옵션을 주입하여 **들여쓰기 오류(`IndentationError`) 방지**. 
-  **`terminal.integrated.defaultProfile.osx`**: Mac 기본 터미널 쉘 지정
	- Mac은 `zsh`
	- Window 는 `powershell`
- **`python.createEnvironment.trigger`** : 가상환경 생성 제안 알림
	- `"off"` : 가상환경 생성 알람 팝업 띄우지 않음

> [!tip] OS 별 특징
> - **Mac**에서는 `terminal.integrated.defaultProfile.osx`는 건드리지 않아도(기본값 `zsh`) 되며, `python.terminal.activateEnvironment: true` 덕분에 가상환경 접속이 잘 됨
> - **Windows**에서는 `activateEnvironment`만 믿기 불안정하여, `terminal.integrated.profiles.windows`에 스크립트를 심어 **가상환경 접속을 "이중 안전장치"로 강제**

#### Mac / Linux

```json
{
    // [기본] 가상환경 파이썬 경로 지정 (Unix 스타일)
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",

    // [핵심] Shift+Enter 실행 시 옵션 주입
    // 1. sys.argv로 '--no-autoindent' 설정 (들여쓰기 오류 IndentationError 방지)
    // 2. IPython 설치 확인 후 실행, 없으면 일반 Python 실행
    "python.terminal.launchArgs": [
        "-c",
        "import sys; sys.argv=['', '--no-autoindent']; exec('try: import IPython; IPython.start_ipython()\\nexcept: import code; code.interact()')"
    ],
    // [편의] 터미널 열릴 때 가상환경 자동 접속 (source .venv/bin/activate 자동 입력)
    "python.terminal.activateEnvironment": true,

    // [알림] 프로젝트 열 때 "가상환경 만드시겠습니까?" 팝업 끄기
    "python.createEnvironment.trigger": "off",

    // [터미널] Mac 기본 쉘은 zsh 사용
    "terminal.integrated.defaultProfile.osx": "zsh",
    
    // [터미널] 터미널 재시작 시 이전 세션(기록) 유지 안 함 (깔끔한 재시작)
    "terminal.integrated.enablePersistentSessions": false
}
```

#### Window

```json
{
    // [기본] 가상환경 파이썬 경로 지정 (Windows 스타일)
    "python.defaultInterpreterPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe",

    // [터미널 프로필] PowerShell 실행 시 .venv 폴더가 있으면 강제로 접속(Activate)
    "terminal.integrated.profiles.windows": {
        "PowerShell Auto-Venv": {
            "source": "PowerShell",
            "args": [
                "-NoExit",
                "-Command",
                "if (Test-Path .venv) { . .venv\\Scripts\\Activate.ps1 }"
            ]
        }
    },

    // [터미널] 위에서 만든 'PowerShell Auto-Venv'를 기본 터미널로 지정
    "terminal.integrated.defaultProfile.windows": "PowerShell Auto-Venv",

    // [핵심] Mac과 동일한 실행 로직 추가 (IPython 자동 실행 + 들여쓰기 방지)
    "python.terminal.launchArgs": [
        "-c",
        "import sys; sys.argv=['', '--no-autoindent']; exec('try: import IPython; IPython.start_ipython()\\nexcept: import code; code.interact()')"
    ],

    // [편의] VS Code의 자동 접속 기능도 켜둠 (이중 안전장치)
    "python.terminal.activateEnvironment": true,

    // [알림] 가상환경 생성 팝업 끄기
    "python.createEnvironment.trigger": "off",

    // [터미널] 터미널 재시작 시 이전 세션 유지 안 함
    "terminal.integrated.enablePersistentSessions": false
}
```

---
# 2. 파일 탐색기 정리 및 성능 최적화

> _**목적: `__pycache__`나 `.venv` 같은 불필요 폴더들을 감시하면 CPU 자원이 낭비되므로 탐색기에 안 보이도록 숨기고 파일 변경 대상에서 제거**_

#### 주요 기능

- **`files.exclude`** : 파일 탐색기(사이드바)에 해당 폴더 숨기기
- **`files.watcherExclude`**: 파일 변경을 감시하는 대상에서 제외
	- 수만 개 파일을 감시하지 않게 하여 CPU 자원 낭비 방지

```json
{
	"files.exclude": {
	    "**/__pycache__": true, // 파이썬 캐시 파일 숨김
	    "**/.venv": true,       // 가상환경 폴더 숨김
	    "**/.vscode": true      // 설정 폴더 숨김
	},
	"files.watcherExclude": {
	    "**/.hg/store/**": false,
	    "**/.venv": true,       // 가상환경 내부 파일 감시 중단 (성능 향상)
	    "**/.vscode": true
	},
}
```

---
# 3. Git 워크플로우 효율화

> **_목적: commit 할 떄 마다 스테이징(`+`) 버튼과, push 할 때 마다 확인 창 누르는 과정 생략_**

#### 주요 기능

- **`git.enableSmartCommit`** : commit 시 스테이징 생략 여부
	- `true` : 변경된 파일이 있을 때 스테이징을 안 했더라도, 커밋 버튼을 누르면 ==알아서 모두 스테이징(Stage All) 후 커밋==
- **`git.confirmSync`** : push / pull 팝업 창 여부
	- `false`: 팝업 띄우지 않고 ==즉시 실행==

```json
{
	"git.enableSmartCommit": true,
	"git.confirmSync": false,
}
```

---

# 4. 시작 화면 초기화

> **_목적: 프로그램 실행할 때 마다 직전 프로젝트 및 파일들 말고 신규 화면 나오도록 설정_**

#### 주요 기능

- **`window.restoreWindows`** : Cursor 실행 시 과거 창 또는 프로젝트 복구 여부
	- `"none"`:  이전에 열었던 창이나 프로젝트를 ==복구하지 않음==
- **`workbench.startupEditor`** : 시작 화면 페이지 설정
	- `"welcomePage"`: 빈 화면 대신 깔끔한 =='Get Started' 페이지를 띄움==

```json
{
	"window.restoreWindows": "none",
	"workbench.startupEditor": "welcomePage",
}
```

---
# 5. 종합 설정

자신의 OS에 맞는 `settings.json`에 붙여넣으세요. 

> **_`Ctrl/Cmd` + `,` ->  우측 상단 'Open Settings (JSON)' 아이콘 클릭_**

#### Mac / Linux

> **터미널 프로필 설정 없이 기본 경로 설정만으로도 충분**

```json
{
	// [터미널 & 파이썬]
	"python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
    "python.terminal.launchArgs": [
        "-c",
        "import sys; sys.argv=['', '--no-autoindent']; exec('try: import IPython; IPython.start_ipython()\\nexcept: import code; code.interact()')"
    ],
    "python.terminal.activateEnvironment": true,
    "python.createEnvironment.trigger": "off",
    "terminal.integrated.defaultProfile.osx": "zsh",    
    "terminal.integrated.enablePersistentSessions": false,
    // [성능 & 뷰]
    "files.exclude": {
        "**/__pycache__": true,
        "**/.venv": true,
        "**/.vscode": true
    },
    "files.watcherExclude": {
        "**/.hg/store/**": false,
        "**/.venv": true,
        "**/.vscode": true
    },

    // [Git]
    "git.enableSmartCommit": true,
    "git.confirmSync": false,

    // [시작]
    "window.restoreWindows": "none",
    "workbench.startupEditor": "welcomePage"
}
```
#### Window

```json
{
    // [터미널 & 파이썬] .venv 자동 감지 및 접속
    "python.defaultInterpreterPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe",
	"terminal.integrated.profiles.windows": {
        "PowerShell Auto-Venv": {
            "source": "PowerShell",
            "args": [
                "-NoExit",
                "-Command",
                "if (Test-Path .venv) { . .venv\\Scripts\\Activate.ps1 }"
            ]
        }
    },
	"terminal.integrated.defaultProfile.windows": "PowerShell Auto-Venv",
	"python.terminal.launchArgs": [
        "-c",
        "import sys; sys.argv=['', '--no-autoindent']; exec('try: import IPython; IPython.start_ipython()\\nexcept: import code; code.interact()')"
    ],
	"python.terminal.activateEnvironment": true,
	"python.createEnvironment.trigger": "off",
	"terminal.integrated.enablePersistentSessions": false,
	
	// [성능 & 뷰] 불필요한 파일 숨기기 및 감시 제외
    "files.exclude": {
        "**/__pycache__": true,
        "**/.venv": true,
        "**/.vscode": true
    },
    "files.watcherExclude": {
        "**/.hg/store/**": false,
        "**/.venv": true,
        "**/.vscode": true
    },

    // [Git] 빠른 커밋 & 푸시
    "git.enableSmartCommit": true,
    "git.confirmSync": false,

    // [시작] 깔끔한 시작 화면
    "window.restoreWindows": "none",
    "workbench.startupEditor": "welcomePage"
}
```

---
>[!example] 참고사이트
>- 