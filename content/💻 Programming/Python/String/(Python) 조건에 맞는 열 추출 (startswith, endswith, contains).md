---
title: (Python) 조건에 맞는 열 추출 (startswith, endswith, contains)
created: 2024-07-05
tags:
  - python/startswith
  - python/endswith
  - python/contains
  - python/columns
  - python/polars/select
---
> [!hint] 요약
> 1. polars
> 	1. **데이터프레임에 바로 접근이 가능함**
> 	2. 조건 개수 상관없이 `select()` 메서드와 정규표현식 활용 가능
> 2. pandas
> 	1. 데이터프레임의 열 list에 접근하여 Boolean 값 반환
> 	2. `df.loc`을 통해 인덱싱을 해야하는 과정이 추가됨

---
# 1. polars
> [!done] 장점
> - 조건의 개수와 상관없이 `select()`메서드 내 정규표현식 활용
> 	- `^` : ~로 시작하는 경우
> 	- `.*` : n개 이상의 문자열
> 	- `$`: ~로 끝나는 경우
- polars 패키지의 `select()`메서드 활용
- `pl.col()` 내 정규 표현식 활용
```python
# 조건 1개
music_df = df.select(pl.col('^music_.*$'))  
movie_df = df.select(pl.col('^.*movie$'))
# 조건 2개 이상
fruits_df = df.select(pl.col('^apple.*$|^banana.*$'))  
nutrient_df = df.select(pl.col('^.*brix$|^.*size$'))
```
---
# 2. pandas
## 2.1 조건 1개
- `music_`로 시작하는 열 만 가져오기
- `_movie`로 끝나는 열 만 가져오기
```python
start_cols = df.columns.str.startswith('music_')
end_cols = df.columns.str.endswith('_movie')

music_df = df.loc[:, start_cols]
movie_df = df.loc[:, end_cols]
```
---
## 2.2 조건 2개 이상
> [!tip] 조건 기호
> - `^` : ~로 시작하는 조건
> - `$`:  ~ 로 끝나는 조건
- `apple_`, `banana_`로 시작하는 열 만 가져오기: `^`활용
- `_brix`, `_size`로 끝나는 열 만 가져오기: `$`
```python
start_cols = df.columns.str.contains('^apple_|^banana_', regex = True)
end_cols = df.columns.str.contains('_brix$|_size$', regex = True)

fruits_df = df.loc[:, start_cols]
nutrient_df = df.loc[:, end_cols]
```
