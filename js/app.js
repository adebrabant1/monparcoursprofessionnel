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
     MODAL (pop-up) — missions & autres
     Utilisation:
     <article class="mission-item" data-modal="1"
       data-modal-title="Active Directory"
       data-modal-content="<p>Ton contenu ici</p>">...</article>
     =============================== */
  function ensureModal() {
    let modal = $(".modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal__backdrop" data-modal-close></div>
      <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal__header">
          <h3 class="modal__title" id="modalTitle">Détail</h3>
          <button class="modal__close" type="button" aria-label="Fermer" data-modal-close>✕</button>
        </div>
        <div class="modal__body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function openModal(title, html) {
    const modal = ensureModal();
    $(".modal__title", modal).textContent = title || "Détail";
    $(".modal__body", modal).innerHTML = html || "<p>Contenu à venir.</p>";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const modal = $(".modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) return closeModal();

    const trigger = e.target.closest("[data-modal]");
    if (!trigger) return;

    e.preventDefault();

    const title =
      trigger.getAttribute("data-modal-title") ||
      trigger.querySelector("h3")?.textContent ||
      "Détail";

    const content =
      trigger.getAttribute("data-modal-content") ||
      "<p>Contenu à venir.</p>";

    openModal(title, content);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();
