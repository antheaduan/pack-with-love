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

  /* ---- 3. Scroll-reveal ---- */
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
