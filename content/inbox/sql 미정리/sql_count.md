---
title: sql_count
created: 2024-04-09
modified: 2024-04-09 16:51
cssclasses:
  - max
tags:
  - sql
  - "#sql/postgresql"
  - sql/count
  - sql/조건count
---
> [!hint] 조건별 카운트
> 목적: 한 쿼리 내 각 조건에 맞는 건수 계산

```sql title:count.sql
select count(case when condition1 then 1 end) as cnt1,
		count(case when condition2 then 2 end) as cnt2
from table
```