(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Activer les animations uniquement si JS est bien là
  document.body.classList.add("js-anim");

  // Loader overlay
  const overlay = document.querySelector(".page-loader");
  const loaderText = document.querySelector(".page-loader__text");

  function setLoaderText(text) { if (loaderText) loaderText.textContent = text; }
  function showLoader() { if (overlay) overlay.classList.add("is-active"); }
  function hideLoader() { if (overlay) overlay.classList.remove("is-active"); }

  // Fallback: si souci, on force l'affichage après 900ms
  const safety = setTimeout(() => {
    document.body.classList.add("is-ready");
    hideLoader();
  }, 900);

  window.addEventListener("DOMContentLoaded", () => {
    // Auto-stagger for cards
    document.querySelectorAll(".card").forEach((card, i) => {
      if (!card.dataset.stagger) card.dataset.stagger = String(i + 1);
    });

    // Toujours cacher le loader au chargement (sécurité)
    hideLoader();

    // ✅ Important : déclenche le reveal après le rendu (sinon transition invisible)
    requestAnimationFrame(() => {
      document.body.classList.add("is-ready");
    });

    clearTimeout(safety);

    if (reduceMotion) document.documentElement.style.scrollBehavior = "auto";
  });

  // Back/forward cache
  window.addEventListener("pageshow", () => hideLoader());

  // Intercept internal navigation
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // Ignore external links / anchors / new tab / downloads
    const isExternal = /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
    const isAnchor = href.startsWith("#");
    const newTab = a.target && a.target !== "";
    const isDownload = a.hasAttribute("download");
    if (isExternal || isAnchor || newTab || isDownload) return;

    // Respect reduced motion (no delays/loader)
    if (reduceMotion) return;

    // Loader text depending on destination
    if (href.includes("index.html")) setLoaderText("Retour à l’accueil...");
    else if (href.includes("mesmissions")) setLoaderText("Chargement des missions…");
    else if (href.includes("apropos")) setLoaderText("Chargement du profil…");
    else if (href.includes("monentreprise")) setLoaderText("Chargement de l’entreprise…");
    else setLoaderText("Préparation de l’expérience…");

    e.preventDefault();
    showLoader();

    setTimeout(() => {
      window.location.href = href;
    }, 650);
  });
})();
