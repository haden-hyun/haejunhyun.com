export default function draw(ctx, { width, height }) {
  ctx.fillStyle = "#ff0000"
  ctx.fillRect(0, 0, width * Math.random(), height)
  document.title = "x"
}
