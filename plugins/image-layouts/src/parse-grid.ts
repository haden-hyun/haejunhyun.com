export interface CustomGrid {
  columns: number
  rows: number
  slots: number
  templateAreas: string
}

const MAX_SLOTS = 20

// ASCII 그리드 → grid-template-areas. 원 플러그인과 동일하게 행은 공백으로 나눈다.
// 실패는 전부 null — 빌드를 멈추지 않는다.
export function parseCustomGrid(spec: unknown): CustomGrid | null {
  if (typeof spec !== "string" || spec.trim() === "") return null

  const rows = spec
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => line.split(/\s+/))

  if (rows.length === 0) return null
  const columns = rows[0]!.length
  if (rows.some((row) => row.length !== columns)) return null

  const order: string[] = []
  for (const row of rows) {
    for (const cell of row) {
      if (cell !== "." && !order.includes(cell)) order.push(cell)
    }
  }
  if (order.length === 0 || order.length > MAX_SLOTS) return null

  // 주의: 각 영역이 꽉 찬 직사각형이 아니면 브라우저가 템플릿을 통째로 버린다
  for (const token of order) {
    let minRow = Infinity
    let maxRow = -1
    let minCol = Infinity
    let maxCol = -1
    let count = 0
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== token) return
        minRow = Math.min(minRow, r)
        maxRow = Math.max(maxRow, r)
        minCol = Math.min(minCol, c)
        maxCol = Math.max(maxCol, c)
        count++
      })
    })
    if (count !== (maxRow - minRow + 1) * (maxCol - minCol + 1)) return null
  }

  const templateAreas = rows
    .map(
      (row) =>
        `"${row.map((cell) => (cell === "." ? "." : `image-${order.indexOf(cell)}`)).join(" ")}"`,
    )
    .join(" ")

  return { columns, rows: rows.length, slots: order.length, templateAreas }
}
