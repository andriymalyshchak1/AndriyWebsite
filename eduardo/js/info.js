/* Testimonial "Read More" toggles and inline vlog players (tools/build_info.py pages). */
(() => {
  document.querySelectorAll('[data-read-more]').forEach(btn => {
    const item = btn.closest('.t-item');
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Read Less' : 'Read More';
    });
  });

  // Swap a thumbnail for the YouTube player on click; starting another video puts the first one back.
  const thumbs = new Map();
  document.addEventListener('click', e => {
    const play = e.target.closest('.vlog-card__play');
    if (!play) return;
    const player = play.parentElement;
    thumbs.forEach((html, other) => { other.innerHTML = html; });
    thumbs.clear();
    thumbs.set(player, player.innerHTML);
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${player.dataset.youtube}?autoplay=1&rel=0`;
    iframe.title = player.dataset.title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
  });
})();
