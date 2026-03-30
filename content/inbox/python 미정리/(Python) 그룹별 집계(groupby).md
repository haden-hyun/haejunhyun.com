---
title: 파이썬_그룹별 집계
created: 2024-03-07
modified: 2024-03-07 23:02
cssclasses:
  - max
tags:
  - python/groupby
---
## 그룹별 집계함수 적용

#### 하나의 통계치

```python
df.groupby('group_id')['value'].sum().reset_index(name = 'value_sum')

df.groupby('group_id').agg({'value':'sum'}).reset_index()
```

#### 산출할 통계치 여러개인 경우
- 그룹별 집계 항목 여러개인 경우
	- 그룹 id에 대해서 col1, col2의 평균, 표준편차, 최대값, 최소값을 각각 구하는 방법
```python title:group_agg.py
import pandas as pd

df.groupby(['group_id']).agg({'col_nm1': ['mean', 'std', 'max', 'min'],
							 'col_nm2': ['mean', 'std', 'max', 'min']}).reset_index()
```

1. 매개변수
	1. `group_keys`: 그룹 키 인덱스 포함 여부
		1. `True`(defalut): 그룹 키 컬럼이 멀티인덱스로 추가
		2. `False`: 그룹 키 컬럼이 포함되지 않음 -> 단순 집계 시 유용

> [!example] 참고사이트
> - [그룹화 계산(group by)](https://trading-for-chicken.tistory.com/134)

