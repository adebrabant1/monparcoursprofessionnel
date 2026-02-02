(function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORAGE_KEY = "portfolio-theme";

  /* ===============================
     HELPERS (compat)
     =============================== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* ===============================
     REVEAL
     =============================== */
  document.body.classList.add("js-anim");
  var safety = setTimeout(function () {
    document.body.classList.add("is-ready");
  }, 900);

  onReady(function () {
    // Auto-stagger (si besoin)
    $all(".card").forEach(function (card, i) {
      if (!card.getAttribute("data-stagger")) card.setAttribute("data-stagger", String(i + 1));
    });

    document.body.classList.add("is-ready");
    clearTimeout(safety);

    // Theme init (toutes pages)
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light") document.body.classList.add("theme--light");
    syncToggleUI();
  });

  /* ===============================
     THEME TOGGLE (dark/light) — anim + persist
     =============================== */
  function syncToggleUI() {
    var btn = $(".theme-toggle");
    if (!btn) return;

    var isLight = document.body.classList.contains("theme--light");
    btn.setAttribute("aria-pressed", String(!isLight));

    var icon = $(".theme-toggle__icon", btn);
    var text = $(".theme-toggle__text", btn);

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  function applyTheme(theme) {
    // animation douce sur toute la page
    document.body.classList.add("theme-animating");

    if (theme === "light") document.body.classList.add("theme--light");
    else document.body.classList.remove("theme--light");

    localStorage.setItem(STORAGE_KEY, theme);
    syncToggleUI();

    setTimeout(function () {
      document.body.classList.remove("theme-animating");
    }, 650);
  }

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest ? e.target.closest(".theme-toggle") : null;
    if (!toggle) return;

    e.preventDefault();
    e.stopPropagation();

    var isLight = document.body.classList.contains("theme--light");
    applyTheme(isLight ? "dark" : "light"
