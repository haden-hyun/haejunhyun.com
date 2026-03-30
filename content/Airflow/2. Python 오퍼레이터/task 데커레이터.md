---
title: task 데커레이터
created: 2024-08-27
tags:
  - airflow/task
  - airflow/python/decorator
  - airflow/task/decorator
---
> [!hint] 요약
> - python 데커레이터의 기능을 airflow task로 활용함
> - airflow 공식 문서에서도 PythonOperator 활용 보다는 task decorator를 활용을 권장함
> - `from airflow.decorators import task`를 통해 사용
> - 장점
> 	- Python 사용자 정의 함수만으로 task 작성 가능
> 	- 코드 단축 및 관리 용이함
# 1. python 데커레이터
> [!hint] Python decorator개념과 기능
> 1. 원래의 함수를 감싸(wrapping) 바깥에 추가 기능을 덧 붙임
> 2. 함수 안에 함수 선언이 가능
> 3. 함수의 인자로 함수 전달이 가능
> 4. 함수 자체를 리턴하는게 가능
## 장점
- 함수를 직접 수정하지 않고, wrapping 함수를 생성하여 함수 변경 최소화
- 함수 호출 로직이 다수인 경우, 일일이 로직을 찾아 수정하지 않고 기존 로직을 그대로 사용 가능

## 활용
- `outer_func`를 적용할 함수가 다수인 경우, 일일이 객체를 지정해야함
```python
def outer_func(target_func):
	def inner_func():
		print('target 함수 실행 전`)
		target_func()
		print(`target 함수 실행 후`)
		
	return inner_func()
```
```python
def get_data():
	print('함수 실행')

a = outer_func(get_data)
a()
```
- Decorator 활용(`@outer_func`) : 기존 함수 호출 로직을 수정하지 않아도 됨
```python
@outer_func
def get_data():
	print('함수 실행')

get_data()
```
---
# 2. task 데커레이터
> [!hint] 
> - python 함수 정의만으로 쉽게 Task 생성
> - `from airflow.decorators import task` 로 불러오기
> - PythonOperator를 직접 import 하여 생성하지 않고 쉽게 작성가능
> 	- Tip) airflow 공식문서의 경우, Python 오퍼레이터를 import하여 활용하기 보다는 task 데커레이터를 활용하는 것이 좋다고 명시됨
## PythonOperator와 Task Decorators 비교
1. 기존 <u>PythonOperator</u> 활용: 함수 정의 후, task에 관련된 명령어 따로 작성 필요
```python
from airflow import DAG
from airflow.operators.python import PythonOperator

def python_func():
	...

py_task_1 = PythonOperator(
	task_id = 'py_task_1'
	python_callable = python_func						   
)
```
2. **Task decorator 활용**: 함수를 정의함과 동시에 task 정보 입력이 가능하여 코드 단축!
```python
from airflow import DAG
from airflow.decorators import task

@task(task_id = 'py_task_1)
def python_func():
	...

py_task_1 = python_func()
```
---
> [!example] 참고 사이트
> - [airflow 강의 github](https://github.com/hjkim-sun/airflow)

