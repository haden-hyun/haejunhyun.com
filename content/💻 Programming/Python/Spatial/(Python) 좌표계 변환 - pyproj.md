---
title: (Python) 좌표계 변환 - Transformer
created: 2026-01-25
modified: 2026-01-25 14:10
cssclasses:
  - max
tags:
  - python/gis
  - python/pyproj/transformer
---
> [!summary] 요약
> - 

---
# 0. 들어가며

공간 데이터를 다루다 보면 가장 흔하게 마주치는 문제가 **'좌표계(CRS) 불일치'** 이다. 공공데이터에서 제공하는 좌표계는 일반적으로 대표적인 지리좌표계인 WGS84이다. 그러나 이를 국내 지도에 알맞게 투영하기 위해서는 국내 대표적인 투영좌표계인 TM좌표계(UTM-K)로 변환할 필요가 있다. (참고: 좌표계(CRS)에 대해서 더 알고 싶다면 [[💡 Knowledge/🌐 GIS/(GIS) 좌표 참조 시스템(CRS)|여기]]를 클릭하세요)

따라서, Python에서 가장 권장되는 방식인 `pyproj` 라이브러리의 **`Transformer`** 클래스의 사용법과 옵션에 대한 내용을 알아보자

---
# 1. Transformer 클래스

> **_출발 좌표계(Source)와 도착 좌표계(Target) 사이의 변환 파이프라인을 생성_**

## 1.2 좌표 변환 객체

>`Transformer.from_crs(crs_from, crs_to, always_xy)`

`from_crs()` 메서드를 이용하여 좌표 변환을 위한 객체를 생성.

#### 주요 파라미터

> [!tip] 경도-위도 고정 (always_xy)
> - 주요 옵션인  `always_xy` 를  `True`로 설정하는 것을 추천
> - 왜냐하면, 좌표계의 공식 정의는 (위도, 경도). 즉 (Y, X) 이다. (예를 들어 서울의 좌표를 표기할 때 (37.5, 126.9) 로 표기하는데 이는 (Y,X) 표기법이다)
> - 그러나, X-Y 가 익숙하기 때문에 해당 옵션을 통해 입출력 순서를 (위도, 경도)가 아닌 **(경도, 위도)로 항상 고정**시키자

| 파라미터(Parameter) | 설명                                                | 권장 값 / 예시                                   |
| --------------- | ------------------------------------------------- | ------------------------------------------- |
| **`crs_from`**  | (필수) 변환 전, **현재 데이터의 좌표계**입니다.                    | EPSG 코드(`"EPSG:4326"`), Proj 문자열, 혹은 CRS 객체 |
| **`crs_to`**    | (필수) 변환 후, **목표로 하는 좌표계**입니다.                     | EPSG 코드(`"EPSG:5179"` - 한국 주요 좌표계)          |
| **`always_xy`** | (중요) **입력/출력 순서를 항상 (X, Y) 즉, (경도, 위도)로 고정할지 여부** | `True` 또는 `False` (기본값: `False`)            |
다음 코드는 WGS84(EPSG:4326) 좌표계를 UTM-K(EPSG:5179)로 변환하고, 항상 경도(X), 위도(Y) 순으로 데이터를 입력 및 출력하는 변환기(객체)이다.

```python
from pyproj import Transformer

transformer = Transfromer.from_crs('EPSG:4326', 'EPSG:5179', always_xy = True)
```

## 1.2 좌표 변환

기 생성한 변환기(`transformer`)에 `transform()`메서드를 통해 변환된 좌표값을 생성

> [!tip] array(Numpy)로 입력하자!
> x,y 좌표값을 갖는 열이 존재하는 데이터프레임에 `apply`메서드보다 좌표값을 numpy 로 변환한 후 입력하는 것이 속도차원에서 우월!

아래 코드는 기존 데이터프레임의 좌표값을 numpy 형태로 변환하고, 기존에 생성해둔 좌표 변환기에 입력값에 넣어 변환된 좌표값을 출력한다.

```python
x_arr = df['x'].to_numpy()
y_arr = df['y'].to_numpy()

x_5179, y_5179 = transfromer.transform(x_arr, y_arr)
```

---
# 2. 예시

> 데이터프레임 내 WGS84 좌표계 값인 x,y 를 참고하여 UTM-K 좌표값으로 변환한 값을 새로운 열로 생성

```python
import numpy as np
import pandas as pd
from pyproj import Transformer

transformer = Transformer.from_crs('EPSG:4326', 'EPSG:5179', always_xy = True)

df['x_5179'], df['y_5179'] = transformer.transform(
		df['x'].to_numpy,
		df['y'].to_numpy
)

```
---
>[!example] 참고사이트
>- [[💡 Knowledge/🌐 GIS/(GIS) 좌표 참조 시스템(CRS)|(GIS) 좌표 참조 시스템(CRS)]]

