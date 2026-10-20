```anim
type: canvas
src: fx-good.js
alt: 학습률별 경사하강 경로
height: 240
cycle: 5000
hold: 2500
```

```anim
type: steps
alt: 두 단계 요약
scene: |
  <svg viewBox="0 0 100 40"><g id="a"><circle cx="20" cy="20" r="8"/></g><g id="b"><circle cx="70" cy="20" r="8"/></g></svg>
steps:
  - say: a가 켜진다
    on: [a]
  - say: a와 b가 모두 켜진다
    on: [a, b]
```
