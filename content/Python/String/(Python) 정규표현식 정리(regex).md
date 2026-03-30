---
title: (Python) 정규표현식 정리(regex)
created: 2024-07-05
tags:
  - python/정규표현식
  - python/regex
  - python/extract
  - python/contains
  - python/re
---
>[!summary] 요약
>- `re`모듈 활용
>- `pandas` 활용: `str.extract`, `str.contains`


# 1. 정규표현식 기초
## 1.1 문자 클래스

- `[]`: 괄호 사이의 문자들을 **매치**(메타문자)
	- `[abc]`: a, b, c 중 한개의 문자와 매치를 뜻함
- 문자 클래스 내부의 문자열은 **정규표현식이 아닌 문자 그대로가 해석됨**
	- `a.b`: a + 모든 문자열 + b
	- `a[.]b`: `a.b`만 매치되며, 그 외 a + 문자열 + b은 매치되지 않음!

| 자주 사용하는 정규식               | 의미                    |
| ------------------------- | --------------------- |
| `\d` (=`[0-9]`)           | 문자가 아닌 숫자와 매치         |
| `\D` (=`[^0-9]`)          | 숫자가 아닌 문자와 매치         |
| `\s` (=`[\t\n\r\f\v]`)    | 공백(whitespace) 문자와 매치 |
| `\S` (= `[^ \t\n\r\f\v]`) | 공백이 아닌 문자와 매치         |
| `\w` (=`[a-zA-Z0-9_]`)    | 문자+숫자와 매치             |
| `\W`(=`[^a-zA-Z0-9_]`)    | 문자 및 숫자가 아닌 문자와 매치    |
| `[a-zA-Z]`                | 모든 알파벳                |
| `[가-힣]`                   | 모든 한글                 |
## 1.2 메타문자

- `*`:  **바로 앞 문자**가 <u>0회 이상 반복</u>
- `+` : 바로 앞 문자가 최소 **1번 이상 반복**(`*`과 차이점!!)
	- `ca+t`: 위에서 `ct`는 매칭되지 않음!
- `{m, n}`: 반복 횟수를 고정
	- `{m}`: **반드시 m번 반복**
	- `{m, n}`: m번 이상, n번 이하 반복
	- `{m, }`: m번 이상 반복
	- `{, m}`: m번 이하 반복 

| 표현식  | 설명                                       | 예시       | 매칭              |
| ---- | ---------------------------------------- | -------- | --------------- |
| `.`  | 줄바꿈 문자(`\n`)를 제외한 모든 문자와 매치              | `a.b`    | a + 모든문자 + b    |
| `^`  | 문자열의 **시작**을 의미함                         | `^a`     | a로 시작하는 모든 문자   |
| `$`  | 문자열의 **끝**을 의미함                          | `a$`     | a로 끝나는 모든 문자    |
| `*`  | 바로 앞 문자가 0회 이상 반복                        | `ca*t`   | ct, cat, caaaat |
| `+`  | 바로 앞 문자가 최소 1번 이상 반복 (`*`과의 차이점)         | `ca+t`   | cat, caaaat     |
| `-`  | 두 문자 사이의 범위로(From - To) 를 의미함            | `0-5`    | 012345          |
| `?`  | 바로 앞 문자가 **0번 또는 1번** 나타는 경우 (2번 이상은 안됨) | `ab?c`   | ac, abc         |
| `\|` | 둘 중 하나 일치                                | `a\|b`   | a 또는 b          |
| `()` | 표현식을 그룹으로 묶음(기존 메타문자는 바로 앞 문자에만 적용)      | `(ab)+c` | abc, ababc      |
| `\`  | 메타문자 및 특수문자 이스케이프를 위함                    | `\$a`    | $a              |

---
# 2. `re` 모듈 활용
## 2.1 기본 메서드
- 기본 모듈로 4가지 메서드를 제공

| Method       | 설명                                  |
| ------------ | ----------------------------------- |
| `match()`    | 문자열 **처음부터 정규식과 매치**되는지 조사          |
| `search()`   | 문자열 **전체 중 정규식과 매치**되는지 조사          |
| `findall()`  | 정규식과 **매치되는 모든 문자열을 리스트**로 반환       |
| `finditer()` | 정규식과 **매치되는 모든 문자열을 반복 가능한 객체**로 반환 |
### 2.1.1 예시
- 찾을 패턴(`[a-z]+`): **소문자 영어 1개 이상** 포함된 패턴
- `match` 객체의 메서드 내 옵션
	- `group()`: 매치된 문자열 반환
		- `group()` = `group(0)` : 매칟된 모든 부분 문자열을 반환
		- `group(i)`: i번째 캡처된 부분만 반환
	- `start()` : 매치된 문자열의 시작 위치 반환
	- `end()`: 매치된 문자열의 끝 위치
	- `span()`: 매치된 문자열의 `(시작, 끝)`에 해당하는 튜플 반환
```python
import re
pattern = re.compile("[a-z]+")

