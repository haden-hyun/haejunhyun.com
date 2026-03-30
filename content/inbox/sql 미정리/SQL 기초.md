---
title: SQL 기초
created: 2023-11-24
modified: 2023-11-24 22:42
cssclass: max
tags: 데이터베이스, DB, sql, 데이터베이스/sql
---
## 데이터베이스의 언어
> [!tip] 사용자와 상호작용하는 질의 언어
> 데이터의 구조를 정의, DB의 데이터를 수정, 보안 및 제약 조건을 명시하기 위한 언어

Structured Query Language(SQL)
- 데이터 정의 언어(DDL)
- 데이터 조작언어(DML)
- 무결성(Integrity)
- 뷰 정의(View Definition)
- 트랜잭션 제어(Transaction control)
- 내장 SQL(Embedded SQL)
- 인증(Authorization)
#### 데이터 정의 언어(DDL)
1. 릴레이션의 명세를 허용
- 각 릴레이션의 스키마
- 각 속성에 연관한 값들의 도메인
- 무결성 제약조건
- 각 릴레이션에 정의된 색인
- 각 릴레이션에 해당하는 보안 및 권한
- 각 릴레이션이 실제 정의된 물리적 스토리지의 위치 등

2. 테이블의 관계 및 구조를 생성
주요 연산자
- `CREATE`
- `ALTER`
- `DROP`
#### 데이터 조작 언어(DML)
데이터베이스에 대한 조작(검색, 등록=삽입, 삭제, 갱신 등) 연산을 명세
주요 연산자
- `INSERT`
- `DELETE`
- `UPDATE`
- `SELECT` :특히 질의어(query language)에 사용되는 연산
#### CREATE TABLE 문
> [!tldr] 릴레이션을 정의함
> create table r($A_{1}D_{1}, A_{2},D_{2},...,A_{n}D_{n}$, (integrity - constraint))
> - $r$: 릴레이션 이름
> - $A_{i}$: 릴레이션 $r$의 스키마에 포함된 모든 속성명
> - $D_{i}$: 속성 $A_{i}$에 해당하는 도메인의 데이터 타입

- 교수 릴레이션에 ID, 이름, 학과명, 연봉의 스키마 생성하기
```sql
create table instructor(ID char(5),
					   name varchar(20),
					   dept_name varchar(20),
					   salary numeric(8,2))
```
- 무결성 제약조건
	- 쉼표(`,`)로 구분하여 나열
	- 기본키, 외래키 제약조건
- primary key($A_{m}$, ..., $A_{n}$)
	- 기본키에 해당하는 속성 집합 정의
	- 기본키는 not null을 보장
- foreign key($A_{m}$, ..., $A_{n}$) references $r$
	- 외래키에 해당하는 속성 집합의 정의

- 교수 릴레이션을 생성하는데,기본키는 $ID$로 설정하고 외래키는 $department$릴레이션을 참고하여 $dept\_name$으로 설정
- 외래키가 2개 이상이 될 수 있음
- 기본키에 포함하는 속성($ID$)이 외래키가 될 수 있음
```sql
create table instructor(
ID char(5),
name varchar(20) not null,
dept_name varchar(20),
salary numeric(8,2),
primary key (ID),
foreign key (dept_name) reference department);

create table takes(
ID varchar(5),
course_id varchar(8),
sec_id varchar(8),
semester varchar(8),
year numeric(4,0),
grade varchar(2),
primary key (ID, course_id, sec_id, semester, year),
foreign key (ID) references student,
foreign key (course_id, sec_id, semester, year) references section);
```
#### 데이터베이스의 변경
> [!tip] INSERT, DELETE, DROP TABLE, ALTER TABLE

- `INSERT` 문은 새로운 튜플 인스턴스를 테이블에 삽입
	- `CREATE TABLE`은 빈 테이블을 생성하고, `INSERT`를 통해 테이블을 채움
	- 예) `insert into instructor values('10211','Smith','Biology',66000);`
