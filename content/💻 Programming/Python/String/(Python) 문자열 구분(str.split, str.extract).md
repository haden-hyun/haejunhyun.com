---
title: (Python) 문자열 구분(str.split, str.extract)
created: 2024-07-05
tags:
  - python/split
  - python/extract
  - python/문자열
---
>[!hint] 요약
>- 목적: 문자열 값을 특정 조건에 맞춰 문자열 값을 분리함
>- 특정 문자로 구분: `str.split()` 활용
>- 정규표현식으로 구분: `str.extract()` 활용

---
# 1. 특정 문자로 구분

> [!summary] 주요 내용
> - `split()`의 반환값은 `list`
> - 함수구조: str.split(sep = '구분자', maxsplit = '분할횟수')
> 	- 단, 데이터프레임의 특정 열에 직접 적용할 경우 위 매개변수들 적용 안됨
> - 매개변수 `expand = True`: 데이터프레임을 결과값으로 반환

## 1.1 각 열을 분할하는 경우(list)
```python
df = df.assign(  
    basic = df['col'].str.split(','),  
    basic_len = lambda df: df['basic'].str.len(),  
    
    ver1 = df['col'].apply(lambda x: x.split(sep = ',')),  
    ver1_len = lambda df: df['ver1'].str.len(),  
    
    ver2 = df['col'].apply(lambda x: x.split(sep = ',', maxsplit = 1)),  
    ver2_len = lambda df: df['ver2'].str.len()  
)
```

| col                   | basic                        | basic_len | ver1                         | ver1_len | ver2                       | ver2_len |
| --------------------- | ---------------------------- | --------- | ---------------------------- | -------- | -------------------------- | -------- |
| apple,banana,cherry   | `[apple, banana, cherry]`    | 3         | `[apple, banana, cherry]`    | 3        | `[apple, banana,cherry]`   | 2        |
| dog,cat               | `[dog, cat]`                 | 2         | `[dog, cat]`                 | 2        | `[dog, cat]`               | 2        |
| red,blue,green,yellow | `[red, blue, green, yellow]` | 4         | `[red, blue, green, yellow]` | 4        | `[red, blue,green,yellow]` | 2        |
| sun,moon              | `[sun, moon]`                | 2         | `[sun, moon]`                | 2        | `[sun, moon]`              | 2        |
## 1.2 특정 열의 분할 결과(데이터프레임)

```python
df2 = df['col'].str.split(',', expand = True)  
df2.columns = [f'split_{i}' for i in range(1, len(df2.columns) + 1)]
```

| split_1 | split_2 | split_3 | split_4 |
| ------- | ------- | ------- | ------- |
| apple   | banana  | cherry  | None    |
| dog     | cat     | None    | None    |
| red     | blue    | green   | yellow  |
| sun     | moon    | None    | None    |
|         |         |         |         |

---
# 2. 정규 표현식으로 구분
- [[💻 Programming/Python/String/(Python) 정규표현식 정리(regex)]]
![[💻 Programming/Python/String/(Python) 정규표현식 정리(regex)#1) `str.extract()`]]