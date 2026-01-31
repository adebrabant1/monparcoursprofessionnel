(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STORAGE_KEY = "portfolio-theme";

  /* ===============================
     HELPERS
     =============================== */
  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const onReady = (fn) =>
    (document.readyState === "loading")
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  /* ===============================
     REVEAL + STAGGER
     =============================== */
  document.body.classList.add("js-anim");

  const safety = setTimeout(() => document.body.classList.add("is-ready"), 900);

  onReady(() => {
    // Auto-stagger (si besoin)
    $$(".card").forEach((card, i) => {
      if (!card.dataset.stagger) card.dataset.stagger = String(i + 1);
    });

    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

  /* ===============================
     THEME TOGGLE (dark/light) — persist + animé
     =============================== */
  function syncToggleUI() {
    const btn = $(".theme-toggle");
    if (!btn) return;

    const isLight = document.body.classList.contains("theme--light");
    btn.setAttribute("aria-pressed", String(!isLight));

    const icon = $(".theme-toggle__icon", btn);
    const text = $(".theme-toggle__text", btn);

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  function applyTheme(theme) {
    // déclenche transition même si click rapide
    document.body.classList.add("theme-animating");
    void document.body.offsetWidth; // reflow

    if (theme === "light") document.body.classList.add("theme--light");
    else document.body.classList.remove("theme--light");

    localStorage.setItem(STORAGE_KEY, theme);
    syncToggleUI();

    setTimeout(() => document.body.classList.remove("theme-animating"), 560);
  }

  onReady(() => {
    // init thème sur toutes pages
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") document.body.classList.add("theme--light");
    syncToggleUI();

    const btn = $(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isLight = document.body.classList.contains("theme--light");
        applyTheme(isLight ? "dark" : "light");
      });
    }
  });

  /* ===============================
     BACKGROUND IT (accueil seulement si .bg-it existe)
     =============================== */
  function initBgIT() {
    if (reduceMotion) return;
    const container = $(".bg-it");
    if (!container) return;

    const ICONS = ["🖥️","🗄️","🖧","📡","🛰️","🌐","🔐","🛠️","🧪","🧰","📶","📦","🗂️","🧩","🔧","⚙️","☁︎"];

    const MAX_ICONS = 46;
    const SPAWN_EVERY = 650;
    const DURATION = 24000;
    const MIN_DIST = 650;
    const MAX_DIST = 1400;

    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[(Math.random() * arr.length) | 0];

    function spawn() {
      while (container.children.length > MAX_ICONS) {
        container.removeChild(container.firstElementChild);
      }

      const el = document.createElement("span");
      el.className = "it-particle";
      el.textContent = pick(ICONS);

      const sx = rand(0, 100);
      const sy = rand(0, 100);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(MIN_DIST, MAX_DIST);

      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      el.style.setProperty("--sx", sx.toFixed(2) + "%");
      el.style.setProperty("--sy", sy.toFixed(2) + "%");
      el.style.setProperty("--dx", dx.toFixed(0) + "px");
      el.style.setProperty("--dy", dy.toFixed(0) + "px");
      el.style.setProperty("--size", rand(22, 46).toFixed(0) + "px");
      el.style.setProperty("--op", rand(0.14, 0.32).toFixed(2));
      el.style.setProperty("--dur", DURATION + "ms");

      container.appendChild(el);

      setTimeout(() => el.remove(), DURATION + 200);
    }

    // burst + loop
    for (let i = 0; i < 16; i++) spawn();
    setInterval(spawn, SPAWN_EVERY);
  }
  onReady(initBgIT);

  /* ===============================
     LOADER NAV (sans casser toggle + modals)
     =============================== */
  const overlay = $(".page-loader");
  const loaderText = $(".page-loader__text");

  const setLoaderText = (t) => { if (loaderText) loaderText.textContent = t; };
  const showLoader = () => { if (overlay) overlay.classList.add("is-active"); };
  const hideLoader = () => { if (overlay) overlay.classList.remove("is-active"); };

  window.addEventListener("pageshow", hideLoader);

  document.addEventListener("click", (e) => {
    if (reduceMotion) return;

    // Ne jamais intercepter le toggle
    if (e.target.closest(".theme-toggle")) return;

    // Ne jamais intercepter un déclencheur modal
    if (e.target.closest("[data-modal]")) return;

    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    const isExternal = /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
    const isAnchor = href.startsWith("#");
    const newTab = a.target && a.target !== "";
    const isDownload = a.hasAttribute("download");
    if (isExternal || isAnchor || newTab || isDownload) return;

    e.preventDefault();
    setLoaderText(href.includes("index.html") ? "Retour à l’accueil..." : "Préparation de l’expérience…");
    showLoader();

    setTimeout(() => (window.location.href = href), 650);
  });

 /* ===============================
   MODAL (pop-up) — slider WOW
   data-modal : déclencheur
   =============================== */
function ensureModal() {
  let modal = document.querySelector(".modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal__backdrop" data-modal-close></div>

    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal__header">
        <h3 class="modal__title" id="modalTitle">Détails</h3>
        <button class="modal__close" type="button" aria-label="Fermer" data-modal-close>✕</button>
      </div>

      <div class="modal__viewport">
        <button class="modal__nav modal__nav--prev" type="button" aria-label="Précédent">‹</button>
        <button class="modal__nav modal__nav--next" type="button" aria-label="Suivant">›</button>

        <div class="modal__track"></div>
      </div>

      <div class="modal__footer">
        <span class="modal__counter">1 / 1</span>
        <div class="modal__dots" aria-hidden="true"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

let modalState = {
  items: [],
  index: 0,
  startX: null,
};

function buildSlides(modal) {
  const track = modal.querySelector(".modal__track");
  track.innerHTML = "";

  modalState.items.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "modal__slide";
    slide.innerHTML = `
      <h4>${item.title}</h4>
      ${item.html}
    `;
    track.appendChild(slide);
  });
}

function buildDots(modal){
  const dots = modal.querySelector(".modal__dots");
  if (!dots) return;
  dots.innerHTML = "";

  modalState.items.forEach((_, i) => {
    const d = document.createElement("span");
    d.className = "modal__dot" + (i === modalState.index ? " is-active" : "");
    d.addEventListener("click", () => {
      modalState.index = i;
      updateSlider(modal, true);
    });
    dots.appendChild(d);
  });
}

function snap(modal){
  modal.classList.add("is-snapping");
  window.setTimeout(() => modal.classList.remove("is-snapping"), 160);
}

function updateSlider(modal, doSnap = false) {
  const track = modal.querySelector(".modal__track");
  const prev = modal.querySelector(".modal__nav--prev");
  const next = modal.querySelector(".modal__nav--next");
  const counter = modal.querySelector(".modal__counter");
  const dots = modal.querySelectorAll(".modal__dot");

  track.style.transform = `translateX(-${modalState.index * 100}%)`;

  if (counter) counter.textContent = `${modalState.index + 1} / ${modalState.items.length}`;
  if (prev) prev.disabled = modalState.index <= 0;
  if (next) next.disabled = modalState.index >= modalState.items.length - 1;

  dots.forEach((d, i) => d.classList.toggle("is-active", i === modalState.index));

  if (doSnap) snap(modal);
}

function openModalAt(startIndex = 0) {
  const modal = ensureModal();

  buildSlides(modal);
  modalState.index = Math.max(0, Math.min(startIndex, modalState.items.length - 1));

  modal.querySelector(".modal__title").textContent = "Détails";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  buildDots(modal);
  updateSlider(modal, false);
  snap(modal);
}

function closeModal() {
  const modal = document.querySelector(".modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function go(delta) {
  const modal = document.querySelector(".modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  const nextIndex = modalState.index + delta;
  if (nextIndex < 0 || nextIndex > modalState.items.length - 1) return;

  modalState.index = nextIndex;
  updateSlider(modal, true);
}

document.addEventListener("click", (e) => {
  // close
  if (e.target.closest("[data-modal-close]")) return closeModal();

  // nav buttons
  if (e.target.closest(".modal__nav--prev")) return go(-1);
  if (e.target.closest(".modal__nav--next")) return go(+1);

  // open trigger
  const trigger = e.target.closest("[data-modal]");
  if (!trigger) return;

  e.preventDefault();

  // Liste de toutes les missions cliquables sur la page
  const all = [...document.querySelectorAll("[data-modal]")];

  modalState.items = all.map((el) => ({
    title:
      el.getAttribute("data-modal-title") ||
      el.querySelector("h3")?.textContent ||
      "Mission",
    html:
      el.getAttribute("data-modal-content") ||
      "<p>Contenu à venir.</p>",
  }));

  const clickedIndex = Math.max(0, all.indexOf(trigger));
  openModalAt(clickedIndex);
});

document.addEventListener("keydown", (e) => {
  const modal = document.querySelector(".modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  if (e.key === "Escape") return closeModal();
  if (e.key === "ArrowLeft") return go(-1);
  if (e.key === "ArrowRight") return go(+1);
});

/* Swipe mobile */
document.addEventListener("pointerdown", (e) => {
  const modal = document.querySelector(".modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  const viewport = modal.querySelector(".modal__viewport");
  if (!viewport.contains(e.target)) return;

  modalState.startX = e.clientX;
});

document.addEventListener("pointerup", (e) => {
  const modal = document.querySelector(".modal");
  if (!modal || !modal.classList.contains("is-open")) return;

  if (modalState.startX === null) return;

  const dx = e.clientX - modalState.startX;
  modalState.startX = null;

  if (Math.abs(dx) < 45) return;

  if (dx > 0) go(-1);
  else go(+1);
});


  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();
