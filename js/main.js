/**
 * main.js — minimal, purposeful JS for andriymalyshchak.com
 *
 * 1. Staggered entrance animations via IntersectionObserver
 * 2. Current year in footer
 */

(function () {
  'use strict';

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
