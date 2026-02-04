(function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORAGE_KEY = "portfolio-theme";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* ===============================
     REVEAL + STAGGER
     =============================== */
  document.body.classList.add("js-anim");
  var safety = setTimeout(function () { document.body.classList.add("is-ready"); }, 900);

  onReady(function () {
    $all(".card").forEach(function (card, i) {
      if (!card.getAttribute("data-stagger")) card.setAttribute("data-stagger", String(i + 1));
    });
    document.body.classList.add("is-ready");
    clearTimeout(safety);
  });

  /* ===============================
     THEME TOGGLE (unique, compatible CSS: body.theme--light)
     =============================== */
  (function themeToggle() {
    var btn = $(".theme-toggle");
    var wash = $(".theme-wash");
    if (!btn) return;

    function syncToggleUI() {
      var isLight = document.body.classList.contains("theme--light");
      btn.setAttribute("aria-pressed", String(!isLight));
      var icon = btn.querySelector(".theme-toggle__icon");
      var text = btn.querySelector(".theme-toggle__text");
      if (icon) icon.textContent = isLight ? "☀️" : "🌙";
      if (text) text.textContent = isLight ? "Clair" : "Sombre";
    }

    function flashOverlay() {
      if (!wash) return;
      wash.classList.remove("is-on");
      void wash.offsetWidth;
      wash.classList.add("is-on");
      setTimeout(function () { wash.classList.remove("is-on"); }, 520);
    }

    function setTheme(isLight, withAnim) {
      if (isLight) document.body.classList.add("theme--light");
      else document.body.classList.remove("theme--light");

      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");

      if (withAnim && !reduceMotion) {
        document.body.classList.add("theme-animating");
        flashOverlay();
        setTimeout(function () { document.body.classList.remove("theme-animating"); }, 650);
      }
      syncToggleUI();
    }

    // init
    var saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved === "light", false);

    btn.addEventListener("click", function () {
      var isLight = document.body.classList.contains("theme--light");
      setTheme(!isLight, true);
    });

    syncToggleUI();
  })();

  /* ===============================
     BACKGROUND IT (icônes)
     =============================== */
  (function bgIT() {
    if (reduceMotion) return;
    var container = $(".bg-it");
    if (!container) return;

    var ICONS = ["</>", "{ }", "01", "IP", "DNS", "AD", "SSH", "LAN", "WAN", "TCP", "UDP", "SQL", "VM"];
    var MAX = 26;
    var SPAWN_EVERY = 900;
    var DURATION = 5500;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function spawnIcon() {
      if (!container) return;
      // limite
      var existing = container.querySelectorAll(".bg-it__el");
      if (existing.length > MAX) return;

      var el = document.createElement("span");
      el.className = "bg-it__el";
      el.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];

      var left = rand(0, 100);
      var size = rand(12, 22);
      var opacity = rand(0.06, 0.14);
      var blur = rand(0, 0.6);

      el.style.left = left + "vw";
      el.style.fontSize = size + "px";
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = "blur(" + blur.toFixed(2) + "px)";
      el.style.animationDuration = DURATION + "ms";

      container.appendChild(el);

      setTimeout(function () {
        if (el && el.parentNode === container) container.removeChild(el);
      }, DURATION + 200);
    }

    // inject CSS minimal si pas présent
    if (!document.getElementById("bgItStyle")) {
      var st = document.createElement("style");
      st.id = "bgItStyle";
      st.textContent =
        ".bg-it__el{position:absolute;top:110vh;transform:translateY(0);font-weight:900;letter-spacing:.3px;" +
        "color:rgba(238,244,255,0.55);text-shadow:0 10px 30px rgba(0,0,0,0.25);" +
        "animation: bgItFloat linear forwards;user-select:none;}" +
        "body.theme--light .bg-it__el{color:rgba(11,18,32,0.35);}" +
        "@keyframes bgItFloat{from{transform:translateY(0)}to{transform:translateY(-140vh)}}";
      document.head.appendChild(st);
    }

    // burst + loop
    for (var i = 0; i < 14; i++) spawnIcon();
    setInterval(spawnIcon, SPAWN_EVERY);
  })();

  /* ===============================
     LOADER NAV (ne casse pas theme-toggle et modals)
     =============================== */
  (function loaderNav() {
    var overlay = $(".page-loader");
    var loaderText = $(".page-loader__text");

    function setLoaderText(t) { if (loaderText) loaderText.textContent = t; }
    function showLoader() { if (overlay) overlay.classList.add("is-active"); }
    function hideLoader() { if (overlay) overlay.classList.remove("is-active"); }

    window.addEventListener("pageshow", function () { hideLoader(); });

    document.addEventListener("click", function (e) {
      if (reduceMotion) return;

      // ne pas intercepter toggle / modals
      if (e.target.closest && e.target.closest(".theme-toggle")) return;
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

      setLoaderText(href.indexOf("index.html") !== -1 ? "Retour à l’accueil..." : "Préparation de l’expérience…");

      e.preventDefault();
      showLoader();
      setTimeout(function () { window.location.href = href; }, 650);
    });
  })();

  /* ===============================
     MODAL WOW + SLIDER + SWIPE
     =============================== */
  (function modalSlider() {
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
            '<div class="modal__dots"></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(modal);
      return modal;
    }

    function openModal(items, startIndex) {
      var modal = ensureModal();
      var track = $(".modal__track", modal);
      var dots = $(".modal__dots", modal);
      var title = $("#modalTitle", modal);
      var prev = $(".modal__nav--prev", modal);
      var next = $(".modal__nav--next", modal);

      modalState.items = items;
      modalState.index = startIndex || 0;

      track.innerHTML = "";
      dots.innerHTML = "";

      items.forEach(function (it, i) {
        var slide = document.createElement("div");
        slide.className = "modal__slide";
        slide.innerHTML = it.content;
        track.appendChild(slide);

        var dot = document.createElement("button");
        dot.className = "modal__dot" + (i === modalState.index ? " is-active" : "");
        dot.type = "button";
        dot.addEventListener("click", function () { goTo(i); });
        dots.appendChild(dot);
      });

      function update() {
        var it = modalState.items[modalState.index];
        if (title) title.textContent = it.title || "Détails";
        track.style.transform = "translateX(" + (-100 * modalState.index) + "%)";

        $all(".modal__dot", modal).forEach(function (d, i) {
          if (i === modalState.index) d.classList.add("is-active");
          else d.classList.remove("is-active");
        });

        if (prev) prev.disabled = modalState.index === 0;
        if (next) next.disabled = modalState.index === (modalState.items.length - 1);
      }

      function goTo(i) {
        modalState.index = Math.max(0, Math.min(i, modalState.items.length - 1));
        update();
      }

      if (prev) prev.onclick = function () { goTo(modalState.index - 1); };
      if (next) next.onclick = function () { goTo(modalState.index + 1); };

      modal.classList.add("is-open");
      document.body.classList.add("modal-open");

      update();
    }

    function closeModal() {
      var modal = $(".modal");
      if (!modal) return;
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
    }

    // Delegation open
    document.addEventListener("click", function (e) {
      var item = e.target.closest && e.target.closest("[data-modal]");
      if (!item) return;

      var group = item.getAttribute("data-modal") || "1";
      var all = $all('[data-modal="' + group + '"]');

      var items = all.map(function (el) {
        return {
          title: el.getAttribute("data-modal-title") || "Détails",
          content: el.getAttribute("data-modal-content") || "<p>Contenu à compléter.</p>"
        };
      });

      var idx = all.indexOf(item);
      openModal(items, idx);
    });

    // Close actions
    document.addEventListener("click", function (e) {
      if (e.target && e.target.hasAttribute && e.target.hasAttribute("data-modal-close")) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  })();

})();
