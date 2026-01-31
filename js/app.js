(function () {

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.add("js-anim");

  /* ===============================
     REVEAL SAFE
     =============================== */
  const safety = setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 900);

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

 /* ===============================
   BACKGROUND IT ICONS (PRO+)
   - plus visible
   - plus long
   - spawn partout
   - propagation dans toutes directions
   =============================== */

if (!reduceMotion) {
  const container = document.querySelector(".bg-it");
  if (container) {

    const icons = [
      "☁️", "🖥️", "🗄️", "🧩",
      "📡", "🛜", "🌐", "🔐",
      "🛠️", "🧪", "🧠", "🖧",
      "📶", "🧰", "🧱", "📦"
    ];

    // ✅ Plus d’icônes (mais safe perf)
    const COUNT = 28;

    // Nettoyage si rechargement / bfcache
    container.innerHTML = "";

    for (let i = 0; i < COUNT; i++) {
      const icon = document.createElement("span");
      icon.textContent = icons[Math.floor(Math.random() * icons.length)];

      // ✅ Spawn partout sur l'écran (0..100%)
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;

      icon.style.left = `${startX}%`;
      icon.style.top  = `${startY}%`;

      // ✅ Direction aléatoire + distance grande => propagation "partout"
      const angle = Math.random() * Math.PI * 2;
      const distance = 900 + Math.random() * 900;

      icon.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      icon.style.setProperty("--y", `${Math.sin(angle) * distance}px`);

      // ✅ délai aléatoire + tailles variées => plus “vivant”
      icon.style.animationDelay = `${Math.random() * 12}s`;
      icon.style.fontSize = `${24 + Math.random() * 26}px`;

      // ✅ opacité variable
      icon.style.opacity = (0.26 + Math.random() * 0.18).toFixed(2);

      container.appendChild(icon);
    }
  }
}

})();
