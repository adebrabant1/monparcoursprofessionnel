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
    applyTheme(isLight ? "dark" : "light");
  }, true);

  /* ===============================
     BACKGROUND IT (icônes) — seulement si .bg-it existe (accueil)
     =============================== */
  (function bgIT() {
    if (reduceMotion) return;
    var container = $(".bg-it");
    if (!container) return;

    // Icônes "safe" (évite gros aplats blancs)
    var ICONS = ["🖥️","🗄️","🖧","📡","🛰️","🌐","🔐","🛠️","🧪","🧰","📶","📦","🗂️","🧩","🔧","⚙️","☁︎"];

    var MAX_ICONS = 46;
    var SPAWN_EVERY = 650;
    var DURATION = 24000;
    var MIN_DIST = 650;
    var MAX_DIST = 1400;

    function rand(min, max) { return Math.random() * (max - min) + min; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function spawnIcon() {
      while (container.children.length > MAX_ICONS) {
        container.removeChild(container.firstChild);
      }

      var el = document.createElement("span");
      el.className = "it-particle";
      el.textContent = pick(ICONS);

      // Spawn partout (0..100%)
      var sx = rand(0, 100);
      var sy = rand(0, 100);

      // Direction 360°
      var angle = rand(0, Math.PI * 2);
      var dist = rand(MIN_DIST, MAX_DIST);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;

      var size = rand(22, 46);
      var op = rand(0.14, 0.32);

      el.style.setProperty("--sx", sx.toFixed(2) + "%");
      el.style.setProperty("--sy", sy.toFixed(2) + "%");
      el.style.setProperty("--dx", dx.toFixed(0) + "px");
      el.style.setProperty("--dy", dy.toFixed(0) + "px");
      el.style.setProperty("--size", size.toFixed(0) + "px");
      el.style.setProperty("--op", op.toFixed(2));
      el.style.setProperty("--dur", DURATION + "ms");

      container.appendChild(el);

      setTimeout(function () {
        if (el && el.parentNode === container) container.removeChild(el);
      }, DURATION + 200);
    }

    // burst start
    for (var i = 0; i < 16; i++) spawnIcon();
    setInterval(spawnIcon, SPAWN_EVERY);
  })();

  /* ===============================
     LOADER NAV (ne casse pas theme-toggle et modals)
     =============================== */
  var overlay = $(".page-loader");
  var loaderText = $(".page-loader__text");

  function setLoaderText(t) { if (loaderText) loaderText.textContent = t; }
  function showLoader() { if (overlay) overlay.classList.add("is-active"); }
  function hideLoader() { if (overlay) overlay.classList.remove("is-active"); }

  window.addEventListener("pageshow", function () { hideLoader(); });

  document.addEventListener("click", function (e) {
    // Ne jamais intercepter toggle
    if (e.target.closest && e.target.closest(".theme-toggle")) return;
    // Ne jamais intercepter un trigger modal
    if (e.target.closest && e.target.closest("[data-modal]")) return;

    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;

    var href = a.getAttribute("href");
    if (!href) return;

    var isExternal = /^https?:\/\//i.test(href) || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0;
    var isAnchor = href.indexOf("#") === 0;
    var newTab = a.target && a.target !== "";
    var isDownload = a.hasAttribute("download");
    if (isExternal || isAnchor || newTab || isDownload) return;

    if (reduceMotion) return;

    if (href.indexOf("index.html") !== -1) setLoaderText("Retour à l’accueil...");
    else setLoaderText("Préparation de l’expérience…");

    e.preventDefault();
    showLoader();

    setTimeout(function () { window.location.href = href; }, 650);
  });

  /* ===============================
     MODAL WOW + SLIDER + SWIPE
     =============================== */
  var modalState = { items: [], index: 0, startX: null };

  function ensureModal() {
    var modal = $(".modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="modal__backdrop" data-modal-close></div>' +
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
        '<div class="modal__header">' +
          '<h3 class="modal__title" id="modalTitle">Détails</h3>' +
          '<button class="modal__close" type="button" aria-label="Fermer" data-modal-close>✕</button>' +
        '</div>' +
        '<div class="modal__viewport">' +
          '<button class="modal__nav modal__nav--prev" type="button" aria-label="Précédent">‹</button>' +
          '<button class="modal__nav modal__nav--next" type="button" aria-label="Suivant">›</button>' +
          '<div class="modal__track"></div>' +
        '</div>' +
        '<div class="modal__footer">' +
          '<span class="modal__counter">1 / 1</span>' +
          '<div class="modal__dots" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    return modal;
  }

  function buildSlides(modal) {
    var track = $(".modal__track", modal);
    track.innerHTML = "";

    modalState.items.forEach(function (item) {
      var slide = document.createElement("div");
      slide.className = "modal__slide";
      slide.innerHTML = "<h4>" + (item.title || "Mission") + "</h4>" + (item.html || "<p>Contenu à venir.</p>");
      track.appendChild(slide);
    });
  }

  function buildDots(modal) {
    var dots = $(".modal__dots", modal);
    if (!dots) return;
    dots.innerHTML = "";

    for (var i = 0; i < modalState.items.length; i++) {
      (function (idx) {
        var d = document.createElement("span");
        d.className = "modal__dot" + (idx === modalState.index ? " is-active" : "");
        d.addEventListener("click", function () {
          modalState.index = idx;
          updateSlider(modal, true);
        });
        dots.appendChild(d);
      })(i);
    }
  }

  function snap(modal) {
    modal.classList.add("is-snapping");
    setTimeout(function () { modal.classList.remove("is-snapping"); }, 160);
  }

  function updateSlider(modal, doSnap) {
    var track = $(".modal__track", modal);
    var prev = $(".modal__nav--prev", modal);
    var next = $(".modal__nav--next", modal);
    var counter = $(".modal__counter", modal);
    var dots = $all(".modal__dot", modal);

    track.style.transform = "translateX(-" + (modalState.index * 100) + "%)";

    if (counter) counter.textContent = (modalState.index + 1) + " / " + modalState.items.length;
    if (prev) prev.disabled = modalState.index <= 0;
    if (next) next.disabled = modalState.index >= (modalState.items.length - 1);

    dots.forEach(function (d, i) {
      if (i === modalState.index) d.classList.add("is-active");
      else d.classList.remove("is-active");
    });

    if (doSnap) snap(modal);
  }

  function openModalAt(startIndex) {
    var modal = ensureModal();

    buildSlides(modal);
    modalState.index = Math.max(0, Math.min(startIndex || 0, modalState.items.length - 1));

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    buildDots(modal);
    updateSlider(modal, false);
    snap(modal);
  }

  function closeModal() {
    var modal = $(".modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function go(delta) {
    var modal = $(".modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    var nextIndex = modalState.index + delta;
    if (nextIndex < 0 || nextIndex > modalState.items.length - 1) return;

    modalState.index = nextIndex;
    updateSlider(modal, true);
  }

  // Open / Close / Nav
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-modal-close]")) return closeModal();
    if (e.target.closest && e.target.closest(".modal__nav--prev")) return go(-1);
    if (e.target.closest && e.target.closest(".modal__nav--next")) return go(+1);

    var trigger = e.target.closest ? e.target.closest("[data-modal]") : null;
    if (!trigger) return;

    e.preventDefault();

    var all = $all("[data-modal]");
    modalState.items = all.map(function (el) {
      var title = el.getAttribute("data-modal-title") || (el.querySelector("h3") ? el.querySelector("h3").textContent : "Mission");
      var content = el.getAttribute("data-modal-content") || "<p>Contenu à venir.</p>";
      return { title: title, html: content };
    });

    var idx = all.indexOf(trigger);
    openModalAt(idx >= 0 ? idx : 0);
  });

  // Keyboard
  document.addEventListener("keydown", function (e) {
    var modal = $(".modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(+1);
  });

  // Swipe
  document.addEventListener("pointerdown", function (e) {
    var modal = $(".modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    var viewport = $(".modal__viewport", modal);
    if (!viewport) return;
    if (!viewport.contains(e.target)) return;

    modalState.startX = e.clientX;
  });

  document.addEventListener("pointerup", function (e) {
    var modal = $(".modal");
    if (!modal || !modal.classList.contains("is-open")) return;

    if (modalState.startX === null) return;

    var dx = e.clientX - modalState.startX;
    modalState.startX = null;

    if (Math.abs(dx) < 45) return;
    if (dx > 0) go(-1);
    else go(+1);
  });

})();
