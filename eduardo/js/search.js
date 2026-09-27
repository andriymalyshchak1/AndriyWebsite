(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const LISTINGS = window.ED_LISTINGS || [];
  const byId = new Map(LISTINGS.map(l => [l.id, l]));
  const photo = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  /* ---------- Formatting ---------- */
  const money = n => '$' + n.toLocaleString('en-US');
  const priceLabel = l => (l.status === 'rent' ? `${money(l.price)}/mo` : money(l.price));
  const short = n => {
    if (n >= 1e6) return `$${+(n / 1e6).toFixed(2)}M`;
    if (n >= 1e4) return `$${Math.round(n / 1e3)}K`;
    if (n >= 1e3) return `$${+(n / 1e3).toFixed(1)}K`;
    return `$${n}`;
  };
  const pinLabel = l => (l.status === 'rent' ? `${short(l.price)}/mo` : short(l.price));
  const facts = l => `${l.beds} bd · ${l.baths} ba · ${l.sqft.toLocaleString('en-US')} sq ft`;
  const TYPE_WORD = { House: 'home', Condo: 'condo', Townhouse: 'townhome', 'Multi-Family': 'multi-family property' };

  /* ---------- State ---------- */
  const DEFAULTS = { q: '', status: 'sale', minPrice: 0, maxPrice: 0, types: [], beds: 0, baths: 0, minSqft: 0, newOnly: false, sort: 'newest' };
  const state = { ...DEFAULTS, types: [] };

  const params = new URLSearchParams(location.search);
  if (params.has('q')) state.q = params.get('q');
  if (params.get('status') === 'rent') state.status = 'rent';
  ['minPrice', 'maxPrice', 'beds', 'baths', 'minSqft'].forEach(k => { if (params.has(k)) state[k] = Number(params.get(k)) || 0; });
  if (params.has('types')) state.types = params.get('types').split(',').filter(t => TYPE_WORD[t]);
  if (params.get('newOnly') === '1') state.newOnly = true;
  if (params.has('sort')) state.sort = params.get('sort');

  const PRICE_STEPS = {
    sale: [200e3, 300e3, 400e3, 500e3, 600e3, 750e3, 1e6, 1.5e6, 2e6, 3e6, 5e6],
    rent: [1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500]
  };

  const SORTS = {
    newest: (a, b) => a.days - b.days,
    'price-desc': (a, b) => b.price - a.price,
    'price-asc': (a, b) => a.price - b.price,
    sqft: (a, b) => b.sqft - a.sqft
  };

  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem('ed-saved-homes') || '[]')); } catch (e) { /* storage unavailable */ }
  const persistSaved = () => { try { localStorage.setItem('ed-saved-homes', JSON.stringify([...saved])); } catch (e) { /* ignore */ } };

  function matches(l) {
    if (l.status !== state.status) return false;
    if (state.minPrice && l.price < state.minPrice) return false;
    if (state.maxPrice && l.price > state.maxPrice) return false;
    if (state.types.length && !state.types.includes(l.type)) return false;
    if (state.beds && l.beds < state.beds) return false;
    if (state.baths && l.baths < state.baths) return false;
    if (state.minSqft && l.sqft < state.minSqft) return false;
    if (state.newOnly && l.days > 7) return false;
    if (state.q) {
      const hay = `${l.title} ${l.hood} ${l.city} ${l.zip} tx texas`.toLowerCase();
      const terms = state.q.toLowerCase().split(/[\s,]+/).filter(Boolean);
      if (!terms.every(t => hay.includes(t))) return false;
    }
    return true;
  }

  /* ---------- Elements ---------- */
  const main = $('.search-main');
  const grid = $('#results');
  const empty = $('#results-empty');
  const boundsToggle = $('#bounds');
  const qInput = $('#q');
  const mapEl = $('#map');

  /* ---------- Map (MapLibre GL + OpenFreeMap tiles, no API key) ---------- */
  const CLUSTER_PX = 58; // pins closer than this on screen are grouped
  let map = null;
  let popup = null;
  let shownPins = [];
  const pinFor = new Map(); // listing id -> pin element currently representing it
  let mapListings = [];
  let needsFit = false;

  const mapVisible = () => mapEl.clientWidth > 0 && mapEl.clientHeight > 0;

  function mapUnavailable() {
    map = null;
    mapEl.innerHTML = '<div class="map-fallback">The map could not be loaded. Check your connection and refresh.</div>';
  }

  function initMap() {
    if (!window.maplibregl) return mapUnavailable();
    try {
      map = new maplibregl.Map({
        container: mapEl,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [-97.8, 30.35],
        zoom: 9.5,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false
      });
    } catch (err) {
      console.error('Map failed to initialize', err);
      return mapUnavailable();
    }
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    popup = new maplibregl.Popup({ closeButton: false, offset: 34, maxWidth: '260px' });
    map.on('moveend', () => {
      if (boundsToggle.checked) apply({ refit: false });
      else renderPins();
    });
  }

  function popupHTML(l) {
    return `<a class="popup-card" href="#" data-detail="${l.id}">
      <img src="${photo(l.img, 480)}" alt="">
      <div class="popup-card__body">
        <p class="popup-card__price">${priceLabel(l)}</p>
        <p class="popup-card__facts">${facts(l)}</p>
        <p class="popup-card__title">${l.title} · ${l.city}</p>
        <span class="popup-card__cta">View Details</span>
      </div>
    </a>`;
  }

  function showPopup(l) {
    const node = document.createElement('div');
    node.innerHTML = popupHTML(l);
    $('[data-detail]', node).addEventListener('click', e => { e.preventDefault(); openDetail(l.id); });
    popup.setLngLat([l.lng, l.lat]).setDOMContent(node).addTo(map);
  }

  function boundsOf(list) {
    const b = new maplibregl.LngLatBounds();
    list.forEach(l => b.extend([l.lng, l.lat]));
    return b;
  }

  function fitTo(list, animate = true) {
    if (!map || !list.length) return;
    const duration = animate ? 700 : 0;
    if (list.length === 1) {
      map.easeTo({ center: [list[0].lng, list[0].lat], zoom: 12.5, duration });
      return;
    }
    map.fitBounds(boundsOf(list), { padding: { top: 90, bottom: 40, left: 50, right: 50 }, maxZoom: 14, duration });
  }

  function inView(l) {
    const b = map.getBounds();
    return l.lng >= b.getWest() && l.lng <= b.getEast() && l.lat >= b.getSouth() && l.lat <= b.getNorth();
  }

  function renderPins() {
    if (!map) return;
    shownPins.forEach(m => m.remove());
    shownPins = [];
    pinFor.clear();

    // Greedy screen-space clustering so dense areas don't stack unreadable labels.
    const groups = [];
    mapListings.forEach(l => {
      const p = map.project([l.lng, l.lat]);
      const g = groups.find(g => Math.hypot(g.x - p.x, g.y - p.y) < CLUSTER_PX);
      if (g) g.items.push(l);
      else groups.push({ x: p.x, y: p.y, items: [l] });
    });

    groups.forEach(g => {
      const el = document.createElement('button');
      el.type = 'button';
      let lngLat;
      if (g.items.length === 1) {
        const l = g.items[0];
        el.className = `pin${l.status === 'rent' ? ' pin--rent' : ''}`;
        el.innerHTML = `<span>${pinLabel(l)}</span>`;
        el.setAttribute('aria-label', `${l.title}, ${priceLabel(l)}`);
        lngLat = [l.lng, l.lat];
        el.addEventListener('click', e => { e.stopPropagation(); showPopup(l); focusCard(l.id); });
      } else {
        const n = g.items.length;
        el.className = 'pin pin--cluster';
        el.innerHTML = `<span>${n} homes</span>`;
        el.setAttribute('aria-label', `${n} homes in this area, zoom in`);
        lngLat = [g.items.reduce((s, l) => s + l.lng, 0) / n, g.items.reduce((s, l) => s + l.lat, 0) / n];
        el.addEventListener('click', e => {
          e.stopPropagation();
          map.fitBounds(boundsOf(g.items), { padding: 100, maxZoom: 15, duration: 700 });
        });
      }
      el.addEventListener('mouseenter', () => g.items.forEach(l => setHot(l.id, true)));
      el.addEventListener('mouseleave', () => g.items.forEach(l => setHot(l.id, false)));
      g.items.forEach(l => pinFor.set(l.id, el));
      shownPins.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(lngLat).addTo(map));
    });
  }

  function setHot(id, on) {
    grid.querySelector(`[data-id="${id}"]`)?.classList.toggle('is-hot', on);
    pinFor.get(id)?.classList.toggle('is-hot', on);
  }

  function focusCard(id) {
    const card = grid.querySelector(`[data-id="${id}"]`);
    if (!card) return;
    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    card.classList.remove('is-selected');
    void card.offsetWidth; // restart the flash animation
    card.classList.add('is-selected');
  }

  /* ---------- Results ---------- */
  function cardHTML(l) {
    const isSaved = saved.has(l.id);
    return `<article class="result" data-id="${l.id}" tabindex="0" aria-label="${l.title}, ${priceLabel(l)}">
      <div class="result__media">
        <img src="${photo(l.img, 700)}" alt="" loading="lazy">
        <div class="result__badges">
          <span class="result__badge${l.status === 'rent' ? ' result__badge--rent' : ''}">${l.status === 'rent' ? 'For Rent' : 'For Sale'}</span>
          ${l.days <= 7 ? '<span class="result__badge result__badge--new">New</span>' : ''}
        </div>
        <button type="button" class="result__save${isSaved ? ' is-saved' : ''}" data-save="${l.id}" aria-pressed="${isSaved}" aria-label="Save ${l.title}"><svg><use href="#i-heart"/></svg></button>
      </div>
      <div class="result__body">
        <p class="result__price">${priceLabel(l)}</p>
        <p class="result__facts">${facts(l)}</p>
        <h3 class="result__title">${l.title}</h3>
        <p class="result__loc">${l.hood}, ${l.city}, TX ${l.zip}</p>
      </div>
    </article>`;
  }

  function renderCards(list) {
    grid.innerHTML = list.map(cardHTML).join('');
    empty.hidden = list.length > 0;
    $$('.result', grid).forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('mouseenter', () => setHot(id, true));
      card.addEventListener('mouseleave', () => setHot(id, false));
    });
  }

  grid.addEventListener('click', e => {
    const save = e.target.closest('[data-save]');
    if (save) {
      const id = save.dataset.save;
      saved.has(id) ? saved.delete(id) : saved.add(id);
      persistSaved();
      save.classList.toggle('is-saved', saved.has(id));
      save.setAttribute('aria-pressed', String(saved.has(id)));
      return;
    }
    const card = e.target.closest('.result');
    if (card) openDetail(card.dataset.id);
  });
  grid.addEventListener('keydown', e => {
    const card = e.target.closest('.result');
    if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDetail(card.dataset.id); }
  });

  /* ---------- Apply filters ---------- */
  function apply({ refit = true } = {}) {
    const filtered = LISTINGS.filter(matches).sort(SORTS[state.sort] || SORTS.newest);
    const visible = map && boundsToggle.checked ? filtered.filter(inView) : filtered;
    renderCards(visible);

    mapListings = filtered;
    if (map && refit && !boundsToggle.checked) {
      popup.remove();
      if (mapVisible()) fitTo(filtered); else needsFit = true;
    }
    renderPins();

    const n = visible.length;
    $('#results-title').textContent = `Homes for ${state.status === 'rent' ? 'Rent' : 'Sale'}${state.q ? ` in “${state.q}”` : ''}`;
    $('#results-count').textContent = `${n} ${n === 1 ? 'result' : 'results'}`;
    $('[data-show-count]').textContent = `Show ${n} ${n === 1 ? 'Home' : 'Homes'}`;
    updatePills();
    syncControls();
    writeUrl();
  }

  /* ---------- Controls ---------- */
  function buildPriceOptions() {
    const steps = PRICE_STEPS[state.status];
    const opts = label => `<option value="0">${label}</option>` +
      steps.map(v => `<option value="${v}">${state.status === 'rent' ? money(v) + '/mo' : short(v)}</option>`).join('');
    $$('[data-filter="minPrice"]').forEach(s => { s.innerHTML = opts('No Min'); });
    $$('[data-filter="maxPrice"]').forEach(s => { s.innerHTML = opts('No Max'); });
  }

  function syncControls() {
    $$('[data-filter="status"]').forEach(r => { r.checked = r.value === state.status; });
    ['minPrice', 'maxPrice', 'minSqft', 'sort'].forEach(k => {
      $$(`select[data-filter="${k}"]`).forEach(s => { s.value = String(state[k]); });
    });
    $$('[data-filter="type"]').forEach(c => { c.checked = state.types.includes(c.value); });
    $$('[data-filter="newOnly"]').forEach(c => { c.checked = state.newOnly; });
    $$('button[data-filter]').forEach(b => { b.setAttribute('aria-pressed', String(Number(b.dataset.value) === state[b.dataset.filter])); });
    if (document.activeElement !== qInput) qInput.value = state.q;
  }

  function setPill(key, label, isSet) {
    const wrap = $(`.pill-wrap[data-pop="${key}"]`);
    if (!wrap) return;
    $('[data-pill-label]', wrap).textContent = label;
    $('.pill', wrap).classList.toggle('is-set', isSet);
  }

  function priceText() {
    const fmt = v => (state.status === 'rent' ? money(v) : short(v));
    if (state.minPrice && state.maxPrice) return `${fmt(state.minPrice)} – ${fmt(state.maxPrice)}`;
    if (state.minPrice) return `${fmt(state.minPrice)}+`;
    if (state.maxPrice) return `Up to ${fmt(state.maxPrice)}`;
    return 'Any Price';
  }

  function updatePills() {
    setPill('status', state.status === 'rent' ? 'For Rent' : 'For Sale', false);
    setPill('price', priceText(), !!(state.minPrice || state.maxPrice));
    setPill('type', state.types.length === 0 ? 'All Property Types' : state.types.length === 1 ? state.types[0] : `${state.types.length} Types`, state.types.length > 0);
    setPill('beds', state.beds ? `${state.beds}+ Beds` : 'All Beds', !!state.beds);
    setPill('baths', state.baths ? `${state.baths}+ Baths` : 'All Baths', !!state.baths);

    const active = [state.minPrice || state.maxPrice, state.types.length, state.beds, state.baths, state.minSqft, state.newOnly].filter(Boolean).length;
    $('[data-filters-label]').innerHTML = active ? `All Filters <span class="filters-count">${active}</span>` : 'All Filters';
  }

  function summary() {
    const parts = [state.status === 'rent' ? 'For rent' : 'For sale'];
    if (state.q) parts.push(`in ${state.q}`);
    if (state.minPrice || state.maxPrice) parts.push(priceText());
    if (state.types.length) parts.push(state.types.join(' / '));
    if (state.beds) parts.push(`${state.beds}+ beds`);
    if (state.baths) parts.push(`${state.baths}+ baths`);
    if (state.minSqft) parts.push(`${state.minSqft.toLocaleString('en-US')}+ sq ft`);
    if (state.newOnly) parts.push('new listings');
    return parts.join(', ');
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.status !== 'sale') p.set('status', state.status);
    ['minPrice', 'maxPrice', 'beds', 'baths', 'minSqft'].forEach(k => { if (state[k]) p.set(k, state[k]); });
    if (state.types.length) p.set('types', state.types.join(','));
    if (state.newOnly) p.set('newOnly', '1');
    if (state.sort !== 'newest') p.set('sort', state.sort);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  document.addEventListener('change', e => {
    const el = e.target.closest('[data-filter]');
    if (!el || el.tagName === 'BUTTON') return;
    const key = el.dataset.filter;
    if (key === 'status') {
      state.status = el.value;
      state.minPrice = 0;
      state.maxPrice = 0;
      buildPriceOptions();
    } else if (key === 'type') {
      state.types = el.checked ? [...new Set([...state.types, el.value])] : state.types.filter(t => t !== el.value);
    } else if (key === 'newOnly') {
      state.newOnly = el.checked;
    } else if (key === 'sort') {
      state.sort = el.value;
    } else {
      state[key] = Number(el.value) || 0;
      if (state.minPrice && state.maxPrice && state.minPrice > state.maxPrice) {
        if (key === 'minPrice') state.maxPrice = 0; else state.minPrice = 0;
      }
    }
    apply({ refit: key !== 'sort' });
  });

  document.addEventListener('click', e => {
    const seg = e.target.closest('button[data-filter]');
    if (seg) {
      state[seg.dataset.filter] = Number(seg.dataset.value);
      apply();
      return;
    }
    if (e.target.closest('[data-reset-filters]')) {
      Object.assign(state, { ...DEFAULTS, q: state.q, status: state.status, sort: state.sort, types: [] });
      apply();
      return;
    }
    if (e.target.closest('[data-reset-all]')) {
      Object.assign(state, { ...DEFAULTS, status: state.status, types: [] });
      boundsToggle.checked = false;
      apply();
      return;
    }
    if (e.target.closest('[data-open="save-modal"]')) {
      $('#save-summary').textContent = summary();
      $('#save-criteria').value = `${summary()} | ${location.href}`;
    }
  });

  let qTimer;
  qInput.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = qInput.value.trim(); apply(); }, 220);
  });
  qInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(qTimer); state.q = qInput.value.trim(); apply(); }
  });

  boundsToggle.addEventListener('change', () => apply({ refit: !boundsToggle.checked }));

  /* ---------- Popovers ---------- */
  const closePops = () => $$('.pill-wrap.is-open').forEach(w => {
    w.classList.remove('is-open');
    $('.pill', w).setAttribute('aria-expanded', 'false');
  });
  $$('.pill-wrap').forEach(wrap => {
    $('.pill', wrap).addEventListener('click', e => {
      e.stopPropagation();
      const open = !wrap.classList.contains('is-open');
      closePops();
      wrap.classList.toggle('is-open', open);
      $('.pill', wrap).setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.popover')) closePops(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePops(); });

  /* ---------- List / map view ---------- */
  const mobileQuery = matchMedia('(max-width: 900px)');
  const mobileToggle = $('[data-mobile-toggle]');

  function setView(view) {
    main.dataset.view = view;
    $$('[data-view-btn]').forEach(b => b.classList.toggle('is-active', b.dataset.viewBtn === view));
    const toMap = view !== 'map';
    mobileToggle.innerHTML = `<svg><use href="#${toMap ? 'i-map' : 'i-list'}"/></svg><span>${toMap ? 'Map' : 'List'}</span>`;
    if (map) {
      requestAnimationFrame(() => {
        map.resize();
        if (needsFit && mapVisible()) { needsFit = false; fitTo(mapListings, false); }
        renderPins();
      });
    }
  }
  $$('[data-view-btn]').forEach(b => b.addEventListener('click', () => setView(b.dataset.viewBtn)));
  mobileToggle.addEventListener('click', () => setView(main.dataset.view === 'map' ? 'list' : 'map'));

  /* ---------- Listing detail ---------- */
  function describe(l) {
    const word = TYPE_WORD[l.type] || 'property';
    const lot = l.lot >= 1 ? ` on ${l.lot} acres` : '';
    return `${l.beds}-bedroom ${word} in ${l.hood} with ${l.sqft.toLocaleString('en-US')} square feet of living space${lot}. ${l.blurb}`;
  }

  function openDetail(id) {
    const l = byId.get(id);
    if (!l) return;
    const shots = [l.img, ...(l.gallery || [])];
    const extra = l.status === 'rent'
      ? ['Lease Term', '12 months']
      : ['Price / Sq Ft', money(Math.round(l.price / l.sqft))];
    $('#listing-content').innerHTML = `
      <div class="detail">
        <div class="detail__gallery">
          <img class="detail__main" src="${photo(shots[0], 1400)}" alt="${l.title}">
          <div class="detail__thumbs">
            ${shots.map((s, i) => `<button type="button" data-shot="${s}" class="${i === 0 ? 'is-active' : ''}" aria-label="Photo ${i + 1}"><img src="${photo(s, 360)}" alt=""></button>`).join('')}
          </div>
        </div>
        <div class="detail__info">
          <span class="eyebrow">${l.status === 'rent' ? 'For Rent' : 'For Sale'} · ${l.type}</span>
          <h3 id="listing-title">${l.title}</h3>
          <p class="detail__loc">${l.hood}, ${l.city}, TX ${l.zip}</p>
          <p class="detail__price">${priceLabel(l)}</p>
          <div class="detail__facts">
            <div><strong>${l.beds}</strong><span>Beds</span></div>
            <div><strong>${l.baths}</strong><span>Baths</span></div>
            <div><strong>${l.sqft.toLocaleString('en-US')}</strong><span>Sq Ft</span></div>
          </div>
          <p class="detail__desc">${describe(l)}</p>
          <dl class="detail__meta">
            <div><dt>Year Built</dt><dd>${l.year}</dd></div>
            <div><dt>Lot Size</dt><dd>${l.lot ? `${l.lot} acres` : '—'}</dd></div>
            <div><dt>Listed</dt><dd>${l.days <= 1 ? 'Today' : `${l.days} days ago`}</dd></div>
            <div><dt>${extra[0]}</dt><dd>${extra[1]}</dd></div>
          </dl>
          <div class="detail__actions">
            <button type="button" class="btn btn--solid" data-inquire="tour" data-id="${l.id}">Schedule a Tour</button>
            <button type="button" class="btn btn--coral" data-inquire="question" data-id="${l.id}">Ask a Question</button>
          </div>
          <p class="detail__note">Sample listing for demonstration purposes.</p>
        </div>
      </div>`;
    window.EDSite.openLayer($('#listing-modal'));
  }

  $('#listing-content').addEventListener('click', e => {
    const thumb = e.target.closest('[data-shot]');
    if (thumb) {
      $('.detail__main').src = photo(thumb.dataset.shot, 1400);
      $$('[data-shot]').forEach(b => b.classList.toggle('is-active', b === thumb));
      return;
    }
    const inquire = e.target.closest('[data-inquire]');
    if (inquire) {
      const l = byId.get(inquire.dataset.id);
      const where = `${l.title} (${l.hood}, ${l.city}) listed at ${priceLabel(l)}`;
      $('#c-interest').value = l.status === 'rent' ? 'Renting / Leasing' : 'Buying';
      $('#c-msg').value = inquire.dataset.inquire === 'tour'
        ? `I'd like to schedule a tour of ${where}.`
        : `I have a question about ${where}.`;
      window.EDSite.openLayer($('#contact-modal'));
    }
  });

  /* ---------- Init ---------- */
  buildPriceOptions();
  setView(mobileQuery.matches ? 'list' : 'map');
  initMap();
  apply();
})();
