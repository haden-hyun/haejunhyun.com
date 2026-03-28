---
title: (GIS) 공간데이터 유형
created: 2025-11-22
modified: 2025-11-22 17:46
cssclasses:
  - max
tags:
  - gis/data/vector
  - gis/data/raster
  - gis/data/network
---
> [!summary] 요약
> - 공간 데이터는 크게 점, 선, 면의 기하학적 요소를 사용하는 벡터와 픽셀 배열 형태인 래스터로 구분되며 상호 변환이 가능함
> - 벡터 데이터는 좌표를 기반으로 명확한 경계를 가진 객체를 표현하며 Shapefile, GeoJSON, GeoParquet 등 다양한 형식으로 저장
> - 래스터 데이터는 균일한 격자 구조를 통해 영상 이미지와 같은 연속적인 현상을 나타내며 공간, 시간, 방사 해상도에 따라 품질이 결정
> - 공간 네트워크는 교차점인 노드와 연결 링크인 엣지로 구성되어 데이터의 연결성과 방향성을 모델링하는 데 특화된 구조를 가짐.

---

> [!note] (참고) Python에서 GIS를 다루기 위한 핵심 패키지
> - 벡터(Vector) 라이브러리: `geopandas`, `pyproj`,`shapely`
> - 래스터(Raster) 라이브러리: `xarray`, `rioxarray`,`rasterio`

# 1. 개요

공간 데이터 유형은 크게 벡터와 래스터 2가지로 구분할 수 있다.

**벡터 데이터**는 점, 선,면과 같은 기하학적 요소를 사용하여 지리적인 개체를 표현한 데이터다. 거리 네트워크를 표현하거나 최단 경로를 찾는 경우 매우 유요한 데이터이며, 선을 나타내는 Edge와 교차점을 나타내는 Node로 표현된 구조를 띈다.

**래스터 데이터**는 격자 또는 그리드 형태로 지리적인 개체를 표현한 데이터다. 픽셀로 구성되어 있고 각 픽셀에 지리적인 속성 값이 할당된다. 해당 할당값은 연속 및 이산적 값 모두 가능하며, 주로 영상 이미지와 유사한 형태의 구조이다.

==이처럼 두 데이터는 구성 요소가 매우 다르기 때문에 GIS 도구 및 방법론도 구분된다==. 그렇다고 벡터와 래스터 세계가 완전히 분리된 것은 아니다. 아래 그림처럼 특정 작업을 위해 자료를 각자 다른 형식으로 변환(예. 벡터 → 래스터)하는 것이 유용한 경우도 많다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/vector_vs_raster.png" width="700" height="500" />
  <div style="font-size: 15px; text-align: right; width: 700px; margin-top: 3px;">
	  <em>source: https://pythongis.org/ </em>    
  </div>
</div>

---

# 2. 벡터(Vector) 데이터

## 2.1. 구성 요소(기하학 유형)

> **_벡터 데이터의 가장 기본적인 기하학 객체는 점, 선, 면이다._**

#### 점 (Point)

> `Point (25 60.5)`

지리적 공간에서 단일 지점을 나타내며, 좌표로 위치를 결정한다. 2차원 ($x, y$ 좌표) 또는 3차원 ($x, y, z$ 좌표)으로 나타낼 수 있으며, 점을 구성하는 **단일 좌표 쌍을 보통 좌표 튜플(coordinate tuple)** 이라고 부른다.
#### 선 (LineString)

> `LINESTRING(24.5 51, 25 60.5`

점들 간 연결되어 선을 형성하고 점들의 순서를 나타낸다. 따라서 **최소 두 개 이상의 좌표 튜플 리스트**로 구성된다.
#### 면 또는 폴리곤 (Polygon)

> `POLYGON(24.5 51, 25 60.5, 25.5 61)`

선 들로 채워진 영역을 나타내며, 외곽 링(LinearRing)을 형성하는 **최소 세 개 이상의 좌표 튜플 리스트**로 구성된다. 또한, 영역 안 빈 공간이 있는 경우 구멍(Holes) 리스트를 포함할 수도 있다.

#### 다중 지오메트리 객체 (Collections)

> `MuitiPoint`, `MultiLineString`, `MultiPolygon`

**여러 개의** 지오메트리 객체 (점, 선, 영역)를 하나의 엔티티로 표현할 수 있다. 여러 개의 점의 집합을 멀티포인트 (MultiPoint), 여러 개의 선의 집합을 멀티라인스트링 (MultiLineString), 여러 개의 면 집합을 멀티폴리곤 (MultiPolygon) 이라고 한다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/vector_data_model.png" width="1000" height="600" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: https://pythongis.org/ </em>   
  </div>
</div>

## 2.2 데이터 형식

벡터 데이터는 다양한 방법으로 저장할 수 있으며, 일반적으로 디스크에 저장하는 공간 데이터 파일 형식 또는 PostGIS 데이터베이스와 같은 공간 인식 데이터베이스에 저장하는 방식이 있다.

#### Shapefile(쉐이프파일)

