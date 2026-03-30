---
title: (Python) 반복문 활용법
created: 2026-03-15
modified: 2026-03-15 15:52
cssclasses:
  - max
tags:
  - python/loop/for
  - python/loof/while
  - python/loop/enumerate
  - python/loop/zip
---
> [!summary] 요약
> - 

---

# 0. 들어가며

코딩을 통해 자동화를 실행하는 경우, 핵심이 되는 기능이 **반복문(loop)**이다. 

이 글에서는 Python의 대표적인 반복문 `for`문과 `while`문의 차이점과 반복문을 더 Pythonic하게 만들어주는 `enumertae`, `zip` 등의 기능을 정리한다.

# 1. 반복문

> **_반복문은 크게 "횟수가 정해진 경우"와 "조건이 만족될 때까지"로 나뉜다._**

## 1.1 for 문: 데이터 순회(Iteration)

> [!summary] for문 특징
> - 목적: 리스트, 튜플, 문자열 등 **정해진 데이터 묶음(Iterable)을 처음부터 끝까지 하나씩 꺼내서 처리**할 때 사용
> - 특징: 반복 횟수가 데이터의 길이만큼 명확하게 정해짐
> - 사용 예시: 엑셀 파일 리스트 처리, 크롤링한 URL 목록 순회, 머신러닝 Epoch 반복 등.

```python
# [실무 예시] CSV 파일 리스트 처리
files = ["sales_2023.csv", "sales_2024.csv", "sales_2025.csv"]

for file in files:
    print(f"Processing: {file}...")
    # df = pd.read_csv(file) 로직 수행
```
## 1.2 while 문: 상태 유지(Condition)

> [!summary] while 문 특징
> - 목적: **반복 횟수를 미리 알 수 없을 때 사용 특정 조건이 참(True)인 동안** 계속 반복
> - 특징: 조건이 영원히 True면 **무한 루프(Infinite Loop)** 에 빠질 수 있어, 내부에서 반드시 종료 조건(`break`)을 고려
> - 사용 예시: API 서버 응답 대기(Polling), 사용자 입력 검증, 실시간 데이터 모니터링 등

```python
# [실무 예시] 서버 상태 확인 (준비될 때까지 대기)
status = "Initializing"
retry_count = 0

while status != "Ready":
    status = check_server_health() # 가상의 서버 상태 확인 함수
    retry_count += 1
    
    if retry_count > 5:
        print("❌ 접속 실패: 시간 초과")
        break
    
    print(f"⏳ 서버 대기 중... (시도: {retry_count})")
```

## 1.3 비교

| 구분    | for 문            | while 문            |
| --------- | -------------------- | ---------------------- |
| 핵심    | 데이터 순회           | 조건 유지              |
| 반복 횟수 | 예측 가능 (데이터 길이만큼) | 예측 불가 (조건이 바뀔 때까지) |
| 주 사용처 | 리스트/배열 처리, 단순 반복     | 무한 루프, 사용자 입력 대기, 폴링   |
| 위험성   | 낮음 (끝이 있음)           | 높음 (무한 루프 가능성)         |**

---

# 2. Pythonic한 순회 방법

### 3.1 `range()`: 숫자 범위 생성

가장 기본적인 형태입니다. 단순히 횟수만큼 반복하거나, 인덱스 숫자가 필요할 때 씁니다.

```python
# 0부터 4까지 반복 (총 5회)
for i in range(5):
    print(f"Epoch: {i}")

# 1부터 10까지 2씩 증가 (1, 3, 5, 7, 9)
for i in range(1, 11, 2):
    print(i)
```

### 3.2 `enumerate()`: 인덱스와 값을 동시에 (★강력 추천)

리스트를 돌면서 **"몇 번째(index)"**인지도 알아야 할 때가 많습니다.

C언어 스타일(range(len(list))) 대신 enumerate를 쓰는 것이 'Pythonic'한 방식입니다.


```python
users = ["Alice", "Bob", "Charlie"]

# ❌ Bad Pattern (비추천)
# for i in range(len(users)):
#     print(f"{i+1}번 유저: {users[i]}")

# ✅ Good Pattern (추천)
# idx는 0부터 시작, user는 리스트의 요소
for idx, user in enumerate(users):
    print(f"{idx+1}번 유저: {user}")
```

### 3.3 `zip()`: 여러 리스트를 동시에 엮기

두 개 이상의 리스트를 **병렬로(동시에)** 처리해야 할 때 사용합니다. 데이터 분석에서 **Feature와 Label을 묶거나**, 두 데이터를 비교할 때 매우 유용합니다.



