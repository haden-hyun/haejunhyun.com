---
title: (Python) 소요시간 계산
created: 2024-10-28
modified: 2024-10-28 22:36
cssclasses:
  - max
tags:
  - python/starttime
  - python/endtime
  - python/소요시간
---
> [!summary] 요약
> - 특정 함수 및 명령어 소요시간 확인 방법

```python
from datetime import datetime

def function()
...

# 시작시간
start_time = datetime.now()  

function()
# 함수 종료시간
end_time = datetime.now()  

# 시간 차이 산출
diff = end_time - start_time    
# timedelta 객체에서 시, 분, 초 추출  
hours, remainder = divmod(diff.total_seconds(), 3600)  
minutes, seconds = divmod(remainder, 60)
print(f"============= 최종 소요시간 : {int(hours)}시간 {int(minutes)}분 소요 ==========================")
```

---
>[!example] 참고사이트