단일 파일이 아닌 여러 파일의 집합으로 `.shp` 확장자를 가진다. <u>여러 파일이 필요하여 최근에는 사용하지 않는 경우가 많다.</u>

- 필수 파일
	- `.shp`: 피쳐(Feature) 지오메트리 정보
	- `.shx`: 피쳐 지오메트리의 위치 인덱스 정보
	- `.dbf`: 속성(attribute) 정보
- 일반적으로 포함되는 파일
	- `.prj`: 좌표 참조 시스템(CRS) 정보

#### GeoJSON

지리 데이터 구조와 속성 데이터를 인코딩한 개방형 표준 형식으로 `.geojson` 확장자를 가진다. J<u>SON 형식으로 읽기 쉽지만, 압축되지 않아 파일 저장시 크기가 커질 수 있다.</u>

```json
{"type": "FeatureCollection",
  "features": [
    {"type": "Feature", "properties": {"id": 75553155, "timestamp": 1494181812},
      "geometry": {"type": "MultiLineString",
        "coordinates": [[[26.938, 60.520], [26.938, 60.520]], [[26.937, 60.521],
                         [26.937, 60.521]], [[26.937, 60.521], [26.936, 60.522]]]
      }
    }, 
    {"type": "Feature", "properties": {"id": 424099695, "timestamp": 1465572910}, 
      "geometry": {"type": "Polygon",
        "coordinates": [[[26.935, 60.521], [26.935, 60.521], [26.935, 60.521],
                         [26.935, 60.521], [26.935, 60.521]]]
      }
    }
  ]
}
```

#### GeoPackage

공간 데이터 저장을 위한 **개방형, 비독점적, 플랫폼 독립적, 이식성 있는 표준 기반** 형식으로 `.gpkg` 확장자를 가진다.

SQLite 데이터베이스 컨테이너를 사용하여 데이터를 저장한다. 벡터와 래스터 모두 저장할 수 있지만, 래스터는 `Byte` 데이터 타입 제한으로 주로 벡터 데이터를 저장한다.

#### GeoParquet

지리 데이터를 저장하는 **가장 최신 파일 형식**으로 `.parquet` 확장자를 가진다. 

Apache Parquet에 데이터를 저장하는 형태로 효율적인 ==데이터 압축 및 인코딩 방식 제공을 통해 데이터 처리 성능을 향상==시킨다.

#### GML

XML 기반 데이터 형식으로 `.gml` 확장자를 가진다. 지리적 피처를 표현하고, 지리 시스템을 위한 모델링 언어이자 인터넷 상 지리 트랜잭션을 위한 개방형 교환 형식 역할을 한다.  기존의 벡터 객체뿐만 아니라 커버리지 및 센서 데이터 등 모든 형태의 지리 정보를 통합한다.

---
# 3. 래스터(Raster) 데이터

> **_래스터 데이터는 픽셀이라고 하는 셀 배열로 표현되어 실제 세계 객체나 연속적인 현상을 나타낸다._**

## 3.1 구성 요소

예를 들어 디지털 카메라는 일반적으로 RGB 색상을 사용하여 캡처하고 이 정보를 각 색상에 대해 별도의 레이어로 픽셀에 저장한다. 동일한 크기의 픽셀들이 R/G/B 3개의 레이어를 가진다(투명도까지 고려하면 4개의 레이어다). 이처럼 이러한 데이터 구성은 대표적인 래스터 데이터 형식으로 별도의 레이어들을 밴드(Bands)나 채널(channels)이라고 한다.

다양한 센서에 의해 생성되는 래스터 데이터는 일반적으로 아래와 같은 기준에 따라 달라질 수 있다.

1. **공간 해상도 (Spatial resolution)**: ==단일 픽셀의 크기==, 즉 픽셀 하나가 나타내는 실제 공간의 크기(50x50 크기의 격자)
2. **시간 해상도 (Temporal resolution)**: 지구상의 동일 영역에서 데이터가 ==얼마나 자주 캡처==되는지를 의미
3. **방사 해상도 (Radiometric resolution)**: 사용 가능한 밝기 ==값의 범위== (비트 심도, bit depth)로, 일반적으로 ==비트(이진 숫자)로 측정==
4. **좌표 참조 시스템 (Coordinate reference system)**: 데이터가 표현되는 ==CRS==의 종류.
5. 분광 해상도 (Spectral resolution): 전자파 스펙트럼 내에서 분광 ==밴드의 수와 위치==를 의미
6. 공간 범위 (Spatial extent): 단일 이미지가 나타내는 세계의 영역 크기. 

아래 래스터 데이터 구조를 통해 각 기준을 살펴보자

래스터 데이터는 아래와 같은 데이터 구조를 갖는다. **고르지 않게 분포되는 벡터 데이터와 다르게 모두 동일한 크기 픽셀 내 속성 값을 가진다**. 이를 활용하여 아래 우측 그림과 같이 속성 값 기반 컬러맵을 통해 어느 지역에 밀집도가 높은지도 알아볼 수 있다. 또한, 각 픽셀들은 행과 열 번호를 기반으로 접근할 수 있다. 예를 들어 좌측 하단 격자는 `(3, 0)`으로 행번호가 3, 열번호가 0인 인덱스로 접근 가능하다. 이처럼 

