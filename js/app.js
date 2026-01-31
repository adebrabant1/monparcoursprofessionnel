(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal (propre)
  document.body.classList.add("js-anim");

  const safety = setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 900);

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

  /* ===============================
     BACKGROUND IT – spawn partout + 360°
     =============================== */
  if (!reduceMotion) {
    const container = document.querySelector(".bg-it");
    if (container) {
      const ICONS = [
        "☁️","🖥️","🗄️","🛜","📡","🌐","🔐","🛠️","🧪","🧠",
        "🧩","🧰","📶","🖧","🧱","📦","🛰️","🗂️"
      ];

      // Réglages (tu peux tweak si tu veux)
      const MAX_ICONS = 42;       // max simultanés
      const SPAWN_EVERY = 650;    // ms (plus bas = + d’icônes)
      const DURATION = 26000;     // ms (plus long = + longtemps)
      const MIN_DIST = 700;       // propagation min
      const MAX_DIST = 1500;      // propagation max

      function rand(min, max) { return Math.random() * (max - min) + min; }
      function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

      function spawnIcon() {
        // Si trop d’icônes, on en enlève une ancienne
        if (container.children.length > MAX_ICONS) {
          container.removeChild(container.firstElementChild);
        }

        const el = document.createElement("span");
        el.className = "it-particle";
        el.textContent = pick(ICONS);

        // ✅ Spawn PARTOUT (0% -> 100%)
        const sx = rand(0, 100);
        const sy = rand(0, 100);

        // ✅ Direction 360°
        const angle = rand(0, Math.PI * 2);
        const dist = rand(MIN_DIST, MAX_DIST);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        // Visibilité / taille
        const size = rand(24, 48);
        const op = rand(0.24, 0.42);

        // Applique les variables CSS
        el.style.setProperty("--sx", sx.toFixed(2) + "%");
        el.style.setProperty("--sy", sy.toFixed(2) + "%");
        el.style.setProperty("--dx", dx.toFixed(0) + "px");
        el.style.setProperty("--dy", dy.toFixed(0) + "px");
        el.style.setProperty("--size", size.toFixed(0) + "px");
        el.style.setProperty("--op", op.toFixed(2));
        el.style.setProperty("--dur", DURATION + "ms");

        container.appendChild(el);

        // Auto-clean après fin anim
        setTimeout(() => {
          if (el && el.parentNode === container) container.removeChild(el);
        }, DURATION + 200);
      }

      // Petit burst au démarrage (ça se voit direct)
      for (let i = 0; i < 14; i++) spawnIcon();

      // Puis génération continue
      setInterval(spawnIcon, SPAWN_EVERY);
    }
  }
/* ===============================
   THEME TOGGLE (dark / light) + persistence
   =============================== */
(function setupThemeToggle(){
  const btn = document.querySelector(".theme-toggle");
  const STORAGE_KEY = "portfolio-theme"; // "dark" | "light"

  // Apply saved theme
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light") document.body.classList.add("theme--light");

  function syncUI(){
    const isLight = document.body.classList.contains("theme--light");
    if (!btn) return;

    btn.setAttribute("aria-pressed", String(!isLight)); // pressed = dark
    const icon = btn.querySelector(".theme-toggle__icon");
    const text = btn.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  if (btn){
    btn.addEventListener("click", () => {
      document.body.classList.toggle("theme--light");
      const isLight = document.body.classList.contains("theme--light");
      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
      syncUI();
    });
  }

  syncUI();
})();
