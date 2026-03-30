---
title: 파이썬_sql
created: 2024-01-24
modified: 2024-01-24 12:41
cssclasses:
  - max
tags:
  - python
  - python/sql
  - python/sqlalchemy
---
# PostgreSQL
> [!hint] 연동방법
> `sqlalchemy`와 `psycopg2` 임포트
## 기본 세팅
#### 패키지 불러오기
```python
from sqlalchemy import create_engine, text
import pandas as pd
import psycopg2
from urllib.parse import quote_plus
```
#### DB 정보
> [!summary]
> `sqlalchemy` 패키지의 `create_engine`활용
> 주의 사항: 패스워드에 **특수문자**가 포함될 경우 `quote_plus()`함수 이용하여 변영한 후, engine 연결
- `postgresql+psycopg2://user:password@host:port/dbname`
```python
# 정보입력
user = 'postgres'  
password = quote_plus('Bigvalue1@3$')
host = '10.10.12.181'  
port = '5432'  
dbname = 'dataops'
  
# postgresql 연결  
postgres_engine = create_engine(f'postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}')
```
## DB 내 파일 입출력
#### query로 파일 불러오기
> [!summary] 쿼리문 통해 데이터 불러오기
> `pd.read_sql(query, engine)`  형식
```python
# 쿼리문
query = 'SELECT * FROM schemas.table_name'
# 데이터 불러오기
db_data = pd.read_sql(query, postgres_engine)
```
#### DB에 파일 저장하기
> [!summary]
> `to_sql()` 함수 이용
> 단, DB내에서 미리 `INSERT TABLE`로 생성된 테이블에 저장해야 함
> **열 이름도 동일**하게 지정
- `name`: 저장할 테이블 이름
- `con`: DB 엔진 객체
- `schema`: 테이블을 저장하려는 스키마 이름
- `index`: 데이터프레임 인덱스 저장 여부 > `False`: 저장X
- `if_exits`: 테이블 존재할 경우 동작 결정
	- `replace`: 기존 테이블 삭제하고 새로운 테이블 저장
	- `append`: 기존 테이블 밑에 추가
	- `fail` : 오류 발생 > 동작X
```python
db_data.to_sql(name = 'table_name', con = postgres_engine, if_exits = 'append', index = False, schema = 'schema_name')
```

#### shp 파일 저장하기
> [!hint] geopandas의 to_postgis() 활용
> - **GeoAlchemy2** 패키지 필요
> - 매개변수는 `to_sql()`과 동일

```PYTHON file:shp파일_DB저장
import geopandas as gpd
import

# engine = 'pyogrio' : 더 빠르게 읽을 수 있음
gdf = gpd.read_file('file.shp', engine = 'pyogrio')

gdf.to_postgis('tabl_name', engine, if_exists = 'append', index = False, schema = 'schema_name')
```


## 기타
#### 대용량 DB 불러오기
> [!summary] Tip!
> SQL 쿼리문 중 `LIMIT`와 `OFFSET` 기능 활용하기
> 1. `LIMIT`: 불러들일 행의 개수
> 2. `OFFSET`: 첫 행부터 건너뛸 행의 개수
> 3. `LIMIT 10 OFFSET 20`: 21번째 행부터 10개 행을 출력. 즉, 21~30번째 행 출력

- 전체 자료를 10000개씩 나누어 불러와서 행 결합
```python
# 진행표시모듈 위함
from tqdm import tqdm

# 불러들일 행 개수
chunk_size = 10000
offset = 0
# 반복횟수 모를 때 None
pbar = tqdm(total=None)

df = pd.DataFrame()

try:
	while True:
		query = f'SELECT * FROM schemas.table_name LIMIT {chunk_size} OFFSET {offset}'
		chunk_df = pd.read_sql(query, postgres_engine)

		offset += chunk_size

		if chunk_df.empty:
			break

		df = pd.concat([df, chunk_df], ignore_index = True)

		# tqdm 업데이트
		pbar.update(len(chunk_df))


except KeyboardInterrupt:
	print('Loop interrupted.')

# loop 종료시, tqdm 닫기
finally:
	pbar.colse()
```

#### 기초통계량
> [!summary] 수치형 자료 기초통계량
> `describe()` 함수 활용

```python
# describe() 결과 행과 열 바꾸기
# 열 이름이 행으로 가기
result = df.describe().T.reset_index
result.rename(columns = {'index':'column_name'}, inplace = True)

# null값 계산
# 기존 DB에서 수치형 열만 추출하여 null 값 계산
result['null_count'] = df[result['column_name'].tolist()].isna().sum().tolist()
```

# MySQL
## sqlalchemy
> [!warning] 오류사항
> 기존 query 문 입력방식 지원x
> `text()` 이용하여 query 문 감싸기

```python
from sqlalchemy.sql import text

engine = create_engine('mysql+pymysql://analysisteam:' + 'dudal313~!' + '@dev.c0gqj5ketijm.ap-northeast-2.rds.amazonaws.com:3306/hybridappraisal_dev?charset=utf8')

# 1. engine 연결
conn = engine.connect()

conn.execute(text('use hybridappraisal_dev'))  
conn.execute(text('CREATE TABLE dandoks_info_for_upload LIKE dandoks_info'))  
conn.execute(text('INSERT INTO dandoks_info_for_upload SELECT * FROM dandoks_info'))  
conn.execute(text('TRUNCATE TABLE dandoks_info_for_upload'))

#. with 문 활용
with engine.connect() as connection:  
    connection.execute(text('use hybridappraisal_dev'))  
    connection.execute(text('CREATE TABLE dandoks_info_for_upload LIKE dandoks_info'))
    connection.execute(text('INSERT INTO dandoks_info_for_upload SELECT * FROM dandoks_info'))  
    connection.execute(text('TRUNCATE TABLE dandoks_info_for_upload'))

# 특정 Table 제거 > IF EXISTS 활용
conn.execute(text('DROP TABLE IF EXISTS dandoks_info_for_upload'))
```