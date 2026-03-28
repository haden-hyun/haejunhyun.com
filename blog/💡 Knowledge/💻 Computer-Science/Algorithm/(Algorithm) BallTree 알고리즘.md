---
title: (Algorithm) BallTree 알고리즘
created: 2025-07-26
modified: 2025-07-26 18:59
cssclasses:
  - max
tags:
  - algorithm/balltree
---
> [!summary] 요약
> - BallTree는 유클리드 거리를 기반으로 데이터 공간을 구체(Ball)로 감싸 계층적인 이진 트리를 구성하는 최근접 이웃 탐색 알고리즘임.
> - 단순 거리 계산 방식과 달리 탐색 과정에서 불필요한 자식 노드들을 효율적으로 제거하여 데이터가 많아질수록 계산량을 획기적으로 줄여줌.
> - KD-Tree에 비해 초기 트리 구축 비용은 더 들지만, 차수가 커질수록 데이터를 훨씬 빠르게 탐색할 수 있다는 장점이 있음.
> - 알고리즘은 가장 거리가 먼 포인트들을 기준으로 재귀적으로 하위 Ball을 생성하고, 탐색 시에는 상위 Ball에서 리프 노드까지 좁혀가는 방식을 사용함.
> - 파이썬의 sklearn 라이브러리를 통해 쉽게 구현할 수 있으며, 특정 반경 내의 격자 데이터를 추출하는 등 공간 데이터 분석에 유용하게 활용됨.

---
# 1. 개요
## 1.1 BallTree 알고리즘이란?
> 최근접 이웃 탐색(knn search)과 유사하며, 특정 데이터를 탐색하는 tree 구조 알고리즘

목적: 유클리드 거리를 기반으로 빠르게 최근접 이웃을 탐색
핵심 내용: 데이터 공간을 Ball로 감싸는 방식인 이진 트리를 구성
주요 용도: KNN, 유사도 검색, 고차원 거리 계산
## 1.2 주요 용어

| 용어            | 의미                                          |
| ------------- | ------------------------------------------- |
| Ball          | 중심점 $c$ 와 $r$을 가지는 구체(데이터 포인트는 해당 Ball에 존재) |
| Leaf Node     | 실제 데이터 포인트들이 저장된 하위 노드                      |
| Internal Node | 두 개의 자식 `Ball`을 갖는 노드                       |
| Tree          | `Ball`들이 게층적으로 구성된 이진 트리 구조                 |

---
# 2. 특징
BallTree는 KD-Tree와 비교하여, 초기 트리 구성 비용이 크지만 차수가 커질수록 데이터를 훨씬 빠르게 탐색할 수 있는 장점이 있다.

반면에, BallTree 는 kd tree 보다 훨씬 빠르게 결과를 도출한다.

비교: BallTree vs 단순 거리 계산
- 단순 거리 계산: 데이터 수 증가할수록 계산량 기하급수적 증가 $N^{2}$
- BallTree: 트리 구조 생성을 통해, 특정 노드가 질의한 거리보다 크면 해당 노드의 자식 노드들은 모두 버림 => 계산량 감소!

---
# 3. 알고리즘
> [!hint] 목적: Input Data와 가장 가까운 Point 탐색
> 1. 랜덤한 point 선택하는 과정을 재귀적으로 수행하여 Ball 생성
> 2. Ball 기반 Tree 구성
> 3. Input data가 속한 Ball을 찾는 트리 노드 탐색하여 가장 가까운 Ball 탐색
> 4. 해당 Ball 에 있는 Point 중 가장 가까운 Point 탐색
## 3.1 Ball 생성

랜덤한 Point `P1` 선택한 후, 가장 거리가 먼 포인트 `P2` 와 P2에서 가장 거리가 먼 포인트 `P3`  선택

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step1.png" width="400" height="400" />
</div>




`P2`와 `P3`를 있는 선을 생성하여 해당 선에 중간점을 기준으로 선을 나눔 => `l1`, `l2`

다른 Point들을 나누어진 각 선에 수선의 발을 내림(=projection), 각 선들에 투영된 점들의 축 성분에 합의 평균을 새로운 Ball의 중심점으로 각각 생성
(단, 여기서 `P1`은 제외된다. 왜냐하면 이미 `P1`을 중심으로 모든 점을 포함하는 Ball1을 만들었기 때문에 하위 Ball 생성 시에는 제외된다.)

각각 새롭게 생성된 Ball의 중심점에서 중심점 생성에 활용된 기존 Point 중 가장 거리가 먼 Point와의 거리를 반지름으로 하는 Ball 을 생성

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step2.png" width="500" height="500" />
</div>





## 3.2 Tree 구성

위 과정을 재귀적으로 반복하여 최종 Ball을 생성한다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step3.png" width="500" height="500" />
</div>

Ball의 위계 구조에 맞게 Tree를 구성한다.

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step4.png" width="500" height="500" />
</div>



## 3.3 Ball 탐색
트리 노드 탐색을 통해 `Input Data(8,5)`가 속한 Ball을 찾으며, 단계적으로 가장 가까운 Ball 을 선택 `B1 - B3 - B6`

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step5.png" width="500" height="500" />
</div>

## 3.4 최근접 Point 탐색

최종 Ball(`B6`) 내 Point들 과의 유클리드 거리를 산출한 후, 가장 가까운 Point`(8,3)` 선택

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/Balltree_step6.png" width="500" height="500" />
</div>



---
# 4. Python 코드 예시

> [!example] 격자 데이터 활용하여, 각 격자별 반경 내 속한 격자 목록 산출
> > ```from skleran.neighbors import BallTree```

**목적: 각 격자 중심점을 기준으로 특정 반경 내 위치한 격자 중심점에 해당하는 격자 목록 추출**

단계 구성
1. 각 격자별 중심좌표 생성
	1. `geometry`정보가 있는 경우, `centroid` 메서드 활용
	2. `geometry`정보가 없고 위경도 정보만 있는 경우, 좌표값 array 형태 생성(N, 2)
2. 중심점 기준 BallTree 초기 생성
3. 특정 반경 내 인덱스 추출
	1. `tree.query_radius(X, r, return_distance = False, count_only = False, sort_result = False)` 활용
		1. `X`: 좌표값 array
		2. `r`: 반경(m)
		3. `return_distance`: 거리 값 반환 여부
		4. `count_only`: 반경 만족 건수만 가져오는지
		5. `sort_result`: 거리와 인덱스 기준 정렬
4. 

```python
from sklearn.neighbors import BallTree
import numpy as np

# 1. 각 격자별 중심좌표 생성
coords = np.array([(geom.centroid.x, geom.centroid.y) for geom in gdf.geometry]) ## geometry 존재
coords = np.vstack([gdf['x'].values, gdf['y'].values]).T ## 좌표값만 존재, (N,2) array 생성

# 2. BallTree 초기화 (유클리디안 거리, 미터 단위)
tree = BallTree(coords, metrid = 'euclidean')

# 3. 특정 거리 반경 이내 인덱스 추출 (예. 3000 미터)
neihbors_idx = tree.query_radius(coords, r = 3000) # 각 격자별 결과 Index만 가져오기

# 4. 추출 예시
# 0번째 index 격자 기준 반경 3000m 이내의 격자들
gdf.iloc[neihbors_idx[0]] 
```

---
>[!example] 참고사이트
>- [python ball tree](https://nobilitycat.tistory.com/entry/ball-tree)
>- [Ball Tree](https://zziny-mago.github.io/data_science/2022/11/17/ball-tree.html)


