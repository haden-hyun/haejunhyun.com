import type { ThemeKey, QuartzPluginData } from "@quartz-community/types"
import { getDate } from "@quartz-community/utils"
import type { ImageOptions, UserOpts } from "./.quartz/plugins"

/**
 * v4 parity override for the `og-image` community plugin's default template.
 *
 * v4's `quartz/util/og.tsx` customized the built-in `defaultImage` renderer with
 * two changes (see root-commit diff, Task 11 of the v4→v5 migration):
 *   1. A left accent bar (8px, theme `secondary` color) — brand signature.
 *   2. The title (`<h1>`) uses `secondary` instead of `dark` for its color.
 *
 * The `og-image` plugin's `imageStructure` option is function-typed, so it can't
 * be expressed in `quartz.config.yaml` — it's supplied here via the plugin's
 * documented `CustomOgImages()` TS-override hook (see quartz.ts), which is the
 * sanctioned "callback option" escape hatch per MIGRATION-NOTES §0/§14.
 *
 * This function otherwise mirrors `.quartz/plugins/og-image/src/emitter.tsx`'s
 * own `defaultImage` byte-for-byte (field names, SVG markup, a11y attributes) —
 * only the two v4 customizations above are applied on top.
 */

type FontSpecification = string | { name: string; weights?: number[]; includeItalic?: boolean }

interface ColorScheme {
  light: string
  lightgray: string
  gray: string
  darkgray: string
  dark: string
  secondary: string
  tertiary: string
  highlight: string
  textHighlight: string
}

interface Theme {
  typography: {
    header: FontSpecification
    body: FontSpecification
  }
  colors: Record<ThemeKey, ColorScheme>
}

function getFontSpecificationName(spec: FontSpecification): string {
  return typeof spec === "string" ? spec : spec.name
}

function formatDate(d: Date, locale: string = "en-US"): string {
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

export function customOgImage({
  cfg,
  userOpts,
  title,
  description,
  fileData,
  iconBase64,
}: ImageOptions & { userOpts: UserOpts; iconBase64?: string }) {
  const { colorScheme } = userOpts
  const theme = cfg.theme as unknown as Theme
  const fontBreakPoint = 32
  const useSmallerFont = title.length > fontBreakPoint

  const rawDate = getDate(fileData as unknown as QuartzPluginData)
  const date = rawDate ? formatDate(rawDate, cfg.locale) : null

  // The emitter's own `defaultImage` uses the `reading-time` npm package for this;
  // that package isn't hoisted to the project root, so this override uses the same
  // words/200wpm estimate `reading-time` computes internally (v4 didn't customize
  // this value, only the two style changes documented above).
  const wordCount = (fileData.text ?? "").split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  const readingTimeText = (userOpts.readingTimeText ?? ((m: number) => `${m} min read`))(minutes)

  const tags = fileData.frontmatter?.tags ?? []
  // OG 이미지는 satori가 빌드 타임에 래스터화하며, 어떤 폰트를 로드할지는
  // og-image 에미터가 `theme.typography`에서 직접 읽는다(dist의 `emit()` →
  // `getSatoriFonts(theme.typography.header, theme.typography.body)`).
  // theme.typography.body(Noto Sans KR)는 Google Fonts에 있는 폰트라
  // 이 값을 그대로 쓰면 폰트 fetch 실패 없이 렌더된다.
  const bodyFont = getFontSpecificationName(theme.typography.body)
  const headerFont = getFontSpecificationName(theme.typography.header)

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        backgroundColor: theme.colors[colorScheme].light,
      }}
    >
      {/* Left accent bar — Slate Blue brand signature (v4 parity) */}
      <div
        style={{
          width: "8px",
          backgroundColor: theme.colors[colorScheme].secondary,
          flexShrink: 0,
        }}
      />
      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "2.5rem",
          fontFamily: bodyFont,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          {iconBase64 && (
            <img
              src={iconBase64}
              alt=""
              width={56}
              height={56}
              style={{
                borderRadius: "50%",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: theme.colors[colorScheme].gray,
              fontFamily: bodyFont,
            }}
          >
            {cfg.baseUrl}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: useSmallerFont ? 64 : 72,
              fontFamily: headerFont,
              fontWeight: 700,
              color: theme.colors[colorScheme].secondary,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            fontSize: 36,
            color: theme.colors[colorScheme].darkgray,
            lineHeight: 1.4,
          }}
        >
          <p
            style={{
              margin: 0,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 5,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: `1px solid ${theme.colors[colorScheme].lightgray}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              color: theme.colors[colorScheme].gray,
              fontSize: 28,
            }}
          >
            {date && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg
                  style={{ marginRight: "0.5rem" }}
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  role="img"
                  aria-label="Date"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {date}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center" }}>
              <svg
                style={{ marginRight: "0.5rem" }}
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                role="img"
                aria-label="Reading time"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {readingTimeText}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: "60%",
            }}
          >
            {tags.slice(0, 3).map((tag: string) => (
              <div
                style={{
                  display: "flex",
                  padding: "0.5rem 1rem",
                  backgroundColor: theme.colors[colorScheme].highlight,
                  color: theme.colors[colorScheme].secondary,
                  borderRadius: "10px",
                  fontSize: 24,
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
