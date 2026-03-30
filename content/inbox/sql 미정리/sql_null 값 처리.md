---
title: sql_null 값 처리
created: 2024-02-14
modified: 2024-02-14 13:09
cssclasses:
  - max
tags:
  - postgresql
  - postgresql/coalesce
  - postgresql/null
---
## coalesce() 함수
- `col1`에 존재하는 NULL 값을 특정 값(`change_value`)로 변경

```postgresql
select coalesce(col1, change_value) as fitted_col1 
from table
```