- `DELETE`문은 테이블의 튜플을 삭제
	- 조건이 없는 경우 모든 튜플(행)을 삭제
	- 보통 `when` 조건문을 사용하여 삭제
	- 예) `delete from student`
- `DROP TABLE`문은 테이블(릴레이션)을 삭제
	- 예) `drop table r`
- `ALTER TABLE` 문은 새로운 속성의 삽입 또는 삭제 = 열 생성 및 삭제
	- 예) `alter table r add A D`: 추가된 열의 값들은 `NULL`
	- 예) `alter table r drop A`: 해당 속성(A 열) 제거

## 데이터베이스 질의 구조
> [!tip] 전형적인 SQL 질의의 구조
> `select A, B, C from r1, r2,r3 where P`
> - $A, B, C$: 속성(=열)
> - $r1,r2,r3$: 릴레이션(=테이블)
> - $P$: 서술어(=조건)
> - 질의 결과는 릴레이션

#### SELECT 문: SELECT 절(clause)과 FROM 절
- `SELECT`절은 질의 결과에 요구되는 속성(=열)들의 이름을 서술
	- 관계 대수의 프로젝션 연산 대응
	- 대/소문자 구분
- `FROM`절은 질의의 대상이 되는 릴레이션(=테이블)의 이름을 서술
- 예) 모든 강사의 이름을 찾아라
	- `select name from instructor`
- 질의 결과는 중복이 허용됨
	- SQL 질의 결과는 릴레이션이지만, 여기서 집합이 아님!!!
	- 중복 제거에 대한 명시적인 서술이 필요!!! 
		- `distinct`: 중복 제거
			- `select distinct dept_name from instructor`
		-  `all`(기본값): 중복 허용
			- `select all dept_name from instructor`
- asterisk 심볼(= $*$ )로 모든 속성 나열 명세 가능
	- 예) 강사 릴레이션에서 모든 정보
		- `select * from instructor`
- `SELECT`절에 속성 명 대신 문자 그대로 출력 가능
	- 행 개수에 맞춰 문자열 생성을 위함
	- `select '437'`: 속성 값도 437
- `SELECT`절에 수식 연산 포함 가능
	- `select ID, name, salary/12 from instructor`
- `as`연산자를 통해 속성명 변경
	- `A as B` 기존의 속성 $A$ 를 $B$로 변경
	- `select ID, name, salary/12 as monthly_salary from instructor`
	- 종종 `as`절 생략 가능한 DBMS도 존재
#### WHERE 절
> [!tldr] 질의의 결과를 도출하기 위한 조건 서술
> 관계대수의 **셀렉션 연산**에 대응

- 논리적 연산자 도입 가능
	- 예) 컴퓨터과학과(조건1)에서 연봉이 8만불 넘은(조건2) 모든 강사의 이름을 찾아라
	- 조건이 여러개인 경우 `and` 연산자 **활용**
	- `select name from instructor where dept_name = 'Comp. Sci.' and salary > 80000`
#### FROM 절
> [!tldr] 질의에 관여하는 모든 릴레이션의 나열 서술
> 관계 대수의 **카테시안 곱 연산자**와 대응

- 예) instructor 릴레이션과 teaches 릴레이션의 카테시안 곱
	- *join*과 같지만, 불필요한 정보가 많이 생성됨
	- `select * from instructor, teaches`

#### 조인(Join) 연산
> [!tldr] 두 개 이상의 릴레이션을 동시에 연관하는 연산을 작성
> 관계대수의 카테시안 곱 연산자에 연관 조건 추가

- 예) 컴퓨터과학과에서 제공하는 각 강의별 강의번호, 학기, 연도, 강의명 나열하라
	- 카테시안 곱: section, course 각 릴레이션을 join
	- 연관 조건: 각 릴레이션의 course_id(속성)을 기준으로 join
	- `where section.course_id=course.course_id`
