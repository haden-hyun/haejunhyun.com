---
title: (Python) Cursor(VS Code) 에디터 세팅
created: 2026-03-15
modified: 2026-03-15 15:14
cssclasses:
  - max
tags:
  - python/vscode/setting
---
> [!summary] 요약
> - 파이썬 패키지 관리자 `uv` 도입에 맞춰, **Cursor(VS Code) 에디터를 가장 가볍고 스마트하게 최적화하는 통합 `settings.json` 세팅 가이드**
> - 에디터 UI 정리 및 Git 작업 자동화는 물론, `.venv` 완벽 인식, Code Runner 튜닝, 그리고 마우스 드래그 없이 함수를 한 번에 실행하는 매크로(Shift+Enter) 기능까지 적용

---

# 0. 들어가며

과거 수동 방식(`python -m venv .venv`) 에서는 가상환경을 강제로 활성화하기 위해 에디터 설정에 복잡한 경로와 억지 스크립트를 넣어야 했다. 

하지만 `uv`를 도입하면서 `uv`의 자동화에 맞춰 **불필요한 설정은 걷어내고, 편의 기능(Git, Code Runner, 매크로)은 극대화**한 최적의 `settings.json`을 공유한다.

---
# 1. 기능별 설정

## 1.1 기본 UI 및 탐색기 최적화 (방해 요소 제거)

> **에디터를 가볍고 직관적으로 쓰기 위한 화면 설정**

- `"workbench.editor.enablePreview": false`
	- 탐색기에서 파일을 클릭했을 때, '미리보기' 모드로 열리지 않고 항상 고정된 탭으로 열리게 한단
	- 클릭할 때마다 탭이 덮어씌워지는 짜증 나는 현상 방지        
- `"editor.minimap.enabled": false`
	- 에디터 우측에 표시되는 코드 축소판(미니맵)을 off로 화면을 더 넓게 쓸 수 있다
- `"window.restoreWindows": "none"`
	- Cursor를 새로 켤 때, 이전에 열어두었던 프로젝트와 창들을 억지로 복구하지 않고 기본 화면 나타나게 한다
- `"files.exclude"` & `"files.watcherExclude"`
	- `uv`가 만든 `.venv` 폴더나 `__pycache__` 같은 시스템 폴더를 탐색기 화면에서 숨김
	- 깔끔해지고, 에디터가 수만 개의 가상환경 내부 파일 변화를 감시하는데 사용하는 자원 및 배터리 낭비 방지

## 1.2 Git 설정

> **_Git을 사용할 때 마우스 클릭이나 타이핑 최소화_**

- `"git.autofetch": true`
	- 팀원이 원격 저장소에 코드를 올렸는지 백그라운드에서 주기적으로 확인(Fetch)
    - 소스 제어 탭에 "↓ 2" 처럼 내려받을 코드가 있다는 알림이 자동으로 나타남
- `"git.enableSmartCommit": true`
	- `git add`(스테이징)를 깜빡하고 바로 커밋 버튼을 눌러도, 에디터가 변경된 파일 전부를 알아서 스테이징 한 뒤 커밋함        
- `"git.confirmSync": false`
	- 'Sync Changes(변경 사항 동기화)' 버튼을 누를 때마다 나타나는 경고 팝업(push & pull 확인) 무시

## 1.3 파이썬 & 가상환경 자동화

> **_`uv`는 프로젝트 루트에 표준적인 `.venv`를 생성하므로 자동으로 가상환경(`venv`) 인식해서 activate 하도록 설정_**

- `"python.terminal.activateEnvironment": true`
	- Cursor가 프로젝트 내의 `.venv`를 알아서 감지하고 자동으로 활성화(Activate)
- `"python.createEnvironment.trigger": "off"`
	- 가상환경 없는 상황에서 에디터가 "새 가상환경을 만들까요?"라고 묻는 알림 팝업을 영구적으로 차단(환경 관리는 오직 `uv`가 전담)

## 1.4 Code Runner 설정 (실행 버튼 최적화)

> **_우측 상단의 재생(▶) 버튼을 눌러 코드를 실행하게 해주는 확장 프로그램 세팅_**

