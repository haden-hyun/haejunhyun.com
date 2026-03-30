---
title: (Python) 날짜 데이터 타입 및 양식(datetime)
created: 2024-07-09
tags:
  - python/datetime
  - python/date
---
> [!hint] 주요 내용 및 요약
> 1. `datetime`패키지의 `datetime`메서드 활용
> 2. 데이터 타입 변환
> 	1. `strftime`: 날짜 -> 문자열
> 	2. `strptime`: 문자열 -> 날짜
> 3. 날짜 양식

---
# 1. 데이터 타입
> [!summary] 형식 변환
> - `strftime`: 날짜 및 시간을 문자열로 변환(`datetime` -> `str`)
> 	-  `f`는 format의 약자로 string foram time: **문자열로 포맷팅**
> - `strptime`: 날짜 및 시간 형태의 문자열을 datetime으로 변환 (`str` -> `datetime`)
> 	- `p`는 parse의 약자로 string parse time: **문자열을 파싱**

## 1.1 문자열 변환

> `datetime.strftime(format)`
- now: datetime.datetime(2024, 7, 9, 11, 11, 30, 309905)
- date: '2024-07-09'
- time: '11:11:30'
- datetime: '2024-07-09 11:11:30'
```python
from datetime import datetime  
  
now = datetime.now()  
  
date = now.strftime('%Y-%m-%d')  
time = now.strftime('%H:%M:%S')  
datetime = now.strftime('%Y-%m-%d %H:%M:%S')
```
## 1.2 datetime 변환
> `datetime.strptime(str, format)`
- now_datetime: datetime.datetime(2024, 7, 9, 11, 11, 30)
- ymd_datetime: datetime.datetime(2024, 7, 9, 0, 0)
```python
from datetime import datetime  

str_datetime = '2024-07-09 11:11:30'  
now_datetime = datetime.strptime(str_datetime, '%Y-%m-%d %H:%M:%S')

str_datetime = '20240709'  
ymd_datetime = datetime.strptime(str_datetime, '%Y%m%d')
```

---
# 2. 형식
1. 연일(==자주 사용==)
	1. `%Y%m%d` : 20240709
	2. `%Y-%m-%d`: 2024-07-09
2. 그 외
	1. `%H:%M:%S`: 15:32:02
	2. `%H%M%S`: 153202

| 표기   | 설명                   | 예시      |
| ---- | -------------------- | ------- |
| `%Y` | 연도 (4자리)             | 2024    |
| `%m` | 월 (01 ~ 12)          | 07      |
| `$d` | 일 (01 ~ 31)          | 09      |
| `%H` | 24시간 형식의 시간(00 ~ 23) | 14      |
| `%M` | 분 (00 ~ 59)          | 30      |
| `%S` | 초 (00 ~ 59)          | 48      |
| `%A` | 전체 요일 이름             | Monday  |
| `%B` | 전체 월 이름              | January |
| `%a` | 축약된 요일 이름            | Mon     |
| `%b` | 축약된 월 이름             | Jan     |
| `%p` | 오전/오후 나타냄 (AM or PM) | AM      |

---
> [!example] 참고 사이트
> - [strftime과 strptime](https://dev-jy.tistory.com/5)
> - [(세부정리) strftime과 strptime](https://docs.python.org/ko/3/library/datetime.html#strftime-strptime-behavior)

