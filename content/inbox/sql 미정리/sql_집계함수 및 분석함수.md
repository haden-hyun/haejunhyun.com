---
title: sql_집계함수 및 분석함수
created: 2024-02-20
modified: 2024-02-20 19:14
cssclasses:
  - max
tags:
  - sql
  - sql/집계함수
  - sql/분석함수
  - sql/postgresql
  - postgresql/over
  - postgresql/집계함수
  - postgresql/partition
  - postgresql/분석함수
  - postgresql/rank
  - postgresql/dense_rank
  - postgresql/row_number
---
# PostgreSQL
## 집계함수
> [!hint] 집계함수
> - 그룹별로 집계하여 결과를 반환
> - 그룹별로 **1개의 행**을 반환

## 분석함수
> [!hint] 분석함수
> - 집계 결과를 각 행마다 보여줌 
> - 그룹 단위로 값이 계산되지만, 결과 Set이 기존에 각 행마다 결과를 보여줌
> 	- 즉, 그룹별 집계 결과를 각 행마다 반환
> - SELECT절에서 수행됨: 쿼리에서 마지막 실행되는 연산 집합
> 	- FROM, WHERE, GROUP BY 절에서 사용 불가
> 	- ORDER BY 구문 사용 가능

#### 주요 구문
- `OVER`: 분석함수 임을 나타냄
- `PARTITION BY`: 계산 대상 **그룹** 지정
	- 그룹별로 함수 값 산출
- `ORDER BY`: 대상 그룹에 대한 정렬 수행
	- `nulls first`: null 값이 맨 먼저 등장
	- `nulls last`(default): null 값이 맨 뒤에 등장
```postgresql
select col1
	, sum(col2) over (partition by group_id) as group_sum
from table1
```
#### 주요 함수
- [참고사이트](https://new-hero.tistory.com/22)
###### 1. `RANK()`
> [!summary]
> - `ORDER BY` 포함한 쿼리 문에서 특정 컬럼에 대한 순위  
> - 동일 값은 동일한 순위를 부여
> - 동일한 순위 다음은 순위 건너뜀
> 	- 예) 순위가 1,1 인 경우 다음 순위는 3

##### 2. `DENSE_RANK()`
> [!summary]
> - `OVER`절의 `ORDER BY` 표현식을 기준으로 그룹에 속한 값의 순위 결정
> - `RANK()` 차이점: 동일한 값은 동일한 순위를 부여하지만, 다음 순위 숫자에 영향을 미치지 않음
> 	- 예) 순위가 1,1 인 경우 다음 순위는 2

###### 3. `ROW_NUMBER()`
> [!summary]
> - 위 두 사례와 차이점:  `RANK(), DENSE_RANK()`가 동일한 값은 동일한 순위를 부여하지만, 이는 동일한 값도 고유한 순위 부여

- 예시 1) 선수 이름별 row_number계산
	- 그룹 대상: 선수 이름(`NAME`)
	- 정렬 대상: 포메이션(`FORMATION`)
	- 해석: 선수이름을 그룹으로 하여 포메이션을 오름차순 했을 때, 선수이름별 순위 부여(단 동일 값도 고유한 순위를 부여)
```sql
select 
	ROW_ID,
	NAME,
	FORMATION,
	ROW_NUMBER() over (partition by name order by FORMATION) AS ROW_NUM
from table
order by ROW_ID
```


| ROW_ID | NAME       | FORMATION | ROW_NUM |
| ------ | ---------- | --------- | ------- |
| 1      | ERIKSEN    | LWF       | 1       |
| 2      | ERIKSEN    | RWF       | 2       |
| 3      | ERIKSEN    | CAM       | 3       |
| 4      | ERIKSEN    | CM        | 4       |
| 5      | KANE       | CF        | 1       |
| 6      | SON        | CF        | 1       |
| 7      | SON        | LWF       | 2       |
| 8      | SON        | RWF       | 3       |
| 9      | SON        | CAM       | 4       |
| 10     | VERTONGHEN | CB        | 1       |
| 11     | VERTONGHEN | LB        | 2       |
- 예시 2) 아파트 코드별 row_number() 계산
	- 그룹 대상: 아파트 코드( `apt_code`)
	- 정렬 대상
		- 1차 순위: 개수(`cnt`)가 높은 것 부터!
		- 2차 순위: 단지키(`complex_key`)가 낮은 것 부터
		- 즉, 개수가 높은 것부터 우선순위를 부여하며, 개수가 동일한 경우에는 단지키가 낮은 것부터 우선순위를 부여함
	- 해석: `apt_code`에 `complex_key`가 여러 개인 경우, 단지키 값이 낮은 것에 우선 순위를 부여함

```postgresql
select *,
		row_number() over (partition by apt_code order by cnt desc, complex_key) as priority
from table
```
