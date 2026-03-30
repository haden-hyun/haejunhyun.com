---
title: (Python) reduce 함수 사용법
created: 2024-12-30
modified: 2024-12-30 16:10
cssclasses:
  - max
tags:
  - python/reduce
  - python/누적집계
  - python/functools/reduce
---
> [!summary] 요약
> - **집계 함수를 누적으로 활용**
> - `functools` 모듈의 `reduce` 함수 사용
> - 기본문법: `reduce(집계함수, 데이터[, 초기값])`

정리할것!
- [reduce 함수란?](https://etloveguitar.tistory.com/96)

---
# 1. 집계 함수 누적 사용
- `ruduce` 함수의 2가지 인자
	- 누적자(**acc**umulator): 함수 실행 ==시작부터 끝까지 재사용되는 값==
	- 현재값(**cur**rent value): loop시, ==계속 변경되는 값==
### 예제 1: 나이 합 구하기
- 유저들의 나이의 합 구하기(대상: 유저 정보(`users`) <u>딕셔너리</u>의 의 나이열(`age`))
- 초기값 `0` 이 세팅되고, `age`의 값들이 누적으로 더해짐
```python
users = [{'mail': 'gregorythomas@gmail.com', 'name': 'Brett Holland', 'sex': 'M', 'age': 73},
... {'mail': 'hintoncynthia@hotmail.com', 'name': 'Madison Martinez', 'sex': 'F', 'age': 29},
... {'mail': 'wwagner@gmail.com', 'name': 'Michael Jenkins', 'sex': 'M', 'age': 51},
... {'mail': 'daniel79@gmail.com', 'name': 'Karen Rodriguez', 'sex': 'F', 'age': 32},
... {'mail': 'ujackson@gmail.com', 'name': 'Amber Rhodes', 'sex': 'F', 'age': 42}]

from functools import reduce
# 초기값 0
reduce(lambda acc, cur: acc + cur['age'], users, 0)
```
### 예제 2: 성별 분류
- 사용자 정의 함수를 통해 그룹별 누적 집계로 활용 가능
- 유저들의 성별(`sex`)로 이름(`name`) 분류하기

```python
from functools import reduce

# case1: 사용자 정의 함수 사용
def names_by_sex(acc, cur):
	sex = cur['sex']
	if sex not in acc:
		acc[sex] = []
	acc[sex].append(cur['name'])
	return acc
# 초기값 empty dictionary
reduce(names_by_sex, users, {})

# case2: 기본 lambda 활용
reduce(lambda acc, cur: 
	   {**acc, cur['sex']: (acc[cur['sex']] 
		   if cur['sex'] in acc else []) + [cur['name']]},
		users, {})
```
---
# 2. 초기값의 중요성
> [!warning] 주의사항
> 초기값 유무에 따라 결과가 달라짐
- 예제 1
	- 초기값 `0` 설정하지 않으면, `TypeError`
- 예제 2
	- 초기값 `{}` 설정하지 않으면, 두번째 인자가 list나 tuple 의 첫번째 값이 초기값으로 사용됨
	- 기존 유저 정보(`users`)가 딕셔너리 형태로 숫자를 더하거나 키 추가시 에러 발생
---
>[!example] 참고사이트
>- [파이썬 reduce 함수 사용법](https://www.daleseo.com/python-functools-reduce/)
>- [reduce 함수란?](https://etloveguitar.tistory.com/96)
>- 



