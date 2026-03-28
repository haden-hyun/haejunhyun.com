---
title: (Python) 딕셔너리 언패킹이란?
created: 2025-07-13
modified: 2025-07-13 17:14
cssclasses:
  - max
tags:
  - python/dictionary/unpacking
---
> [!summary] 요약
> - 딕셔너리 구조를 통해 함수에 키워드 인자를 간접 삽입
> - 이를 통해 가독성 및 리팩토링에 유리함
> - 구조: `함수(**딕셔너리)`

---
# 1. 개요
## 1.1 목적
> [!hint] 목적
> - 기존 함수에 키워드 인자를 직접 전달하는 대신에 딕셔너리를 이용하여 **간접 삽입**
> - 가독성 및 리팩토링에 효과적!

## 1.2 구조
- `함수(**딕셔너리)`
	- 딕셔너리 객체 앞에 asterisk(`*`) **2개**를 붙여서 하용 
- 단, 딕셔너리의 `key` 값은 반드시 **문자열** 형태
--- 
# 2. 예시
## 2.1 기본 예제
- `function(**args_dict)` = `function(name = 'HJ', birthdate = '19960517')`
	- 단, 매개변수와 딕셔너리의 Key 이름과 개수는 동일!
```python
def function(name, birth_date):
	print(f'이름: {name}')
	print(f'생년월일: {birth_date}')

args_dict = {'name' : 'HJ', 'birth_date' : '19960517'}
function(**args_dict)
## 이름: HJ
## 생년월일: 19960517
```

## 2.2 덮어쓰기
- 딕셔너리 리터럴 안에서 사용가능
- KEY 이름이 동일하면 뒤의 것을 덮어씀
```python
a = {"x": 1, "y": 2}
b = {"z": 3, "x": 5}

merged = {**a, **b}
print(merged)  # {'x': 5, 'y': 2, 'z': 3}
```

## 2.3 assign 함수를 이용한 예제
> Pandas의 assign 함수에 활용
- 내부 구조
	- `df.assign(new_col1 = ..., new_col2 = ...)`
	- `df.assign(**{col : value})`
- 즉 딕셔너리 언패킹을 통해 **첫 번째 인자값을 컬럼명**,  **두번째 결과 값을 컬럼 값**으로 가짐

- 기존 방식
```python
df = df.assign(
	hj_a = lambda df: df['score'] *1.5,
	hj_b = lambda df: df['score'] *1.2
)
```

- 딕셔너링 언패킹
	- 변수가 n개인 경우 각각 언패킹하는 방법(**ver1**)과 한 번에 언패킹하는 방법(**ver2**)이 존재
```python
prefix = 'hj'
# 단일
df.assign(
	**{f'{prefix}_a' : lambda df: df['score'] * 1.5}
)

# 여러개 ver1
df.assign(
	**{f'{prefix}_a' : lambda df: df['score'] * 1.5},
	**{f'{prefix}_b' : lambda df: df['score'] * 1.2}
)

# 여러개 ver2
df.assign(**{
	f'{prefix}_a' : lambda df: df['score'] * 1.5,
	f'{prefix}_b' : lambda df: df['score'] * 1.2
})
```

---
>[!example] 참고사이트
>- [파이썬 키워드 인수와 딕셔너리 언패킹 사용하기](https://dojang.io/mod/page/view.php?id=2347#google_vignette)