```sql
select course_id, semester, year, title
from section, course
where section.course_id = course.course_id and dept_name = 'Comp. Sci.'
```
#### 문자열 연산
SQL은 문자열 매칭을 위한 연산자를 제공하여, 문자열 간 비교가 가능하며, 대/소문자를 구분함
- `LIKE`연산자
	- 와일드카드 활용하여 속성에 특정 문자열 패턴 존재여부 조건을 서술
	- `%`(percent): 문자열 매칭으로 임의 개수를 의미함
		- `'Intro%'`: Intro로 시작하는 문자열 대응
		- `'%Comp%'` : Comp를 포함하는 문자열 대응
	- `_`(underscore): 개수 매칭
		- `'___'`: 정확하게 3개의 문자로 이루어진 문자열 대응
		- `'___%'` : 적어도 3개 이상의 문자로 이루어진 문자열 대응
- 예) 'dar' 라는 문자를 포함하는 강사의 이름을 찾아라
	- `'%dar%'` 문자열 중 앞 뒤 관계없이 'dar'을 포함하는 문자열
```sql
select name from instructor
where name like '%dar%';
```
#### 순서화 연산
주어진 속성에 대해 알파벳 순/ 오름차순으로 튜플의 순서를 정해서 출력 가능
- `order by`연산자
	- `desc` : 내림차순
	- `asc` : 오름차순(기본값)
- 두개 이상의 속성을 사용하여 추가적인 순서화 가능
- 예) 모든 강사의 이름을 학과 이름과 강사 이름을 내림차순으로 출력하라
```sql
select distinct name from instructor
order by dept_name, name desc;
```
#### WHERE 절의 다양한 서술어 
- `between`: 크기 비교 연산자를 동시에 사용하는 것과 동등
	- 예) 연봉 9만불 이상, 10만불 이하인 모든 강사의 이름
```sql
select name from instructor
where salary between 90000 and 100000
```
- 튜플 단위 비교 연산
	- 교수와 강의를 ID를 기준으로 join후, dept_name이 'Biology'인 강사의 이름과 수업 코드 출력
```sql
select name, course_id from instructor, teaches
where (instructor.ID, dept_name) = (teaches.ID, 'Biology');
```
- 집합연산자(`union`,`intersection`,`except`)
	- `union`: 합집합
	- `intersection`: 교집합
	- `except`: 차집합
	- 기본적으로 중복을 제거함
		- 중복을 제거하지 않고 싶은 경우
		- `all`연산자 활용: `union all`, `intersection all`, `except all`
```sql
# 1. 2009년 가을 또는 2010년 봄에 개설된 모든 강의
(select course_id from section where sem = 'Fall' and year = 2009)
union
(select course_id from section where sem = 'Spring' and year = 2010)
# 2. 2009년 가을과 2010년 봄에 개설된 모든 강의
(select course_id from section where sem = 'Fall' and year = 2009)
intersect
(select course_id from section where sem = 'Spring' and year = 2010)
# 3. 2009년 가을에는 개설되었지만, 2010년 봄에는 개설되지 않은 모든 강의
(select course_id from section where sem = 'Fall' and year = 2009)
except
(select course_id from section where sem = 'Spring' and year = 2010)
```
- `select distinct`와 `select`의 차이
	- `DISTINCT`연산자: 중복 튜플 제거
