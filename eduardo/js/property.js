/*
  Property detail pages: photo gallery, Schedule a Showing picker, mortgage calculator,
  share links, and pre-filling the contact form from the page's buttons.
*/
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Gallery ---------- */
  const gallery = $('[data-gallery]');
  if (gallery) {
    const slides = $$('.gallery__slide', gallery);
    const thumbs = $$('.gallery__thumb', gallery);
    const counter = $('[data-gallery-current]', gallery);
    let index = 0;

    const show = i => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      thumbs.forEach((t, n) => t.classList.toggle('is-active', n === index));
      counter.textContent = index + 1;
      const thumb = thumbs[index];
      const strip = thumb.parentElement;
      strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: 'smooth' });
      // Warm the neighbours so arrows feel instant.
      [index + 1, index - 1].forEach(n => { const img = $('img', slides[(n + slides.length) % slides.length]); if (img) img.loading = 'eager'; });
    };

    $('[data-gallery-prev]', gallery).addEventListener('click', () => show(index - 1));
    $('[data-gallery-next]', gallery).addEventListener('click', () => show(index + 1));
    thumbs.forEach(t => t.addEventListener('click', () => show(Number(t.dataset.index))));
    gallery.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    // Swipe on touch screens
    let startX = null;
    const stage = $('.gallery__stage', gallery);
    stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Contact form pre-fill ---------- */
  const prefill = text => {
    const msg = $('#contact-modal textarea[name="message"]');
    if (msg && text) msg.value = text;
  };
  $$('[data-prefill]').forEach(btn => btn.addEventListener('click', () => prefill(btn.dataset.prefill)));

  /* ---------- Schedule a Showing ---------- */
  const showing = $('[data-showing]');
  if (showing) {
    const track = $('[data-dates]', showing);
    const time = $('[data-time]', showing);
    const next = $('[data-showing-next]', showing);
    const types = $$('.showing__type', showing);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    let chosen = null;
    let type = 'in person';
    let first = 0;

    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    days.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'showing__date';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', 'false');
      b.innerHTML = `<span>${dayName.format(d)}</span><strong>${d.getDate()}</strong><span>${monthName.format(d)}</span>`;
      b.addEventListener('click', () => {
        chosen = i;
        $$('.showing__date', track).forEach((x, n) => x.setAttribute('aria-selected', String(n === i)));
        update();
      });
      track.appendChild(b);
    });

    const visible = () => (matchMedia('(max-width: 640px)').matches ? 2 : 3);
    const slide = () => {
      first = Math.min(Math.max(first, 0), days.length - visible());
      const w = track.firstElementChild.getBoundingClientRect().width + 12;
      track.style.transform = `translateX(${-first * w}px)`;
      $('[data-dates-prev]', showing).disabled = first === 0;
      $('[data-dates-next]', showing).disabled = first >= days.length - visible();
    };
    $('[data-dates-prev]', showing).addEventListener('click', () => { first -= 1; slide(); });
    $('[data-dates-next]', showing).addEventListener('click', () => { first += 1; slide(); });
    addEventListener('resize', slide);
    slide();

    types.forEach(b => b.addEventListener('click', () => {
      type = b.dataset.type;
      types.forEach(x => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    }));

    function update() { next.disabled = chosen === null || !time.value; }
    time.addEventListener('change', update);

    next.addEventListener('click', () => {
      prefill(`I'd like to schedule a showing of ${showing.dataset.address} on ${longDate.format(days[chosen])} at ${time.value} (${type}).`);
    });
  }

  /* ---------- Mortgage calculator ---------- */
  const calc = $('[data-calc]');
  if (calc) {
    const field = name => $(`[data-field="${name}"]`, calc);
    const out = name => $(`[data-out="${name}"]`, calc);
    const usd = n => '$' + Math.round(n).toLocaleString('en-US');
    const num = el => Number(String(el.value).replace(/[^0-9.]/g, '')) || 0;
    const defaults = { ...calc.dataset };

    const setMoney = (el, n, suffix = '') => { el.value = usd(n) + suffix; };

    function reset() {
      const price = Number(defaults.price);
      setMoney(field('price'), price);
      field('term').value = defaults.term;
      setMoney(field('down'), price * defaults.down / 100);
      field('downPct').value = defaults.down + '%';
      setMoney(field('tax'), Number(defaults.tax), '/month');
      field('rate').value = defaults.rate + '%';
      setMoney(field('hoa'), Number(defaults.hoa), '/month');
      render();
    }

    function render() {
      const price = num(field('price'));
      const loan = Math.max(price - num(field('down')), 0);
      const r = num(field('rate')) / 100 / 12;
      const n = Number(field('term').value) * 12;
      const pi = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      const tax = num(field('tax'));
      const hoa = num(field('hoa'));
      const total = pi + tax + hoa;
      const pct = v => (total ? Math.round(v / total * 100) : 0);
      out('total').textContent = usd(total);
      out('pi').textContent = `${usd(pi)} (${pct(pi)}%)`;
      out('tax').textContent = `${usd(tax)} (${pct(tax)}%)`;
      out('hoa').textContent = `${usd(hoa)} (${pct(hoa)}%)`;
      // Donut: circumference is 100 for r=15.915, so dash lengths are percentages.
      let offset = 25;
      [['pi', pi], ['tax', tax], ['hoa', hoa]].forEach(([key, v]) => {
        const len = total ? v / total * 100 : 0;
        const arc = $(`[data-arc="${key}"]`, calc);
        arc.style.strokeDasharray = `${len} ${100 - len}`;
        arc.style.strokeDashoffset = offset;
        offset -= len;
      });
    }

    // Keep the down payment amount and percent in step.
    field('down').addEventListener('input', () => {
      const price = num(field('price'));
      field('downPct').value = price ? `${+(num(field('down')) / price * 100).toFixed(1)}%` : '0%';
      render();
    });
    field('downPct').addEventListener('input', () => {
      setMoney(field('down'), num(field('price')) * num(field('downPct')) / 100);
      render();
    });
    field('price').addEventListener('input', () => {
      setMoney(field('down'), num(field('price')) * num(field('downPct')) / 100);
      render();
    });
    ['tax', 'rate', 'hoa'].forEach(name => field(name).addEventListener('input', render));
    field('term').addEventListener('change', render);

    // Tidy the formatting once someone leaves a field.
    const formats = { price: v => usd(v), down: v => usd(v), tax: v => usd(v) + '/month', hoa: v => usd(v) + '/month', rate: v => `${v}%`, downPct: v => `${v}%` };
    Object.entries(formats).forEach(([name, f]) => field(name).addEventListener('blur', e => { e.target.value = f(num(e.target)); }));

    $('[data-calc-reset]', calc).addEventListener('click', reset);
    reset();
  }

  /* ---------- Share links use wherever the site is hosted ---------- */
  const here = encodeURIComponent(location.href.split('#')[0]);
  $$('[data-share]').forEach(a => {
    const kind = a.dataset.share;
    if (kind === 'facebook') a.href = `https://www.facebook.com/sharer/sharer.php?u=${here}`;
    if (kind === 'x') a.href = `https://twitter.com/intent/tweet?url=${here}`;
    if (kind === 'email') a.href = `${a.getAttribute('href').split('&')[0]}&body=${here}`;
  });
})();
