---
title: airflow connection과 hook
created: 2024-05-09
modified: 2024-05-09 22:31
cssclasses:
  - max
tags:
  - airflow
  - "#airflow/connection"
  - airflow/hook
  - "#airflow/postgresql"
  - airflow/custom_hook
---
# Connection
> Airflow UI 화면에서 등록한 커넥션 정보
#### 등록
| key             | value                   |
| --------------- | ----------------------- |
| Connection id   | conn=db-postgres-custom |
| Connection Type | Postgres                |
| Host            | 172.28.0.3              |
| Database        | haejun                  |
| Login           | haejun                  |
| Password        | 4780                    |
| Port            | 5432                    |
# Hook
> [!summary] 개요 및 특징
> - 개요: Airflow 외부 솔루션 기능을 사용할 수 있도록 미리 구현된 메서드를 가진 클래스
> - 특징
> 	- Connection 정보를 통해 생성됨(즉, Connection이 생성된 후 작동)
> 		- 접속정보를 Connection 통해 받아오므로 코드상 노출되지 않음
> 	- 특정 솔루션 다룰 수 있게 메서드가 미리 구현됨
> 	- task를 만들지 못함
> 		- 커스텀 오퍼레이터 또는 python 오퍼레이터 내 사용되는 함수 객체
## 1. get_conn()

> [!summary] 
> `get_conn()`을 통해 Airflow UI에 입력한 Connection 정보를 가져와 아래 변수를 할당하고, DB에 연결함

```python
def get_conn(self) -> connection: 
"""Establish a connection to a postgres database.""" 
	conn_id = getattr(self, self.conn_name_attr) 
	conn = deepcopy(self.connection or self.get_connection(conn_id)) 

# check for authentication via AWS IAM 
	if conn.extra_dejson.get("iam", False): 
		conn.login, conn.password, conn.port = self.get_iam_token(conn) 
		
	conn_args = { 
		"host": conn.host, 
		"user": conn.login, 
		"password": conn.password, 
		"dbname": self.database or conn.schema, 
		"port": conn.port, 
		} 
	...
	self.conn = psycopg2.connect(**conn_args) 
	return self.conn
```

#### 2. Bulk_load
- `bulk_load(table,tmp_file)`
	- `table`: DB 테이블명
	- `tmp_file`: 올릴 파일명
- `copy_expert` 메서드를 활용
> [!warning] 문제점
> - Load 가능한 구분자가 `\t`으로 고정
> - `Header`까지 포함되어 업로드
> - 특수문자로 인해 파싱 안될 경우 에러 발생
	
```python
def bulk_load(self, table: str, tmp_file: str) -> None: 
	"""Load a tab-delimited file into a database table.""" 
	self.copy_expert(f"COPY {table} FROM STDIN", tmp_file)

def bulk_dump(self, table: str, tmp_file: str) -> None: 
	"""Dump a database table into a tab-delimited file.""" 
	self.copy_expert(f"COPY {table} TO STDOUT", tmp_file)

```
#### 2-1) copy_expert
- `copy_exper(sql, filename)`
	- `sql`: `bulk_load`애서 입력한 query문
	- `filename`: `bulk_load`에서 입력한 `tmp_file`

```python file:copy_exprt()
def copy_expert(self, sql: str, filename: str) -> None: 
"""Execute SQL using psycopg2's ``copy_expert`` method. Necessary to execute COPY command without access to a superuser. 

Note: if this method is called with a "COPY FROM" statement and the specified input file does not exist, it creates an empty file and no data is loaded, but the operation succeeds. So if users want to be aware when the input file does not exist, they have to check its existence by themselves. """

	self.log.info("Running copy expert: %s, filename: %s", sql, filename) 
	if not os.path.isfile(filename): 
		with open(filename, "w"): 
			pass 
			
	with open(filename, "r+") as file, closing(self.get_conn()) as conn, closing(conn.cursor()) as cur:
	 cur.copy_expert(sql, file) 
	 file.truncate(file.tell()) 
	 conn.commit()
```

## 3. Custom Hook

> [!hin] 기존 Hook 단점 개선
> - `BaseHook` **의 클래스를 상속 받아 작성해야함!!**
> - 기존 Hook 단점 예시
> 	- Custom Hook을 생성하여 구분자 유형을 입력받음
> 	- `Header`여부 선택
> 	- 특수문자 제거 로직 추가
> - `sqlalchemy`이용방법 고려1

#### 3-1) BaseHook 주요 함수
###### get_connection(conn_id)
- `conn`을 반환
- 단, Airflow UI 화면 connection에 입력한 정보를 담은 객체를 반환
- `get_conn(conn_id)`와 차이점 구별!!
###### get_hook()
- Hook 객체를 반환
###### get_conn(conn_id)
- get_conn()을 선 구현 해놓고 작업이 필요
- `conn` 반환
- Postgres DB와의 연결이 담긴 객체를 반환
#### `@classmethod`
- 객체를 따로 지정하지 않고 바로 사용 가능
```python file:classmethod
# 1. 기존 class
import BaseHook

a = BaseHook()
a.function()

# 2. classmethod
import BaseHook

b = BaseHook.get_connections(conn_id)
```

### 3-2) Custom Hook 개발
> [!note] 목적
> 1. `get_conn`메서드 구현
> 	1. DB와 연결 세션 객체인 `conn`을 반환
> 		1. 주의! Airflow UI에 등록한 Connectino 정보를 담은 conn이 아님!!!
> 	2. BaseHook의 추상 메서드 및 자식 클래스 구현
> 2. `bulk_load`메서드 구현
> 	1. 사용자 정의