// 토픽 표(key → 표시명)의 단일 소스. 부제·노트 수는 표에 두지 않는다 — topicIndex.ts가 런타임으로 센다.

export const TOPICS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "computer-science", label: "Computer Science" },
  { key: "data-engineering", label: "Data Engineering" },
  { key: "data-science", label: "Data Science" },
  { key: "gis", label: "GIS" },
  { key: "programming", label: "Programming" },
  { key: "finance-property", label: "Finance & Property" },
  { key: "tools", label: "Tools" },
]

export const TOPIC_NAMES: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.key, t.label]))

/** Topics 페이지의 토픽 섹션 앵커 — CATALOG `← All topics`가 이 id로 딥링크한다. */
export const topicAnchor = (key: string): string => `topic-${key}`
