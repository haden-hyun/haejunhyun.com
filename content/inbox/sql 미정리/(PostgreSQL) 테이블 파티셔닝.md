---
title: (PostgreSQL) 테이블 파티셔닝
created: 2025-07-03
modified: 2025-07-03 00:12
cssclasses:
  - max
tags:
  - postgresql/partition
---
> [!summary] 요약

---
# 1. 개요
## 1.1 테이블 파티션이란?
## 1.2 특징

---
# 2. 사용법

---
# 3. 검토


---
> 과거내용
## 파티션(partition)이란?
> [!hint] 파티션
> 방대한 데이터들을 여러 테이블에 나누어서 insert하여 관리함
> 

#### Range
- 특정 키 연속된 범위를 정의
- 
#### List
- 파티션 키 값이 코드 값 또는 카테고리와 같이 고정 값
- 연속적이지 않고, 정렬 순서 관계 없는 경우 활용
- 키 값 기준 레코드 건수 균일 및 검색 조건에 파티션 키가 자주 사용될 때

## 파티션 기준 열 지정
> [!summary] 파티션 생성
> 테이블 생성시 `partition by list ('columns_name')` 지정
#### 테이블 생성(CREATE)
```sql
create table schema.table_name
(  
    col1      char(19) not null,  
    col2      char(4),  
    col3      varchar(150)
)  
    partition by LIST ("col2");
```

#### 테이블 수정(ALTER)
- 특정 값에 따라 파티션 이름 분류
	- value1, value2의 경우 part_name1로 분류
```sql
alter table schema.table_name partition by list(column_name) (
	partition part_name1 values in (value1, value2)
	partition part_name2 values in (value3, value4, value5)
)
```

## 파티션 저장
- 기존 테이블에 특정 값을 기준으로 파티션을 분리하여 테이블 저장
- 예) 기존 토지소유정보에 `2023-12`'값을 갖는 자료를 '토지소유정보2312'에 저장

```sql file:파티션저장.sql
# 새로 생성할 테이블 이름
CREATE TABLE schema.table_new
# 기존 테이블
partition of schema.table
# 파티션 조건이 되는 기준 값
for values in ('standard_value')
# 파티션 조건 범위
for values from ('start_value') to ('end_value')

# 예)
land_owner.토지소유정보2312 
PARTITION OF land_owner.토지소유정보 
FOR VALUES IN ('2023-12') -- 2023년 12월만 분리
for values from ('2023-10') to ('2023-12') -- 2023년 10~12월 분리
```


---
>[!example] 참고사이트
> - [postgresql - table partitioning](https://velog.io/@dailylifecoding/postgresql-table-partitioning)


