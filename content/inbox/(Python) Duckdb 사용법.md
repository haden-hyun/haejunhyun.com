---
title: (Python) Duckdb 사용법
created: 2025-11-26
modified: 2025-11-26 18:44
cssclass: max
tags: 
---


# 설치

```bash
pip install duckdb
```

## 데이터베이스

> 파일 기반 데이터베이스
> - `.db` 파일에 데이터베이스를 생성 및 연결

```python
import duckdb

con = duckdb.connect('my_database.db')
```

> 메모리 기반 데이터베이스
> - 현재 메모리에 데이터베이스를 생성하고 종료시 삭제

```python
import duckdb

con = duckdb.connect() # duckdb.connect(':memory:')
```

## 사용법

> [!note] `main` 스키마에 자동 업로드

로컬 내 parquet 파일 db 업로드

```python
con.sql("""
    CREATE TABLE IF NOT EXISTS yellow_tripdata AS
    SELECT *
    FROM './data/yellow_tripdata_2024-01.parquet'
""")

con.sql('select * from yellow_tripdata limit 10')
```

#### 테이블 목록

현재 테이블 목록 및 특정 테이블 스키마 정보
```python
# DB 내 테이블 목록
con.sql('select current_schema()').show()

# 특정 테이블 스키마 정보
con.sql('PRAGMA table_info('{table_name}')')
```

## UI

> [!warning] 
> - shell로 작성 시, con.close() 되면 창 종료
> - duckdb로 작성시, 파일 종료시 창 종료

```bash
duckdb -ui
```

```python
con.sql('CALL start_ui();')
```



[참고사이트](https://zzsza.github.io/data-engineering/2024/10/25/duckdb/#duckdb-ui)
