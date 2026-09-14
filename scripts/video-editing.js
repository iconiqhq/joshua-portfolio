/* video-editing.js — Section 05: featured long-form videos + vertical reels
   The featured long-form videos use the EXACT same carousel engine as the
   social-media section (window.__jlCarousel): 1:1 drag → scroll, snap to the
   nearest card, coverflow, seamless clone loop, dots, native mobile scroll-snap.
   Each card is a click-to-play thumbnail (a live iframe would swallow the drag,
   the same reason the social cards are static). */

(function () {
  'use strict';

  const wrap   = document.getElementById('ve-featured-wrap');
  const row    = document.getElementById('ve-cards-row');
  const dotsEl = document.getElementById('ve-video-dots');

  function embedSrc(id) {
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&autoplay=1&enablejsapi=1`;
  }
  function poster(id)         { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
  function posterFallback(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

  /* ── Pause every other section iframe when one starts playing ── */
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://www.youtube.com') return;
    try {
      const data = JSON.parse(e.data);
      if (data.event === 'onStateChange' && data.info === 1) {
        document.querySelectorAll('#video-editing iframe').forEach(function (el) {
          if (el.contentWindow !== e.source) {
            el.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
            );
          }
        });
      }
    } catch (_) {}
  });

  /* ── Featured long-form videos ─────────────────────── */
  if (wrap && row) {
    const videos = JSON.parse(wrap.dataset.videos || '[]');

    function cardHTML(id, i) {
      return (
        '<div class="ve-vcard" role="listitem" tabindex="0" data-id="' + id + '" ' +
             'aria-label="Play featured video ' + (i + 1) + '">' +
          '<img class="ve-vcard__poster" src="' + poster(id) + '" alt="Featured video ' + (i + 1) + '" ' +
               'loading="lazy" decoding="async" ' +
               'onerror="this.onerror=null;this.src=\'' + posterFallback(id) + '\'">' +
          '<span class="ve-vcard__play" aria-hidden="true">' +
            '<svg viewBox="0 0 20 20" fill="none"><path d="M6 4L16 10L6 16V4Z" fill="currentColor"/></svg>' +
          '</span>' +
        '</div>'
      );
    }

    row.innerHTML = videos.map(cardHTML).join('');

    /* Play a card in place: swap its poster for the live embed. */
    function playCard(card) {
      if (!card || card.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      f.src = embedSrc(card.dataset.id);
      f.title = 'Featured long-form video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.setAttribute('allowfullscreen', '');
      card.appendChild(f);
      card.classList.add('ve-vcard--playing');
    }

    /* Drive it with the shared social-media carousel engine — identical
       animation + swipe motion. Auto-advance is off (like the creators row) so a
       playing video isn't scrolled away. Falls back to a plain scroll strip if
       the shared engine somehow hasn't loaded. */
    if (typeof window.__jlCarousel === 'function') {
      window.__jlCarousel(row, dotsEl, { autoScroll: false });
    }

    /* Click / Enter / Space on a card → play it. The engine swallows the click
       that follows a drag, so this only fires on a real tap. */
    row.addEventListener('click', function (e) {
      playCard(e.target.closest('.ve-vcard'));
    });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.ve-vcard');
        if (card) { e.preventDefault(); playCard(card); }
      }
    });
  }

  /* ── Vertical video play overlays ───────────────────── */
  document.querySelectorAll('.ve-play-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      const iframe = overlay.previousElementSibling;
      overlay.classList.add('ve-playing');
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    });
  });

  /* ── Reels-style horizontal scroll (arrows + edge state) ─ */
  (function () {
    const row = document.getElementById('ve-reels-row');
    const prev = document.getElementById('ve-reels-prev');
    const next = document.getElementById('ve-reels-next');
    if (!row || !next) return;
    function step() {
      const card = row.querySelector('.ve-vertical-card');
      const gap = parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 14;
      return card ? (card.offsetWidth + gap) * 2 : 360;   // ~2 cards per click
    }
    function sync() {
      const max = row.scrollWidth - row.clientWidth - 2;
      const noOverflow = max <= 0;
      if (prev) prev.hidden = noOverflow || row.scrollLeft <= 2;
      next.hidden = noOverflow || row.scrollLeft >= max;
    }
    next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
    if (prev) prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
    row.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    sync();
  })();
})();
