---
title: (Postgresql) LAG, LEAD 함수
created: 2025-10-31
modified: 2025-10-31 14:39
cssclasses:
  - max
tags:
  - postgresql/lag
  - postgresql/lead
---
> [!summary] 요약

---
# 1. 개요

조회 결과 또는 결과 내 특정 집합 안에서 **특정 컬럼의 이전 행의 값(LAG) 또는 다음 행의 값(LEAD)을 구하는 함수**이다.

*어디에 활용?*

이전 행의 값과 현재 값을 비교하거나 계산할 때 복잡하게 만들어야 하는 쿼리를 LAG, LEAD 함수를 쓰면 한 줄로 간단하게 끝낼 수 있다. 아래의 예시를 보자.



---
>[!example] 참고사이트
>- [postgresql LAG, LEAD 사용하기](https://dev-jy.tistory.com/50)


