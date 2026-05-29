/**
 * main.js — minimal, purposeful JS for andriymalyshchak.com
 *
 * 0. Typewriter effect on name
 * 1. Staggered entrance animations via IntersectionObserver
 * 2. Current year in footer
 * 5. Photo strip — auto-rotating banner
 */

(function () {
  'use strict';

  /* ── 0. Typewriter effect on name ───────────────────────────────────────
     Types "Andriy Malyshchak" one character at a time with randomised
     per-character delay. Cursor blinks 3 cycles after typing, then fades.
     Skipped entirely under prefers-reduced-motion.
  ─────────────────────────────────────────────────────────────────────── */
  (function () {
    var nameEl = document.querySelector('.hero__name');
    if (!nameEl) return;

    var NAME = 'Andriy Malyshchak';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var textNode = document.createTextNode('');
    var cursor   = document.createElement('span');
    cursor.id = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    nameEl.innerHTML = '';
    nameEl.appendChild(textNode);
    nameEl.appendChild(cursor);

    var i = 0;

    function typeNext() {
      if (i >= NAME.length) {
        setTimeout(function () {
          cursor.style.transition = 'opacity 400ms ease';
          cursor.style.opacity    = '0';
          setTimeout(function () {
            if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
          }, 400);
        }, 1600);
        return;
      }

      var ch = NAME[i];
      textNode.textContent += ch;
      i++;

      var delay = Math.random() * 40 + 45;
      if (ch === ' ') delay += 180;

      setTimeout(typeNext, delay);
    }

    setTimeout(typeNext, 200);
  }());

  /* ── 1. Staggered entrance animations ───────────────────────────────────
     CSS sets opacity:0 + translateY on .js .hero and .js .section.
     We add .is-visible as each element enters the viewport, triggering
     the CSS transition. Stagger is applied as a transitionDelay via JS
     so the order is determined by DOM position, not hardcoded selectors.
  ─────────────────────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const STAGGER_MS = 70;
    const THRESHOLD  = 0.08;

    const targets = document.querySelectorAll('.hero, .section');

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: THRESHOLD, rootMargin: '0px 0px -32px 0px' }
    );

    targets.forEach(function (el, i) {
      el.style.transitionDelay = (i * STAGGER_MS) + 'ms';
      observer.observe(el);
    });
  } else {
    /* No IntersectionObserver — make everything visible immediately */
    document.querySelectorAll('.hero, .section').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── 2. Current year ────────────────────────────────────────────────── */
  var yearEl = document.getElementById('js-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── 3. Music player ────────────────────────────────────────────────── */
  var playerBtn  = document.getElementById('music-player');
  var iconPlay   = document.getElementById('icon-play');
  var iconPause  = document.getElementById('icon-pause');

  if (playerBtn) {
    var audio = null;
    try {
      audio = new Audio('audio/fuckin-problems.mp3');
    } catch (e) {}

    playerBtn.addEventListener('click', function () {
      if (!audio) return;
      if (audio.paused) {
        audio.play().catch(function () {});
        playerBtn.classList.add('music-player--playing');
        if (iconPlay)  iconPlay.style.display  = 'none';
        if (iconPause) iconPause.style.display = '';
        playerBtn.setAttribute('aria-label', "Pause Fuckin' Problems by ASAP Rocky");
      } else {
        audio.pause();
        playerBtn.classList.remove('music-player--playing');
        if (iconPlay)  iconPlay.style.display  = '';
        if (iconPause) iconPause.style.display = 'none';
        playerBtn.setAttribute('aria-label', "Play Fuckin' Problems by ASAP Rocky");
      }
    });

    if (audio) {
      audio.addEventListener('ended', function () {
        playerBtn.classList.remove('music-player--playing');
        if (iconPlay)  iconPlay.style.display  = '';
        if (iconPause) iconPause.style.display = 'none';
        playerBtn.setAttribute('aria-label', "Play Fuckin' Problems by ASAP Rocky");
      });
    }

    /* Kill audio whenever the user leaves the page (covers all links +
       Chrome's back/forward cache restoring a playing page) */
    window.addEventListener('pagehide', function () {
      if (audio) audio.pause();
    });

    /* Also stop immediately on any outbound link click */
    document.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (audio) audio.pause();
      });
    });
  }

  /* ── 5. Photo strip — auto-rotating banner ─────────────────────────────
     Clones all photos in .photo-strip__inner for seamless infinite loop.
     To add or remove photos, edit only the HTML — JS derives the clone
     set automatically from whatever children exist in the inner div.
  ─────────────────────────────────────────────────────────────────────── */
  (function () {
    var strip = document.querySelector('.photo-strip');
    var inner = strip && strip.querySelector('.photo-strip__inner');
    if (!strip || !inner) return;

    /* Reduced-motion: skip animation, restore manual overflow scroll */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      strip.style.overflowX = 'scroll';
      return;
    }

    /* Clone every original photo and append — creates the seamless second lap.
       originals[] stays as the reference set for loop-width calculation. */
    var originals = Array.from(inner.children);
    originals.forEach(function (el) {
      inner.appendChild(el.cloneNode(true));
    });

    var DEFAULT_SPEED = 0.5;   /* px per frame — gentle drift          */
    var FAST_SPEED    = 3;     /* px per frame — on press              */
    var EASE_MS       = 300;   /* speed transition duration            */

    var offset     = 0;
    var curSpeed   = DEFAULT_SPEED;
    var fromSpeed  = DEFAULT_SPEED;
    var toSpeed    = DEFAULT_SPEED;
    var easeStart  = null;     /* null = not easing, use curSpeed as-is */
    var rafId      = null;
    var isVisible  = false;
    var loopWidth  = 0;

    function calcLoopWidth() {
      if (!originals[0]) return 0;
      var itemW = originals[0].getBoundingClientRect().width;
      var gap   = parseFloat(getComputedStyle(inner).columnGap) || 12;
      /* loopWidth = one full original set including trailing gap,
         so offset reset lands the clone-set exactly where the originals started */
      return originals.length * (itemW + gap);
    }

    loopWidth = calcLoopWidth();
    window.addEventListener('load',   function () { loopWidth = calcLoopWidth(); });
    window.addEventListener('resize', function () { loopWidth = calcLoopWidth(); });

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function setSpeed(to) {
      fromSpeed = curSpeed;
      toSpeed   = to;
      easeStart = performance.now();
    }

    function tick(now) {
      /* Interpolate between fromSpeed → toSpeed over EASE_MS */
      if (easeStart !== null) {
        var t = Math.min((now - easeStart) / EASE_MS, 1);
        curSpeed = fromSpeed + (toSpeed - fromSpeed) * easeInOut(t);
        if (t >= 1) { curSpeed = toSpeed; easeStart = null; }
      }

      offset += curSpeed;

      /* Seamless loop: when offset reaches the original set's width,
         snap back to 0 in the same frame — no transition, no flash */
      if (loopWidth > 0 && offset >= loopWidth) offset -= loopWidth;

      inner.style.transform = 'translateX(-' + offset + 'px)';

      rafId = isVisible ? requestAnimationFrame(tick) : null;
    }

    /* Pause the rAF loop when the strip is off-screen */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        isVisible = e.isIntersecting;
        if (isVisible && !rafId) rafId = requestAnimationFrame(tick);
      });
    }, { threshold: 0.1 });
    io.observe(strip);

    /* Speed up on press */
    strip.addEventListener('mousedown',  function () { setSpeed(FAST_SPEED); });
    strip.addEventListener('touchstart', function () { setSpeed(FAST_SPEED); }, { passive: true });

    /* Ease back on release */
    document.addEventListener('mouseup', function () { setSpeed(DEFAULT_SPEED); });
    strip.addEventListener('touchend', function () {
      lastTouchX = null;
      setSpeed(DEFAULT_SPEED);
    });

    /* Match swipe velocity on touchmove — if the user drags faster than
       the auto-speed, adopt their velocity then ease back on lift */
    var lastTouchX    = null;
    var lastTouchTime = null;
    strip.addEventListener('touchmove', function (e) {
      if (!e.touches.length) return;
      var x   = e.touches[0].clientX;
      var now = performance.now();
      if (lastTouchX !== null && (now - lastTouchTime) > 0) {
        var vel = (lastTouchX - x) / (now - lastTouchTime) * 16.67; /* px per frame @ 60fps */
        if (vel > DEFAULT_SPEED) {
          curSpeed  = vel;
          fromSpeed = vel;
          toSpeed   = vel;
          easeStart = null;
        }
      }
      lastTouchX    = x;
      lastTouchTime = now;
    }, { passive: true });
  }());

  /* Restore opacity if browser restores this page from bfcache (back button from secret.html) */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.style.transition = 'opacity 300ms ease';
      document.body.style.opacity = '1';
    }
  });

  /* ── 4. Headshot easter egg — fade page out before navigating ────────── */
  var headshotLink = document.querySelector('.headshot-link');
  if (headshotLink) {
    headshotLink.addEventListener('click', function (e) {
      e.preventDefault();
      var href = this.getAttribute('href');
      document.body.style.transition = 'opacity 350ms ease';
      document.body.style.opacity = '0';
      setTimeout(function () {
        window.location.href = href;
      }, 350);
    });
  }

})();
