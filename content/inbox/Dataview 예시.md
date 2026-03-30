---
title: Dataview 예시
created: 2023-12-28
modified: 2023-12-28 14:11
cssclass: max
tags: obsidian, obsidian/dataview
---
# 오늘 만든 노트 목록 생성
- 예시 1)
```dataview

table

Where date(today)-file.ctime<dur(0 day)

Sort file.ctime desc

```
- 예시 2)
```dataview

table

Where file.cday=date(this.file.modifydate)

Sort file.ctime desc

```
