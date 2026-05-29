/**
 * main.js — minimal, purposeful JS for andriymalyshchak.com
 *
 * 0. Typewriter effect on name
 * 1. Staggered entrance animations via IntersectionObserver
 * 2. Current year in footer
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

  /* ── 5. Album grid — tap-to-play covers ────────────────────────────────
     One global Audio instance shared across all four cells.
     Audio files: audio/clip-1.mp3 … audio/clip-4.mp3
     <!-- REPLACE: drop 20-second MP3 clips into /audio and add song titles -->
  ─────────────────────────────────────────────────────────────────────── */
  (function () {
    var cells = Array.from(document.querySelectorAll('.album-cell'));
    if (!cells.length) return;

    /* Hide broken-image icons — cell background colour shows instead */
    cells.forEach(function (cell) {
      var img = cell.querySelector('img.album-cell__cover');
      if (img) img.addEventListener('error', function () { this.style.display = 'none'; });
    });

    /* <!-- REPLACE: swap each entry for a unique 20-second clip when ready --> */
    var CLIPS = [
      'audio/fuckin-problems.mp3',
      'audio/Fred.mp3',
      'audio/MK.mp3',
      'audio/Bad-B.mp3',
    ];

    var audio      = new Audio();   /* single global instance — never create multiples */
    var activeCell = null;
    var stopTimer  = null;

    audio.addEventListener('ended', stopActive);
    window.addEventListener('pagehide', function () { audio.pause(); });

    function reset(cell) {
      cell.classList.remove('album-cell--active');
    }

    function stopActive() {
      clearTimeout(stopTimer);
      audio.pause();
      if (activeCell) { reset(activeCell); activeCell = null; }
    }

    /* Start offset (seconds) per cell index — 0 = beginning of track */
    var START_AT = [0, 75, 0, 0]; /* index 1 (Fred, top-right) starts at 1:15 */

    function play(cell) {
      var idx = parseInt(cell.getAttribute('data-index'), 10);
      audio.src = CLIPS[idx];
      audio.currentTime = START_AT[idx] || 0;
      audio.play().catch(function () {});

      cell.classList.add('album-cell--active');
      activeCell = cell;

      /* Stop after 35-second clip */
      clearTimeout(stopTimer);
      stopTimer = setTimeout(stopActive, 35000);
    }

    cells.forEach(function (cell) {
      cell.addEventListener('click', function () {
        if (cell === activeCell) {
          stopActive();
        } else {
          if (activeCell) { clearTimeout(stopTimer); audio.pause(); reset(activeCell); }
          play(cell);
        }
      });
    });
  }());

  /* Restore opacity if browser restores this page from bfcache (back button from secret.html) */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.style.transition = 'opacity 300ms ease';
      document.body.style.opacity = '1';
    }
  });

  /* ── 4. Photo strip — seamless infinite scroll + smooth swipe ──────────
     Single source of truth: offset is written by handlers, transform is
     applied ONLY inside the rAF loop once per frame. Velocity averaged
     over 3 samples to eliminate iOS touch-sampling spikes.
     To add/remove photos, only edit .photo-strip__inner in HTML.
  ─────────────────────────────────────────────────────────────────────── */
  (function () {
    var strip = document.querySelector('.photo-strip');
    var inner = strip && strip.querySelector('.photo-strip__inner');
    if (!strip || !inner) return;

    /* Reduced-motion: restore manual scroll */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      strip.style.overflowX          = 'scroll';
      strip.style.scrollSnapType     = 'x mandatory';
      strip.style.webkitOverflowScrolling = 'touch';
      strip.style.cursor             = 'default';
      return;
    }

    /* Clone originals — inner becomes [1…9, 1…9] */
    var originals = Array.from(inner.children);
    originals.forEach(function (el) { inner.appendChild(el.cloneNode(true)); });

    var DEFAULT_SPEED = 0.6;
    var LERP          = 0.08;

    var offset         = 0;
    var curSpeed       = DEFAULT_SPEED;
    var totalWidth     = 0;
    var rafId          = null;
    var isVisible      = false;

    var isDragging       = false;
    var dragStartX       = 0;
    var dragStartOffset  = 0;
    var lastDragX        = 0;
    var dragVelocity     = 0;
    var velocitySamples  = [];   /* last 3 move deltas — averaged on release */
    var momentumActive   = false;
    var autoScrollPaused = false;
    var isHorizontalDrag = null;
    var touchStartY      = 0;

    /* --- totalWidth --- */
    function calcTotalWidth() {
      if (!originals[0]) return;
      var gap = parseFloat(getComputedStyle(inner).columnGap) || 12;
      totalWidth = originals.reduce(function (sum, el) {
        return sum + el.offsetWidth + gap;
      }, 0);
      if (totalWidth > 0) offset = offset % totalWidth;
    }

    calcTotalWidth();
    window.addEventListener('load', calcTotalWidth);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calcTotalWidth, 150);
    });

    /* --- Helpers --- */
    function applyLoopWrap() {
      if (totalWidth <= 0) return;
      while (offset < 0)           offset += totalWidth;
      while (offset >= totalWidth) offset -= totalWidth;
    }

    /* Rounded to 2dp to eliminate subpixel jitter */
    function applyTransform() {
      var r = Math.round(offset * 100) / 100;
      inner.style.transform = 'translateX(' + (-r) + 'px)';
    }

    /* --- rAF loop — single source of truth for all DOM writes --- */
    function tick() {
      if (isDragging) {
        /* offset already updated by handler; just wrap and render */
        applyLoopWrap();
        applyTransform();
      } else if (momentumActive) {
        dragVelocity *= 0.96;
        offset += dragVelocity;
        if (Math.abs(dragVelocity) < 0.05) {
          momentumActive   = false;
          autoScrollPaused = false;
        }
        applyLoopWrap();
        applyTransform();
      } else if (!autoScrollPaused) {
        curSpeed += (DEFAULT_SPEED - curSpeed) * LERP;
        offset   += curSpeed;
        applyLoopWrap();
        applyTransform();
      }

      rafId = isVisible ? requestAnimationFrame(tick) : null;
    }

    /* IntersectionObserver — pause rAF off-screen */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        isVisible = e.isIntersecting;
        if (isVisible && !rafId) rafId = requestAnimationFrame(tick);
      });
    }, { threshold: 0.1 });
    io.observe(strip);

    /* --- Touch handlers --- */
    function onTouchStart(e) {
      var t            = e.touches[0];
      isDragging       = true;
      autoScrollPaused = true;
      momentumActive   = false;
      dragStartX       = t.clientX;
      touchStartY      = t.clientY;
      dragStartOffset  = offset;
      lastDragX        = t.clientX;
      dragVelocity     = 0;
      velocitySamples  = [];
      isHorizontalDrag = null;
    }

    function onTouchMove(e) {
      if (!isDragging) return;
      var t        = e.touches[0];
      var currentX = t.clientX;
      var currentY = t.clientY;

      if (isHorizontalDrag === null) {
        var dx = Math.abs(currentX - dragStartX);
        var dy = Math.abs(currentY - touchStartY);
        isHorizontalDrag = dx > dy;
      }

      if (!isHorizontalDrag) return;

      e.preventDefault();

      /* Sample velocity — keep last 3, average on release */
      velocitySamples.push(lastDragX - currentX);
      if (velocitySamples.length > 3) velocitySamples.shift();

      lastDragX = currentX;
      offset    = dragStartOffset + (dragStartX - currentX); /* 1:1 tracking */
    }

    function onTouchEnd() {
      if (!isDragging) return;
      isDragging       = false;
      isHorizontalDrag = null;
      /* Average last 3 samples for smooth launch velocity */
      if (velocitySamples.length > 0) {
        dragVelocity = velocitySamples.reduce(function (a, b) { return a + b; }, 0)
                       / velocitySamples.length;
      }
      velocitySamples = [];
      if (Math.abs(dragVelocity) > 0.5) {
        momentumActive = true;
      } else {
        autoScrollPaused = false;
      }
    }

    strip.addEventListener('touchstart',  onTouchStart, { passive: false });
    strip.addEventListener('touchmove',   onTouchMove,  { passive: false });
    strip.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    strip.addEventListener('touchcancel', onTouchEnd,   { passive: true  });

    /* --- Mouse handlers --- */
    function onMouseDown(e) {
      isDragging       = true;
      autoScrollPaused = true;
      momentumActive   = false;
      dragStartX       = e.clientX;
      dragStartOffset  = offset;
      lastDragX        = e.clientX;
      dragVelocity     = 0;
      velocitySamples  = [];
      isHorizontalDrag = true;
      strip.style.cursor = 'grabbing';
      e.preventDefault();
    }

    function onMouseMove(e) {
      if (!isDragging) return;
      velocitySamples.push(lastDragX - e.clientX);
      if (velocitySamples.length > 3) velocitySamples.shift();
      lastDragX = e.clientX;
      offset    = dragStartOffset + (dragStartX - e.clientX);
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging         = false;
      isHorizontalDrag   = null;
      strip.style.cursor = 'grab';
      if (velocitySamples.length > 0) {
        dragVelocity = velocitySamples.reduce(function (a, b) { return a + b; }, 0)
                       / velocitySamples.length;
      }
      velocitySamples = [];
      if (Math.abs(dragVelocity) > 0.5) {
        momentumActive = true;
      } else {
        autoScrollPaused = false;
      }
    }

    strip.addEventListener('mousedown',  onMouseDown);
    strip.addEventListener('mousemove',  onMouseMove);
    strip.addEventListener('mouseup',    onMouseUp);
    strip.addEventListener('mouseleave', onMouseUp);
  }());

  /* ── 6. Headshot easter egg — fade page out before navigating ────────── */
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
