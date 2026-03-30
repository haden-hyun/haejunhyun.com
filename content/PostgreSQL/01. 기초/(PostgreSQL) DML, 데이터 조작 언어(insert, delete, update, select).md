---
title: (PostgreSQL) DML, 데이터 조작 언어(insert, delete, update, select)
created: 2024-07-04
tags:
  - postgresql/DML/insert
  - postgresql/DML/delete
  - postgresql/DML/update
  - postgresql/DML/select
---
> [!hint] 작성 내용 및 요약
> 1. 데이터베이스에 대한 조작(검색, 삽입, 삭제, 갱신 등) 연산을 명세
> 2. 주요 연산자: `INSERT`, `DELETE`, `UPDATE`, `SELECT`
> 	1. `INSERT`: 새로운 행을 테이블에 삽입
> 	2. `DELETE`: 테이블의 행을 삭제
> 	3. `UPDATE`: 특정 열의 값을 수정
> 	4. `SELECT`: 질의어

---
# 1. INSERT
> INSERT INTO 테이블명 (컬럼명) VALUES (값)
- `CREATE TABLE`은 빈 테이블을 생성
- `INSERT INTO`를 통해 테이블을 채움
	- 테이블 내 모든 컬럼을 채울 경우, 컬럼명 생략 가능
```sql
-- 1. 테이블 생성
create table schema_name.table_name
(
	col1 varchar(10),
	col2 numeric(8, 2)
)
-- 2. 테이블 채우기
insert into schema_name.table_name
values('abcd', 1234), ('hhjj', 3932);
```
---
# 2. DELETE
> DELETE FROM 테이블명 WHERE 조건문
- 조건이 없는 경우 모든 행을 삭제
- 일반적으로 `WHERE` 조건문을 사용하여 행을 삭제
```sql
-- 1. 모든 행 삭제
delete from schema.table 
-- 2. col2 가 3000보다 큰 행 삭제
delete from schema.table
where col2 > 3000;
```
---
# 3. UPDATE
> UPDATE 테이블명 SET 컬럼명 = 변경값 WHERE 조건문
- 조건에 만족하는 행에 대해서 특정 컬럼명의 값을 변경함
```sql
-- 예시1) 
update schema.table
set col1 = 'abcd',
	col2 = 'aaaa'
where col3 < 4000;

-- 예시2) 공백 및 콤마 제거 전체 적용
update schema.table
set col1 = trim(col1),
col2 = replace(col2, ',', '')
```
---
# 4. SELECT
> [!summary] SELECT 문
> 1. SELECT 절: **질의 결과**에 요구되는 **열 이름**을 서술
> 	1. `distinct` : 중복 제거
> 	2. 수식 연산 포함 가능
> 	3. `as`: 열 이름 변경
> 2. FROM 절: **질의 대상**이 되는 **테이블 이름**을 서술