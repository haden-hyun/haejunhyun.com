import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 * Theme B — Nanum Myeongjo (heading) + Noto Sans KR (body) + Slate Blue
 *
 * ── 컬러 키 역할 ──────────────────────────────────────────────────────────
 * light       : 페이지 배경색. 가장 넓은 면적을 차지.
 * lightgray   : 사이드바·테두리·구분선에 사용되는 연한 회색.
 * gray        : 메타 정보(날짜, 읽기 시간)·비활성 UI 요소.
 * darkgray    : 본문 텍스트 기본색. 순수 black보다 부드러움.
 * dark        : 제목(h1~h3), 강조 텍스트에 사용되는 가장 진한 색.
 * secondary   : 링크·active 상태·태그·callout 포인트 컬러. 브랜드 색.
 * tertiary    : secondary 보조색. hover 상태, 그래프 노드 등에 활용.
 * highlight   : 인라인 코드 배경, 검색 하이라이트, 선택 영역 배경.
 * textHighlight: <mark> 태그 배경색. 형광펜 효과.
 * ─────────────────────────────────────────────────────────────────────────
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "☀️ haejun",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "google",
      tagId: "G-6XY03WD2ST",
    },
    locale: "en-US",                           // ← "ko-KR" → "en-US" 변경 (날짜 영문 표시, 줄바뀜 방지)
    baseUrl: "haejunhyun.com",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "published",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        // ── 폰트 키 역할 ──────────────────────────────────────────────
        // header : 사이트 제목(PageTitle), h1~h3 제목에 적용
        // body   : 본문 paragraph, 사이드바, 메타 텍스트 전반
        // code   : 인라인 코드(`backtick`) 및 코드블록 내부
        // ─────────────────────────────────────────────────────────────
        header: "Nanum Myeongjo",             // ← Gowun Batang → Nanum Myeongjo (명조, 제목 위계감)
        body:   "Noto Sans KR",               // ← Gowun Batang → Noto Sans KR (고딕, 본문 가독성)
        code:   "JetBrains Mono",             // 유지 (가장 완성도 높은 코딩 폰트)
      },
      colors: {
        lightMode: {
          // ── Light Mode ───────────────────────────────────────────────
          light:         "#fafaf8",            // ← "#faf8f8" → 약간 더 따뜻한 오프화이트
          lightgray:     "#e8e4de",            // ← "#e5e5e5" → 따뜻한 베이지 계열 구분선
          gray:          "#a09890",            // ← "#b8b8b8" → 따뜻한 회갈색 (메타 텍스트)
          darkgray:      "#3d3833",            // ← "#4e4e4e" → 따뜻한 다크브라운 (본문)
          dark:          "#1a1612",            // ← "#2b2b2b" → 거의 흑색에 가까운 브라운 (제목)
          secondary:     "#3d6b8e",            // ← "#284b63" → Slate Blue (링크·포인트 컬러)
          tertiary:      "#6a9ab8",            // ← "#84a59d" → secondary 밝은 버전 (hover·그래프)
          highlight:     "rgba(61,107,142,0.10)", // ← 기존 회색계 → secondary 기반 블루 틴트
          textHighlight: "#fde68a88",          // ← "#fff23688" → 앰버 옐로우 형광펜
        },
        darkMode: {
          // ── Dark Mode (라이트 권장이지만 다크 전환 시 대비 유지) ────
          light:         "#1a1e24",
          lightgray:     "#2a3040",
          gray:          "#5a6478",
          darkgray:      "#b8c4d4",
          dark:          "#e8edf5",
          secondary:     "#7aaed4",            // 다크모드에서 secondary 더 밝게
          tertiary:      "#9cc4e4",
          highlight:     "rgba(122,174,212,0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          // ── SyntaxHighlighting 테마 키 역할 ──────────────────────
          // light/dark : shiki(코드 하이라이터)의 내장 테마명
          // 주요 light 테마: "github-light", "min-light", "solarized-light"
          //                  "catppuccin-latte", "one-light"
          // 주요 dark  테마: "github-dark", "tokyo-night", "dracula"
          //                  "catppuccin-mocha", "nord"
          // keepBackground: true → 테마 배경색 그대로 / false → Quartz 배경 따라감
          // ─────────────────────────────────────────────────────────
          light: "github-light",               // 유지 — 깔끔하고 색상 구분 명확
          dark:  "github-dark",
        },
        keepBackground: false,                 // false → custom.scss의 코드블록 배경 사용
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }), // katex 유지 (mathjax보다 빠름)
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
