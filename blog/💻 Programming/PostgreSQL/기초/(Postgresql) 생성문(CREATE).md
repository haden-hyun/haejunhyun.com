---
title: (Postgresql) 생성문(CREATE)
created: 2024-09-28
modified: 2024-09-28 17:35
cssclasses:
  - max
tags:
  - postgresql/ddl/create
  - postgresql/index
  - postgresql/pk
  - postgresql/테이블생성
  - postgresql/create
---
> [!summary] 요약
> - `CREATE` 기능: 새로운 대상을 생성하는데 사용됨
> - 생성 대상 지정(데이터베이스, 스키마, 테이블, index , 함수 및 프로시저 등)
> 	- `database`, `schema`, `table`, `index`, `function`, `procedure`

---
# 1. 테이블
## 1.1 신규 테이블 생성
> 테이블 생성 시, 컬럼명과 데이터 타입, PK 등 지정 가능
> 컬럼 생성 시, 데이터타입 주의(참고: [[💻 Programming/PostgreSQL/데이터베이스/(DataBase) 데이터 타입]])
```sql
create table 스키마명.테이블명(
	column1 varchar(20) not null,
	column2 numeric(10, 4),
	column3 text,
	column4 integer
	primary key (column1, column2),
	foreign key (column3) reference 스키마명.참고테이블명
)
```

## 1.2 SELECT 문을 활용하여 테이블 생성
> `FROM` 문에서 가져온 테이블 내 컬럼의 속성을 그대로 생성
> `CREATE TABLE AS` 활용
```sql
create table 스키마명.테이블명 as
select column1, column2
from schema.table;
```

---
# 2. Index
## 2.1 Index 생성
- `idx_name`은 생략 가능(자동으로 지어줌)
```sql
create index on table_name (column1, column2)
create index idx_name on table_name (column1, column2)
```
## 2.2 Index와 Primary Key 차이점

| 구분      | Index                                              | PK                                         |
| ------- | -------------------------------------------------- | ------------------------------------------ |
| 목적      | 데이터 **조회 기능 성능 향상**을 위해 특정 열 또는 열 조합에 index 생성     | 테이블 **각 행을 고유하게 식별**하기 위해 PK 설정            |
| 기능      | 테이블의 **특정 열에 대한 검색, 정렬, 조인 연산을 빠르게 수행**할 수 있도록 도와줌 | PK 열 또는 열 조합은 테이블 내 고유하며, NULL 값 가질 수 없음   |
| 용도      | **쿼리 기능 향상**(API에서 테이블 조회 시 활용)                    | 데이터 **무결성 보장**, RDBS애서 **테이블 간 관계 설정**에 활용 |
| 무결성 차이점 | **중복 허용 및 Null 값 포함** 가능(단, Unique Index 설정도 가능)   | 자동으로 **Unique와 Not Null** 제약 포함            |
| 인덱스 차이점 | 수동으로 인덱스 지정 필요                                     | 고유 Index 생성하여 빠른 조회가 가능함                   |

---
# 3. 데이터베이스 생성
```sql
create database db_name
```
---
# 4. 스키마 생성
- database는 지정된 상태
```sql
create schema schema_name
```
---
>[!example] 참고사이트


