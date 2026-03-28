---
title: (Python) 운영체제(OS) 모듈
created: 2024-03-05
modified: 2024-03-05 18:31
cssclasses:
  - max
tags:
  - python/os
  - python/os/listdirs
  - python/os/makedirs
  - python/os/getcwd
  - python/os/chdir
  - python/os/rmdir
---

> [!summary] 요약
> - 목적: 운영체제(os) 모듈 주요 함수
> - 경로 설정
> 	- 현재 경로 확인: `os.getcwd()`
> 	- 경로 변경: `os.chdir('new_path')`
> - 경로 내 목록 : `os.listdirs('path')`
> - 신규 폴더 생성
> 	- `os.makedirs('new_folder_name')`
> 	- 단, 이미 존재했을 때를 대비하여 `os.path.exists` 조건문 활용

---
# 1. 경로 설정

1. 경로 설정
	1. 현재 경로(current working directory) 확인: `getwcd` 
	2. 경로 변경(change directory): `chdir`

```python
import os

# 1. 경로 설정
## 경로 확인
os.getcwd()
# 경로 변경
new_path = './new_path'
os.chdir(new_path)
```
---
# 2. 경로 내 목록 확인 및 폴더 생성
- 현재 경로 내 파일들 확인
```python
# 1. 현재 경로 내 파일 목록 확인
os.listdir()

# 2. 폴더 생성
if not os.path.exists('folder_name'):
	os.makedirs('folder_name')
```

---
# 3. 제거
```python
os.rmdir('folder_name')
```
---
>[!example] 참고사이트
