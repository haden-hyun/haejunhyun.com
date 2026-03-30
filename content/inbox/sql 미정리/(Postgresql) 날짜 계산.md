---
title: (Postgresql) 날짜 계산
created: 2025-10-31
modified: 2025-10-31 14:49
cssclasses:
  - max
tags:
  - postgresql/date/to_date
  - postgresql/date/date_part
  - postgresql/date/age
---
> [!summary] 요약

---
```sql
select date_part('year', age(to_date('20250205', 'YYYYMMDD'), to_date('20241103', 'YYYYMMDD'))) * 12 
		+ date_part('month', age(to_date('20250205', 'YYYYMMDD'), to_date('20241103', 'YYYYMMDD')));
```



- `TO_DATE(col1, 'YYYYMMDD')`: `YYYYMMDD` 형식의 문자열을 `DATE` 타입으로 변환
- `AGE(date1, date2)`: 두 날짜 간의 차이를 **년-월-일** 형태로 반환
- `DATE_PART('year', AGE(...)) * 12`: 연도 차이를 개월 수로 변환
- `DATE_PART('month', AGE(...))`: 개월 차이를 가져와 연도 개월과 합산
---
>[!example] 참고사이트


