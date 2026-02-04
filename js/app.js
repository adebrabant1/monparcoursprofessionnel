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
  var safety = setTimeout(function () { document.body.classList.add("is-ready"); }, 900);

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
     THEME TOGGLE (✅ UNIQUE : body.theme--light)
     =============================== */
  function syncToggleUI() {
    var btn = $(".theme-toggle");
    if (!btn) return;

    var isLight = document.body.classList.contains("theme--light");
    btn.setAttribute("aria-pressed", String(!isLight));

    var icon = btn.querySelector(".theme-toggle__icon");
    var text = btn.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = isLight ? "☀️" : "🌙";
    if (text) text.textContent = isLight ? "Clair" : "Sombre";
  }

  function animateThemeFlash() {
    if (reduceMotion) return;
    document.body.classList.add("theme-animating");
    setTimeout(function () { document.body.classList.remove("theme-animating"); }, 650);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".theme-toggle");
    if (!btn) return;

    e.preventDefault();

    var willBeLight = !document.body.classList.contains("theme--light");

    animateThemeFlash();
    document.body.classList.toggle("theme--light", willBeLight);

    localStorage.setItem(STORAGE_KEY, willBeLight ? "light" : "dark");
    syncToggleUI();
  });

  /* ===============================
     BACKGROUND IT (icônes) — toutes pages si .bg-it existe
     =============================== */
  (function bgIT() {
    if (reduceMotion) return;

    var container = $(".bg-it");
    if (!container) return;

    var ICONS = ["🖥️","🗄️","🖧","📡","🛰️","🌐","🔐","🛠️","🧪","🧰","📶","📦","🗂️","🧩","🔧","⚙️","☁︎"];
    var MAX_ICONS = 46;
    var SPAWN_EVERY = 650;
    var DURATION = 24000;
    var MIN_DIST = 650;
    var MAX_DIST = 1400;

    function rand(min, max) { return Math.random() * (max - min) + min; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function spawnIcon() {
      while (container.children.length > MAX_ICONS) container.removeChild(container.firstChild);

      var el = document.createElement("span");
      el.className = "it-particle";
      el.textContent = pick(ICONS);

      var sx = rand(0, 100);
      var sy = rand(0, 100);

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
    var counter = $(".modal__counter", modal);
    var prev = $(".modal__nav--prev", modal);
    var next = $(".modal__nav--next", modal);

    var count = modalState.items.length;
    var idx = modalState.index;

    track.style.transform = "translateX(" + (-idx * 100) + "%)";

    if (counter) counter.textContent = (idx + 1) + " / " + count;
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx >= count - 1;

    $all(".modal__dot", modal).forEach(function (d, i) {
      d.classList.toggle("is-active", i === idx);
    });

    if (doSnap) snap(modal);
  }

  function openModal(items, startIndex) {
    var modal = ensureModal();

    modalState.items = items || [];
    modalState.index = Math.max(0, Math.min(startIndex || 0, modalState.items.length - 1));

    buildSlides(modal);
    buildDots(modal);

    document.body.classList.add("modal-open");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    updateSlider(modal, false);
  }

  function closeModal() {
    var modal = $(".modal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  // Click triggers
  document.addEventListener("click", function (e) {
    var closeBtn = e.target.closest && e.target.closest("[data-modal-close]");
    if (closeBtn) { e.preventDefault(); closeModal(); return; }

    var item = e.target.closest && e.target.closest("[data-modal]");
    if (!item) return;

    var title = item.getAttribute("data-modal-title") || "Détails";
    var html = item.getAttribute("data-modal-content") || "<p>Contenu à venir.</p>";

    openModal([{ title: title, html: html }], 0);
  });

  // Nav buttons
  document.addEventListener("click", function (e) {
    var modal = $(".modal.is-open");
    if (!modal) return;

    var prev = e.target.closest && e.target.closest(".modal__nav--prev");
    var next = e.target.closest && e.target.closest(".modal__nav--next");

    if (prev) { modalState.index = Math.max(0, modalState.index - 1); updateSlider(modal, true); }
    if (next) { modalState.index = Math.min(modalState.items.length - 1, modalState.index + 1); updateSlider(modal, true); }
  });

  // Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  // Swipe (mobile)
  document.addEventListener("touchstart", function (e) {
    var modal = $(".modal.is-open");
    if (!modal) return;
    modalState.startX = e.touches && e.touches[0] ? e.touches[0].clientX : null;
  }, { passive: true });

  document.addEventListener("touchend", function (e) {
    var modal = $(".modal.is-open");
    if (!modal) return;
    if (modalState.startX == null) return;

    var endX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
    if (endX == null) return;

    var dx = endX - modalState.startX;
    modalState.startX = null;

    if (Math.abs(dx) < 45) return;
    if (dx > 0) modalState.index = Math.max(0, modalState.index - 1);
    else modalState.index = Math.min(modalState.items.length - 1, modalState.index + 1);

    updateSlider(modal, true);
  }, { passive: true });

})();
