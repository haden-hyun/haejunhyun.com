// 집중 모드 — 상태는 localStorage, 페인트 전에 <html focus-mode>로 적용한다(레이아웃은 custom.scss §8.6).
// - ⌘\ / Ctrl+\ 토글, 토글 전후 읽던 블록의 화면 위치 유지, 켤 때·세션 첫 노트에서 토스트
// - 우측 TOC 자리는 레일: 접힘 = 눈금, 커서 300ms 머묾·키보드 포커스·클릭 = 펼침
const KEY = "focus-mode"
const DESKTOP = "(min-width: 1201px)"
const BLOCKS = ".center > article :is(h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, table, figure)"
const COACH_KEY = "focus-coach"
const TOAST =
  '<span>패널 숨김</span><span class="focus-toast-sep" aria-hidden="true">·</span><span><kbd>⌘\\</kbd> 로 복원</span>'
const root = document.documentElement

const safe = <T,>(fn: () => T) => {
  try {
    return fn()
  } catch {
    return null
  }
}

root.toggleAttribute("focus-mode", safe(() => localStorage.getItem(KEY)) === "on")

let toastTimer = 0
let closeCoach = () => {}
let coachShown = false
let seen = false
let closeRail = () => {}

// 주의: SPA 이동이 body에 붙인 요소를 지운다 — 이동마다 빈 영역을 미리 만들어 둬야 첫 알림도 낭독된다.
function toastBox() {
  let el = document.querySelector<HTMLElement>(".focus-toast")
  if (!el) {
    el = document.createElement("div")
    el.className = "focus-toast"
    el.setAttribute("role", "status")
    document.body.append(el)
  }
  return el
}

function syncTip(on: boolean) {
  for (const t of document.querySelectorAll(".focus-tip")) {
    t.querySelector(".focus-tip-title")!.textContent = on ? "집중 모드 끄기" : "집중 모드 켜기"
    t.querySelector(".focus-tip-desc")!.textContent = on ? "패널 복원 · 본문 원래 폭" : "패널 숨김 · 본문 확대"
  }
}

// 표시하는 순간 본 것으로 기록한다(재방문 시 다시 안 뜸).
function showCoach(anchor: Element) {
  const host = anchor.parentElement
  if (!host || coachShown) return
  coachShown = true
  const el = document.createElement("div")
  el.className = "focus-coach"
  el.innerHTML =
    '<div><b>긴 글은 집중 모드로</b><span>패널 숨김 · 본문 확대 · <kbd>⌘\\</kbd></span></div>' +
    '<button type="button" class="focus-coach-close" aria-label="안내 닫기">×</button>'
  host.append(el)
  safe(() => localStorage.setItem(COACH_KEY, "1"))
  const timer = window.setTimeout(() => closeCoach(), 6000)
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCoach()
  closeCoach = () => {
    clearTimeout(timer)
    document.removeEventListener("keydown", onKey)
    el.remove()
    closeCoach = () => {}
  }
  el.querySelector("button")!.addEventListener("click", () => closeCoach())
  document.addEventListener("keydown", onKey)
  window.addCleanup(() => closeCoach())
}

function toast(show: boolean) {
  const box = toastBox()
  clearTimeout(toastTimer)
  box.classList.remove("show")
  box.textContent = ""
  if (!show) return
  // 빈 영역을 잠시 뒤 채워야 스크린리더가 상태 변경으로 읽는다.
  toastTimer = window.setTimeout(() => {
    if (!root.hasAttribute("focus-mode")) return
    box.innerHTML = TOAST
    box.classList.add("show")
    toastTimer = window.setTimeout(() => box.classList.remove("show"), 2500)
  }, 100)
}

// 상단 바 아래 경계에 걸친 가장 안쪽 블록과 그 화면 위치.
function readingAnchor() {
  const edge = document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 0
  let el: Element | null = null
  for (const b of document.querySelectorAll(BLOCKS)) {
    if (el && !el.contains(b)) break
    if (b.getBoundingClientRect().bottom > edge) el = b
  }
  return el && { el, top: el.getBoundingClientRect().top }
}

function setFocus(on: boolean) {
  const at = readingAnchor()
  // 숨는 좌측 단에 있던 포커스는 body로 떨어지므로 토글로 옮긴다.
  if (on && document.activeElement?.closest(".sidebar.left")) document.querySelector<HTMLElement>(".focus-toggle")?.focus()
  root.toggleAttribute("focus-mode", on)
  safe(() => localStorage.setItem(KEY, on ? "on" : "off"))
  for (const b of document.querySelectorAll(".focus-toggle")) b.setAttribute("aria-pressed", String(on))
  closeRail()
  closeCoach()
  syncTip(on)
  if (at) window.scrollBy({ top: at.el.getBoundingClientRect().top - at.top, behavior: "instant" })
  toast(on)
}

