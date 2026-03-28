---
title: (Python) argparse 가이드
created: 2026-03-21
modified: 2026-03-21 16:17
cssclasses:
  - max
tags:
  - python/argparse
---
> [!summary] Summary
> - `argparse`는 Python 표준 라이브러리로 터미널 명령어를 통해 스크립트 내부의 변수 값을 직접 수정하지 않고도 유연하게 제어할 수 있게 해주는 CLI 도구이다.
> - **파서 생성 → 인자 추가 → 분석** 이라는 3단계의 명확한 흐름을 통해 직관적으로 프로그램을 구성한다.
> - 필수 입력값인 '위치 인자'와 부가적인 설정용인 '선택 인자'로 구분하여 다양한 실행 환경을 설계할 수 있다.
> - `add_argument` 메서드 내 다양한 옵션들(`type`, `default`, `choices`, `action` 등)을 활용해 데이터 형변환, 기본값 설정, 유효성 검사 자동화, 플래그 설정 등을 손쉽게 구현할 수 있다.

---

# 0. 들어가며

매번 Python 스크립트 내에서 변수를 직접 수정하는 것은 귀찮은 작업이다. 

Python 표준 라이브러리인 `argparse` 를 사용하여, 터미널을 통해 Python 파일 실행할 때 터미널에서 옵션을 입력해서 Python 코드 내 변수 값들을 제어해보자. 

여기서는 `argparse`를 이용하여 쉽게 사용할 수 있는 **CLI(Command Line Interface)** 도구를 만드는 방법을 정리하였다.

---

# 1. 개요

#### argparse 란?

> **_`argparse`는 프로그램 실행 시 커맨드 라인에서 인자(Argument)를 받아, 이를 파이썬 내부 변수로 쉽게 변환해 주는 라이브러리_**

예를 들어, 단순히 `python main.py`로 실행하는 것이 아니라, 아래처럼 실행하고 싶을 때 사용한다.

아래 명령어에서 `extract`, `10`, `verbose` 같은 값들을 파이썬이 알아먹도록 도와주는 것이 바로 `argparse`이다.

```bash
python main.py extract --sample 10 --verbose
```

---
# 2. 기본 사용법

## 2.1 흐름

> **_`argparse`의 사용 흐름은 정형화되어 있으며, 3단계만 기억하면 된다._**

1. **Parser 생성(`ArgumentParser`)**: 담을 그릇(객체)을 생성
2. **인자 추가 (`add_argument`)**: 어떤 입력을 받을지 규칙을 정하기    
3. **분석 (`parse_args`)**: 들어온 입력을 실제로 해석하여 변수에 담습니다.
    
```python
import argparse 

# 1. Parser 생성
parser = argparse.ArgumentParser(description="이 프로그램은 예제입니다.")

# 2. 인자 추가
parser.add_argument("name", help="사용자 이름") 
parser.add_argument("--age", help="나이")

# 3. 분석
args = parser.parse_args()

print(f"이름: {args.name}, 나이: {args.age}")
```
## 2.2 위치 인자 vs 선택 인자

> **_`add_argument`를 사용할 때 가장 헷갈리는 부분으로 인자 이름 앞에 붙는 하이픈(`-`)의 유무가 결정적인 차이_**

| 구분  | 위치 인자(Positional Arguments)                | 선택 인자(Optional Arguments)                      |
| --- | ------------------------------------------ | ---------------------------------------------- |
| 특징  | 이름 앞에 하이픈 (`-`) 없다 (예: `filename`, `mode`) | 이름 앞에 하이픈(`-`, `--`) 이 붙는다 (예: `-f`, `--file`) |
| 규칙  | **필수 입력**이며, **작성 순서**가 중요                 | 입력하지 않아도 에러 발생하지 않고, 순서도 상관없다                  |
| 용도  | 프로그램 실행 시, 없어서는 안 될 핵심 데이터                 | 옵션 설정, 모드 변경 등 부가적인 기능                         |

## 2.3 핵심 옵션들

> **_`add_argument()` 메서드 내 기능 설명_**

