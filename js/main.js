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

      var delay = Math.random() * 100 + 83; /* wider range = more stagger between chars */
      if (ch === ' ') delay += 332;

      setTimeout(typeNext, delay);
    }

    setTimeout(typeNext, 376);
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
      'audio/like-animal.mp3',
      'audio/Beto.mp3',
      'audio/MK.mp3',
      'audio/cinderella.mp3',
    ];

    var audio      = new Audio();   /* single global instance — never create multiples */
    var activeCell = null;
    var stopTimer  = null;

    audio.addEventListener('ended', stopActive);
    window.addEventListener('pagehide', function () { audio.pause(); });

    function reset(cell) {
      cell.classList.remove('album-cell--active');
      var name = cell.closest('.album-card') && cell.closest('.album-card').querySelector('.album-card__name');
      if (name) name.classList.remove('artist-name-visible');
    }

    function stopActive() {
      clearTimeout(stopTimer);
      audio.pause();
      if (activeCell) { reset(activeCell); activeCell = null; }
    }

    /* Start offset (seconds) per cell index — 0 = beginning of track */
    var START_AT = [46, 50, 7, 28]; /* index 0 (like-animal) starts at 46s | index 1 (Beto) starts at 50s | index 2 (MK) starts at 7s | index 3 (cinderella) starts at 28s */

    function play(cell) {
      var idx = parseInt(cell.getAttribute('data-index'), 10);
      audio.src = CLIPS[idx];
      audio.currentTime = START_AT[idx] || 0;
      audio.play().catch(function () {});

      cell.classList.add('album-cell--active');
      var name = cell.closest('.album-card') && cell.closest('.album-card').querySelector('.album-card__name');
      if (name) name.classList.add('artist-name-visible');
      activeCell = cell;

      /* Stop after 35-second clip */
      clearTimeout(stopTimer);
      stopTimer = setTimeout(stopActive, 60000);
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

  /* ── 7. Bubble expand — headshot, album cells, photo strip items ────────
     CSS hover handles desktop. JS adds/removes .is-hovered on touch.
     Container scales + margin-bottom expands so content below shifts.
     Photo strip cancels on touchmove so drag is never fought.
  ─────────────────────────────────────────────────────────────────────── */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function expand(el)   { el.classList.add('is-hovered'); }
    function contract(el) { el.classList.remove('is-hovered'); }

    function bind(el, cancelOnMove) {
      el.addEventListener('touchstart',  function () { expand(el);   }, { passive: true });
      if (cancelOnMove) {
        el.addEventListener('touchmove', function () { contract(el); }, { passive: true });
      }
      el.addEventListener('touchend',    function () { contract(el); }, { passive: true });
      el.addEventListener('touchcancel', function () { contract(el); }, { passive: true });
    }

    /* Headshot wrapper — clear fadeUp animation fill once it ends so the
       transform transition can take over (animations outrank transitions) */
    var headshotLink = document.querySelector('.headshot-link');
    if (headshotLink) {
      headshotLink.addEventListener('animationend', function () {
        /* Clear the fadeUp fill so transitions can take over, but DON'T pin
           transform inline — an inline transform would outrank the
           .is-hovered class rule and kill the touch-hold expand. */
        this.style.animation = 'none';
        this.style.opacity   = '1';
      }, { once: true });
      bind(headshotLink, false);
    }

    /* Album cells (the full cell frame, not the inner cover) */
    document.querySelectorAll('.album-cell').forEach(function (cell) {
      bind(cell, false);
    });
  }());

  /* ── Pre-buffer all audio + photo strip images after page load ──────────
     Audio objects with preload='auto' tell the browser to fully buffer
     each file before it's needed — play becomes instant with no network lag.
     Images are fetched via Image() to warm the cache for the photo strip.
  ─────────────────────────────────────────────────────────────────────── */
  window.addEventListener('load', function () {
    /* Audio pre-buffer */
    [
      'audio/like-animal.mp3',
      'audio/Beto.mp3',
      'audio/MK.mp3',
      'audio/cinderella.mp3',
      'audio/fuckin-problems.mp3',
    ].forEach(function (src) {
      var a = new Audio();
      a.preload = 'auto';
      a.src = src;
    });

    /* Photo strip image pre-cache */
    [
      'images/cover1.JPG', 'images/cover2.jpg', 'images/cover3.jpg',
      'images/cover4.jpg', 'images/cover5.jpg', 'images/cover6.jpg',
      'images/cover7.jpg', 'images/cover8.jpg', 'images/cover9.JPG',
    ].forEach(function (src) {
      var img = new Image();
      img.src = src;
    });
  });

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
