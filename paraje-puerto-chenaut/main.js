(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $  = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]; }); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ============================================================
     Splash
     ============================================================ */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    function hide() { splash.classList.add("is-out"); }
    if (document.readyState === "complete") setTimeout(hide, 600);
    else window.addEventListener("load", function () { setTimeout(hide, 400); });
    setTimeout(hide, 4000);
  }

  /* ============================================================
     Navigation
     ============================================================ */
  function initNav() {
    var nav = $("[data-nav]");
    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-mobile-menu]");
    if (!nav) return;

    var onScroll = function () {
      if (window.scrollY > 60) nav.classList.add("is-solid");
      else nav.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var isOpen = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ============================================================
     Scroll Reveal
     ============================================================ */
  function initReveals() {
    var targets = $$("[data-reveal]");
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ============================================================
     Custom Cursor
     ============================================================ */
  function initCursor() {
    if (!fineHover) return;
    var cursor = $("[data-cursor]");
    if (!cursor) return;
    var dot = $(".cursor-dot", cursor);
    var ring = $(".cursor-ring", cursor);

    var rx = 0, ry = 0, dx = 0, dy = 0;
    var firstMove = false;

    window.addEventListener("mousemove", function (e) {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0)";
      if (!firstMove) {
        firstMove = true; rx = dx; ry = dy;
        ring.style.transform = "translate3d(" + rx + "px, " + ry + "px, 0)";
        cursor.classList.add("is-ready");
      }
    }, { passive: true });

    function loop() {
      rx += (dx - rx) * 0.12;
      ry += (dy - ry) * 0.12;
      ring.style.transform = "translate3d(" + rx + "px, " + ry + "px, 0)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverables = $$("a, button, .card, .bento-item, [data-tilt]");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        ring.style.width = "48px"; ring.style.height = "48px"; ring.style.margin = "-24px";
      });
      el.addEventListener("mouseleave", function () {
        ring.style.width = "32px"; ring.style.height = "32px"; ring.style.margin = "-16px";
      });
    });
  }

  /* ============================================================
     Card Tilt
     ============================================================ */
  function initTilt() {
    if (!fineHover) return;
    var cards = $$("[data-tilt]");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(800px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 4) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(800px) rotateY(0) rotateX(0) translateY(0)";
      });
    });
  }

  /* ============================================================
     Smooth scroll for anchors
     ============================================================ */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 88;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ============================================================
     Newsletter form
     ============================================================ */
  function initNewsletter() {
    var form = $("[data-newsletter-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", form);
      var btn = $("button", form);
      var originalText = btn.textContent;
      btn.textContent = "¡Gracias!";
      btn.disabled = true;
      input.value = "";
      setTimeout(function () { btn.textContent = originalText; btn.disabled = false; }, 3000);
    });
  }

  /* ============================================================
     GSAP-dependent inits
     ============================================================ */
  function initGSAPInits() {
    if (!window.gsap || !window.ScrollTrigger) return;
    try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}

    /* Parallax hero */
    var heroBg = $(".hero-bg img, .page-hero-bg img");
    if (heroBg) {
      gsap.to(heroBg, {
        y: 60,
        ease: "none",
        scrollTrigger: { trigger: heroBg.closest(".hero, .page-hero"), start: "top top", end: "bottom top", scrub: true }
      });
    }

    /* Reveal sections with stagger */
    $$(".reveal").forEach(function (section) {
      var items = $$(".reveal-item", section);
      if (!items.length) return;
      gsap.from(items, {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1,
        scrollTrigger: { trigger: section, start: "top 85%" }
      });
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initCursor, "initCursor");
    safe(initTilt, "initTilt");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initNewsletter, "initNewsletter");
    safe(initGSAPInits, "initGSAPInits");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
