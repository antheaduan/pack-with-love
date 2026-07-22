/* =====================================================================
   PACK WITH LOVE — small, dependency-free enhancements
   1) Mobile menu open/close
   2) Header "scrolled" state (adds a hairline + shadow once you scroll)
   3) Gentle scroll-reveal for elements marked with data-reveal
   Everything degrades gracefully and respects reduced-motion settings.
   ===================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- 1. Mobile menu ---- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close the menu after tapping a link
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- 2. Header scroll state ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- 3. Hero carousel (rotating backpack designs) ---- */
  (function () {
    var carousel = document.querySelector('.hero__carousel');
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero__slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));
    if (slides.length < 2) return;

    var idx = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var INTERVAL = 5000;

    function show(next) {
      next = (next + slides.length) % slides.length;
      slides[idx].classList.remove('is-active');
      if (dots[idx]) dots[idx].classList.remove('is-active');
      idx = next;
      slides[idx].classList.add('is-active');
      if (dots[idx]) dots[idx].classList.add('is-active');
    }
    function start() { if (reduce || timer) return; timer = setInterval(function () { show(idx + 1); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { stop(); show(i); start(); });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    // Pause when the tab isn't visible
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

    start();
  })();

  /* ---- 4. Scroll-reveal ---- */
  var revealables = document.querySelectorAll('[data-reveal]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!revealables.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately if animation isn't wanted or supported.
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealables.forEach(function (el) { observer.observe(el); });
});
