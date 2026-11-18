/* ============================================================================
   WEEKDAYS COFFEE — plain JavaScript
   1. Page routing (#home, #about, #outlet, #event)
   2. Mobile menu
   3. Hero carousel
   4. Gallery lightbox
============================================================================ */
(function () {
  "use strict";

  /* ---------- 1. Page routing ------------------------------------------- */
  var PAGES = ["home", "about", "outlet", "event"];
  var navbar = document.getElementById("navbar");

  function showPage() {
    var id = window.location.hash.replace("#", "");
    if (PAGES.indexOf(id) === -1) id = "home";

    document.querySelectorAll(".page").forEach(function (el) {
      el.hidden = el.dataset.page !== id;
    });
    document.querySelectorAll("[data-page-link]").forEach(function (el) {
      el.classList.toggle("active", el.dataset.pageLink === id);
    });

    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.addEventListener("hashchange", showPage);

  /* ---------- 2. Mobile menu -------------------------------------------- */
  var burger = document.getElementById("burger");

  function setMenu(open) {
    navbar.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }

  burger.addEventListener("click", function () {
    setMenu(!navbar.classList.contains("open"));
  });

  /* ---------- 3. Hero carousel ------------------------------------------ */
  var AUTOPLAY_MS = 6000;
  var heroSection = document.getElementById("hero");
  var slides = heroSection.querySelectorAll(".hero-slide");
  var dots = heroSection.querySelectorAll(".hero-dots button");
  var current = 0;
  var timer = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle("active", i === current);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });
    startAutoplay();
  }

  function startAutoplay() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      goTo(current + 1);
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearTimeout(timer);
  }

  document.getElementById("hero-prev").addEventListener("click", function () {
    goTo(current - 1);
  });
  document.getElementById("hero-next").addEventListener("click", function () {
    goTo(current + 1);
  });
  dots.forEach(function (d, i) {
    d.addEventListener("click", function () {
      goTo(i);
    });
  });

  // Pause while the pointer is over the hero
  heroSection.addEventListener("mouseenter", stopAutoplay);
  heroSection.addEventListener("mouseleave", startAutoplay);

  /* ---------- 4. Gallery lightbox --------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCounter = document.getElementById("lb-counter");
  var galleryImgs = document.querySelectorAll("#gallery .gallery-img");
  var lbIndex = 0;

  function renderLightbox() {
    var img = galleryImgs[lbIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCounter.textContent = lbIndex + 1 + " / " + galleryImgs.length;
  }

  function openLightbox(index) {
    lbIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function stepLightbox(delta) {
    lbIndex = (lbIndex + delta + galleryImgs.length) % galleryImgs.length;
    renderLightbox();
  }

  document.querySelectorAll("#gallery .gallery-item").forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      openLightbox(i);
    });
  });

  document.getElementById("lb-close").addEventListener("click", function (e) {
    e.stopPropagation();
    closeLightbox();
  });
  document.getElementById("lb-prev").addEventListener("click", function (e) {
    e.stopPropagation();
    stepLightbox(-1);
  });
  document.getElementById("lb-next").addEventListener("click", function (e) {
    e.stopPropagation();
    stepLightbox(1);
  });
  // Click on the dark backdrop closes; clicking the photo does not
  lightbox.addEventListener("click", closeLightbox);
  lbImg.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  /* ---------- 5. Event rails (horizontal scroll) ------------------------- */
  document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
    var rail = wrap.querySelector(".rail");
    var prev = wrap.querySelector(".rail-prev");
    var next = wrap.querySelector(".rail-next");

    function update() {
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    }
    function step(dir) {
      rail.scrollBy({ left: dir * rail.clientWidth * 0.9, behavior: "smooth" });
    }

    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", function () { setTimeout(update, 0); });
    update();
  });

  /* ---------- Init ------------------------------------------------------ */
  showPage();
  window.dispatchEvent(new Event("resize")); // refresh rail arrows once the page is visible
  startAutoplay();
})();
