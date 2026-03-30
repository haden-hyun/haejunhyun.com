---
title: sql_문자열패턴
created: 2024-02-13
modified: 2024-02-13 13:15
cssclasses:
  - max
tags:
  - sql
  - sql/문자열패턴
---
# 콤마(,) 여부
- 대소문자 비교
	- `like`: 대소문자를 구분하여 매칭. 즉 패턴이 대소문자와 정확히 일치해야함
	- `ilike`: 대소문자 구분하지 않고 매칭. 즉, 대소문자 차이를 무시하고 비교
- 와일드카드(`%, _`)
	- `%`: 임의의 문자열
	- `_`: 임의의 단일 문자
```postgresql
/* col_name에 앞뒤 관계없이 콤마(,) 포함하는 행 */
select * from table where col_name like '%,%'
```