function buildRail() {
  const links = document.querySelectorAll<HTMLAnchorElement>(".sidebar.right .toc-content a")
  const sidebar = links[0]?.closest(".sidebar")
  if (!sidebar) return

  const nav = document.createElement("nav")
  nav.className = "focus-rail"
  nav.setAttribute("aria-labelledby", "focus-rail-caption")
  nav.innerHTML = '<span id="focus-rail-caption" class="focus-rail-caption">TOC</span><ol></ol>'
  const list = nav.lastElementChild!
  for (const a of links) {
    const li = document.createElement("li")
    li.className = a.parentElement?.className ?? ""
    li.innerHTML = '<a><span class="focus-rail-tick" aria-hidden="true"></span><span class="focus-rail-label"></span></a>'
    const link = li.firstElementChild as HTMLAnchorElement
    // data-for·클래스를 그대로 옮겨 업스트림 TOC 스크립트가 in-view(현재 절 판정)를 레일에도 칠하게 한다.
    link.setAttribute("href", a.getAttribute("href") ?? "")
    link.dataset.for = a.dataset.for ?? ""
    link.className = a.className
    link.lastElementChild!.textContent = a.textContent
    list.append(li)
  }
  sidebar.prepend(nav)

  // 펼침 지연과 닫힘 유예는 겹치지 않아 타이머 하나로 쓴다.
  let timer = 0
  const set = (open: boolean, pinned = false) => {
    clearTimeout(timer)
    nav.classList.toggle("open", open)
    nav.classList.toggle("pinned", open && pinned)
  }
  const later = (ms: number, open: boolean) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => set(open), ms)
  }
  const pinned = () => nav.classList.contains("pinned")
  closeRail = () => set(false)

  nav.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "touch") return
    if (nav.classList.contains("open")) clearTimeout(timer)
    else later(300, true)
  })
  nav.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "touch" && !pinned()) later(500, false)
  })
  // 고정된 패널·키보드(detail 0)·수정 키(새 탭)에서만 링크가 이동한다 — 그 밖의 클릭·탭은 펼친 채 고정.
  nav.addEventListener("click", (e) => {
    const link = (e.target as Element).closest("a")
    if (pinned() || (link && (e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey))) set(false)
    else {
      e.preventDefault()
      set(true, true)
    }
  })
  nav.addEventListener("focusin", (e) => {
    if ((e.target as Element).matches(":focus-visible")) set(true, pinned())
  })
  nav.addEventListener("focusout", (e) => {
    if (!pinned() && !nav.contains(e.relatedTarget as Node | null)) set(false)
  })

  const onDown = (e: PointerEvent) => {
    if (!nav.contains(e.target as Node)) set(false)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && nav.classList.contains("open")) set(false)
  }
  document.addEventListener("pointerdown", onDown)
  document.addEventListener("keydown", onKey)
  window.addCleanup(() => {
    clearTimeout(timer)
    document.removeEventListener("pointerdown", onDown)
    document.removeEventListener("keydown", onKey)
    closeRail = () => {}
    nav.remove()
  })
}

document.addEventListener("nav", () => {
  const buttons = document.querySelectorAll(".focus-toggle")
  if (!buttons.length) return
  const on = root.hasAttribute("focus-mode")
  const toggle = () => setFocus(!root.hasAttribute("focus-mode"))
  for (const b of buttons) {
    b.setAttribute("aria-pressed", String(on))
    b.addEventListener("click", toggle)
    window.addCleanup(() => b.removeEventListener("click", toggle))
  }

  syncTip(on)
  document.querySelector(".focus-rail")?.remove()
  buildRail()
  toastBox()

  // 한국어 자판은 같은 키가 ₩라 e.key가 아니라 e.code로 본다. 주의: Shift·Alt 조합(Safari ⇧⌘\ 등)은 남겨 둔다.
  const onKey = (e: KeyboardEvent) => {
    if (e.code !== "Backslash" || !(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey || e.isComposing || e.repeat) return
    const el = document.activeElement
    if (el instanceof HTMLElement && (el.isContentEditable || el.matches("input, textarea, select"))) return
    if (document.querySelector("dialog[open], .search-container.active") || !matchMedia(DESKTOP).matches) return
    e.preventDefault()
    toggle()
  }
  document.addEventListener("keydown", onKey)
  window.addCleanup(() => document.removeEventListener("keydown", onKey))

  const first = !seen && safe(() => sessionStorage.getItem(KEY)) === null
  seen = true
  safe(() => sessionStorage.setItem(KEY, "seen"))
  if (first && on && matchMedia(DESKTOP).matches) toast(true)

  if (!on && matchMedia(DESKTOP).matches && safe(() => localStorage.getItem(COACH_KEY)) === null) showCoach(buttons[0]!)
})
