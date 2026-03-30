---
title: (Python) 시간간격(data_range)
created: 2024-10-28
modified: 2024-10-28 22:44
cssclasses:
  - max
tags:
  - python/시간간격
  - python/date_range
---
> [!summary] 요약
> - `pandas`의 `date_range()`를 활용하여 시작과 끝 날짜 사이에 원하는 주기를 넣어 동일한 시간 간격의 날짜 데이터를 생성

# 1. 함수 인자
- `start` , `end` : 날짜 주기 시작과 끝 (dtype: `str` or `datetime`)
- `periods`: 생성하려는 날짜 **개수**
- `freq`: 생성하려는 날짜 간격(주기) - 기본값(= `'D'`)
- `closed`: 시작과 끝 날짜 포함 여부(기본값: `None` 으로 시작과 끝 포함)
	- `left`: **시작 포함** / 끝 미포함
	- `right`:시작 미포함 / **끝 포함**
---
# 2. 예시
## 2.1 start, end, periods 의 활용
- 예1: 1일 간격으로 날짜 인덱스 생성
	- `['2024-01-01', '2024-01-02', ... ,'2024-01-10']`
- 예2: 구간을 3등분(4-1) 하어, 시작과 마지막 날짜 포함한 4개의 날짜 인덱스 생성
	- `['2024-01-01', '2024-01-04', '2024-01-07', '2024-01-10']`
```python
import pandas as pd
# 예1
pd.date_range(start = '2024-01-01', end = '2024-01-10')
# 예2
pd.date_range(start = '2024-01-01', end = '2024-01-10', periods = 4)
```

## 2.2 freq 활용
- `freq` 주기 활용 별침 [참고사이트](https://pandas.pydata.org/docs/user_guide/timeseries.html#timeseries-offset-aliases)
- 예1: 1달 주기로 날짜 인덱스 생성
	- `['2024-01-31', '2024-02-28', '2024-03-31', ... , '2024-12-31']`
- 예2: 3달 주기로 날짜 인덱스 생성
	- `['2024-01-31', '2024-04-30','2024-07-31', '2024-10-31']`
	- 특이사항(**마지막 날짜 미포함**): <u>날짜 구간을 벗어나지 않는 선</u>에서 해당 주기 간격으로 날짜 인덱스를 생성
- 예3: 시작일로부터 1개월 간격으로 3개의 날짜 인덱스 생성
	- `['2024-01-31', '2024-02-28', '2024-03-31']`
```python
# 예1
pd.date_range(start = '2024-01-01', end = '2024-12-31', freq = 'M')
# 예2
pd.date_range(start = '2024-01-01', end = '2024-12-31', freq = '3M')
# 예3
pd.date_ragne(satrt = '2024-01-01', periods = 3, freq = 'M')
```

---
>[!example] 참고사이트
>- [주기적인 날짜데이터 생성하기](https://data-minggeul.tistory.com/9)


