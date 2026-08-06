import { describe, expect, it } from "vitest"
import { parseOptions } from "../src/parse-options"

describe("parseOptions", () => {
  it("키를 소문자로 정규화한다", () => {
    expect(parseOptions("carouselShowThumbnails: true")).toEqual({ carouselshowthumbnails: true })
  })

  it("bool·number·문자열을 구분한다", () => {
    expect(parseOptions("a: true\nb: false\nc: 3\nd: 1.5\ne: 60vh\nf: null")).toEqual({
      a: true,
      b: false,
      c: 3,
      d: 1.5,
      e: "60vh",
      f: null,
    })
  })

  it("따옴표를 벗긴다", () => {
    expect(parseOptions('carouselBackground: "#101014"')).toEqual({
      carouselbackground: "#101014",
    })
    expect(parseOptions("caption: '여름 여행'")).toEqual({ caption: "여름 여행" })
  })

  it("콜론이 들어간 캡션을 자르지 않는다", () => {
    expect(parseOptions("caption: Sailing trip, June: day 2")).toEqual({
      caption: "Sailing trip, June: day 2",
    })
  })

  it("블록 스칼라를 줄바꿈째 모은다", () => {
    expect(parseOptions("layout: custom\ngrid: |\n  A A B\n  A A C")).toEqual({
      layout: "custom",
      grid: "A A B\nA A C",
    })
  })

  it("블록 스칼라 뒤에 오는 키를 계속 읽는다", () => {
    expect(parseOptions("grid: |\n  A B\ncaption: 끝")).toEqual({
      grid: "A B",
      caption: "끝",
    })
  })

  it("주석과 빈 줄을 건너뛴다", () => {
    expect(parseOptions("# 주석\n\nlayout: a")).toEqual({ layout: "a" })
  })

  it("문법에 안 맞는 줄은 조용히 버린다", () => {
    expect(parseOptions("이건 키가 아니다\nlayout: a")).toEqual({ layout: "a" })
  })

  it("빈 입력은 빈 객체", () => {
    expect(parseOptions("")).toEqual({})
  })
})
