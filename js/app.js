(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===============================
     REVEAL
     =============================== */
  document.body.classList.add("js-anim");

  const safety = setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 900);

  window.addEventListener("DOMContentLoaded", () => {
    // Auto-stagger (si besoin)
    document.querySelectorAll(".card").forEach((card, i) => {
      if (!card.dataset.stagger) card.dataset.stagger = String(i + 1);
    });

    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

  /* ===============================
     THEME (dark/light) — global + animé + persist
     =============================== */
  const STORAGE_KEY = "portfolio-theme";

  function syncToggleUI() {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    const isLight = document.body.classList.contains("theme--light");
    btn.setAttribute("aria-pressed", String(!isLight));

    const icon = btn.querySelector(".theme-toggle__icon");
    const text = btn.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  function applyTheme(theme) {
    // animation douce
    document.body.classList.add("theme-animating");

    if (theme === "light") document.body.classList.add("theme--light");
    else document.body.classList.remove("theme--light");

    localStorage.setItem(STORAGE_KEY, theme);
    syncToggleUI();

    window.setTimeout(() => {
      document.body.classList.remove("theme-animating");
    }, 600);
  }

  window.addEventListener("DOMContentLoaded", () => {
    // init theme sur TOUTES les pages
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") document.body.classList.add("theme--light");
    syncToggleUI();

    // bind click toggle
    const btn = document.querySelector(".theme-toggle");
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
     BACKGROUND IT (icônes) — UNIQUEMENT si .bg-it existe (donc accueil)
     =============================== */
  if (!reduceMotion) {
    const container = document.querySelector(".bg-it");
    if (container) {
      const ICONS = [
        "🖥️","🗄️","🖧","📡","🛰️","🌐","🔐","🛠️","🧪","🧰",
        "📶","📦","🗂️","🧩","🔧","⚙️","☁︎"
      ];

      const MAX_ICONS = 46;
      const SPAWN_EVERY = 650;
      const DURATION = 24000;
      const MIN_DIST = 650;
      const MAX_DIST = 1400;

      function rand(min, max) { return Math.random() * (max - min) + min; }
      function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

      function spawnIcon() {
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

        const size = rand(22, 46);
        const op = rand(0.14, 0.32);

        el.style.setProperty("--sx", sx.toFixed(2) + "%");
        el.style.setProperty("--sy", sy.toFixed(2) + "%");
        el.style.setProperty("--dx", dx.toFixed(0) + "px");
        el.style.setProperty("--dy", dy.toFixed(0) + "px");
        el.style.setProperty("--size", size.toFixed(0) + "px");
        el.style.setProperty("--op", op.toFixed(2));
        el.style.setProperty("--dur", DURATION + "ms");

        container.appendChild(el);

        setTimeout(() => {
          if (el && el.parentNode === container) container.removeChild(el);
        }, DURATION + 200);
      }

      for (let i = 0; i < 16; i++) spawnIcon();
      setInterval(spawnIcon, SPAWN_EVERY);
    }
  }

  /* ===============================
     LOADER (navigation) — sans casser le toggle + sans casser les modals
     =============================== */
  const overlay = document.querySelector(".page-loader");
  const loaderText = document.querySelector(".page-loader__text");

  function setLoaderText(text){ if (loaderText) loaderText.textContent = text; }
  function showLoader(){ if (overlay) overlay.classList.add("is-active"); }
  function hideLoader(){ if (overlay) overlay.classList.remove("is-active"); }

  window.addEventListener("pageshow", () => hideLoader());

  document.addEventListener("click", (e) => {
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

    if (reduceMotion) return;

    if (href.includes("index.html")) setLoaderText("Retour à l’accueil...");
    else setLoaderText("Préparation de l’expérience…");

    e.preventDefault();
    showLoader();

    setTimeout(() => {
      window.location.href = href;
    }, 650);
  });

  /* ===============================
     MODAL (pop-up) — pour missions (si présent)
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
          <h3 class="modal__title" id="modalTitle">Titre</h3>
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
    modal.querySelector(".modal__title").textContent = title || "Détail";
    modal.querySelector(".modal__body").innerHTML = html || "<p>Contenu à venir.</p>";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    const modal = document.querySelector(".modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-modal-close]");
    if (close) return closeModal();

    const trigger = e.target.closest("[data-modal]");
    if (!trigger) return;

    e.preventDefault();
    const title = trigger.getAttribute("data-modal-title") || trigger.querySelector("h3")?.textContent || "Détail";
    const content = trigger.getAttribute("data-modal-content") || "<p>Contenu à venir.</p>";
    openModal(title, content);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

})();
