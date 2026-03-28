---
title: airflow python 외부 모듈
created: 2024-05-07
modified: 2024-05-07 23:11
cssclasses:
  - max
tags:
  - airflow
  - airflow/python
  - airflow/python/모듈
  - airflow/python/path
---
## python 모듈 설정
#### `sys.path`에 값 추가
1. 명시적으로 추가
	1. 예) `sys.path.append('/home/haejun')`
	2. 경로 List에 직접적으로 추가하는 방식
2. OS 환경변수 `PYTHONPATH` 값 추가

#### Airflow 장점
> [!hint] 장점
> - 공통함수 작성
> - 재활용성 증가
> - DAG 깔끔
- **자동적으로 dags폴더와 plugins 폴더를 sys.path에 추가함**
#### 개발환경과 Airflow에서의 차이점
- plugins 폴더에 common 폴더와 common_func.py 생성
1) python 개발환경
	1) 기본적으로 개발환경 설정시 프로젝트 폴더가 상위폴더로 잡혀서 아래와 같이 작성해야 함
```python file:개발환경
from plugins.common.common_func
```
2) airflow 환경
	1) 그러나, airflow에서는 python 개발환경이 아니므로 plugins 폴더를 인식하지 못함
	2) 따라서 바로 common 폴더명을 지정
	3) **Why? airflow는 자동으로 plugins 폴더를 sys.path에 추가하기 때문에 자동으로 인식!!**
```python file:airflow환경
from common.common_func
```

3) python 개발환경 오류 해결방법
	1) 프로젝트 폴더 내 `.env` 파일 생성
	2) tip! `.env`는 git에 안 올려도 됨
```bash file:.env설정
WORKSPACE_FOLDER = /Users/haejun/vscode/airflow
PYTHONPATH = ${WORKSPACE_FOLDER}/plugins
```
