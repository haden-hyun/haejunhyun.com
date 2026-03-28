---
title: (PostgreSQL) 스키마별 다양한 정보 조회 - `information_schema`
created: 2025-06-17
modified: 2025-06-17 23:51
cssclasses:
  - max
tags:
  - postgresql/information_schema
  - postgresql/스키마정보
---
> [!summary] 요약
> 1. 목적
> 	1. 특정 schema에 속한 컬럼, 함수, 시퀀스, 테이블 스키마 등 다양한 정보 조회
> 2. `INFORMATION_SCHEMA` 활용
> 	1. 함수: `ROUTINES`
> 	2. 테이블: `TABLES`
> 	3. 시퀀스: `SEQUENCES`
> 	4. 컬럼: `COLUMNS`
> 	5. 테이블 기준 제약조건: `table_constraints`
> 	6. 열 기준 제약조건: `key_column_usage`

---
# 1. 함수 목록
## 1.1 주요 output
- `routine_schema`: 데이터 스키마명
- `routine_name`: 루틴 이름
- `routine_type`: 루틴 분류
	- `PROCEDURE`: 프로시저 / `FUNCTION`: 함수
## 1.2 활용

```postgresql
-- 함수 및 프로시저 가져오기
select routine_schema, routine_name, routine_type
from INFORMATION_SCHEMA.ROUTINES  
where routine_type = 'FUNCTION' -- 함수
where routine_type = 'PROCEDURE' -- 프로시저
```
---
# 2. 테이블 목록
## 2.1 주요 output
- `table_schema`: 데이터 스키마명
- `table_name`: 테이블명
- `table_type`: 테이블 타입
	- `VIEW` : 뷰 테이블
	- `BASE TABLE`: 기본 테이블
## 2.2 활용
```postgresql
-- 1. 특정 데이터 스키마 내 테이블 목록 가져오기
select table_schema, table_name
from INFORMATION_SCEHMA.TABLES
where table_schema = '스키마명'

-- 2. view 테이블만 가져오기
select table_schema, table_name, table_type
from INFORMATION_SCEHMA.TABLES
where table_type = 'VIEW';
```
---
# 3. 시퀀스 목록
> [!question] 시퀀스란?
> - 숫자 시리즈 생성하는 독립적인 객체
> - 테이블과 별도로 존재하며, 필요시마다 호출해서 가져옴
> - `SERIAL`, `BIGSERIAL` 등 컬럼 뒤에서 동작

```postgresql
select *
from INFROMATION_SCHEMA.SEQUENCES;
```

---
# 4. 컬럼 목록
## 4.1 주요 output
- `table_schema`: 스키마명
- `table_name` : 스키마 내 테이블 명
- `column_name`: 스키마 내 테이블에 해당하는 컬럼명
- `data_type`: 데이터 타입
## 4.2 특정 테이블 내 컬럼 목록 확인
- `table_name` 조건문 활용
```postgresql
select *
from INFORMATION_SCHEMA.COLUMNS
where table_name = '테이블명'
```
## 4.3 활용
```postgresql
-- 1. 특정 컬럼 존재 여부
select count(*)
from INFORMATION_SCHEMA.COLUMNS
where table_name = '테이블명'
and column_name = '컬럼명';

-- 2. 특정 테이블 내 `amt` 로 끝나는 열 목록 추출
select table_name, column_name
from INFORMATION_SCHEMA.COLUMNS
where table_name = '테이블명'
and column_name like '%amt';
```

---
# 5. 제약조건

> [!warning] PK와 같은 제약조건은 `INFORMATION_SCHEMA.table_constraints` 등 활용
> - `table_constraints`: 테이블 제약조건 목록(PK, FK, UNIQUE 등)
> - `key_column_usage`: 어떤 컬럼이 어떤 제약조건인지
> - 따라서, 특정 테이블에 어떤 컬럼이 PK 인지 활용하기 위해서 두 테이블 `constraint_name` 기준 JOIN

## 5.1 주요 output
- `table_constraints` : 테이블 기준
	- `constraint_schema`: 데이터 스키마명
	- `constraint_name`: 제약명
	- `constraint_type`: 제약 조건
		- `PRIMARY KEY`
		- `FOREIGN KEY`
		- `UNIQUE`
- `key_column_usage`: 컬럼 기준
	- `column_name`: 컬럼명
## 5.2 활용
```postgresql
-- 특정 테이블에 PK 컬럼 가져오기
select a.constraint_schema,  
       a.constraint_name,  
       a.table_name,  
       b.column_name  
from information_schema.table_constraints a  
         left join information_schema.key_column_usage b  
                   on a.constraint_name = b.constraint_name  
where a.constraint_type = 'PRIMARY KEY';
```

---
>[!example] 참고사이트
>- [스키마별 각종 정보 조회하기 (ft. 컬럼, 함수, 시퀀스, 테이블 목록 등)](https://mine-it-record.tistory.com/456)
>- [테이블의 컬럼 정보 확인](https://mine-it-record.tistory.com/379#google_vignette)