- `"python": "$pythonPath -u"`
	- 기본 파이썬이 아니라 **현재 uv로 활성화된 가상환경(`.venv`)의 파이썬**을 정확히 물고 실행하도록 강제
	- `-u`는 프린트 출력물이 버벅거리지 않고 즉각 뜨게 해준다.
- `"code-runner.runInTerminal": true`
	- 코드 실행 결과를 '출력(Output)' 탭이 아니라 **'터미널(Terminal)' 탭**에서 보여줌
	-  터미널에서 실행해야 `input()` 같은 사용자 입력 함수가 먹통이 되지 않고 정상 작동
- `"code-runner.ignoreSelection": true`
	- 실수로 코드 일부를 드래그한 상태에서 재생 버튼을 누르면 그 부분만 실행되어 에러가 나곤 하는데, 드래그를 무시하고 무조건 **파일 전체를 실행**하도록 막아주는 안전장치

## 1.5 매크로: Shift + Enter 커스텀 (Jupyter 스타일 런)

> **_Jupyter Notebook처럼 특정 코드 블록만 편하게 실행하기 위한 단축키 연동_**

- `"macros": { "runBlock": [ ... ] }`
	- `.py` 파일에서 특정 덩어리(함수, 반복문) 안에 커서를 두고 `Shift + Enter`를 누르면, 에디터가 알아서 그 덩어리만 드래그하고, 터미널 REPL로 던져서 실행한 뒤 다음 줄로 커서를 내려준다.
	- `editor.action.smartSelect.expand`: 에디터가 문맥을 파악해 함수/클래스 전체를 자동 드래그
	- `python.execSelectionInTerminal` : 드래그된 덩어리를 파이썬 REPL(터미널)로 던져서 실행
	- `cancelSelection`: 보기 싫은 드래그 영역을 다시 해제함
	- `cursorDown`: 다음 줄로 커서를 부드럽게 넘겨줌

---
# 2. 필수 확장 프로그램 (Extensions)

> **_위 설정 작동을 위해 VS Code 확장 프로그램들 설치가 필요_**

| Extensions       | 제작자       | 설명                                              |
| ---------------- | --------- | ----------------------------------------------- |
| `Python`         | Microsoft | `.venv` 자동 인식 및 Python 코드 실행, 자동 완성(Pylance) 지원 |
| `Macros`         | ctf0      | `"macros.list"`를 읽어들여 매크로 실행 가능하게 만듦            |
| `Code Runner`    | Jun Han   | 에디터 우측 상단의 재생 버튼(▶) 활성화                         |
| `Github Theme`   | Github    | 테마 제공                                           |
| `Indent-Rainbow` | oderwat   | 들여쓰기 공간 색상 칠해 가독성 극대화                           |

---

# 3. 단축키 연결 (`keybindings.json`)

> **_위에서 설정한 `shift+enter` 적용 시 기본 설정이 아닌 매크로 설정한 기능이 수행되도록 단축키 설정_**

1. `Ctrl + Shift + P` (Mac은 `Cmd + Shift + P`)를 눌러 명령어 팔레트 열기
2. `Preferences: Open Keyboard Shortcuts (JSON)` 클릭
3. `keybindings.json` 파일의 대괄호 `[ ]` 안에 아래 코드 복사-붙여넣기
```json
[
	{
		"key": "shift+enter",
		"command": "python.execSelectionInTerminal",
		"when": "editorTextFocus && editorLangId == 'python'"
	}
]
```
---
# 4. 통합 설정

> **_`Ctrl + Shift + P` -> `Preferences: Open User Settings (JSON)`_**

