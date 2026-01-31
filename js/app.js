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
    // Auto-stagger si besoin
    document.querySelectorAll(".card").forEach((card, i) => {
      if (!card.dataset.stagger) card.dataset.stagger = String(i + 1);
    });

    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

  /* ===============================
     BACKGROUND IT – spawn partout + 360°
     =============================== */
  if (!reduceMotion) {
    const container = document.querySelector(".bg-it");

    if (container) {
      // ✅ IMPORTANT : emojis qui bug parfois = remplacés/filtrés
      const ICONS = [
        "🖥️","🗄️","🖧","📡","🛰️","🌐","🔐","🛠️","🧪","🧰",
        "📶","🛜","📦","🗂️","🧩","🔧","⚙️",
        "☁︎" // cloud en version texte (évite l’aplat blanc)
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

        // Spawn partout
        const sx = rand(0, 100);
        const sy = rand(0, 100);

        // Direction 360°
        const angle = rand(0, Math.PI * 2);
        const dist = rand(MIN_DIST, MAX_DIST);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        // Taille / opacité
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
     LOADER overlay (navigation)
     =============================== */
  const overlay = document.querySelector(".page-loader");
  const loaderText = document.querySelector(".page-loader__text");

  function setLoaderText(text){ if (loaderText) loaderText.textContent = text; }
  function showLoader(){ if (overlay) overlay.classList.add("is-active"); }
  function hideLoader(){ if (overlay) overlay.classList.remove("is-active"); }

  window.addEventListener("pageshow", () => hideLoader());

  document.addEventListener("click", (e) => {
    // ✅ NE JAMAIS intercepter le bouton theme
    if (e.target.closest(".theme-toggle")) return;

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
     THEME TOGGLE (dark/light) — FULL PAGE WASH ✅
     =============================== */
  const STORAGE_KEY = "portfolio-theme";

  function syncToggleUI(){
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    const isLight = document.body.classList.contains("theme--light");
    btn.setAttribute("aria-pressed", String(!isLight));

    const icon = btn.querySelector(".theme-toggle__icon");
    const text = btn.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  function applyTheme(theme){
    // ✅ Animation pleine page (overlay .theme-wash)
    document.body.classList.add("theme-wash-on");
    document.body.classList.add("theme-animating");

    // petit délai pour que l’overlay apparaisse AVANT le switch
    window.setTimeout(() => {
      if (theme === "light") document.body.classList.add("theme--light");
      else document.body.classList.remove("theme--light");

      localStorage.setItem(STORAGE_KEY, theme);
      syncToggleUI();
    }, 120);

    // on retire l’overlay après l’anim
    window.setTimeout(() => {
      document.body.classList.remove("theme-wash-on");
      document.body.classList.remove("theme-animating");
    }, 650);
  }

  window.addEventListener("DOMContentLoaded", () => {
    // init thème
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") document.body.classList.add("theme--light");
    syncToggleUI();

    // bind bouton
    const btn = document.querySelector(".theme-toggle");
    if (btn){
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isLight = document.body.classList.contains("theme--light");
        applyTheme(isLight ? "dark" : "light");
      }, true);
    }
  });

})();
