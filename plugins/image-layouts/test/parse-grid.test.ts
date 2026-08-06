import { describe, expect, it } from "vitest"
import { parseCustomGrid } from "../src/parse-grid"

describe("parseCustomGrid", () => {
  it("공백으로 나눈 행을 grid-template-areas로 바꾼다", () => {
    expect(parseCustomGrid("A A B\nA A C")).toEqual({
      columns: 3,
      rows: 2,
      slots: 3,
      templateAreas: `"image-0 image-0 image-1" "image-0 image-0 image-2"`,
    })
  })

  it("'.'은 빈 셀로 남긴다", () => {
    expect(parseCustomGrid("A .\nA B")?.templateAreas).toBe(`"image-0 ." "image-0 image-1"`)
  })

  it("행마다 열 수가 다르면 null", () => {
    expect(parseCustomGrid("A A B\nA A")).toBeNull()
  })

  it("직사각형이 아닌 영역은 null", () => {
    expect(parseCustomGrid("A A B\nB A A")).toBeNull()
  })

  it("빈 값·비문자열은 null", () => {
    expect(parseCustomGrid("")).toBeNull()
    expect(parseCustomGrid(undefined)).toBeNull()
    expect(parseCustomGrid(42)).toBeNull()
  })

  it("모든 셀이 '.'이면 null", () => {
    expect(parseCustomGrid(". .\n. .")).toBeNull()
  })

  it("슬롯이 20개를 넘으면 null", () => {
    const spec = Array.from({ length: 21 }, (_, i) => `x${i}`).join(" ")
    expect(parseCustomGrid(spec)).toBeNull()
  })
})
