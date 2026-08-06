import { describe, expect, it } from "vitest"
import { parseBlock } from "../src/parse-block"

describe("parseBlock", () => {
  it("블록 프런트매터와 위키링크를 읽는다", () => {
    const block = parseBlock(
      "image-layout",
      "---\nlayout: carousel\ncarouselShowThumbnails: true\n---\n![[a.png|첫 장]]\n![[b.png]]",
    )
    expect(block).toEqual({
      layout: "carousel",
      opts: { layout: "carousel", carouselshowthumbnails: true },
      images: [{ url: "a.png", caption: "첫 장" }, { url: "b.png" }],
    })
  })

  it("숫자 파이프는 캡션이 아니라 크기다", () => {
    expect(parseBlock("image-layout", "![[a.png|300]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
    })
    expect(parseBlock("image-layout", "![[a.png|300x200]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
      height: 200,
    })
  })

  it("크기와 캡션이 함께 오면 둘 다 잡는다", () => {
    expect(parseBlock("image-layout", "![[a.png|300|바다]]")?.images[0]).toEqual({
      url: "a.png",
      width: 300,
      caption: "바다",
    })
  })

  it("레거시 fence에서 레이아웃명을 뽑는다", () => {
    expect(parseBlock("image-layout-a", "![[a.png]]")?.layout).toBe("a")
  })

  it("마크다운 이미지도 읽는다", () => {
    expect(parseBlock("image-layout", "![바다](assets/a.png)")?.images[0]).toEqual({
      url: "assets/a.png",
      caption: "바다",
    })
  })

  it("깨진 YAML이어도 throw하지 않는다", () => {
    const block = parseBlock("image-layout", "---\nlayout: [unclosed\n---\n![[a.png]]")
    expect(block?.images).toHaveLength(1)
  })

  it("알 수 없는 키는 그대로 담고 무시할 수 있게 둔다", () => {
    const block = parseBlock("image-layout", "---\nsomeFutureKey: 1\n---\n![[a.png]]")
    expect(block?.opts.somefuturekey).toBe(1)
  })

  it("image-layout 계열이 아닌 fence는 null", () => {
    expect(parseBlock("python", "print(1)")).toBeNull()
  })

  it("이미지가 없으면 빈 배열", () => {
    expect(parseBlock("image-layout", "---\nlayout: a\n---\n")?.images).toEqual([])
  })

  it("여러 줄 grid 옵션을 보존한다", () => {
    const block = parseBlock(
      "image-layout",
      "---\nlayout: custom\ngrid: |\n  A A B\n  A A C\n---\n![[a.png]]",
    )
    expect(block?.opts.grid).toBe("A A B\nA A C\n")
  })
})
