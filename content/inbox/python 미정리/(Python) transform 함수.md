---
title: (Python) transform 함수
created: 2025-10-31
modified: 2025-10-31 14:51
cssclasses:
  - max
tags:
  - python/transform
  - python/groupby/transform
---
> [!summary] 요약

---


- 아래는 ChatGPT 내용
- `assign` 함수에 적용하기 좋음
- 고유한 그룹을 index로하는 결과값이 아닌 기존 데이터프레임 형태를 유지한 상태에서 그룹 집계값이 저장
```python
df = df.assign(
	group_max = lambda df: df.groupby(['col1','col2'])['target_column'].transform('max')
)
```

| 특징    | max()              | transform('max')               |
|-------|--------------------|--------------------------------|
| 출력 크기 | 축소된 데이터프레임 (그룹 단위) | 원래 데이터프레임 크기                   |
| 출력 내용 | 각 그룹의 최대값          | 각 행에 그룹 최대값 반복                 |
| 사용 목적 | 그룹별 통계 요약          | 그룹 결과를 원래 데이터프레임과 결합하거나 계산에 사용 |
| 적용 방식 | 요약된 데이터 반환 (축소)    | 원래 크기 유지 (전파)                  |


---
>[!example] 참고사이트
>- [Transform() 함수란?](https://m.blog.naver.com/sw4r/222392753166)


%%  %%