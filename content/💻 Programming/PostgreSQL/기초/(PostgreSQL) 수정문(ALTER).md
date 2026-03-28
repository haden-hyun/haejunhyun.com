---
title: (PostgreSQL) 수정문(ALTER)
created: 2024-09-17
modified: 2024-09-17 15:00
cssclasses:
  - max
tags:
  - postgresql/테이블수정
  - postgresql/열수정
  - postgresql/alter
---
> [!summary] 요약
> - `ALTER` 기능: 테이블 그 자체 또는 테이블 내 열, 제약조건을 수정하는 경우 활용
> - 수정 대상 지정(테이블, 컬럼, 제약조건, 데이터타입)
> 	- `table`, `column`, `constraint`, `type`
> - 수정 사항 명령어 입력
> 	- `rename`: 테이블 및 열 이름 변경
> 	- `add` : 새로운 열 및 제약조건 추가
> 	- `drop` : 기존 열 및 사전 제약조건 제거

---
# 1. 테이블 수정
> 기존에 생성한 테이블의 이름을 변경
```sql
alter table old_table_name rename to NEW_TABLE_NAME
```
---
# 2. 열 수정
## 2.1 열 생성 및 삭제
- 데이터 타입 작성 필요
```sql
-- 1. 열 생성
alter table 테이블명
add column 컬럼명1 integer,
add column 컬럼명2 char(20)

-- 2. 열 삭제
alter table 테이블명
drop column 컬럼명
```
## 2.2 열 이름 변경
> <u>PostgreSQL</u>의 경우 **한 명령문에 하나의 열 이름만 변경 가능**
```sql
alter table 테이블명
rename column OLD_컬럼명1 to NEW_컬럼명1
alter table 테이블명
rename column OLD_컬럼명2 to NEW_컬럼명2
```
## 2.3 열 데이터 타입 변경
> - `alter` 재사용
> - `type`을 통해 데이터타입을 변경할 것이라는 것을 
```sql
alter table 테이블명
alter column 컬럼명 type 변경할_데이터타입
```
---
# 3. 제약조건(PK, index 등) 수정
## 3.1 사후 PK 추가
> 기존에 생성한 테이블에서 PK를 새롭게 추가하는 경우 활용
> PK 이름을 지정해줘야함
```sql
alter table 테이블명 add constraint PK_name primary key (컬럼명);
```
## 3.2 사전 PK 제거
- 기존 PK 제약 이름 확인
```sql
select conname
from pg_constraint
where conrelid = '스키마명.테이블명'::regclass
and contype = 'p'
```
- 확인한 PK 제거
```sql
alter table 테이블명
drop constraint PK명
```
---
>[!example] 참고사이트


