---
title: SQL 명령어
created: 2023-03-07
modified: 2023-03-07 11:15
tags:
  - sql
  - sql/명령어
  - postgresql
---

## 행 합치기
###### 주의사항!!
   - 합쳐지는 열의 숫자는 반드시 동일!
   - 각 데이터 타입 일치!

###### 집합 연산자
- `UNION` : 합집합 - **중복되는 행은 한 번만 출력**
- `UNION ALL` : 합집합 - **중복되는 행도 그대로 출력**
- `INTERSET` : 교집합 - **중복되는 행만 출력**
- `MINUS` : 차집합 - 첫 번째 SELECT 문의 조회 결과에서 주 번째 조회 결과를 뺌
```SQL
SELECT col_name1, col_name2 FROM table_name1 WHERE 조건문
집합 연산자(UNION / UNION ALL / INTERSET / MINUS)
SELECT col_name1, col_name2 FROM table_name2 WHERE 조건문
ORDER BY 1;

```

## 모든 열에 있는 값들의 공백 제거

```sql
# 기존의 테이블을 공백제거한 테이블로 업데이트
update table_name
# 해당 열의 모든 값들 공백 제거
SET col_name1 = TRIM(col_name1),
col_name2 = TRIM(col_name2),
col_name3 = TRIM(col_name3)
```

## 열 이름 변경

```sql
ALTER TABLE Schemas_name.table_name RENAME 
COLUMN "old_col_name1" TO "new_col_name1"
ALTER TABLE Schemas_name.table_name RENAME 
COLUMN "old_col_name2" TO "new_col_name2"
ALTER TABLE Schemas_name.table_name RENAME 
COLUMN "old_col_name3" TO "new_col_name3"
```

## 문자열 교체
- 콤마(,) 제거
```sql
# 기존의 테이블을 공백제거한 테이블로 업데이트
update table_name
# 해당 열의 콤머(,) 제거
set col_1 = replace(col_1, ',', ''),
col_2 = replace(col_2, ',', '')
col_3 = replace(col_3, ',', '')
```

## 데이터 타입 변경
- `float4`형으로 변경
``` SQL
ALTER TABLE Schemas_name.table_name 
ALTER COLUMN col_1 TYPE float4 USING col_1::float4;
ALTER TABLE Schemas_name.table_name 
ALTER COLUMN col_2 TYPE float4 USING col_2::float4;
ALTER TABLE Schemas_name.table_name 
ALTER COLUMN col_3 TYPE float4 USING col_3::float4;
```

## 데이터베이스 및 스키마 용량 확인

###### postgreSQL 용량 확인
1. 데이터베이스 총 용량 확인
```sql
select datname, pg_size_pretty(pg_database_size(datname)) from pg_database;
```

2. 스키마별 용량 확인
- 스키마 이름 / 디스크 용량 / 할당된 데이터 베이스 용량 / 디스크 사용 비율
```sql
--스키마 사이즈 반환하기 위한 세팅 
CREATE OR REPLACE FUNCTION pg_schema_size(text) returns bigint AS $$
select sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint
from pg_tables where schemaname = $1 $$ language sql; 

-- 특정 스키마 사이즈 조회 
select pg_size_pretty(pg_schema_size('스키마 명')); 

--전체 스키마 크기 출력 [스키마 명 / 디스크 공간 / 할당된 DB 사이즈 / 사용 percent]
SELECT schema_name, pg_size_pretty(sum(table_size)::bigint) as "disk space", 
pg_size_pretty(pg_database_size(current_database())) as "DB_size",
(sum(table_size) / pg_database_size(current_database())) * 100
as "percent (%)" FROM ( 
SELECT pg_catalog.pg_namespace.nspname as schema_name,
pg_relation_size(pg_catalog.pg_class.oid) as table_size 
FROM pg_catalog.pg_class
JOIN pg_catalog.pg_namespace
ON relnamespace = pg_catalog.pg_namespace.oid 
) t 
GROUP BY schema_name
ORDER BY schema_name;
```