```sql
# 예1) 모든 강사의 연봉을 찾아라(단, 동일 연봉 중복 제거)
select distinct salary from instructor
# 예2) 최고 연봉 제외하고 그보다 적은 연봉을 모두 출력: 동일한 릴레이션을 복사하고, 릴레이션 간 비교
select distinct T.salary 
from instructor as T, instructor as S
where T.salary < S.salary
# 예3) 차집합을 이용하여 최고 연봉을 출력해라: 전체 연봉에서 최고 연봉 제외한 연봉자료 빼기
(select distinct salary from instructor)
except
(select distinct T.salary from instructor as T, instructor as S where T.salary < S.salary)
```
- NULL에 관하여
	- `is null` 주어진 속성 값이 NULL인지 확인
	- 예) 연봉이 Null인 모든 강사의 이름
		- `select name from instructor where salary is null`
	- 특성: NULL을 포함한 수학 연산의 결과는 NULL
	- 비교 연산의 활용: 결과가 true, false에 추가적으로 unknown 표현 가능
		- NULL 포함한 모든 비교 연산 결과는 unknown
	- 논리 연산자(OR, AND, NOT)
		- OR
			- `(unknown or true) = true`
			- (unknown or false) = unknown
			- (unknown or unknown) = unknown
		- AND
			- `(false and unknown) = false`
			- (true and unknown) = unknown
			- (unknown and unknown) = unknown
		- NOT
			- `(not unknown) = unknown`
	- WHERE 절 서술한 연산의 결과가 Unknown으로 표현되는 경우, WHERE절의 조건 = FALSE로 간주함
## 집계 함수
> [!tldr] 질의의 중간 연산 결과가 집합인 경우 적용가능한 집계 함수 제공
> `AVG`, `MIN`, `MAX`, `SUM`, `COUNT`

```sql
# 예1) 컴퓨터 과학과 소속 강사 평균 연봉 구하라
# 결과값: 단일 행,열인 단일값을 갖는 릴레이션
select avg (salary) from instructor where dept_name = 'Comp. Sci.';
# 예2) 2020 봄학기 강의한 모든 강사의 인원수를 구하라
select count (distinct ID) from teaches where semester = 'Spring' and year = 2020;
# 예3) Course 릴레이션의 튜플 개수
select count (*) from course;
```
#### Group By (군집화) 절
> [!tldr] 집계 연산의 결과를 집계 대상이 된 집합(군집)에 대응된 항목으로 정리
> `group by` 절의 열 이름도 `select` 절에 있어야 연관정보를 확인할 수 있음

- 예) 교수 릴레이션에서 학과별 평균 연봉을 구하고 평균 연봉의 이름을 'avg_salary'로 변경
	- 작동 순서: 그룹을 먼저 만든 후, 집계 연산이 작동됨
	- 따라서, 집계연산(`avg`)이 `select`절에 포함됨
```sql
select dept_name, avg (salary) as avg_salary from instructor
group by dept_name;
```
#### HAVING (군집 조건) 절
> [!tldr] 군집에 대응된 집계 연산의 결과가 만족해야 하는 조건 서술
> `having`절 내 서술어는 군집이 형성된 후 적용됨
> 반면에, `where` 절 내 서술어는 군집 형성 이전에 적용

- 예) 모든 학과 평균 연봉 계산하고, 해당 평균 연봉이 42000불보다 많은 학과명 나열
	- 조건절의 대상이 군집이 아닌 경우에는 `where`
```sql
select dept_name, avg (salary) from instructor
group by dept_name
having avg (salary) > 42000;
```
#### 집계연산과 NULL
> [!tldr] count 집계 연산을 제외하고, 모든 집계 연산은 null 값을 무시하고 연산을 수행
> `count`는 개수에 관한 집계 연산으로 Null 값을 포함해도 개수에 포함됨
- 모든 값이 Null인 경우(행의 값이 전부 null)
	- `count`도 0으로 출력
	- 그 외 모든 집계 연산자는 Null
- 예) 강사의 연봉을 모두 더함: `select sum (salary) from instructor;`
	- 위 연산은 Null로 표현된 salary 속성은 모두 무시한 상태에서 연봉의 총합 출력
	- 모든 강사의 연봉이 null이면, 결과도 Null
## 중첩 질의(Nested query)
> [!info] 질의는 외부 질의(outer query)와 내부 질의(inner query)로 구분하여 내부 질의를 subquery라고 함
> subquery의 형태도 `SELECT-FROM-WHERE` 의 효현형 가진 일반 질의와 동일

