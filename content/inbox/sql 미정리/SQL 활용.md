---
title: SQL 활용
created: 2023-12-01
modified: 2023-12-01 14:32
cssclass: max
tags: 데이터베이스, DB, sql, 데이터베이스/sql
---

## Join 연산 활용
> [!tldr] 조인 연산 - 입력값: 2개 릴레이션, 출력값: 또 다른 1개의 릴레이션
> Subquery 표현을 통해 from절에서 사용

- 예) 컴퓨터과학과에서 제공하는 각 강의별로 강의번호, 학기, 연도, 강의명 나열
```sql
select course_id, semester, year, title
from section, course
where section.course_id = course.course_id and dept_name = 'Comp. Sci.';
```
#### 외부 조인(Outer Join)
> [!tldr] 기본 조인 연산을 확장하여, 정보의 유실을 회피할 수 있음
> 조인되지 않고 남은(=매칭되는 속성이 없는) 튜플들에 한해서 Null 값을 활용하여 결과에 포함

- Join condition
	- 두 릴레이션 매치 조건 정의
	- 조인 연산 결과에 포함 속성 정의
- Join type
	- 각 릴레이션에서 매치하지 않는 튜플 다루는 방식
- 활용
	- `FROM` 절:  릴레이션 나열
	- `WHERE` 절: 조건 서술
	- 명시적으로는, Join type을 명시하고 `ON` 서술어와 함꼐 `FROM` 절에 사용
- 예
```sql
course inner join prereq on
course.course_id = prereq.coures_id
```
- 단, 조인의 조건으로 활용된 `coures_id`는 조인 결과에 중복 정보
	- 이러한 중복 정보를 자연스럽게 제거해주는 연산이 `natural join`
- 예) Course, preq 릴레이션
![[Pasted image 20231201150225.png]]
- 왼쪽 외부 조인(Left outer join): Course 릴레이션의 course_id가 기준
```sql
course natural left outer join prereq on
coures.course_id = prereq.coures_id
```

| course_id | title       | dept_name  | credits | prereq_id |
| --------- | ----------- | ---------- | ------- | --------- |
| BIO-301   | Genetics    | Biology    | 4       | BIO-101   |
| CS-190    | Game Design | Comp. Sci. | 4       | CS-101    |
| CS-315    | Robotics    | Comp. Sci. | 3       | null      |

- 오른쪽 외부 조인(Right outer join): Preq 릴레이션의 course_id가 기준
```sql
coures natural right outer join prereq on
coures.coures_id = prereq.coures_id
```

| course_id | title       | dept_name  | credits | prereq_id |
| --------- | ----------- | ---------- | ------- | --------- |
| BIO-301   | Genetics    | Biology    | 4       | BIO-101   |
| CS-190    | Game Design | Comp. Sci. | 4       | CS-101    |
| CS-347    | null        | null       | null    | CS-101      |
- 양쪽 외부 조인(Full outer join): 두 릴레이션의 coures_id 모두 활용
```sql
course full outer join prereq using (coures_id)
```

| course_id | title       | dept_name  | credits | prereq_id |
| --------- | ----------- | ---------- | ------- | --------- |
| BIO-301   | Genetics    | Biology    | 4       | BIO-101   |
| CS-190    | Game Design | Comp. Sci. | 4       | CS-101    |
| CS-315    | Robotics    | Comp. Sci. | 3       | null      |
| CS-347    | null        | null       | null    | CS-101          |
## 뷰(View)
> [!tldr] 특정 사용자들에게 릴레이션 일부를 가리고 일부만 보여주는 방식
> 모든 사용자에게 DB의 논리적인 구조를 모두 보여줄 필요 없음
> 열람 권한, 개인정보 보안 등의 문제

- 뷰 정의
	- `CREATE VIEW` 문 사용
	- `create view v as <query expression>`
- 뷰 한번 정의되면, 뷰의 이름 통해서 참조 가능
```sql
# 예 1) 연봉 제외한 생물학과 교수 뷰
create view faculty as
	select ID, name, dept_name from instructor
	where dept_name = 'Biology';
# 예 2) 총 연봉 보여주는 뷰 정의
# 새로운 릴레이션을 정의하여 뷰
create view department_total_salary(dept_name, total_salary) as
	select dept_name, sum(salary) from instructor
	group by dept_name;
```





