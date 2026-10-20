# 위반 픽스처

```anim
type: canvas
src: fx-bad-source.js
alt: 금지 API·색 리터럴
```

```anim
type: canvas
src: fx-blank.js
alt: 아무것도 그리지 않는다
```

```anim
type: canvas
src: fx-frozen.js
alt: 움직이지 않고 테마를 무시한다
cycle: 20000
```

```anim
type: steps
alt: 없는 id와 긴 문장
interval: 500
scene: |
  <svg viewBox="0 0 100 40"><g id="a"><circle cx="10" cy="20" r="5"/></g><g id="b"><circle cx="40" cy="20" r="5"/></g></svg>
steps:
  - say: 이 문장은 사십 자 제한을 넘기도록 일부러 아주 길게 늘여 쓴 단계 설명 문장입니다
    on: [a, ghost]
  - say: 마지막 단계가 요약이 아니다
    on: [a]
```

```anim
type: canvas
src: fx-missing.js
alt: 없는 파일
```
