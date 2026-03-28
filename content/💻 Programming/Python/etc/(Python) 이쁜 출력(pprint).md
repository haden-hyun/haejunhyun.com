---
title: (Python) 이쁜 출력(pprint)
created: 2024-03-16
modified: 2024-03-16 23:06
cssclasses:
  - max
tags:
  - python/pprint
---
>[!summary] 요약
>- 목적: 덜 정제된 데이터 형태를 사용자가 보기 좋게 출력되도록 함
>- `pprint` 모듈 내 `pprint` 함수 활용

```python
from pprint import pprint

result = {'userId': 1, 'id': 1, 'title': 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit', 'body': 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'}

pprint(result)

## 출력 결과
{'body': 'quia et suscipit\n'
         'suscipit recusandae consequuntur expedita et cum\n'
         'reprehenderit molestiae ut ut quas totam\n'
         'nostrum rerum est autem sunt rem eveniet architecto',
 'id': 1,
 'title': 'sunt aut facere repellat provident occaecati excepturi optio '
          'reprehenderit',
 'userId': 1}

```