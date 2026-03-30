---
title: (Python) 날짜 데이터 활용(timedelta, relativedelta)
created: 2024-07-09
tags:
  - python/timedelta
  - python/relativedelta
  - python/weekday
  - python/weekend
  - python/first_day
  - python/last_day
---
> [!hint] 주요 내용 및 요약
> 1. 상대적인 시간 계산
> 	1. `dateutil.relativedelta` 패키지 활용
> 	2. `datetime`보다 효과적
> 2. 요일 및 주중/주말 표시
> 	1. `datetime` 형식의 기본 메서드 활용
> 	2. 요일 문자열: `day_name()`
> 	3. 요일 정수: `dayofweek`, `weekday`
> 3. 특정 월 시작/끝 연월일 구하기

---
# 1.  상대적인 시간 계산
> [!warning] 참고사항
> - `datetime` 패키지는 일(day) 단위만 적용 가능하다. 이로 인해 월 단위 이상 계산 시, 월 마다 30일 31일 차이가 발생하여 정확한 계산이 어려움
> - 따라서, `dateutil` 라이브러리 내 `relativedelta()`를 활용
> - 매개변수: `years`, `months`, `days`, `hours`, `minutes`
> - 날짜 데이터 형식(`datetime`)에 적용한 후 문자열로 변환

```python
from datetime import datetime
from dateutil.relativedelta import relativedelta

now = datetime.now()

# apply relativedelta
year_diff = now - relativedelta(years = 4)
month_diff = now - relativedelta(months = 4)
day_diff = now - relativedelta(days = 4)
hour_diff = now - relativedelta(hours = 4)
minute_diff = now - relativedelta(minutes = 4)

# datetime -> str
year_diff = year_diff.strftime('%Y%m%d')
```

---
# 2. 요일 및 주중/주말
## 2.1 문자열
- `datetime.day_name()`
- 월요일: `'Monday'`
- 일요일: `'Sunday'`
```python
from datetime import datetime
import pandas

now = datetime.now()

```
## 정수

---
> [!example] 참고 사이트
> - [dateutil 설명 블로그](https://hangbok-archive.com/development/python/%ED%8C%8C%EC%9D%B4%EC%8D%AC-datetime-dateuti/)

