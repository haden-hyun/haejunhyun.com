// progress와 colors를 무시한다: 움직이지 않고 테마도 따르지 않는다.
export default function draw(ctx, { width, height }) {
  ctx.fillRect(width * 0.25, height * 0.25, width * 0.5, height * 0.5)
}
