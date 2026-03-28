---
title: (Python) 지도 시각화
created: 2024-03-08
modified: 2024-03-08 16:49
cssclasses:
  - max
tags:
  - python
  - python/geopandas
  - python/gpd
  - python/explore
  - python/지도시각화
  - python/folium
---

## explore
> [!hint] explore
> - Geopandas내 explore 메서드 활용
> 	- folium, matplotlib, mapclassify 패키지 설치 필요
- Vworld 배경지도를 활용하여 html로 저장
	- 속성정보도 표시됨
```python
gdf.explore(column='color', legend=False,
            tiles='https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png', attr='vworld').save('../data/total.html')
```

## folium
#### tiles(배경지도)
> [!caution] 주의사항
> - 커스텀 지도 제작 시, `attr` 로 배경지도 저작권에 대한 표시 필수! 
> - 

1. 기본 제공 
	1. OpenSteetMap(기본값)
	2. Stamen Terrain, Stamen Toner, Stamen Watercolor
	3. CartoDB positron, CartoDB dark_matter
2. 배경지도 변경
	1. Vworld

```python
from sqlalchemy import create_engine
from urllib.parse import quote_plus
from sqlalchemy.sql import text
from json import load
import geopandas as gpd
import pandas as pd
with open('config.json', 'r', encoding='utf-8') as config:
    config = load(config)

engine = create_engine(config['address'].format(quote_plus(config['password'])), isolation_level='AUTOCOMMIT')
target = '41463'

gdf = gpd.read_postgis(text(f"select * from centroid.도로명주소건물도형 where 도로명주소관리번호 like '{target}%'"),
                       engine, geom_col='geometry')
gdf['color'] = [str(i % 10) for i in range(len(gdf))]
df = pd.read_sql(text(f"select distinct pnu, 도로명주소관리번호 from general.표제부 where 대장pk like '{target}%'"),
                 engine).dropna()
gdf = gdf.merge(df, on='도로명주소관리번호', how='left')
fltr = pd.read_sql(text(f"select pnu from general.도로명주소한글 where 공동주택여부='1' and 도로명주소관리번호 like '{target}%'"),
                   engine)
fltr = gdf.merge(fltr, on='pnu', how='inner').dissolve('pnu')
gdf = gdf.groupby('도로명주소관리번호').agg(
    {column: 'first' for column in gdf.columns if column not in ('도로명주소관리번호', 'pnu')} | {'pnu': 'unique'})
gdf['pnu'] = gdf['pnu'].str.join('\n')
gdf = gpd.GeoDataFrame(gdf, geometry='geometry', crs=fltr.crs)

gdf.explore(column='color', legend=False,
            tiles='https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png', attr='vworld').save(
    '../data/total.html')
fltr.explore(column='color', legend=False,
            tiles='https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png', attr='vworld').save(
    '../data/apt.html')
```


---
> [!example] 참고사이트
> - [Geopandas의 explore를 이용한 지도시각화](https://thlee33.medium.com/geopandas%EC%9D%98-explore%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EC%A7%80%EB%8F%84%EC%8B%9C%EA%B0%81%ED%99%94-9926f1ab53d)
> - [브이월드 API 활용한 지도 시각화](https://wooiljeong.github.io/python/folium_tiles/)
