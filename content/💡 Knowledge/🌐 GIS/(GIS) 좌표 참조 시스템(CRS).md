---
title: (GIS) 좌표 참조 시스템(CRS)
created: 2025-11-25
modified: 2025-11-25 23:59
cssclasses:
  - max
tags:
  - gis/crs
  - gis/투영좌표계
  - gis/지리좌표계
---
> [!summary] 요약
> - CRS는 공간 데이터가 지구상 어디에 위치하는지 정의하는 필수 메타데이터로 데이텀, 지도 투영, 추가 파라미터로 구성됨.
> - 지도 투영은 3차원인 지구 표면을 수학적 방식을 통해 2차원 평면으로 변환하는 과정이며 필연적으로 형태나 면적 등의 왜곡을 수반함.
> - 따라서 분석 목적에 따라 각도, 면적, 거리 중 보존해야 할 특성을 고려하여 메르카토르나 몰바이데 등 적합한 투영법을 선택해야 함.
> - 이러한 CRS 정보는 EPSG 코드, PROJ 문자열, OGC WKT와 같은 표준화된 시스템을 통해 저장되고 GIS 소프트웨어에서 식별됨.

---

# 1. 개요

공간 데이터 유형으로 벡터, 래스터 그리고 네트워크가 있지만, 그 외 공간 데이터의 기본적인 측면인 좌표 참조 시스템(Coordinate Reference System, CRS)도 존재한다.

CRS가 없으며 공간 데이터는 단순히 임의의 공간에 위치한 좌표의 모음일 뿐이다. 원칙적으로 모든 공간데이터는 특정 CRS 정보가 첨부되어야 하며, 데이터의 중요한 맥락적 정보를 제공하기 때문에 메타데이터라고도 한다.

# 2. 구성 요소

> **_CRS는 크게 데이텀(Datum), 지도 투영(Map Projection), 추가 파라미터(Parameters)로 구성_**

#### 데이텀(Datum)

데이텀(Datum) 은 지구의 크기와 모양을 나타내는 모델이다. 지구의 평균 해수면을 설명하는 타원체와 지오이드가 있으며, 가장 일반적으로 사용하는 데이텀 중 하나가 WGS84이다. 

데이텀에는 지구상의 특정 지점을 고정시키는 기준점(origin) 정보를 포함하고 있어 해당 기준점으로부터 다른 위치들의 좌표가 정밀하게 측정된다. 이를 활용하여 GPS 수신기의 정확도를 검증하는데 쓰일 수 있다.

또한, 기울기, 방향, 원점 위치를 포함하여 좌표계가 지구 표면으로 부터 어떻게 기울어져 있는지, 원점이 어디에 위치하는지 등을 정의한다.

#### 지도 투영(Map Projection)

투영(Projection)은 지구 3차원 표면을 2차원 평면으로 변환하는 수학적 방식이다. 투영법의 종류는 다양하며, 각 장단점이 있어 지도의 목적과 지역 특성에 따라 달라진다.

더 자세한 내용은 아래에서 다루겠다.

#### 추가 파라미터(Parameters)

CRS를 완전히 정의하기 위해 필요한 부가적인 설정값으로 중앙 자오선, 표준 위선, 축척 계수 등이 있다. 또한, 좌표계의 원점 및 방향과 투영 좌표와 지리 좌표 간 변환 정보도 포함될 수 있다.

---
# 3. 지도 투영

> **_좌표계의 핵심 구성 요소는 지도 투영(Projection)으로 지구의 3차원 표면을 2차원 평면에 어떻게 나타낼지 결정_**

==지도 투영은 수학정 방법을 통해 3차원 위치의 좌표(위도와 경도)를 평평한 표면(지도)에 매핑==한다. 이처럼 3차원 표면을 2차원 평면으로 변환하는 과정에서 결과는 어떤 식으로든 아래 그림과 같이 **항상 왜곡**된다는 점을 잊지 말자!

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/curved_surface_to_flat_plane.png" width="700" height="400" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: https://pythongis.org/part2</em>
  </div>
</div>

#### 위도와 경도에 대해서 알아보자

_잠깐 여기서 위도와 경도를 헷갈리수 있기 때문에 알아보자. 사실 내가 늘 헷갈려서 다시 상기시키기 위한 복습이다._

| 구분        | 위도(Latitude)                             | 경도(Longitude)                                     |
| --------- | ---------------------------------------- | ------------------------------------------------- |
| 정의        | 중심을 기점으로 각도 측정 → 적도를 기준으로 북쪽 또는 남쪽으로의 각도 | 본초 자오선을 기점으로 동쪽 또는 서쪽으로의 각도 (본초 자오선: 그리니치 천문대 기준) |
| 범위        | 0(적도) ~ 90도(극지방)                         | 0(본초자오선) ~ 180도(국제 날짜 변경선)                        |
| 표기        | 90N, 90S                                 | 180W, 180E                                        |
| 거리(1도 간격) | 약 111.32 km 동일                           | 위도에 따라 다름  (적도: 111.32 km, 북위 37도: 약 88.93km)     |
| 시간대와 관계   | 관계 없음                                    | 각 시간대의 기준                                         |
| x,y 좌표    | y                                        | x                                                 |

## 3.1 투영법 종류

==지도 투영법은 항상 근사치를 사용하기 때문에 이 과정에 늘 무엇인가 손실을 본다==. 여기서 무엇이란 지도를 표현하는 각도, 면적, 거리 등이 있다. 따라서, 왜곡이 전혀 없는 투영법이라던지 지도 전체에서 동일한 축척을 유지하는 투영법은 존재하지 않는다.

