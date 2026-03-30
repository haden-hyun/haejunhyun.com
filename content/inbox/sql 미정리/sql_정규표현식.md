---
title: sql_정규표현식
created: 2024-03-12
modified: 2024-03-12 10:35
cssclasses:
  - max
tags:
  - sql/postgresql
  - postgresql/정규표현식
  - postgresql/regexp_substr
  - postgresql/regexp_replace
---
## 문자열 교체(regexp_replace)

`regexp_replace(source, pattern, replacement_string, flag)`
- `source`: 원본 데이터
- `pattern`: 찾을 패턴
- `replacement_string`: 변경할 내용
- `flag`
	- `g` : 전체 데이터 범위를 Replace
	- 생략: 첫번째 발견한 데이터 1개만 replace
예시)
- `select regexp_replace('A1B2C3', '[0-9]', '', 'g');`  : ABC
	- 숫자에 해당하는 문자열 전체 공백으로 변경
- `select regexp_replace('A1B2C3', '[0-9]', '');` AB2C3
	- 숫자에 해당하는 첫번째 문자열만 공백으로 변경
- `select regexp_replace('A1B2C3', '[^0-9]', '', 'g');`
	- 문자에 해당하는 문자열 전체를 공백으로 변경
- `select regexp_replace('A1B2C3', '[^0-9]', '');`
	- 문자에 해당하는 첫번째 문자열만 공백으로 변경
- `select regexp_replace('산508-1대', '[ㄱ-ㅣ가-힣]', '', 'g')`
- `select regexp_replace('산508-1대', '[ㄱ-ㅣ가-힣]', '', 'g')`

```postgresql file:regexp_replace.sql
select regexp_replace('A1B2C3', '[0-9]', '', 'g');  
select regexp_replace('A1B2C3', '[^0-9]', '', 'g');  
select regexp_replace('A1B2C3', '[0-9]', '');  
select regexp_replace('A1B2C3', '[^0-9]', '');
```


#### 자주 쓰는 정규식
```postgresql file:정규표현식.sql
-- 숫자를 전부 특정 문자로 변경 ( 중간에 .이 들어간 소수는 뒷자리 변경안됨 )
select regexp_replace([컬럼명], '[[:digit:]]+', [변경값]) from [테이블명];

-- 숫자를 제외한 모든(문자/특수문자)를 제거 
select regexp_replace([컬럼명], '\D', [변경값], 'g') from [테이블명];

-- 특수문자 제거
SELECT regexp_replace([컬럼명], '[^a-zA-Z]', '') FROM [테이블명];
```

## 문자열 추출(regexp_substr)
`regexp_substr(string, pattern)`

- `select regexp_substr('서울특별시 관악구 낙성대동 247-5', '[^ ]+시 [^ ]+구|[^ ]*군');`: 서울특별시 관악구
- `select regexp_substr('경상북도 예천군 호명읍 복대리 425-2', '[^ ]+시 [^ ]+구|[^ ]*군');`: 예천군

###### 지번주소를 활용한 시도/시군구/읍면/동리/본번/부번 구분
> [!warning] 시군구 주의점
> - 시도가 '도'일 경우에는 시 구 또는 군 추출
> 	- 예) 경기도 부천시 소사구 > 부천시 소사구
> 	- 예) 경상북도 예천군 호명읍 > 예천군
> - 시도가 '시'일 경우에는 구 또는 군
> 	- 예) 서울특별시 종로구 > 종로구

- postgresql
	- 시군구, 지번 적용유의
	- `split_part(string, pattern, n)`: 패턴으로 구분했을 때, n번째 등장하는 문자열
	- 지번
		- pnu 기준 4자리 0으로 채울지에 따라 다름
		- `lpad(a_string, n, b_string)`: a_string을 n자리로 만들며, 앞에 string으로 채움
			- 예) `lpad('23', 4, '0')` > `0023`
		- 위와 같은 경우, `-` 기준으로 분리한 후 `lpad` 함수를 통해 
```sql
select regexp_substr(address, '[^ ]+시|[^ ]+도') 
			as sido_name,
		case
			when regexp_substr(split_part(address, ' ', 1), '[^ ]+시') is not null
				then regexp_substr(address, '[^ ]+구')
			when regexp_substr(split_part(address, ' ', 1), '[^ ]+도') is not null
				then regexp_substr(address, '[^ ]+시 [^ ]+구|[^ ]+군')
			end as sigungu_name,
		regexp_substr(address, '[^ ]+읍|[^ ]+면') 
			as upmyun_name,
		regexp_substr(address, '[^ ]+동|[^ ]+리|[^ ]+가|[^ ]+로')
			as dongri_name,
		split_part(regexp_substr(address, '\d+-\d+'), '-', 1) 
			as bunji1,
		lpad(split_part(regexp_replace(address, '[^-0-9]', '', 'g'), '-', 1), 4,'0')  
    as bunji1_fill,	
		split_part(regexp_substr(address, '\d+-\d+'), '-', 2)
			as bunji2,
		lpad(split_part(regexp_replace(address, '[^-0-9]', '', 'g'), '-', 2), 4,'0')  
    as bunji2_fill
from table
```

- mysql
	- `substring_index(string, pattern, n)`:  패턴으로 구분했을 때, n번째 등장하는 문자열
```mysql
select regexp_substr(address, '[^ ]+시|[^ ]+도') 
			as sido_name,
		case
			when regexp_substr(substring_index(address, ' ', 1), '[^ ]+시') is not null
				then regexp_substr(address, '[^ ]+구')
			when regexp_substr(substring_index(address, ' ', 1), '[^ ]+도') is not null
				then regexp_substr(address, '[^ ]+시 [^ ]+구|[^ ]+군')
			end as sigungu_name,
		regexp_substr(address, '[^ ]+읍|[^ ]+면') 
			as upmyun_name,
		regexp_substr(address, '[^ ]+동|[^ ]+리')
			as dongri_name
from table
```

## 특정문자 채우기(LAPD)

```postgresql
select lpad()
```


## 특정 문자 앞 자르기(regexp_split_to_array)

> [!hint] 활용방법
> 특정 문자를 기준으로 문자열을 분리할 때 사용
> 예) '서울특별시 관악구 신림동 611-171번지 푸르미르빌 402호' 지번 주소를 '번지'를 기준으로 앞 뒤 자르기
> 결과) 서울특별시 관악구 신림동 611-171, 푸르미르빌 402호
> 단, 번지 뒤에 공백이 있음!


```postgresql file:regexp_split_to_array.sql
select regexp_split_to_array('서울특별시 관악구 신림동 611-171번지 푸르미르빌 402호', '번지')

# 번지 앞 부분 가져오기
select (regexp_split_to_array('서울특별시 관악구 신림동 611-171번지 푸르미르빌 402호', '번지'))[1]
# 번지 뒷 부분 가져오기
select (regexp_split_to_array('서울특별시 관악구 신림동 611-171번지 푸르미르빌 402호', '번지'))[2]

# 앞 뒤 공백 제거
select trim((regexp_split_to_array('서울특별시 관악구 신림동 611-171번지 푸르미르빌 402호', '번지'))[2])
```