`select` $A_{1}, A_{2}, ..., A_{m}$
`from` $r_{1}, r_{2},...,r_{m}$
`where` $P$
- $A_{i}$: 단일 값을 출력하는 subquery로 대체 가능
- $r_{i}$: 정당한 (valid) subquery로 대체 가능
- $P$: 속성 $B$와 subquery 및 그 둘 간 연산자를 포함하여 대체 가능
	- $B$ $<operation>$ (subquery)
	- 집합 포함 여부 조건 확인(membership) - `in`
	- 집합 동일 여부 조건 확인(comparison) - `some`, `all`
	- 집합 크기 비교 조건 확인(cardinality) - `exist`
#### Set membership - 포함 여부
> [!tldr] 내부 질의의 결과 특성과 외부 질의의 조건 특성과 호환성을 맞춰야함
> 내부 질의의 `SELECT` 절 = 외부 질의의 `WHERE`절

- 예 1) 2009년 가을(=outer query)과 2010년 봄(=inner query)에 제공된 강의 모두 찾아라 
	- inner query의 결과가 outer query의 조건문에 들어감(course_id)
```sql
select distinct course_id from section
where semester = 'Fall' and year = 2009 and
	course_id in (select distinct course_id from section 
					where semester = 'Spring' and year = 2010);
```
- 예 2) 강사번호가 10101인 강사가 가르친 강의(=ineer query)를 수강한 학생 수를 중복 없는 총 인원수(=outer query)를 계산
	- inner query의 조건을 만족하는 결과의 포함 여부가 outer query의 조건
```sql
select count (distinct ID) from takes
where (course_id, sec_id, semester, year) in
	(select course_id, sec_id, semester, year from teaches
	where teaches.ID = 10101);
```
#### Set comparison - 동일 여부
- `some`의 결과 중 하나라도 만족하면 TRUE
	- `some`이 `in`과 같은 역할을 할 수 있지만, not `some`이 not `in`이 되진 않음
	- 0,5가 있는 경우, `5=some`은 조건을 만족하여 `5=in`과 동일하게 적용
	- 그러나, `5 != some`인 경우에도 0으로 인해 TRUE이지만, `5 != in`은 FALSE라서 동일하게 적용되지 않음
- 예) 최소 연봉을 제거한 생물학과의 강사의 이름을 출력하시오
	- 첫 명령문을 `some` 절을 사용하여 작성 가능
	- 생물학 교수의 연봉 정보(=inner query)보다 큰 생물학과의 교수 이름
```sql
select distinct T.name from instructor as T, instructor as S 
where T.salary > S.salary and S.dept_name = 'Biology';

select name from instructor where salary > some 
	(select salary from instructor where dept_name = 'Biology');
```
- `all` 모든 결과가 만족해야 TRUE
	- `not all`은 `not in`과 같은 역할을 할 수 있지만, `all`이 `in`되진 않음
	- 4,6이 있는 경우, `5 not all`은 조건을 만족하여 TRUE이며, `5 not in`도 동일하게 적용
	- 그러나, 4,5가 있는경우, `5 = all`은 조건을 만족하지 못해 FALSE지만, `5=in`은 조건을 만족하여 TRUE
- 예) 생물학과 강사 중 최고 연봉 받는 강사보다 더 많은 연봉을 받는 강사
```sql
select name from instructor where salary > all 
	(select salary from intsructor where dept_name = 'Biology');
```
#### Set cardinality - 비교 여부
- `NOT EXIST`연산자
- 예) 생물학과 제공된 모든 강의를 수강한 학생을 모두 구하라
	- outer query의 조건: sub query의 결과가 공집합(not exist)인 경우
	- outer query에서 선언한 것($S$)도 sub query에서 사용 가능함
	- sub query 내용: 생물학과 모든 강의 - 학생이 수강한 강의
		- 즉, 학생이 생물학과의 모든 강의를 수강했다면, sub query의 결과가 공집합
