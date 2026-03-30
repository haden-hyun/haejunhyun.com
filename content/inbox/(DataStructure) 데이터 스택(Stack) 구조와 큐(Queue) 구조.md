---
title: (DataStructure) 데이터 스택(Stack) 구조와 큐(Queue) 구조
created: 2025-08-02
modified: 2025-08-02 16:05
cssclasses:
  - max
tags:
  - datastructure/stack
  - datastructure/queue
---
> [!summary] 요약

---
# 1. 스택(Stack) 
^d1998a
## 1.1 개념

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/%E1%84%89%E1%85%B3%E1%84%90%E1%85%A2%E1%86%A8_%E1%84%8C%E1%85%A1%E1%84%85%E1%85%AD%E1%84%80%E1%85%AE%E1%84%8C%E1%85%A9.png" width="300" height="300" />
</div>




- 스택(stack)은 후입 선출(LIFO, Last In First Out) 방식으로 동작하는 선형 자료 구조
- 데이터가 차곡차곡 쌓아 올리는 형태로, 가장 마지막에 삽입된 데이터가 가장 먼저 삭제되는 구조
- `push` : 새로운 데이터를 가장 맨 위(`top`)위치에 삽입
- `pop`: 맨 위(`top`) 데이터를 제거
- 항상 맨 위(`top`) 데이터를 통해서만 접근이 가능하며, 중간에 있는 데이터를 직접 수정 및 삭제할 수 없다
## 1.2. 활용 예시
- 웹 브라우저 방문기록(뒤로가기)
- 실행 취소(undo)
- 역순 문자열 생성
- 후위 표기법 계산
---
# 2. 큐(Queue)
## 2.1. 개념

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/%E1%84%8F%E1%85%B2_%E1%84%8C%E1%85%A1%E1%84%85%E1%85%AD%E1%84%80%E1%85%AE%E1%84%8C%E1%85%A9.png" width="300" height="300" />
</div>



- 큐(Queue)는 선입선출(FIFO, First In First Out)으로 먼저 들어온 데이터가 먼저 나가는 방식의 선형 자료구조
	- 에) 줄을 서서 기다리는 손님이 먼저 온 순서대로 서비스 받음
- `front`에서 데이터를 삭제(`dequeue`)한다.
- `rear`에서 데이터를 삽입(`enqueue`)한다.
- 즉, 한쪽 끝에서 데이터를 추가하고 반대쪽 끝에서 데이터를 삭제할 수 있다.
## 2.2. 활용 예시
- 은행 업무
- 대기열 순서와 같은 우선순위 작업 예약
- 서비스 센터의 대기시간
- 프로세스 관리
---
# 3. 비교
| 특성    | 스택(Stack)               | 큐(Queue)                       |
| ----- | ----------------------- | ------------------------------ |
| 구조    | 후입선출(LIFO)              | 선입선출(FIFO)                     |
| 삽입 방식 | `push`: 맨 위(`top`)에서 삽입 | `enqueue`: 맨 뒤(`rear`)에서 삽입    |
| 삭제 방식 | `pop`: 맨 위(`top`)에서 삭제  | `dequeue`: 맨 앞(`front`)에서 삭제   |
| 접근 방식 | `top`에서만 데이터 접근 가능      | `front`에서만 삭제, `rear`에서만 삽입 가능 |
| 사용 사례 | 실행 취소(undo), 역순 문자열 등   | 은행 업무, 프로세스 관리 등1              |

---
>[!example] 참고사이트
>-  [(자료구조) 스택(stack)과 큐(queue)에 대해서 알아보자](https://jud00.tistory.com/entry/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%EC%8A%A4%ED%83%9DStack%EA%B3%BC-%ED%81%90Queue%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
>- [스택과 큐 비교하기](https://devuna.tistory.com/22)


