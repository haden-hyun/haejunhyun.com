---
title: (PostgreSQL) 공백 및 특정 문자 제거
created: 2025-07-14
modified: 2025-07-14 23:46
cssclasses:
  - max
tags:
  - postgresql/trim
  - postgresql/ltrim
  - postgresql/rtrim
  - postgresql/trim_scale
  - postgresql/coalesce
---
> [!summary] 요약
> - `trim` 은 맨 앞 또는 맨 뒤에 연속된 공백 및 특정 문자를 제거할 때 사용
> 	- 문자열 중간에 공백 및 특정 문자를 제거하지는 못함

---
# 1. 공백 제거
- `trim`: 문자열 중간이 아닌 **양쪽 끝의 공백**만을 제거할 때 활용
	- `ltrim`: 왼쪽 공백 제거
	- `rtrim`: 오른쪽 공백 제거
- `replace`: 문자열 내 **모든 공백**을 제거하고 싶은 경우, `replace`를 활용

| 함수                             | 기능                               | 결과         |
| ------------------------------ | -------------------------------- | ---------- |
| `trim('   abc   ')`            | 양쪽 공백 제거                         | `'abc'`    |
| `ltrim('   abc   ')`           | 왼쪽 공백 제거                         | `'abc   '` |
| `rtrim('   abc   ')`           | 오른쪽 공백 제거                        | `'   abc'` |
| `replace(' a  b c ', ' ', '')` | 문자열 내 모든 공백 제거(= 공백을 모두 빈칸으로 대체) | `abc`      |

---
# 2. 특정 문자 제거

> `trim(option '제거할 패턴' from '제거 대상 문자열')`
- `trim`의 옵션을 활용하여, 문자열 양쪽 끝에 위치한 특정 문자열 제거
- `option`
	- `trailing`: ==뒤 따라온다== 로 패턴을 만족하는 문자열의 **뒷**부분을 제거
	- `leading`: ==앞 서다== 로 패턴을 만족하는 문자열의 **앞**부분을 제거
	- `both`: 패턴을 만족하는 문자열의 **양쪽** 부분을 모두 제거

```sql
select trim(trailing '-' from '----abc----') -- '----abc'
select trim(leading '-' from '----abc----') -- 'abc----'
select trim(both '-' from '----abc----') -- 'abc'
```

## 2.1 예시

- 지번 주소에서 `번지` 앞 또는 뒷 부분만 가져올 때 활용
- `trim()`: 번지로 끝나는 경우에 활용 가능
- `regexp_split_to_array()` 번지 뒤에 다른 주소가 있는 경우 정규표현식 활용(참고: [[inbox/sql 미정리/정규표현식]])

```sql
-- 지번 주소 중 번지 앞 부분만 가져오기
select trim(trailing '번지' from '서울특별시 관악구 신림동 611-171번지') -- 서울특별시 관악구 신림동 611-171
select (regexp_split_to_array('서울특별시 동작구 신대방동 607-28번지 206호', '번지'))[1] -- 서울특별시 동작구 신대방동 607-28
```

---
# 3. 수치형 자료인 경우
> `trim_scale()` 활용

## 3.1 예시
- 정수값이었으나 실수형 데이터 타입으로 인해 생긴 소수점 이하 0들을 제거하기 위함
```sql
select trim_scale(234.0000) -- 234
```

---
>[!example] 참고사이트
>- [trim 함수에 대해 간단히 알아봅시다](https://codingdog.tistory.com/entry/postgresql-trim-%ED%95%A8%EC%88%98%EC%97%90-%EB%8C%80%ED%95%B4-%EA%B0%84%EB%8B%A8%ED%9E%88-%EC%95%8C%EC%95%84%EB%B4%85%EC%8B%9C%EB%8B%A4)


