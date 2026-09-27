/*
  Client-side pagination for the inner index pages (blog, portfolio, neighborhoods, testimonials).
  Every item is in the HTML, so the page still works without JS; this just shows one page at a time.

  <div data-paginate="6"> ...items... </div>
  The current page is kept in ?page=N so links and the back button land on the same page.
*/
(() => {
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  $$('[data-paginate]').forEach(list => {
    const items = [...list.children];
    const perPage = Number(list.dataset.paginate) || 6;
    const pages = Math.ceil(items.length / perPage);
    if (pages < 2) return;

    const nav = document.createElement('nav');
    nav.className = 'pagination';
    nav.setAttribute('aria-label', 'Pagination');
    list.after(nav);

    const fromUrl = Number(new URLSearchParams(location.search).get('page'));
    let current = fromUrl >= 1 && fromUrl <= pages ? fromUrl : 1;

    // 1 2 … 7 when there are more than a few pages, like the original site
    const pageNumbers = () => {
      if (pages <= 3) return Array.from({ length: pages }, (_, i) => i + 1);
      const near = [current - 1, current, current + 1].filter(n => n > 1 && n < pages);
      const out = [1];
      if (near[0] > 2) out.push('…');
      out.push(...near);
      if (near[near.length - 1] < pages - 1) out.push('…');
      out.push(pages);
      return out;
    };

    const button = (label, page, { disabled = false, active = false, aria } = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (aria) b.setAttribute('aria-label', aria);
      if (active) b.setAttribute('aria-current', 'page');
      b.disabled = disabled;
      b.addEventListener('click', () => go(page, true));
      return b;
    };

    function render() {
      items.forEach((item, i) => { item.hidden = Math.floor(i / perPage) + 1 !== current; });
      nav.replaceChildren(
        button('«', current - 1, { disabled: current === 1, aria: 'Previous page' }),
        ...pageNumbers().map(n => n === '…'
          ? Object.assign(document.createElement('span'), { className: 'pagination__gap', textContent: '…' })
          : button(String(n), n, { active: n === current, aria: `Page ${n}` })),
        button('»', current + 1, { disabled: current === pages, aria: 'Next page' })
      );
    }

    function go(page, scroll) {
      current = Math.min(Math.max(page, 1), pages);
      const url = new URL(location.href);
      if (current === 1) url.searchParams.delete('page'); else url.searchParams.set('page', current);
      history.replaceState(null, '', url);
      render();
      if (scroll) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    render();
  });
})();
