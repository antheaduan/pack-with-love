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
    var INTERVAL = 3500;

    function show(next) {
      next = (next + slides.length) % slides.length;
      slides[idx].classList.remove('is-active');
      if (dots[idx]) { dots[idx].classList.remove('is-active'); dots[idx].setAttribute('aria-pressed', 'false'); }
      idx = next;
      slides[idx].classList.add('is-active');
      if (dots[idx]) { dots[idx].classList.add('is-active'); dots[idx].setAttribute('aria-pressed', 'true'); }
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

  /* ---- 4. Campaign progress (reads data/campaign.json) ---- */
  (function () {
    var mod = document.querySelector('[data-progress]');
    if (!mod || !window.fetch) return;

    // Fallbacks only. When a live endpoint is configured it reports the real
    // set cost (ACO can change it in their admin), and these go unused.
    var SET_COST = 4.5;   // one complete backpack set
    var MAX_SETS = 1000;  // the founding-year commitment

    var getJSON = function (url) {
      return fetch(url, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      });
    };

    // Local file first. If it names a `source` (e.g. ACO's live endpoint), use
    // that instead — so both sites can show the same number. If the remote call
    // fails we quietly keep the local numbers rather than hiding the bar.
    getJSON('data/campaign.json')
      .then(function (local) {
        if (!local || !local.source) return local;
        return getJSON(local.source)
          .then(function (remote) {
            remote = remote || {};
            var pick = function (k) { return remote[k] != null ? remote[k] : local[k]; };
            // Prefer the *_cents fields where the endpoint sends them. The
            // whole-dollar fields drop the cents, and two bars rounded from
            // different places disagree by up to a dollar — which is exactly
            // the disagreement this integration exists to prevent.
            var money = function (k) {
              return remote[k + '_cents'] != null
                ? Number(remote[k + '_cents']) / 100
                : pick(k);
            };
            return {
              goal: money('goal'),
              raised: money('raised'),
              // Counted from the backpack line item alone, upstream. Dividing
              // the *total* raised by the set cost would count shipping money
              // as backpacks.
              backpacks_funded: pick('backpacks_funded'),
              set_cost: pick('set_cost'),
              as_of: remote.as_of || local.as_of
            };
          })
          .catch(function () { return local; });
      })
      .then(function (d) {
        var goal = Number(d.goal), raised = Number(d.raised);
        if (!isFinite(goal) || goal <= 0 || !isFinite(raised) || raised < 0) throw new Error('bad data');

        var pct = Math.max(0, Math.min(100, (raised / goal) * 100));

        // Use the reported count whenever there is one — including a genuine
        // zero. Only estimate when nobody told us, and say so by using the
        // fallback cost.
        var setCost = Number(d.set_cost) > 0 ? Number(d.set_cost) : SET_COST;
        var reported = Number(d.backpacks_funded);
        var sets = (d.backpacks_funded != null && isFinite(reported) && reported >= 0)
          ? reported
          : Math.floor(raised / setCost);
        sets = Math.min(sets, MAX_SETS);

        var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
        var set = function (sel, text) {
          var el = mod.querySelector(sel);
          if (el) el.textContent = text;
        };

        set('[data-progress-raised]', money(raised));
        set('[data-progress-goal]', 'raised of ' + money(goal) + ' goal');
        set('[data-progress-sets]', sets.toLocaleString('en-US') +
            (sets === 1 ? ' backpack set funded' : ' backpack sets funded'));

        if (d.as_of) {
          var parts = String(d.as_of).split('-');
          var label = String(d.as_of);
          if (parts.length === 3) {
            var dt = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
            if (!isNaN(dt.getTime())) {
              label = dt.toLocaleDateString('en-US',
                { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            }
          }
          set('[data-progress-asof]', 'Updated ' + label);
        }

        var bar = mod.querySelector('[data-progress-fill]');
        if (bar) {
          bar.parentElement.setAttribute('aria-valuenow', String(Math.round(pct)));
          // let the browser paint the 0% state first so the fill animates
          requestAnimationFrame(function () { bar.style.width = pct + '%'; });
        }

        mod.hidden = false;
      })
      .catch(function () { /* leave the module hidden — never show $0 of $0 */ });
  })();

  /* ---- 5. Course seats (reads data/course.json, optionally live from ACO) ---- */
  (function () {
    var nodes = document.querySelectorAll('[data-seats]');
    if (!nodes.length || !window.fetch) return;

    var getJSON = function (url) {
      return fetch(url, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      });
    };

    getJSON('data/course.json')
      .then(function (local) {
        if (!local || !local.source) throw new Error('no live source');
        return getJSON(local.source).then(function (remote) {
          remote = remote || {};
          return {
            total: remote.seats_total != null ? Number(remote.seats_total) : Number(local.seats_total),
            taken: Number(remote.seats_taken),
            open: remote.open !== false
          };
        });
      })
      .then(function (d) {
        var total = d.total, taken = d.taken;
        if (!isFinite(total) || total <= 0 || !isFinite(taken) || taken < 0) throw new Error('bad data');
        var left = Math.max(0, total - taken);
        var full = !d.open || left === 0;

        Array.prototype.forEach.call(nodes, function (el) {
          if (left === 0) {
            el.classList.add('seats--full');
            el.innerHTML = '<strong>All ' + total + ' seats are taken for this year.</strong> ' +
              'Ask us about the waitlist and we\'ll be in touch when a seat opens.';
          } else if (full) {
            // Closed by an admin with seats still free — saying "all taken"
            // here would simply be untrue.
            el.classList.add('seats--full');
            el.innerHTML = '<strong>Enrollment is closed for this year.</strong> ' +
              'Ask us about the waitlist and we\'ll be in touch if that changes.';
          } else {
            el.innerHTML = '<strong>' + left + ' of ' + total + ' seats</strong> still open.';
          }
          el.hidden = false;
        });

        // A full course still accepts clicks otherwise, and ACO's page would
        // decline the payment — better to send them somewhere that can help.
        if (full) {
          Array.prototype.forEach.call(document.querySelectorAll('[data-enroll]'), function (a) {
            a.setAttribute('href', 'contact');
            a.textContent = 'Join the Waitlist';
          });
        }
      })
      .catch(function () { /* no reliable count — say nothing rather than guess */ });
  })();

  /* ---- 6. Scroll-reveal ---- */
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
