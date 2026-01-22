// ======================================================
// Animations + Loading overlay (global)
// - Reveal on load (top -> bottom)
// - Smooth loading overlay on internal navigation
// ======================================================

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Reveal on page load
  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-ready");

    // If reduced motion, skip fancy delays
    if (reduceMotion) {
      document.documentElement.style.scrollBehavior = "auto";
    }
  });

  // --- Loading overlay: show, then navigate
  const overlay = document.querySelector(".page-loader");
  const loaderText = document.querySelector(".page-loader__text");

  // Change text depending on context (optional)
  function setLoaderText(text) {
    if (loaderText) loaderText.textContent = text;
  }

  function showLoader() {
    if (!overlay) return;
    overlay.classList.add("is-active");
  }

  function hideLoader() {
    if (!overlay) return;
    overlay.classList.remove("is-active");
  }

  // Hide loader on pageshow (back/forward cache)
  window.addEventListener("pageshow", () => hideLoader());

  // Intercept internal link clicks
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

    // If reduced motion, don't delay navigation
    if (reduceMotion) return;

    // Custom text if you want
    if (href.includes("index.html")) setLoaderText("Retour à l’accueil...");
    else setLoaderText("Chargement...");

    e.preventDefault();
    showLoader();

    // Small delay for style (feel premium)
    const DELAY_MS = 650;
    setTimeout(() => {
      window.location.href = href;
    }, DELAY_MS);
  });
})();

