---
title: (Python) 누락 값 처리
created: 2025-06-24
modified: 2025-06-24 00:59
cssclasses:
  - max
tags:
  - python/Isna
  - python/notna
  - python/null
  - python/nan
  - python/none
---
> [!summary] 요약

---
# 1. 누락 값 정의
> [!hint] Python내 누락 값 정의
> - `NA`, `None`, `NaN`, `Null`
> - 데이터 유형별 누락 값 정의 다름

- 문자열은 `None`, 수치형은 `NaN`으로 이해하면 편함
	- ==단, 정수형의 경우 누락값 저장 불가능==
- `NaN` 값을 따로 가지지 않기 때문에 `np.nan`으로 표기

| 환경/라이브러리 | 자료형          | 누락값                | 비고                                     |
| -------- | ------------ | ------------------ | -------------------------------------- |
| Python   | 모든 타입        | `None`             | 일반적인 `null` 표현                         |
| NumPy    | `float`      | `np.nan`           | 수치형                                    |
| Pandas   | `object`     | `None`, `np.nan`   | 문자열 및 객체형에서는 `None`도 누락값으로 간주          |
|          | `float64`    | `np.nan`           | 수치형인 경우 `NaN` 기본 누락                    |
|          | `int64`      | **불가능**            | 정수형의 경우 누락값 저장 불가로 (`pd.Int64Dtype()`) |
|          | `boolean`    | `pd.NA`            | 누락값 전용 타입                              |
|          | `datetime64` | `NaT`              | 시계열 누락값                                |
|          | `category`   | `np.nan` 또는 `None` | 범주형도 누락값 가능                            |

---
# 2. 누락 값 확인
> [!hint] `isna()` 메서드 활용
> - 데이터프레임 내 각 열별 누락된 행의 존재 여부를 `boolean` 배열로 반환
> - 반대로 `notna()` 활용 가능

```python
# 1. 누락 값 개수 확인
df.isna().sum()
# 2. 누락이 아닌 값 개수 확인
df.notna().sum()
```

---
# 3. 누락 값 처리
> [!hint] 인덱싱, 교체, 채우기 기능 활용
> - `loc`, `replace`, `fillna`

1. `loc`: 특정 열 기준 누락된 행 가져오기
2. `fillna`: 모든 값 또는 특정 열 기준 누락된 값을 다른 값으로 바꿈

```python
# 1. loc
df.loc[df['column1'].isna(), :]
# 2. replace
## 1) 데이터프레임 내 모든 누락값을 공백으로 변환
df.fillna('', inplace = True)
## 2) 특정 열에 누락되니 값만 '없음'이라는 문자열로 변환
df.fillna({'column1': '없음'}, inplace = True)
```
---
>[!example] 참고사이트

