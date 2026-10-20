// 노트 날짜·읽는 시간의 단일 구현. 홈(Featured·Recent)·Archive·SPECS가 함께 쓴다.

type DatedFile = {
  dates?: { created?: Date; modified?: Date; published?: Date }
  frontmatter?: Record<string, unknown>
}

/**
 * `reading-time` 패키지 알고리즘의 이식. content-meta(모바일)와 SPECS(데스크톱)가
 * 같은 숫자를 내야 해서 근사가 아니라 이식이다.
 *
 * 주의: 패키지를 의존성으로 넣지 말 것. CJS라 ESM 번들에서 컴포넌트 로드가 죽는다.
 */
function inRanges(code: number, ranges: [number, number][]): boolean {
  return ranges.some(([lo, hi]) => lo <= code && code <= hi)
}

// 카타카나는 원 패키지가 의도적으로 제외한다.
const isCJK = (c?: string): boolean =>
  typeof c === "string" &&
  inRanges(c.charCodeAt(0), [
    [0x3040, 0x309f],
    [0x4e00, 0x9fff],
    [0xac00, 0xd7a3],
    [0x20000, 0x2ebe0],
  ])

const isWordBound = (c?: string): boolean => typeof c === "string" && " \n\r\t".includes(c)

const isPunctuation = (c?: string): boolean =>
  typeof c === "string" &&
  inRanges(c.charCodeAt(0), [
    [0x21, 0x2f],
    [0x3a, 0x40],
    [0x5b, 0x60],
    [0x7b, 0x7e],
    [0x3000, 0x303f],
    [0xff00, 0xffef],
  ])

function countWords(text: string): number {
  let words = 0
  let start = 0
  let end = text.length - 1

  while (isWordBound(text[start])) start++
  while (end >= 0 && isWordBound(text[end])) end--

  const t = `${text}\n`
  for (let i = start; i <= end; i++) {
    if (isCJK(t[i]) || (!isWordBound(t[i]) && (isWordBound(t[i + 1]) || isCJK(t[i + 1])))) {
      words++
    }
    // CJK 뒤에 붙은 문장부호·공백은 같은 단어로 먹는다
    if (isCJK(t[i])) {
      while (i <= end && (isPunctuation(t[i + 1]) || isWordBound(t[i + 1]))) i++
    }
  }
  return words
}

/** 읽는 시간(분, 올림). 200 wpm — reading-time 기본값. 텍스트가 없으면 0. */
export function readingMinutes(text: string | undefined): number {
  return text ? Math.ceil(countWords(text) / 200) : 0
}

/** frontmatter 날짜 값(YAML Date 또는 문자열) → Date. 해석 불가면 undefined. */
export function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value
  if (typeof value !== "string" && typeof value !== "number") return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

/** YYYY-MM-DD (KST). 빌드 머신 시간대와 무관하게 같은 날짜를 낸다. */
export function formatYmd(date: Date): string {
  return date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
}

export interface NoteDates {
  created?: Date
  /** 개정(게시)일 = frontmatter.posted — 날짜 플러그인이 모르는 키라 직접 읽는다. created와 같은 날이면 undefined. */
  revised?: Date
  /** frontmatter.updated(note-properties가 modified로 별칭). created·revised와 같은 날이면 undefined. */
  updated?: Date
}

export function getNoteDates(file: DatedFile): NoteDates {
  const created = file.dates?.created ?? file.dates?.published
  const differs = (d: Date | undefined, ...others: (Date | undefined)[]) =>
    d && !others.some((o) => o && formatYmd(o) === formatYmd(d)) ? d : undefined

  const revised = differs(toDate(file.frontmatter?.posted), created)
  const updated = differs(file.dates?.modified, created, revised)
  return { created, revised, updated }
}

/** 목록 정렬·표시 키 = posted → created. 주의: modified(=updated)는 작업마다 바뀌므로 쓰지 않는다. */
export function getListDate(file: DatedFile): Date | undefined {
  const { created, revised } = getNoteDates(file)
  return revised ?? created
}
