(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Activer les animations uniquement si JS est bien là
  document.body.classList.add("js-anim");

  // Fallback: si souci, on force l'affichage après 900ms
  const safety = setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 900);

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-ready");
    clearTimeout(safety);
    if (reduceMotion) document.documentElement.style.scrollBehavior = "auto";
  });

  // Loader overlay (optionnel)
  const overlay = document.querySelector(".page-loader");
  const loaderText = document.querySelector(".page-loader__text");

  function setLoaderText(text){ if (loaderText) loaderText.textContent = text; }
  function showLoader(){ if (overlay) overlay.classList.add("is-active"); }
  function hideLoader(){ if (overlay) overlay.classList.remove("is-active"); }

  window.addEventListener("pageshow", () => hideLoader());

  document.addEventListener("click", (e) => {
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
    else setLoaderText("Chargement...");

    e.preventDefault();
    showLoader();

    setTimeout(() => {
      window.location.href = href;
    }, 650);
  });
})();
