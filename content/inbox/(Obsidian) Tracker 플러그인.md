---
title: (Obsidian) Tracker 플러그인
created: 2024-07-04
tags:
  - obsidian/plugin/tracker
---
> [!hint] 요약
> - 습관 리뷰에 활용 가능함
> - github 내 [task sample code](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTask.md) 사용

---
# 1. 활용 방법
- ` ``` `앞에 `tracker`라고 작성
- `searchType`: 가져올 task 목록 형태
	- `.done` : check box 중 완료된 항목
- `searchTarget`: 카운트 할 task의 이름
- `folder`: 파일 경로
- `datasetName`: 지정할 이름
- `month`: 달력 형태로 만듦
	- `mode`: 표시 형태
	- `annotation`: 카운트 할 task 별 **이모티콘**
# 2. 사용 예시
## 월별 습관 리뷰

```
searchType: task.done
searchTarget: 웨이트, 러닝, 테니스, 영어숙제, SNS 금지, 가계부
folder: "02. Area/01. Diary/01. Daily"
fixedScale: 0.8
month:
    mode: annotation
    annotation: 🏋🏻‍♂️,🏃🏻,🎾,🇺🇸,🈲,💰
    startWeekOn: 'Mon'
```

---
> [!example] 참고사이트
> - [Tracker github](https://github.com/pyrochlore/obsidian-tracker/tree/master)
