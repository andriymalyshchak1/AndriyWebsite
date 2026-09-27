(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header background on scroll ---------- */
  const header = $('.site-header');
  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  syncHeader();
  addEventListener('scroll', syncHeader, { passive: true });

  /* ---------- Drawer + modals ---------- */
  let lastFocus = null;
  const openLayers = () => $$('.drawer.is-open, .modal.is-open');

  function openLayer(layer) {
    openLayers().forEach(l => closeLayer(l, false));
    lastFocus = document.activeElement;
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const first = $('input:not([type=checkbox]), select, textarea, .drawer__nav a', layer);
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
  }

  function closeLayer(layer, restoreFocus = true) {
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    if (!openLayers().length) document.body.classList.remove('no-scroll');
    if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      const layer = document.getElementById(opener.dataset.open);
      if (layer) openLayer(layer);
      return;
    }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      closeLayer(closer.closest('.drawer, .modal'));
      return;
    }
    // In-page links inside the drawer close it before scrolling.
    const drawerLink = e.target.closest('.drawer a[href^="#"]');
    if (drawerLink) closeLayer(drawerLink.closest('.drawer'), false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') openLayers().forEach(l => closeLayer(l));
  });

  // Shared with page scripts (e.g. search.js) that open modals programmatically.
  window.EDSite = { openLayer, closeLayer };

  /* ---------- Forms ---------- */
  // With no action attribute the form just shows its thank-you state.
  // Set action="https://formspree.io/f/..." (or similar) to actually deliver submissions.
  $$('form[data-form]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const action = form.getAttribute('action');
      const btn = $('[type=submit]', form);
      if (action) {
        btn.disabled = true;
        try {
          await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        } catch (err) {
          console.error('Form submission failed', err);
        }
        btn.disabled = false;
      }
      form.closest('.form-wrap').classList.add('is-sent');
      form.reset();
    });
  });

  // Reset modal forms each time a modal is opened again.
  $$('.modal').forEach(modal => {
    new MutationObserver(() => {
      if (modal.classList.contains('is-open')) $('.form-wrap', modal)?.classList.remove('is-sent');
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  });

  // Address bar hands the address off to the valuation modal.
  const addressForm = $('[data-address-form]');
  addressForm?.addEventListener('submit', e => {
    e.preventDefault();
    const address = addressForm.address.value.trim();
    openLayer($('#valuation-modal'));
    $('#v-address').value = address;
    setTimeout(() => $('#v-name').focus({ preventScroll: true }), 80);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Stat counters ---------- */
  const counters = $$('[data-count]');
  const renderCount = (el, n) => { el.textContent = `${el.dataset.prefix || ''}${n}${el.dataset.suffix || ''}`; };
  if ('IntersectionObserver' in window && !reducedMotion) {
    counters.forEach(el => renderCount(el, 0));
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1600;
        const tick = now => {
          const p = Math.min((now - start) / duration, 1);
          renderCount(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  /* ---------- Testimonials slider ---------- */
  // Manual only, like the original: Previous / Next step through (and wrap around).
  const tSlider = $('[data-slider="testimonials"]');
  if (tSlider) {
    const slides = $$('.t-slide', tSlider);
    let index = 0;
    const go = i => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    };
    $('[data-prev]', tSlider).addEventListener('click', () => go(index - 1));
    $('[data-next]', tSlider).addEventListener('click', () => go(index + 1));
  }

  /* ---------- "Just closed" vertical slider ---------- */
  const vSlider = $('.v-slider');
  if (vSlider) {
    const track = $('.v-track', vSlider);
    const slides = $$('.v-slide', vSlider);
    const GAP = 8;
    const SLIDE = 76; // % of viewport height, keep in sync with .v-slide flex-basis
    let index = 0;
    let timer;

    function go(i) {
      index = (i + slides.length) % slides.length;
      const offset = (100 - SLIDE) / 2;
      track.style.transform = `translateY(calc(${offset}% - ${index * SLIDE}% - ${index * GAP}px))`;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    }
    function restart() {
      clearInterval(timer);
      if (!reducedMotion) timer = setInterval(() => go(index + 1), 4500);
    }

    $('[data-vprev]').addEventListener('click', () => { go(index - 1); restart(); });
    $('[data-vnext]').addEventListener('click', () => { go(index + 1); restart(); });
    go(0);
    restart();
  }

  /* ---------- Listings carousel ---------- */
  const carousel = $('[data-carousel]');
  if (carousel) {
    const track = $('.carousel__track', carousel);
    const items = $$('.listing', carousel);
    const prev = $('[data-prev]', carousel);
    const next = $('[data-next]', carousel);
    let index = 0;

    const perView = () => (matchMedia('(max-width: 900px)').matches ? 1 : 2);

    function update() {
      const max = Math.max(items.length - perView(), 0);
      index = Math.min(Math.max(index, 0), max);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = items[0].getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
      prev.disabled = index === 0;
      next.disabled = index === max;
    }

    prev.addEventListener('click', () => { index -= 1; update(); });
    next.addEventListener('click', () => { index += 1; update(); });
    addEventListener('resize', update);

    // Basic swipe support on touch devices.
    let startX = null;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { index += dx < 0 ? 1 : -1; update(); }
      startX = null;
    });

    update();
  }

  /* ---------- Video spotlight ---------- */
  const player = $('[data-player]');
  if (player) {
    const thumb = $('.player__thumb', player);
    const buttons = $$('[data-video]');
    let current = buttons[0]?.dataset.video;

    function load(id, autoplay) {
      current = id;
      $('iframe', player)?.remove();
      buttons.forEach(b => b.classList.toggle('is-active', b.dataset.video === id));
      if (autoplay) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.title = 'YouTube video player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        player.appendChild(iframe);
      } else {
        thumb.onerror = () => { thumb.onerror = null; thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; };
        thumb.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
      }
    }

    player.addEventListener('click', () => { if (!$('iframe', player)) load(current, true); });
    buttons.forEach(b => b.addEventListener('click', () => {
      const playing = !!$('iframe', player);
      load(b.dataset.video, false);
      if (playing) load(b.dataset.video, true);
    }));
  }

  /* ---------- About photo swap (touch screens have no hover, so tap toggles it) ---------- */
  const aboutMedia = $('.about__media');
  if (aboutMedia && matchMedia('(hover: none)').matches) {
    aboutMedia.addEventListener('click', () => aboutMedia.classList.toggle('is-active'));
  }

  /* ---------- Hero video ----------
     Starts after the page has loaded so it never competes with the first paint, picks the
     720p file on small screens, and only becomes visible once frames are really playing.
     If autoplay is refused (iOS Low Power Mode, Data Saver) the poster photo simply stays. */
  const heroVideo = $('[data-hero-video]');
  if (heroVideo) {
    const conn = navigator.connection || {};
    const skip = reducedMotion || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    const start = () => {
      heroVideo.muted = true; // iOS only autoplays inline video that is muted as a property, not just the attribute
      heroVideo.src = matchMedia('(max-width: 900px)').matches ? heroVideo.dataset.srcSmall : heroVideo.dataset.srcLarge;
      heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'), { once: true });
      const attempt = heroVideo.play();
      if (attempt && attempt.catch) attempt.catch(() => heroVideo.remove());
    };
    if (skip) heroVideo.remove();
    else if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
    // Safari pauses background video when the tab is hidden; resume quietly when it comes back.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && heroVideo.isConnected && heroVideo.classList.contains('is-playing')) heroVideo.play().catch(() => {});
    });
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
