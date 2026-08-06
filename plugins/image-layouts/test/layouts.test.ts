import { describe, expect, it } from "vitest"
import { resolveLayout } from "../src/layouts"

describe("resolveLayout", () => {
  it("프리셋 a는 2열 그리드다", () => {
    expect(resolveLayout("a", undefined, "single")).toEqual({
      kind: "grid",
      templateColumns: "1fr 1fr",
      templateAreas: `"image-0 image-1"`,
    })
  })

  it("프리셋 d는 2행 구조다", () => {
    expect(resolveLayout("d", undefined, "single")).toEqual({
      kind: "grid",
      templateColumns: "2fr 1fr",
      templateAreas: `"image-0 image-1" "image-0 image-2"`,
    })
  })

  it("custom은 grid 옵션을 파싱한다", () => {
    expect(resolveLayout("custom", "A A B\nA A C", "single")).toEqual({
      kind: "grid",
      templateColumns: "repeat(3, 1fr)",
      templateAreas: `"image-0 image-0 image-1" "image-0 image-0 image-2"`,
    })
  })

  it("custom인데 grid가 깨졌으면 자동배치로 폴백한다", () => {
    expect(resolveLayout("custom", "A A B\nA A", "single")).toEqual({ kind: "grid" })
  })

  it("masonry-3은 3열이다", () => {
    expect(resolveLayout("masonry-3", undefined, "single")).toEqual({ kind: "masonry", columns: 3 })
  })

  it("carousel", () => {
    expect(resolveLayout("carousel", undefined, "single")).toEqual({ kind: "carousel" })
  })

  it("대소문자를 가리지 않는다", () => {
    expect(resolveLayout("Carousel", undefined, "single").kind).toBe("carousel")
  })

  it("빈 레이아웃명은 fallback을 쓴다", () => {
    expect(resolveLayout("", undefined, "a").templateColumns).toBe("1fr 1fr")
  })

  it("미지원 레이아웃은 자동배치로 폴백한다 (throw 금지)", () => {
    expect(resolveLayout("some-future-layout", undefined, "single")).toEqual({ kind: "grid" })
  })

  it("masonry는 2~6만 인정한다", () => {
    expect(resolveLayout("masonry-9", undefined, "single")).toEqual({ kind: "grid" })
  })
})
