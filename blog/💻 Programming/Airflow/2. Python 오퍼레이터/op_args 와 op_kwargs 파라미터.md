---
title: op_args 와 op_kwargs 파라미터
created: 2024-09-08
tags:
  - airflow/python/operator/op_args
  - airflow/python/args
  - airflow/python/kwargs
  - airflow/python/operator/op_kwargs
---
> [!summary] 요약
> - airflow 내 args 결과는 `set` 형태로 반환
> - `PythonOperator`의 `op_args`, `op_kwargs` 매개변수 활용
> - `op_args`는 list로 작성
> - `op_kwargs`는 dictionary로 작성

---
# 1. op_args 파라미터
> `op_args`는 List로 작성되며, 함수 호출 시 파라미터로 입력됨
## 1) Only 일반 변수
```python
def regist(name, sex):
	print(f'이름은 {name}이고 성별은 {sex}입니다')

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_args = ['hyun','male']
)
```
## 2)일반 변수 + args
-  필수 파라미터 외 변수가 `args`객체로 캡쳐됨
```python
def regist(name, sex, *args):
	print(name)
	print(sex)
	print(args)

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_args =  ['hyun','male', 'kr', 'seoul']
)
```
## 3) Only args
- 모든 변수가 `args` 객체로 캡쳐됨
```python
def regist(*args):
	print(args)

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_args = ['hjkim','male','kr','seoul']
)
```
---
# 2. op_kwargs로 변수 할당
> `op_kwargs`는 **dictionary**로 작성되며, 함수 호출 시 파라미터로 들어감.
> 또한, Key값에 해당하는 **Value값이 캡쳐됨**
## 1) Only 일반 변수
```python
def regist(name, sex):
	print(f'이름은 {name}이고 성별은 {sex}입니다')

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_kwargs = {'name':'hyun', 'sex':'male'}
)
```
## 2) 일반 변수 + kwargs
- 필수 파라미터인 key값에 명시되지 않는 arguments는 `kwargs`로 캡쳐됨
> 함수
```python
def regist(name, sex, **kwargs):
	print(name)
	print(sex)
	print(kwargs)

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_kwargs = {'name':'hyun', 'sex':'male',
					'country':'kr','city':'seoul'}
)
```
## 3) Only kwargs
```python
def regist(**kwargs):
	name = kwargs['name'] or ''
	sex = kwargs['sex'] or ''
	country = kwargs['country'] or ''
	city = kwargs['city'] or ''

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_kwargs = {'name':'hyun', 'sex':'male',
					'country':'kr','city':'seoul'}

```
## 4) 일반 변수 + args + kwargs
- 명시된 변수는 해당 값이 캡쳐
- 그 외 dicitonary가 나오기 이전까지 남은 변수는 `args` 값이 캡쳐
- dicitonary는 `kwargs`에 캡쳐
```python
def regist(name, sex, *args, **kwargs):

python_task = PythonOperator(
		task_id = 'python_task',
		python_callable = regist,
		op_args = ['hyun','male','kr','seoul']
		op_kwargs = {'phone': 010, 'mail':'hyun@naver.com'}
)
```