래스터 데이터의 위 기준을 예시로 들면, 격자의 크기는 10m로 공간 해상도는 10x10 이다. 좀 더 세밀하고 정교하게 표현하기 위해서는 격자의 크기를 줄여 공간 해상도롤 높일 수 있다. 

또한, 래스터 데이터를 특성화하는 기본적인 방법은 데이터의 방사 해상도(Radiometric resolution)에 대한 정보를 제공하는 bit depth 또는 pixel depth 를 기반으로 한다. bit depth 는 래스터 데이터가 저장할 수 있는 고유 값의 범위를 정의한다. 예를 들어 1비트 래스터는 0과 1 인 두 가지 고유값만 저장할 수 있는 반면에 8비트 래스터는 0에서 255까지 256($2^{8}$) 가지의 고유값을 저장할 수 있다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/raster_data_model.png" width="900" height="400" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">    
  </div>
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/raster_bit_depths.png" width="500" height="400" />
  <div style="font-size: 15px; text-align: right; width: 500px; margin-top: 3px;">
    <em>source: https://pythongis.org/ </em>   
  </div>
</div>

## 3.2 데이터 형식

#### GeoTIFF

휴대성이 좋고 플랫폼에 독립적으로 `.tif` 확장자를 가진다. 

#### COG

GeoTIFF 기반 파일 형식으로 클라우드 환경에 최적화되어 있고, 일반적으로 HTTP 파일 서버에 호스팅된다.  파일 전체가 아닌 필요한 부분만 검색할 수 있도록 하여 효율적인 워크플로우 가능토록 한다. 확장자는 `.tif` 로 동일하다.

#### NetCDF

배열 지향적인 다차원 데이터 저장을 위해 휴대성, 자체 설명, 확장성이 뛰어난 파일 형식으로지구 과학 데이터 저장에 흔히 사용된다. `.nc4` 확장자를 가진다.

#### ASCII Grid
다양한 응용프로그램에 사용가능한 단순한 파일 형식으로 `.asc` 확장자를 가진다.

#### IMG

우리가 흔히 아는 이미지 파일 형식으로 영상 처리 회사에서 만든 독점 파일 형식이다.래스터 데이터에 대한 메타데이터 정보 제공하는 `.xml` 함게 제공될 수 있으며 기본적인 확장자는 `.img` 이다.

---
# 4. 공간 네트워크

## 4.1 개요

네트워크는 일상 생활에 매우 친숙한 표현으로 예를 들어 소셜 네트워크 ,신경망, 교통 네트워크 등이 있다.  이처럼 다양한 네트워크 종류 중 공간 네트워크에 초점을 맞추고, **일반적으로 노드와 에지로 표현**된다.

- 노드(Node): 교차로 또는 소셜 네트워크의 사람
- 엣지(Edge): 노드를 연결하는 링크(link)

## 4.2 네트워크 속성 데이터

공간 네트워크 내 **속성 정보는 대부분 Node에 저장**된다. Node의 대표적인 예시인 교차로의 경우 교차로의 위치 정보가 포함되어 있다.

그러나 **엣지(Edge)에는 훨씬 더 많은 정보가 포함**되어 있다. 특정 Edge에 어느 노드가 연결되어 있는지, 그리고 이 연결된 노드 간 시간 및 거리는 어떤지에 대한 정보를 포함하고 있으며, ==이러한 Edge 정보를 가중치로 활용==할 수 있다.

또한, 이는 **방향성**을 나타낼 수 있다. 그래프는 방향성(directed) 또는 비방향성(undirected)일 수 있고, 이는 Edge의 대표적인 예시인 도로가 양방향인지 일방향 도로인지에 결정하는 정보이다. 

헷갈릴 수 있는데 아래의 사진을 참고해서 설명한다. 

- **비방향성 (undirected)** : 양방향 그래프를 의미하며, 보통 도보나 자전거 경로 모델링 시 사용된다. (예시. A ←→ C)
- **방향성 (directed)** : 이동할 수 있는 방향이 정해져 있다는 의미다. (예시. A → B, C → D → E)


<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/directed_graph.png" width="600" height="300" />
  <div style="font-size: 15px; text-align: right; width: 600px; margin-top: 3px;">
    <em>source: https://pythongis.org/ </em>   
  </div>
</div>


## 4.3 데이터 형식
#### GML(Graph Modelling Language)

네트워크 데이터 지원 파일 형식으로 구문이 매우 간단하고, Key - Value 리스트로 구조를 갖는다. 확장자는 `.gml`를 가지는데, 벡터 데이터 저장형식인 GML(Geography Markup Language)의 확장자와 동일하므로 혼동하지 않게 주의해야 한다.
#### GraphML

XML 기반 포괄적이고 사용하기 쉬운 형식으로 `.graphml` 확장자를 가진다. 주로 Python에서는 `networkx` 라이브러리 활용한다.

---
>[!example] 참고사이트
>- [Python for Geographic Data Analysis](https://pythongis.org/part2/chapter-05/nb/01-introduction-to-geographic-data-in-python.html)
