import type { Blockquote, Paragraph, RootContent } from "mdast"
import type { AnimSpec } from "./parse"

type Props = Record<string, unknown>

// mdast에 figure/div 노드 타입이 없어 블록 컨테이너에 hName을 씌운다 (image-layouts와 동일).
const container = (hName: string, hProperties: Props, children: RootContent[]): Blockquote =>
  ({ type: "blockquote", data: { hName, hProperties }, children }) as unknown as Blockquote

const textBlock = (hName: string, hProperties: Props, value: string): Paragraph =>
  ({
    type: "paragraph",
    data: { hName, hProperties },
    children: [{ type: "text", value }],
  }) as unknown as Paragraph

const element = (hName: string, hProperties: Props): Paragraph =>
  ({ type: "paragraph", data: { hName, hProperties }, children: [] }) as unknown as Paragraph

/** resolve: 파일명 → 현재 페이지 기준 상대 URL. 빌드 시점에 끝내야 SPA·중첩 슬러그에서 404가 안 난다. */
export function buildNode(spec: AnimSpec, resolve: (name: string) => string): Blockquote {
  const figure = (props: Props, children: RootContent[]) =>
    container(
      "figure",
      { className: ["anim", `anim-${spec.kind}`], "data-needs-init": "true", ...props },
      [
        ...children,
        ...(spec.caption ? [textBlock("figcaption", { className: ["anim-caption"] }, spec.caption)] : []),
      ],
    )

  switch (spec.kind) {
    case "steps":
      return figure(
        {
          role: "group",
          ariaLabel: spec.alt,
          dataSteps: JSON.stringify(spec.steps),
          dataInterval: spec.interval,
          dataAutoplay: String(spec.autoplay),
        },
        [
          container("div", { className: ["anim-scene"] }, [{ type: "html", value: spec.scene }]),
          textBlock("p", { className: ["anim-say"], ariaLive: "polite" }, spec.steps[0]!.say),
        ],
      )
    case "canvas":
      return figure(
        {
          dataSrc: resolve(spec.src),
          dataCycle: spec.cycle,
          dataHold: spec.hold,
          style: `--anim-height:${spec.height}px`,
        },
        [
          container("div", { className: ["anim-stage"] }, [
            element("canvas", { role: "img", ariaLabel: spec.alt }),
          ]),
        ],
      )
    case "video":
      return figure({}, [
        element("video", {
          src: resolve(spec.src),
          ...(spec.poster ? { poster: resolve(spec.poster) } : {}),
          ariaLabel: spec.alt,
          muted: true,
          loop: true,
          playsInline: true,
          preload: "metadata",
        }),
      ])
  }
}