```python
products = ["Notebook", "Mouse", "Keyboard"]
prices = [1200000, 50000, 150000]

# 두 리스트를 지퍼(zip)처럼 맞물려서 순회
# 길이가 짧은 리스트 기준으로 종료됩니다.
for item, price in zip(products, prices):
    print(f"상품명: {item} / 가격: {price:,}원")
```

### 3.4 딕셔너리(`dict`) 순회: 키와 값

딕셔너리를 `for` 문에 넣으면 기본적으로 **Key**만 나옵니다. 상황에 따라 메서드를 골라 써야 합니다.


```python
scores = {"Math": 90, "English": 80, "Science": 95}

# 1. 키(Key)만 순회 (기본)
for subject in scores:
    print(subject)  # Math, English...

# 2. 값(Value)만 순회
for score in scores.values():
    print(score)    # 90, 80...

# 3. 키와 값(Key, Value) 동시 순회 (★가장 많이 사용)
for subject, score in scores.items():
    print(f"{subject} 과목 점수: {score}")
```



---
>[!example] 참고사이트
>- 

---

## 3. 반복문을 더 강력하게: Pythonic한 순회 방법

`for` 문을 쓸 때 단순히 `in list:`만 쓰는 것이 아닙니다. 파이썬이 제공하는 강력한 내장 함수들을 활용하면 코드가 훨씬 간결하고 가독성이 좋아집니다.

### 3.1 `range()`: 숫자 범위 생성

가장 기본적인 형태입니다. 단순히 횟수만큼 반복하거나, 인덱스 숫자가 필요할 때 씁니다.

Python

```
# 0부터 4까지 반복 (총 5회)
for i in range(5):
    print(f"Epoch: {i}")

# 1부터 10까지 2씩 증가 (1, 3, 5, 7, 9)
for i in range(1, 11, 2):
    print(i)
```

### 3.2 `enumerate()`: 인덱스와 값을 동시에 (★강력 추천)

리스트를 돌면서 **"몇 번째(index)"**인지도 알아야 할 때가 많습니다.

C언어 스타일(range(len(list))) 대신 enumerate를 쓰는 것이 'Pythonic'한 방식입니다.

Python

```
users = ["Alice", "Bob", "Charlie"]

# ❌ Bad Pattern (비추천)
# for i in range(len(users)):
#     print(f"{i+1}번 유저: {users[i]}")

# ✅ Good Pattern (추천)
# idx는 0부터 시작, user는 리스트의 요소
for idx, user in enumerate(users):
    print(f"{idx+1}번 유저: {user}")
```

### 3.3 `zip()`: 여러 리스트를 동시에 엮기

두 개 이상의 리스트를 **병렬로(동시에)** 처리해야 할 때 사용합니다. 데이터 분석에서 **Feature와 Label을 묶거나**, 두 데이터를 비교할 때 매우 유용합니다.

Python

```
products = ["Notebook", "Mouse", "Keyboard"]
prices = [1200000, 50000, 150000]

# 두 리스트를 지퍼(zip)처럼 맞물려서 순회
# 길이가 짧은 리스트 기준으로 종료됩니다.
for item, price in zip(products, prices):
    print(f"상품명: {item} / 가격: {price:,}원")
```

### 3.4 딕셔너리(`dict`) 순회: 키와 값

딕셔너리를 `for` 문에 넣으면 기본적으로 **Key**만 나옵니다. 상황에 따라 메서드를 골라 써야 합니다.

Python

```
scores = {"Math": 90, "English": 80, "Science": 95}

# 1. 키(Key)만 순회 (기본)
for subject in scores:
    print(subject)  # Math, English...

# 2. 값(Value)만 순회
for score in scores.values():
    print(score)    # 90, 80...

# 3. 키와 값(Key, Value) 동시 순회 (★가장 많이 사용)
for subject, score in scores.items():
    print(f"{subject} 과목 점수: {score}")
```

---

## 4. 요약 노트

1. **`pass`**: 문법적 에러를 막기 위한 **빈칸**. "구조만 잡고 내용은 나중에" 혹은 "에러 무시".
    
2. **`for`**: 데이터 묶음이 있을 때. (**리스트, 튜플 처리**)
    
3. **`while`**: 끝나는 시점을 모를 때. (**특정 조건 만족 시까지**)
    
4. **`enumerate`**: 데이터와 **순서(인덱스)**가 같이 필요할 때.
    
5. **`zip`**: **두 개 이상의 리스트**를 한 번에 엮어서 처리할 때.
    
6. **`dict.items()`**: 딕셔너리의 **키와 값**을 동시에 꺼낼 때.