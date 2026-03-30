---
title: (Python) 진행표시 모듈(tqdm)
created: 2025-06-22
modified: 2025-06-22 20:58
cssclasses:
  - max
tags:
  - python/tqdm
  - python/progress_apply
---
> [!summary] 요약
> - 목적: 반복문의 진행상황을 확인
> - 활용: 일반적인 반복문 및 apply() 함수에서 활용 가능 

---
# 1. 모듈 소개
> [!hint] 목적
> - 시간이 다소 걸리는 Loop문 실행시, 진행표시 바를 생성하여 진행정도를 확인하기 위함
> - 반복자 객체(`iterable`)를 **tqdm**으로 감싸면 끝
> 

---
# 2. 활용
## 2.1 기본 활용법
```python
from tqdm import tqdm
# 1. 일반 for 문
for i in tqdm(range(len(df))):
	print(i)
```
## 2.2 enumerate, zip, itterrow 에서 활용
> [!hint] `tqdm`은 내부적으로 감싼 녀석의 길이(`__len__`)를 확인하지만, `enumerate`, `zip`에는 해당 요소가 없음
> - 외부에서 감쌀 때: `total` 옵션 사용
> - 내부에서 감쌀 때: list를 감쌈

```python
from tqdm import tqdm

# 1. 외부에서 감쌀 때
## len(list1) = len(list2)
for pair in tqdm(zip(list1, list2), tota = len(list1)):
	print(pair)
for idx, row in tqdm(df.iterrows(), total = len(df)):
	print(idx, row)
	
# 2. 내부에서 감쌀 때
for i, row in zip(tqdm(list1)):
	print(i, row)	
```

## 2.3 generator 활용
> [!hint] 반복 횟수를 알고 있을 때

```python
length = 1000
generator = (2 * n for n in range(length)):

for n in tqdm(generator, total = length):
	pass
```

---
# 3. apply 함수에 적용
> [!summary] 목적
> - apply() 함수를 활용할 때 기존 `tqdm`과 같은 진행상황을 확인하기 위함
> - `progress_apply()` 활용

```python
import pandas as pd
from tqdm import tqdm

tqdm.pandas() # tqdm의 pandas전용 메소드를 호출합니다.

df['col3'] = df.progress_apply(lambda x: x['col'] + x['col2'])
# 띄어쓰기 카운트 열
df['count'] = df['context'].progress_apply(lambda x: len(x.split()))
```

---

> [!example] 참고사이트
> - [진행상황 표시에 사용하는 tqdm 모듈, enumerate, zip, generator 와 함께 사용](https://mechurak.github.io/2022-10-01_tqdm/)
> - [pandas dataframe에서 apply의 진척도 보기 (progress_apply())](https://lovedh.tistory.com/entry/pandas-dataframe%EC%97%90%EC%84%9C-apply%EC%9D%98-%EC%A7%84%EC%B2%99%EB%8F%84-%EB%B3%B4%EA%B8%B0-tqdm)