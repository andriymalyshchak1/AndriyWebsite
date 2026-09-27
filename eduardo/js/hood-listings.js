/*
  Property Listings on the neighborhood guides: search, property type, beds, baths, and
  price / living-area range sliders over the listing cards, like the original's MLS widget.
  A slider handle left at either end means "no limit" on that side.
  Cards open the contact form pre-filled with the listing's address.
*/
(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const form = $('[data-hood-filters]');
  const grid = $('[data-hood-listings]');
  if (!form || !grid) return;

  const cards = $$('.hl-card', grid);
  const empty = $('.hl-empty');
  const trim = n => String(Number(n.toFixed(1)));

  const formats = {
    price: (v, lo, hi) => v <= lo ? `$${trim(lo / 1e6)} M` : `$${trim(v / 1e6)} M${v >= hi ? '+' : ''}`,
    area: (v, lo, hi) => {
      if (v <= lo) return `<${lo} sqft`;
      const text = v >= 1000 ? `${trim(v / 1000)}K` : String(v);
      return `${text}${v >= hi ? '+' : ''} sqft`;
    },
  };

  const ranges = $$('[data-range]', form).map(el => {
    const [from, to] = $$('input[type="range"]', el);
    const out = { from: $('[data-edge="from"]', el), to: $('[data-edge="to"]', el) };
    const lo = Number(from.min), hi = Number(from.max), step = Number(from.step);
    const format = formats[el.dataset.range];
    const pct = v => ((v - lo) / (hi - lo)) * 100;

    const sync = moved => {
      // Handles can't cross: push the one that wasn't dragged
      if (Number(from.value) > Number(to.value) - step) {
        if (moved === from) from.value = Number(to.value) - step; else to.value = Number(from.value) + step;
      }
      el.style.setProperty('--from', pct(Number(from.value)));
      el.style.setProperty('--to', pct(Number(to.value)));
      out.from.textContent = format(Number(from.value), lo, hi);
      out.to.textContent = format(Number(to.value), lo, hi);
    };
    from.addEventListener('input', () => sync(from));
    to.addEventListener('input', () => sync(to));
    sync();

    return {
      key: el.dataset.range,
      bounds: () => [Number(from.value) <= lo ? -Infinity : Number(from.value), Number(to.value) >= hi ? Infinity : Number(to.value)],
    };
  });

  const inRange = (value, [min, max]) => {
    if (min === -Infinity && max === Infinity) return true;
    return value !== '' && Number(value) >= min && Number(value) <= max;
  };

  function filter() {
    const q = form.elements.q.value.trim().toLowerCase();
    const type = form.elements.type.value;
    const beds = Number(form.elements.beds.value) || 0;
    const baths = Number(form.elements.baths.value) || 0;
    const [price, area] = ['price', 'area'].map(key => ranges.find(r => r.key === key).bounds());

    let shown = 0;
    cards.forEach(card => {
      const d = card.dataset;
      const match = (!q || d.search.includes(q))
        && (!type || d.type === type)
        && (!beds || Number(d.beds) >= beds)
        && (!baths || Number(d.baths) >= baths)
        && inRange(d.price, price)
        && inRange(d.sqft, area);
      card.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
  }

  form.addEventListener('input', filter);
  form.addEventListener('submit', e => e.preventDefault());

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-prefill]');
    const message = $('#contact-modal textarea[name="message"]');
    if (card && message) message.value = card.dataset.prefill;
  });
})();