```json
{
    // [기본 UI/UX 창 설정]
    "workbench.editor.enablePreview": false,
    "editor.minimap.enabled": false,
    "window.restoreWindows": "none",
    "workbench.startupEditor": "welcomePage",

    // [성능 및 뷰 최적화]
    "files.exclude": {
        "**/__pycache__": true,
        "**/.venv": true,       // 에디터 탐색기에서 uv 가상환경 폴더 숨김
        "**/.vscode": true
    },
    "files.watcherExclude": {
        "**/.venv": true       // 가상환경 내부 파일 감시 중단 (배터리 및 성능 향상)
    },

    // [Git 스마트 설정]
    "git.autofetch": true,         // 원격 변경사항 자동 감지
    "git.enableSmartCommit": true, // add 생략 시 알아서 전체 스테이징 후 커밋
    "git.confirmSync": false,      // 동기화 시 귀찮은 팝업 창 제거

    // [파이썬/uv 가상환경 자동화 설정]
    "python.terminal.activateEnvironment": true,
    "terminal.integrated.enablePersistentSessions": false,
    "python.createEnvironment.trigger": "off", // 에디터의 불필요한 환경 생성 알림 차단

    // [Code Runner (우측 상단 재생버튼) 설정]
    "code-runner.executorMap": {
        "python": "$pythonPath -u" // 시스템 파이썬이 아닌 .venv의 파이썬으로 실행 강제
    },
    "code-runner.runInTerminal": true,   // 출력창 대신 터미널에서 실행 (input() 오류 방지)
    "code-runner.ignoreSelection": true, // 실수로 코드 드래그 시 부분 실행되는 현상 방지

    // [매크로: Shift+Enter 커스텀]
    "macros.list": {
        "runBlock": [
            "editor.action.smartSelect.expand", // 1. 에디터가 문맥을 파악해 함수/클래스 전체를 자동 드래그함!
            "python.execSelectionInTerminal",   // 2. 그 드래그된 덩어리를 파이썬 REPL(터미널)로 던져서 실행
            "cancelSelection",                  // 3. (추가) 보기 싫은 드래그 영역을 다시 해제함
            "cursorDown"                        // 4. 다음 줄로 커서를 부드럽게 넘겨줌
        ]
    },

    // [들여쓰기 기본 원칙 (파이썬 PEP 8 강제)]
    "editor.tabSize": 4,
    "editor.insertSpaces": true,       // 탭(Tab) 키를 누르면 스페이스 4칸으로 자동 변환
    "editor.detectIndentation": false, // 파일 열 때 기존 들여쓰기 무시하고 무조건 4칸 강제 (혼용 방지)

    // [시각적 가이드 (가독성 극대화)]
    "editor.guides.indentation": true,              // 들여쓰기 세로선 표시
    "editor.guides.bracketPairs": true,             // 괄호 짝끼리 세로선으로 연결 (딕셔너리, 리스트 볼 때 필수)
    "editor.bracketPairColorization.enabled": true, // 괄호 쌍마다 색상을 다르게 표시 (알록달록)
    "editor.renderWhitespace": "selection",         // 평소엔 숨기고, 드래그했을 때만 스페이스바를 점(.)으로 표시

    // [코드 정리 (저장 시 자동화)]
    "files.trimTrailingWhitespace": true, // 파일 저장 시 줄 끝에 묻어있는 쓸데없는 공백(스페이스바) 자동 삭제
    "files.trimFinalNewlines": true,      // 파일 맨 끝에 의미 없이 추가된 빈 줄 자동 정리

    // [🔥 Indent-Rainbow 확장 프로그램 설정]
    // (선택 사항: 확장 탭에서 'Indent-Rainbow' 설치 후 적용)
    "indentRainbow.indicatorStyle": "classic",
    "indentRainbow.errorColor": "rgba(128,32,32,0.6)", // 잘못된 들여쓰기(스페이스 3칸 등) 시 붉은색 경고
    "indentRainbow.colors": [
        "rgba(255,255,64,0.02)",
        "rgba(127,255,127,0.02)",
        "rgba(255,127,255,0.02)",
        "rgba(79,236,236,0.02)"
    ],

    // [에디터 폰트: JetBrains Mono(영문) + D2Coding(한글) 조합]
    "editor.fontFamily": "'JetBrains Mono', 'D2Coding', Consolas, monospace",

    // [터미널 폰트 에러 완벽 차단용]
    "terminal.integrated.fontFamily": "'JetBrains Mono', 'D2Coding', Consolas, monospace",

    // [기호 합자 기능 켜기 (>= 가 예쁘게 합쳐짐)]
    "editor.fontLigatures": true,
    "workbench.colorTheme": "GitHub Dark",
}
```

---
>[!example] 참고사이트
>- 