그러므로 ==사용 목적에 따라 어떤 특성을 보존할지 선택하여 투영법을 선택==한다. 대표적으로 모양, 면적, 거리, 방위 중에서 보존한다

| 투영 유형            | 보존 특성           | 왜곡 사항      | 대표 투영법                                   | 특징                         |
| ---------------- | --------------- | ---------- | ---------------------------------------- | -------------------------- |
| 정각도(Conformal)   | 각도와 거리 비율       | 면적, 거리     | 메르카토르(Mercator)                          | 역사적으로나 항해에서 중요하지만 면적 왜곡 큼  |
| 동면적(Equal-area)  | 면적              | 모양, 각도     | 몰바이데(Mollweide) 및 알버스(Albers Equal Area) | 지역 간 면적 비교에 적합             |
| 동거리(Equidistant) | 특정 점 또는 선 기준 거리 | 면적, 각도, 모양 | 정방위 동거리(Azimuthal Equidistant)           | 전체가 아닌 특정 점 또는 선 기준 거리가 정확 |

아래 그림은 3차원 지구 표면을 2차원 평면으로 변환한 9가지 지도 투영법이다. 각 방법별 모양이 다르고 장단점이 존재한다. 즉, 목적과 필요에 따라 가장 적합한 투영법을 선택해야 한다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/projections.png" width="800" height="600" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: https://pythongis.org/part2</em>
  </div>
</div>

---
# 4. 저장 방식

> **_CRS 정보는 대표적으로 EPSG, PROJ, OGC WKT 시스템을 활용한다. 모두 주어진 좌표계의 주요 특성을 표준화된 방식으로 저장되며, Python 및 GIS 에서 공간 데이터를 처리하는데 필수적!_**

- epsg: 좌표계 식별
- proj: 좌표를 실제로 변환하기 위한 파라미터
- ogc wkt: 모든 내용을 사람이 읽기 좋게 정리한 전체 설명


#### EPSG

지리좌표계, 투영좌표게, 데이텀 등 광범위한 CRS 정보를 포함한다. GIS 소프트웨어에서 가장 널리 사용되는 무료 및 오픈 시스템이다. 각 CRS는 고유번호인 EPSG 코드로 식별된다.

예를 들어 위에서 언급한 대표적인 지리좌표계인 WGS84의 EPSG 코드는 `4326`이다. 또한 국내에서 자주 활용되는 투영 좌표계 중 하나인 TM 좌표계(Korea 2000 / Central Belt 2010)의 EPSG 코드는 `5179` 이다.

이처럼 단순한 코드 숫자로 좌표계를 쉽게 지정하거나 변환할 수 있어 매우 편리한 장점이 있다.
#### PROJ

PROJ는 CRS 정보를 저장하고 서로 다른 시스템 간 좌표 변환을 수행하는 오픈소스 라이브러리다. 주로 `proj-string` 형태로 저장되며, 특정 파라미터 이름 규칙을 따르는 텍스트 구조를 가진다.

`proj-string`은 데이텀(Datum), 타원체(ellipsoid), 투영방식(projection), 좌표 단위(예: meter), UTM zone 과 같은 정보들을 포함한다.

> [!question] UTM이란? 지구를 경도 6도 폭으로 총 60개 존으로 나눈 평면 좌표계이다.

아래는 `EPSG:3067` 인 `ETRS-TM35FIN`의 PROJ 정보이다.

```text
+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=**crs**
```
#### OGC WKT

OGC WKT(Wel-Known Text)는 사람이 읽기 좋은 텍스트 기반 CRS 표현 방식이다. 이는 CRS 정의 및 좌표 변환 정보까지 포함하는 등 매우 자세하기 때문에 길어질 수 있다.

아래는 `EPSG:3067` 인 `ETRS-TM35FIN`의 WKT원문이다.

```text
PROJCS["ETRS89 / TM35FIN(E,N)",
    GEOGCS["ETRS89",
        DATUM["European_Terrestrial_Reference_System_1989",
            SPHEROID["GRS 1980",6378137,298.257222101,
                AUTHORITY["EPSG","7019"]],
            TOWGS84[0,0,0,0,0,0,0],
            AUTHORITY["EPSG","6258"]],
        PRIMEM["Greenwich",0,
            AUTHORITY["EPSG","8901"]],
        UNIT["degree",0.0174532925199433,
            AUTHORITY["EPSG","9122"]],
        AUTHORITY["EPSG","4258"]],
    PROJECTION["Transverse_Mercator"],
    PARAMETER["latitude_of_origin",0],
    PARAMETER["central_meridian",27],
    PARAMETER["scale_factor",0.9996],
    PARAMETER["false_easting",500000],
    PARAMETER["false_northing",0],
    UNIT["metre",1,
        AUTHORITY["EPSG","9001"]],
    AXIS["Easting",EAST],
    AXIS["Northing",NORTH],
    AUTHORITY["EPSG","3067"]]
```

---
>[!example] 참고사이트
>- [Python for Geographic Data Analysis](https://pythongis.org/part2/chapter-05/nb/01-introduction-to-geographic-data-in-python.html)
>- [위도와 경도 차이](https://velog.io/@bonjugi/%EC%9C%84%EB%8F%84%EC%99%80-%EA%B2%BD%EB%8F%84-%EC%B0%A8%EC%9D%B4)
>- [지리좌표계, 투영좌표계, 데이텀 이해하기](https://blog.naver.com/heejin9867/221330301521)
