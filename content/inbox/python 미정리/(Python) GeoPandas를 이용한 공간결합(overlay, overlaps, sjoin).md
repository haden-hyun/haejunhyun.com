---
title: (Python) GeoPandas를 이용한 공간결합(overlay, overlaps, sjoin)
created: 2025-06-20
modified: 2025-06-20 00:25
cssclasses:
  - max
tags:
  - python/geopandas/overlay
  - python/geopandas/overlaps
  - python/geopandas/sjoin
---
> [!summary] 요약
> 1. `gpd.overlay(A, B, how = '옵션')`: 공간자료들의 위치를 기반으로 새로운 도형을 생성
> 	1. **A의 geometry가 기준**
> 	2. `union`: 합집합
> 	3. `intersection`: 교집합
> 	4. `symmetric_difference`: 대칭차집합 (교집합과 반대)
> 	5. `difference`: 차집합 A(기준) - B
> 	6. `identity`: 교집합(intersection) + 차집합(difference)

# 1. overlay
> [!hint] 목적
> - `geopandas.GeoDataFrame.overlay()`: `GeoDataFrame` 객체에 대한 메소드 
> - 공간자료들의 위치 정보들을 고려하여 겹치거나 겹치지 않는 위치를 기반으로 새로운 도형을 만들 때 사용한다.
> - 단, `gpd.overlay(A, B)` 두 도형의 속성이 모두 유지된다. 즉 공간 결합시 좌측 공간데이터를 기준 공간 정보에 우측 공간데이터의 속성들이 결합됨
> 		- 즉, `A`안에 `B`가 담기며, 이를 통해 집계함수 사용시 `A` 공간 단위로 집계 가능
> - `how` 옵션을 통해 다양한 공간 결합 활용
> - output: `GeoDataFrame`

아래와 같이 GeoDataFrame 형태인 gdf1, gdf2 2개의 공간 자료가 있으며, 각각 1과 2의 속성 정보를 담고 있다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%83%98%ED%94%8C.png" width="500" height="500" />
</div>


## 1.1 union

> [!summary] (**합집합**) 가능한 모든 기하학 정보를 반환

- 각 공간자료별 겹치는지 겹치지 않는 지에 대한 모든 정보를 반환
- 위 예시자료를 기준으로 4개의 공간객체가 있으니, 4 x 2 - 1= 7 개의 속성 정보를 반환한다.
	- 공집합 제외

```python
result_union = gdf1.overlay(gdf2, how = 'union')
print(result_union)
```

| gdf1    | gdf2    |
| ------- | ------- |
| 1       | 1       |
| 2       | 1       |
| 2       | 2       |
| 1       | **NaN** |
| 2       | **NaN** |
| **NaN** | 1       |
| **NaN** | 2       |

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_overlay_union.png" width="500" height="500" />
</div>


## 1.2 intersection
> [!summary] (**교집합**) 공간 자료 중 겹치는 객체만 반환
- NaN이 하나라도 아닌 조합을 반환

```python
result_intersection = gdf1.overlay(gdf2, how = 'intersection')
print(resut_intersection)
```

| gdf1 | gdf2 |
| ---- | ---- |
| 1    | 1    |
| 2    | 1    |
| 2    | 2    |

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_overlay_intersection.png" width="500" height="500" />
</div>



## 1.3 symmertric_difference
> [!summary] (**대칭차집합**) 겹치지 않는 객체만 반환(`intersection`의 반대) 

- 즉, `Union` 한 결과에서 `interssection` 를 뺀 나머지
- **주의! `difference` 와 다름**
$$
Union = intersection + symmertric\_differecen
$$
```python
result_sym_diff = gdf1.overlay(gdf2, how = 'symmetric_difference')
print(result_sym_diff)
```

| gdf1    | gdf2    |
| ------- | ------- |
| 1       | **NaN** |
| 2       | **NaN** |
| **NaN** | 1       |
| **NaN** | 2       |

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_overlay_symmertric_difference.png" width="500" height="500" />
</div>



## 1.4 difference
> [!summary] (**차집합**) 기준이 되는 객체에서 특정 객체를 제외한 나머지

- 대칭차집합(`symmetric_difference`) 와의 차이점
	- 대칭차집합은 전체에서 교집합을 제외한 나머지
	- 차집합은 기준 객체에서 특정 객체를 전부 제외한 나머지
```python
result_diff = gdf1.overlay(gdf2, how = 'difference')
print(result_diff)
```

| gdf1 | gdf2    |
| ---- | ------- |
| 1    | **NaN** |
| 2    | **NaN** |
<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_overlay_difference.png" width="500" height="500" />
</div>



## 1.5 identity
> [!summary] 기준이 되는 객체만 반환하지만 겹치는 객체와 그렇지 않은 객체를 구분해서 반환

- 즉, `identity`는 교집합(`intersection`)과 차집합(`difference`)의 합이다.
$$
identity = intersection + difference
$$
```python
result_identity = gdf1.overlay(gdf2, how = 'identity')
print(result_identity)
```

| gdf1    | gdf2    |
| ------- | ------- |
| 1       | 1       |
| 2       | 1       |
| 2       | 2       |
| 1       | **NaN** |
| 2       | **NaN** |
<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/gpd_overlay_identity.png" width="500" height="500" />
</div>



---
# 2. overlaps



---
# 3. sjoin

---
>[!example] 참고사이트
>- [GeoPandas 사용 시 알아두면 좋은 점들](https://jungham.tistory.com/21#join-1)
>- [Geopandas 공식문서](https://geopandas.org/en/stable/docs/user_guide/set_operations.html)








```python
from shapely.geometry import MultiPolygon
```

## 공간결합
#### intersection(교차)
> [!hint] 개념
> - 두 GeoDataFrame의 지오메트리를 겹치는 부분 조합
> - `gpd.overlay(A, B)`: `A` geomerty 별로 속한 `B`의 geometry들이 들어감
> 	- 즉, `A`안에 `B`가 담김
> 	- 이를 통해 집계함수 사용시,  `A` 공간 단위로 집계 가능

- `keep_geom_type` : 서로 다른 지오메트리 유형을 가진 객체 보존여부
	- `True`: 서로 다른 유형 지오메트리 제거 > 경고메시지 발생 가능
	- `False`: 모든 지오메트리 유지
```python
gpd.overlay(A, B, how='intersection', keep_geom_type = False)
```


