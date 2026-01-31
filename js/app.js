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
     BACKGROUND IT ICONS (FIX)
     =============================== */

  if (!reduceMotion) {
    const container = document.querySelector(".bg-it");
    if (container) {

      const icons = [
        "☁️", "🖥️", "🧠", "🗄️",
        "📡", "🛜", "🧩", "🔐",
        "🛠️", "🧪", "🌐"
      ];

      const COUNT = 18;

      for (let i = 0; i < COUNT; i++) {
        const icon = document.createElement("span");
        icon.textContent = icons[Math.floor(Math.random() * icons.length)];

        const angle = Math.random() * Math.PI * 2;
        const distance = 600 + Math.random() * 600;

        icon.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
        icon.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
        icon.style.animationDelay = `${Math.random() * 8}s`;
        icon.style.fontSize = `${22 + Math.random() * 18}px`;

        container.appendChild(icon);
      }
    }
  }

})();
