---
title: (PostgreSQL) 제거문(DROP)
created: 2024-11-12
modified: 2024-11-12 23:43
cssclasses:
  - max
tags:
  - postgresql/drop
  - postgresql/truncate
  - postgresql/테이블제거
---
> [!summary] 요약
> - `DROP` 기능: 대상을 제거하는데 사용
> - **주의할 점**
> 	- `DROP` : 대상 전체를 삭제. **절대 되돌릴 수 없음**
> 	- `DELETE`: <u>원하는 데이터</u>만 지울 수 있으며, 삭제 후 되돌릴 수 있음
> 	- `TRUNCATE`: <u>인덱스 및 데이터가 삭제</u>. 테이블은 삭제되지 않지만, **삭제 후 되돌릴 수 없음**

---
# 1. 대상 제거
```sql
-- 1. 테이블 제거
drop table 스키마명.테이블명;
-- 2. 스키마 제거
drop schema 스키마명;
-- 3. 데이터베이스 제거
drop database 데이터베이스명;
```

---
>[!example] 참고사이트


