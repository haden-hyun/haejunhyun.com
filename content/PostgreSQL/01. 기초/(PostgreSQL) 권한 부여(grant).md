---
title: (PostgreSQL) 권한 부여(grant)
created: 2024-10-28
modified: 2024-10-28 21:35
cssclasses:
  - max
tags:
  - postgresql/권한
  - postgresql/user
  - postgresql/grantor
  - postgresql/grantee
  - postgresql/privilege_type
---
> [!summary] 요약
> - 현재 권한 확인
> - 계정 권한 부여
> 	- 스키마 
> 	- 스키마 내 테이블
> - 테이블 권한 부여 순서 주의!
> 	- 스키마 권한 부여가 최우선
> 	- 그 후 스키마 내 테이블 권한 부여

---
# 1. 사용자 관련
- 사용자 생성 및 삭제
```sql
-- 사용자 생성
create user 사용자명 password '비밀번호'
-- 사용자 삭제
drop user 사용자명
```
---
# 2. 현재 권한 확인
- `grantor`: 권한 부여자
- `grantee`: 권한 대상자
- `table_schema`: 스키마명
- `table_name`: 테이블명
- `privilege_type`: 권한 목록
```sql
select *
from  information_schema.role_table_grants
```
---
# 3. 계정 권한 부여

## 3.1 스키마
- `grant`: 권한 부여
	- `tablespace`: 모든 권한 부여 시 
- `revoke` : 권한 삭제
```sql
-- 특정 스키마 권한 부여
grant all privileges on schema 스키마명 to 사용자명
-- 모든 스키마 권한 부여
grant all privileges on tablespace bv_space to 사용자명
-- 스키마 권한 삭제
revoke all on all tables in schema 스키마명 from 사용자명
```
## 3.2 스키마 내 테이블
```sql
-- 모든 테이블 권한 부여
grant all privileges on all tables in schema 스키마명 to 사용자명
-- 특정 테이블 권한 부여
grant usage on schema 스키마명 to 테이블명
-- 조회권한 만 부여
grant select on all tables in schema 스키마명 to 테이블명
```

---
>[!example] 참고사이트


