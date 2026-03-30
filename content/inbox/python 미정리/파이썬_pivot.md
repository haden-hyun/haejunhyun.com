---
title: 파이썬_pivot
created: 2024-01-31
modified: 2024-01-31 10:48
cssclasses:
  - max
tags:
  - python
  - python/pivot
  - python/pivot_table
---
1. long > wide
	1. `id`를 기준으로 지정
	2. `col_list`열의 값들을 새로운 열의 이름으로 지정
	3. 새롭게 생성되는 열에 값은 `value`열에 해당하는 값을 지정
`pd.pivot_table(df, index = 'id', columns = 'col_list', values = 'value')`