```sql
select distinct S.ID, S.name from student as S
where not exist (
	(select course_id from course where dept_name = 'Biology') except
	(select T.course_id, from takes as T where S.ID = T.ID)
);
```
#### FROM 절에서 sub query
- 예) 42000불보다 평균 연봉이 높은 부서를 찾아서 부서명과 평균 연봉을 출력하라
```sql
select dept_name, avg_salary
from (select dept_name, avg (salary) as avg_salary from instructor group by dept_name)
where avg_salary > 42000;

select dept_name, avg_salary
from (select dept_name, avg (salary) from instructor group by dept_name) as dept_name, avg_salary
where avg_salary > 42000;
```
#### WITH 절
> [!tldr] 질의를 실행하는 상황에서만 제공하는 임시 릴레이션의 정의
> 질의의 결과를 재사용하기 위함

- 예) 예산이 가장 많은 학과를 찾으시오
	- `WITH`절을 활용하여 max_budget 릴레이션을 생성하고 특성 이름이 value이며, 특성 값이 sub query의 결과(예산 최대값)
```SQL
with max_budget (value) as (select max (budget) from department)
select department.name from department, max_budget
where deprtment.budget = max_budget.value
```
- 예) 총 연봉이 모든 학과의 총 연봉의 평균보다 높은 학과를 모두 고르시오
	- 임시 릴레이션 2개 생성(`dept_total, dept_total_avg`)
		- `dept_total`: 특성이 2개(학과명, 학과별 총 연봉)
		- `dept_total_avg`: 특성이 1개(`dept_total`릴레이션의 평균)
		- 
```sql
with dept_total (dept_name, value) as (select dept_name, sum(salary) from instructor group by dept_name),
	dept_total_avg (value) as (select avg(value) from dept_total)
select dept_name from dept_total, dept_total_avg
where dept_total.value > dept_total_avg.value;
```
## DML 연산자 활용 예시 (DELETE, INSERT, UPDATE 등)
- 모든 강사 삭제
	- `delete from instructor`
- 재무학과 모든 강사 삭제
	- `delete from instructor where dept_name = 'Finance';`
- 왓슷 빌딩 위치한 학과의 강사와 정보를 가진 강사 테이블의 모든 튜플 삭제
```sql
delete from instructor
where dept_name in (select dept_name from department where building = 'Watson');
```
- 강사 평균 연봉보다 적게 받는 강사들 삭제
	- 강사 삭제시 평균 연봉 변화 생기지 않음(질의 수행마다 평균 연봉 계산x)
	- 즉, 평균 연봉을 먼저 구한 후 튜플이 삭제됨
```sql
delete from instructor
where salary < (select avg(salary) from instructor);
```
- Course 테이블에서 새로운 튜플 만드시오
	- `insert into course values('CS-437', 'Database Systems', 'Comp. Sci.', 4);`
- 모든 강사에 대해 이수학점을 0으로 초기화해서 student 테이블로 삽입
	- query의 결과를 새로운 릴레이션에 넢을 수 있음
	- `select`문의 결과는 다른 테이블 삽입 이전에 모든 실행 완료
		- `insert into table1 select * from table1`
```sql
insert into student
select ID, name, dept_name, 0 from instructor
```
- 연봉 10만 불 넘는 강사는 3% 인상, 그 외 5%인상하여 연봉을 상향 조정하시오
	- 갱신(`update`)은 순서가 중요함
		- `case`연산자를 통해 작성
		- 잘못된 query: 99999불 값이 5% 인상하면, 다음 조건문에 영향을 미침
```sql
# 잘못된 예
update instructor set salary = salary * 1.03 where salary > 100000;
update instructor set salary = salary * 1.05 where salary < 100000;
# case 연산자 활용
update instructor set salary = case 
	when salary <= 100000 then salary * 1.05
	else salary * 1.03
end;
```




