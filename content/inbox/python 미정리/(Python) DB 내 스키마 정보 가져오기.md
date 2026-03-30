---
title: 파이썬_스키마 불러오기
created: 2024-03-07
modified: 2024-03-07 15:32
cssclasses:
  - max
tags:
  - python/sql
  - python/스키마
  - python/스키마/테이블목록
---
```python
db_schema = 'full_text'  
def schema_tables(db_schema):  
    """  
    :param db_schema: 검색할 db내 스키마    :return: 스키마 내 테이블 목록  
    """    # 커서 생성  
    cursor = conn.cursor()  
  
    # 스키마 목록을 조회하는 SQL 쿼리  
    query = "SELECT table_name FROM information_schema.tables WHERE table_schema = %s;"  
    cursor.execute(query, [db_schema])  
    tables = cursor.fetchall()  
    clean_table_list = [item[0].replace("(", "").replace(")", "").replace("'", "").replace(",", "") for item in tables]  
  
  
    cursor.close()  
  
    return clean_table_list  
  
db_table_list = schema_tables(db_schema)  
pattern = re.compile(r'.*shinhan.*info$')  
shinhan_list = [item for item in db_table_list if pattern.match(item)]  
shinhan_list
```