match1 = pattern.match('3 python')
print(match1) # None

match2 = pattern.search('3 python')
print(match2) # <re.Match object; span=(2, 8), match='python'>

match3 = pattern.findall('life is too short')
print(match3) # ['life', 'is', 'too', 'short']

match4 = pattern.finditer('life is too short')
for m in match4: print(m)
# <re.Match object; span=(0, 4), match='life'>
# <re.Match object; span=(5, 7), match='is'>
# <re.Match object; span=(8, 11), match='too'>
# <re.Match object; span=(12, 17), match='short'>
```
## 2.2 컴파일 옵션
| 옵션                        | 설명                     |
| ------------------------- | ---------------------- |
| `re.DOTALL` (=`re.S`)     | 줄바꿈 문자를 포함하여 모든 문자와 매치 |
| `re.IGNORECASE` (=`re.I`) | 대소문자 관계없이 매치           |
| `re.MULTILINE` (=`re.M`)  | 여러 줄과 매치               |
| `re.VERBOSE` (=`re.X`)    | verbose 모드 사용          |
### 2.2.1 예시
```python
import re

p = re.compile('a.b')
m = p.match('a\nb')
print(m) # None

p = re.compile('a.b', re.DOTALLL)
m = p.match('a\nb')
print(m) # a\nb

p = re.compile('[a-z]+', re.I)
p.match('python') # <re.Match object; span=(0, 6), match='python'>
p.match('Python') # <re.Match object; span=(0, 6), match='Python'>
p.match('PYTHON') # <re.Match object; span=(0, 6), match='PYTHON'>
p.findall('Py12Tho32N') # ['Py', 'Tho', 'N']

data = """python one  
life is too short  
python two  
you need python  
python three"""

p = re.compile("^python\s\w+")
print(p.findall(data)) # ['python one']
p = re.compile("^python\s\w+", re.MULTILINE)
print(p.findall(data)) # ['python one', 'python two', 'python three']
```
---
# 3. pandas 형식
> [!hint] 목적
> - `re` 라이브러리 없이 `pandas`를 통해 정규표현식을 이용하여 특정 조건 만족하는 값을 추출하거나 카운팅
## 3.1 str.extract
- 특정 조건을 **만족하는 경우만 추출**
- 예) df의 col 열의 unique 값이 '0-39g/day', '40-79', '80-119','120+' 일 때, 숫자 범위 정보만 가져오기
	- 
```python
import pandas as pd

# case1
df['new'] = df['col'].str.extract(r'(\d+-\d\d+|\d\d\d\+)')
# case2
df['new'] = df['col'].str.extract(r'(\d+-\d{2}+|\d{3}\+))
```
## 3.2 str.contains()
- 특정 조건을 만족하는 행을 추출
- 예) col 열 중 `day` 라는 문자가 포함된 행 개수 파악
```python
df.col.str.contains(r'(day)')
```
---
# 4. 활용
> [!hint] 괄호 제거(내부 문자 포함)
> - 대괄호: `r'\s*\[.*?\]'`
> - 중괄호: `r'\s*\{.*?\}'`
> - 소괄호: `r'\s*\(.*?\)'`

---
> [!example] 참고사이트
> - [Python 정규표현식 정리](https://roothyo.tistory.com/65)
> - [str.extract, str.contains 정규표현식 사용](https://bio-info.tistory.com/21)
> - [메타문자](https://codetorial.net/python/regular_expression/regex_metacharacters.html)
