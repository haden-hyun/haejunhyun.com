
const heroClient = (function heroClient() {
  const root = document.querySelector(".home-hero");
  const dataEl = root?.querySelector(".hero-data");
  const shelf = root?.querySelector(".hero-shelf");
  const dlg = root?.querySelector(".hero-card");
  const tip = root?.querySelector(".hero-tip");
  if (!dataEl || !shelf || !dlg || !tip) return;
  const notes = JSON.parse(dataEl.textContent).notes;
  const spines = [...shelf.querySelectorAll(".hero-spine")];
  if (spines.length !== notes.length) return;
  const mobileQ = window.matchMedia("(max-width: 800px)");
  const perRow = shelf.querySelector(".hero-row").children.length;
  const cleanups = [];
  const on = (t2, ev, fn, opt) => {
    t2.addEventListener(ev, fn, opt);
    cleanups.push(() => t2.removeEventListener(ev, fn, opt));
  };
  const el = (tag, txt) => {
    const e2 = document.createElement(tag);
    e2.textContent = txt;
    return e2;
  };
  let active = 0;
  spines.forEach((a2, i2) => {
    a2.tabIndex = i2 === active ? 0 : -1;
    a2.dataset.routerIgnore = "";
    a2.setAttribute("aria-haspopup", "dialog");
    a2.setAttribute("aria-label", notes[i2].t + " \u2014 " + notes[i2].tl + " \xB7 \uB178\uD2B8 \uCE74\uB4DC \uC5F4\uAE30");
  });
  const setActive = (k, focus) => {
    active = Math.max(0, Math.min(spines.length - 1, k));
    spines.forEach((a2, i2) => a2.tabIndex = i2 === active ? 0 : -1);
    if (focus) spines[active].focus();
  };
  const showTip = (k) => {
    const a2 = spines[k], n2 = notes[k], lift = 9;
    tip.replaceChildren(el("b", n2.t), el("small", n2.tl));
    tip.classList.add("is-on");
    const x2 = a2.offsetLeft + a2.offsetWidth / 2 - tip.offsetWidth / 2;
    tip.style.left = Math.max(0, Math.min(shelf.clientWidth - tip.offsetWidth, x2)) + "px";
    tip.style.top = a2.offsetTop - lift - tip.offsetHeight - 8 + "px";
  };
  const hideTip = () => tip.classList.remove("is-on");
  spines.forEach((a2, i2) => {
    on(a2, "pointerenter", (e2) => {
      if (e2.pointerType !== "touch") showTip(i2);
    });
    on(a2, "pointerleave", hideTip);
    on(a2, "focus", () => {
      active = i2;
      showTip(i2);
    });
    on(a2, "blur", hideTip);
  });
  on(shelf, "keydown", (e2) => {
    const d2 = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: perRow, ArrowUp: -perRow }[e2.key];
    if (d2) {
      e2.preventDefault();
      const k = active + d2;
      if (k >= 0 && k < spines.length) setActive(k, true);
    } else if (e2.key === "Home") {
      e2.preventDefault();
      setActive(0, true);
    } else if (e2.key === "End") {
      e2.preventDefault();
      setActive(spines.length - 1, true);
    }
  });
  let card = { k: 0, opener: null };
  const fillCard = () => {
    const n2 = notes[card.k];
    const q2 = (s2) => dlg.querySelector(s2);
    q2(".hero-card-eyebrow").textContent = n2.tl + (n2.sl ? " \xB7 \uC2DC\uB9AC\uC988 " + n2.sl : "") + (n2.isNew ? " \xB7 NEW" : "");
    q2(".hero-card-title").textContent = n2.t;
    q2(".hero-card-meta").textContent = "posted " + n2.p + (n2.c && n2.c !== n2.p ? " \xB7 \uC791\uC131 " + n2.c : "") + (n2.m ? " \xB7 " + n2.m + " min read" : "");
    q2(".hero-card-desc").textContent = n2.d || "\uC694\uC57D\uC774 \uC5C6\uB294 \uB178\uD2B8\uC785\uB2C8\uB2E4.";
    q2(".hero-card-dive").href = n2.h;
    q2(".hero-card-prev").disabled = card.k === 0;
    q2(".hero-card-next").disabled = card.k === spines.length - 1;
  };
  const openCard = (k) => {
    card = { k, opener: spines[k] };
    hideTip();
    dlg.classList.toggle("is-sheet", mobileQ.matches);
    fillCard();
    dlg.showModal();
    document.documentElement.classList.add("hero-locked");
    dlg.querySelector(".hero-card-title").focus();
  };
  const moveCard = (d2) => {
    const k = card.k + d2;
    if (k < 0 || k >= spines.length) return;
    card.k = k;
    card.opener = spines[k];
    fillCard();
  };
  on(shelf, "click", (e2) => {
    if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.button === 1) return;
    const a2 = e2.target.closest?.(".hero-spine");
    if (!a2) return;
    e2.preventDefault();
    const k = spines.indexOf(a2);
    setActive(k, false);
    openCard(k);
  });
  on(dlg, "close", () => {
    document.documentElement.classList.remove("hero-locked");
    if (card.opener) requestAnimationFrame(() => setActive(card.k, true));
  });
  on(dlg, "click", (e2) => {
    if (e2.target === dlg) dlg.close();
  });
  on(dlg.querySelector(".hero-card-close"), "click", () => dlg.close());
  on(dlg.querySelector(".hero-card-prev"), "click", () => moveCard(-1));
  on(dlg.querySelector(".hero-card-next"), "click", () => moveCard(1));
  on(dlg, "keydown", (e2) => {
    if (e2.key === "ArrowLeft") {
      e2.preventDefault();
      moveCard(-1);
    } else if (e2.key === "ArrowRight") {
      e2.preventDefault();
      moveCard(1);
    } else if (e2.key === "Tab") {
      const f3 = [...dlg.querySelectorAll("button:not(:disabled), a[href]")];
      const i2 = f3.indexOf(document.activeElement);
      if (e2.shiftKey && i2 <= 0) {
        e2.preventDefault();
        f3[f3.length - 1].focus();
      } else if (!e2.shiftKey && i2 === f3.length - 1) {
        e2.preventDefault();
        f3[0].focus();
      }
    }
  });
  on(dlg.querySelector(".hero-card-dive"), "click", (e2) => {
    if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.button === 1) return;
    e2.preventDefault();
    const url = new URL(e2.currentTarget.href, window.location.href);
    card.opener = null;
    dlg.close();
    window.spaNavigate ? window.spaNavigate(url) : window.location.href = url.href;
  });
  const hd = dlg.querySelector(".hero-card-handle");
  let y0 = null;
  on(hd, "pointerdown", (e2) => {
    y0 = e2.clientY;
    hd.setPointerCapture?.(e2.pointerId);
  });
  on(hd, "pointermove", (e2) => {
    if (y0 == null) return;
    const d2 = Math.max(0, e2.clientY - y0);
    dlg.style.transform = d2 ? "translateY(" + d2 + "px)" : "";
  });
  const end = (e2) => {
    if (y0 == null) return;
    const d2 = e2.clientY - y0;
    y0 = null;
    dlg.style.transform = "";
    if (d2 > 70) dlg.close();
  };
  on(hd, "pointerup", end);
  on(hd, "pointercancel", end);
  cleanups.push(() => {
    if (dlg.open) {
      card.opener = null;
      dlg.close();
    }
    document.documentElement.classList.remove("hero-locked");
  });
  window.addCleanup?.(() => cleanups.forEach((fn) => fn()));
})

function fillHeroVisits() {
  const total = document.getElementById("hero-visits-total")
  const today = document.getElementById("hero-visits-today")
  if (!total && !today) return
  const set = (el, n) => { if (el && Number.isFinite(n)) el.textContent = n }
  fetch("/api/stats")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (!d || !Number.isFinite(d.total) || !Number.isFinite(d.today)) return Promise.reject()
      set(total, d.total)
      set(today, d.today)
    })
    .catch(() =>
      fetch("https://haejunhyun.goatcounter.com/counter/TOTAL.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && total) total.textContent = d.count })
        .catch(() => {}),
    )
}

function initHero() {
  if (document.querySelector(".home-hero")) heroClient()
}

document.addEventListener("nav", () => {
  fillHeroVisits()
  initHero()
})
