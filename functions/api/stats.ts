/**
 * GoatCounter 통계 프록시 (Cloudflare Pages Function → /api/stats)
 * - 토큰은 Pages Secret(GOATCOUNTER_TOKEN)에만 두고 브라우저에는 집계값만 내려준다
 * - 응답: { today(KST), total, views{경로:방문자}, top[{path,title,count}](최근 30일), updated }
 * - 10분 엣지 캐시로 GoatCounter 요청 제한(초당 4회)을 피한다
 */

interface Env {
  GOATCOUNTER_TOKEN?: string
}

interface Ctx {
  env: Env
  request: Request
  waitUntil(p: Promise<unknown>): void
}

const API = "https://haejunhyun.goatcounter.com/api/v0"
const EPOCH = "2020-01-01T00:00:00Z"
const TTL = 600
const KST_MS = 9 * 3600e3
const HITS_PAGES = 3
const TOP_LIMIT = 30

type Hit = { path_id: number; path: string; title: string; count: number }
type HitsRes = { hits: Hit[]; more: boolean }
type TotalRes = { total: number; stats: { day: string; daily: number }[] }

const hourIso = (ms: number) => new Date(Math.ceil(ms / 3600e3) * 3600e3).toISOString().replace(/\.\d+Z$/, "Z")

async function gc<T>(token: string, path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${API}${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`goatcounter ${path} ${res.status}`)
  return res.json() as Promise<T>
}

// 주의: 초당 4회 제한 — 호출을 병렬로 보내지 않는다
async function allHits(token: string, start: string, end: string, pages: number): Promise<Hit[]> {
  const out: Hit[] = []
  for (let i = 0; i < pages; i++) {
    const params: Record<string, string> = { start, end, limit: "100" }
    if (out.length) params.exclude_paths = out.map((h) => h.path_id).join(",")
    const res = await gc<HitsRes>(token, "/stats/hits", params)
    out.push(...res.hits)
    if (!res.more) break
  }
  return out
}

async function collect(token: string) {
  const now = Date.now()
  const end = hourIso(now + 3600e3)
  const kstToday = new Date(now + KST_MS).toISOString().slice(0, 10)

  const all = await gc<TotalRes>(token, "/stats/total", { start: EPOCH, end })
  const recent = await gc<TotalRes>(token, "/stats/total", { start: hourIso(now - 2 * 864e5), end })
  const hits = await allHits(token, EPOCH, end, HITS_PAGES)
  const month = await gc<HitsRes>(token, "/stats/hits", { start: hourIso(now - 30 * 864e5), end, limit: String(TOP_LIMIT) })

  const views: Record<string, number> = {}
  for (const h of hits) views[h.path] = h.count

  return {
    today: recent.stats.find((s) => s.day === kstToday)?.daily ?? 0,
    total: all.total,
    views,
    top: month.hits.map((h) => ({ path: h.path, title: h.title, count: h.count })),
    updated: new Date(now).toISOString(),
  }
}

const json = (body: unknown, cache: string, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  })

export async function onRequestGet({ env, request, waitUntil }: Ctx): Promise<Response> {
  if (!env.GOATCOUNTER_TOKEN) return json({ error: "not configured" }, "no-store", 503)

  const cache = (caches as unknown as { default: Cache }).default
  const key = new Request(new URL(request.url).origin + "/api/stats")
  const hit = await cache.match(key)
  if (hit) return hit

  try {
    const res = json(await collect(env.GOATCOUNTER_TOKEN), `public, max-age=300, s-maxage=${TTL}`)
    waitUntil(cache.put(key, res.clone()))
    return res
  } catch {
    return json({ error: "upstream" }, "no-store", 502)
  }
}