| 옵션         | 기능       | 설명                                             |
| ---------- | -------- | ---------------------------------------------- |
| `type`     | 타입 지정    | 입력값은 _기본적으로 문자열(str)_ 로 ==다른 타입으로 변환==하는 경우 사용 |
| `defalut`  | 기본값 설정   | 옵션 미입력시 ==기본으로 사용할 값== 지정                      |
| `choices`  | 선택지 제한   | 정해진 값 외 입력이 들어오면 에러 일으킴 (==유효성 검사 자동화==)       |
| `action`   | 플래그 설정   | 값이 아닌 ==옵션 존재 여부== 검사                          |
| `required` | 필수 옵션 설정 | 선택 인자지만, ==반드시 입력을 강제==                        |
| `nargs`    | 리스트로 받기  | 입력값을 ==리스트로 받기==                               |

```python
# 1. 타입 지정: count 변수를 int형으로 지정
parser.add_argument("--count", type = int)

# 2. 기본값 설정: mode 변수 기본값을 'normal'로 설정
parser.add_argument("--mode", defalut = "normal")

# 3. 선택지 제한: color 변수는 red, blue, green 값만 받음
parser.add_argument("color", choices = ['red', 'blue','green'])

# 4. 플래그 설정: --verbose를 입력하면 True, 그렇지 않으면 False
parser.add_argument('--verbose', action = 'store_true')

# 5. 필수 옵션: api-key 변수는 필수 입력값으로 설정
parser.add_argument('--api-key', required = True)

# 6. 리스트 받기: files 변수는 list 값을 받기 (예시, ['a.txt', 'b.txt', 'c.txt'])
parser.add_argument('--files', nargs = '*')
```

---

# 3. 활용

#### 코드

아래 코드는 `mode`라는 위치 인자(필수 입력)와 `--sample`이라는 선택 인자(선택 입력) 옵션을 조합하여 사용한다.

```python
import argparse
import sys

def main():
    # 1. 파서 생성 (description으로 도움말 제공)
    parser = argparse.ArgumentParser(description="아파트 도면 데이터 처리 파이프라인")

    # [위치 인자] 실행 모드 (choices로 오타 방지)
    parser.add_argument(
        "mode", 
        choices=["extract", "convert", "validate", "all"], 
        help="실행 모드 (extract: 추출, convert: 변환, validate: 검증, all: 전체)"
    )

    # [선택 인자] 테스트용 샘플 개수 (int 형변환)
    # 팁: 단축 옵션 '-s'와 전체 옵션 '--sample'을 같이 지정하면 편리함
    parser.add_argument(
        "-s", "--sample", 
        type=int, 
        default=None,
        help="테스트를 위해 처리할 샘플 이미지 개수 (기본값: 전체)"
    )
    
    # [선택 인자] 상세 로그 출력 (플래그)
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="상세 로그 출력 활성화"
    )

    # 인자 분석
    args = parser.parse_args()

    # --- 실제 로직 ---
    print(f"🚀 실행 모드: {args.mode}")
    
    if args.verbose:
        print("📢 상세 로그 모드가 켜졌습니다.")

    if args.sample:
        print(f"🧪 [TEST] 샘플 {args.sample}개만 처리합니다.")
    else:
        print("✅ 전체 데이터를 처리합니다.")

    # 모드별 분기 처리
    if args.mode in ["extract", "all"]:
        print("... 데이터 추출 중 ...")
        # run_extraction(limit=args.sample) 호출
    
    if args.mode in ["convert", "all"]:
        print("... 데이터 변환 중 ...")

if __name__ == "__main__":
    main()
```

#### 실행 결과 예시

> **_각 상황별 결과 예시_**

```bash
# 1. 도움말 확인
>>> python main.py -h
### help 메시지와 usage가 출력

# 2. 정상 실행: 모드(extract), 샘플 개수(5), 상세 로그 출력
>>> python main.py extract -s 5 --verbose
# [output]
🚀 실행 모드: extract
📢 상세 로그 모드가 켜졌습니다.
🧪 [TEST] 샘플 5개만 처리합니다.
... 데이터 추출 중 ...

# 3. 에러: 위치 인자값 중 유효한 값이 아닌 경우
>>> python main.py delete 
# [output]
usage: main.py [-h] [-s SAMPLE] [-v] {extract,convert,validate,all}
main.py: error: argument mode: invalid choice: 'delete' ...
```

---
### 마치며

`argparse`를 사용하면 코드 수정 없이 터미널 명령어만으로 프로그램의 동작을 유연하게 바꿀 수 있다. **`choices`를 활용한 유효성 검사**와 **`--help` 자동 생성 기능**은 개발자의 수고를 덜어준다.

---
>[!example] Reference
>- [python ArgumentParser 사용법](https://engineer-mole.tistory.com/213#google_vignette)