---
title: (PostgreSQL) 데이터베이스 용량 조회
created: 2024-10-06
modified: 2024-10-06 16:04
cssclasses:
  - max
tags:
  - postgresql/용량
  - postgresql/pg_database
  - postgresql/schema
---
> [!summary] 요약
> - `pg_database` 테이블의 정보를 활용함 

---
# 1. pg_database
> **데이터베이스에 대한 메타데이터를 저장한 테이블**
- `datname`: DB 명
- `datdba` : DB 소유자의 ID (OID)
- `encoding`: DB 문자 인코딩(예: UTF8)
- `datcollate`: DB 로케일 정보
- `datctype`: DB 문자 타입 로케일
- `datistemplate`: 템플릿 여부(`True`: 해당 DB가 다른 DB 생성시, 템플릿 사용)
- `datallowconn`: DB 접속 허용 여부
- `datconnlimit`: 동시 허용 최대 연결 수
- `datfrozenxid`: 백엔드 활성화된 트랜잭션 ID
---
# 2. 데이터베이스별 용량
- `pg_database_size`: 데이터베이스의 용량 확인(**byte 기준**)
- `pg_size_pretty`: 위에서 산출한 사이즈를 기준으로 KB, MB, GB 단위로 계산
```sql
select datname,
	   pg_size_pretty(pg_database_size(datname))
from pg_database
```
---
# 3. 스키마별 용량
```sql
-- 1. 특정 스키마 사이즈 조회 
select pg_size_pretty(pg_schema_size('schema_name')); 

-- 2. 전체 스키마 크기 출력 [스키마 명 / 디스크 공간 / 할당된 DB 사이즈 / 사용 percent]
select 
	pg_size_pretty(pg_database_size(current_database())) as db_size,
	schema_name,
	pg_size_pretty(sum(table_size)::bigint) as disk_space,
	round((sum(table_size) / pg_database_size(current_database())) * 100, 3) as ratio	
from 
	(select pg_catalog.pg_namespace.nspname as schema_name,
			pg_relation_size(pg_catalog.pg_class.oid) as table_size
	from pg_catalog.pg_class
		join pg_catalog.pg_namespace
			on relnamespace = pg_catalog.pg_namespace.oid) as t
group by schema_name
order by ratio desc	
```
## 3.1 예시 테이블
- `db_size`: DB 총 용량
- `schema_name`: DB 내 스키마명
- `disk_space`: 스키마별 차지 용량
- `ratio`: 스키마별 DB 용량 차지 비율

| db_size | schema_name        | disk_space | ratio  |
| ------- | ------------------ | ---------- | ------ |
| 9197 kB | pg_catalog         | 6704 kB    | 72.895 |
| 9197 kB | pg_toast           | 944 kB     | 10.264 |
| 9197 kB | portfolio          | 144 kB     | 1.566  |
| 9197 kB | test               | 88 kB      | 0.957  |
| 9197 kB | information_schema | 88 kB      | 0.957  |

---
>[!example] 참고사이트
>- [데이터베이스 및 스키마별 용량확인](https://wogus789789.tistory.com/363)