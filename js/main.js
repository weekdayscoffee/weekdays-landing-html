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
  var hovering = false;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle("active", i === current);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });
    // Klik panah/dot saat kursor di atas hero tidak boleh menyalakan autoplay lagi
    if (!hovering) startAutoplay();
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
  heroSection.addEventListener("mouseenter", function () {
    hovering = true;
    stopAutoplay();
  });
  heroSection.addEventListener("mouseleave", function () {
    hovering = false;
    startAutoplay();
  });

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
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
    }

    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", function () { setTimeout(update, 0); });
    update();
  });

  /* ---------- 6. Client logos: drifts on its own, swipeable by hand ----- */
  // The list is rendered twice in the HTML, so the drift loops without a jump.
  var logoStrip = document.querySelector(".logo-strip");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (logoStrip && !reduceMotion) {
    var SPEED = 36; // px per second
    var pos = logoStrip.scrollLeft;
    var logoPaused = false;
    var last = performance.now();
    var resumeTimer = null;

    var tickLogos = function (now) {
      var dt = Math.min(now - last, 100);
      last = now;
      if (logoStrip.offsetParent === null) {
        // Event page is hidden (display: none): keep the position in sync, don't drift
        pos = logoStrip.scrollLeft;
      } else if (!logoPaused) {
        var half = logoStrip.scrollWidth / 2;
        pos += (SPEED * dt) / 1000;
        if (half > 0 && pos >= half) pos = pos % half;
        logoStrip.scrollLeft = pos;
      }
      requestAnimationFrame(tickLogos);
    };

    var pauseLogos = function () {
      clearTimeout(resumeTimer);
      logoPaused = true;
    };
    var resumeLogos = function (delay) {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () {
        pos = logoStrip.scrollLeft;
        logoPaused = false;
      }, delay);
    };

    logoStrip.addEventListener("mouseenter", pauseLogos);
    logoStrip.addEventListener("mouseleave", function () { resumeLogos(0); });
    logoStrip.addEventListener("focusin", pauseLogos);
    logoStrip.addEventListener("focusout", function () { resumeLogos(0); });
    logoStrip.addEventListener("touchstart", pauseLogos, { passive: true });
    logoStrip.addEventListener("touchend", function () { resumeLogos(2500); }); // let swipe momentum finish

    requestAnimationFrame(tickLogos);
  }

  /* ---------- 7. Image fallback: foto yang gagal dimuat jadi blok gradasi -- */
  // Error events on <img> do not bubble, so listen in the capture phase.
  document.addEventListener(
    "error",
    function (e) {
      if (e.target && e.target.tagName === "IMG") e.target.classList.add("is-broken");
    },
    true
  );

  /* ---------- Init ------------------------------------------------------ */
  showPage();
  window.dispatchEvent(new Event("resize")); // refresh rail arrows once the page is visible
  startAutoplay();
})();
