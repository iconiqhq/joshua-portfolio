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
    // autoplay + mute=1 guarantees it starts; we unmute on load (works once the
    // page has any user interaction — browsers block sound-autoplay before that).
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&autoplay=1&mute=1&loop=1&playlist=${id}&enablejsapi=1`;
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

    /* Start the live embed inside a card (autoplay; unmute once allowed). The
       iframe is pointer-events:none (CSS) so the carousel drag/swipe still works
       right over the playing video. */
    function playCard(card) {
      if (!card || card.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      f.src = embedSrc(card.dataset.id);
      f.title = 'Featured long-form video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.setAttribute('allowfullscreen', '');
      f.addEventListener('load', function () {
        try {
          const send = (func, args) => f.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
          send('unMute'); send('setVolume', [100]); send('playVideo');   // audio on when the browser allows
        } catch (_) {}
      });
      card.appendChild(f);
      card.classList.add('ve-vcard--playing');
    }
    function stopCard(card) {
      const f = card.querySelector('iframe');
      if (f) f.remove();
      card.classList.remove('ve-vcard--playing');
    }

    /* Autoplay whichever card is the MAIN one on screen (nearest the row's
       centre — the big one, not the small side peeks). Others revert to their
       poster so only one plays and the surface stays swipeable. */
    let activeCard = null;
    let inView = true;
    function stopAll() {
      row.querySelectorAll('.ve-vcard').forEach(stopCard);
      activeCard = null;
    }
    function activateCentered() {
      if (!inView || row.clientWidth < 50) return;   // skip while off-screen / not laid out
      const mid = row.scrollLeft + row.clientWidth / 2;
      let best = null, bd = Infinity;
      row.querySelectorAll('.ve-vcard').forEach(c => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = c; }
      });
      if (!best || best === activeCard) return;
      row.querySelectorAll('.ve-vcard').forEach(c => { if (c !== best) stopCard(c); });
      activeCard = best;
      playCard(best);
    }

    /* Drive it with the shared social-media carousel engine — identical
       animation + swipe motion. Auto-advance is off (like the creators row).
       Falls back gracefully if the shared engine hasn't loaded. */
    if (typeof window.__jlCarousel === 'function') {
      window.__jlCarousel(row, dotsEl, { autoScroll: false });
    }

    /* Re-evaluate the main card whenever scrolling settles. */
    let settleT = 0;
    row.addEventListener('scroll', () => {
      clearTimeout(settleT);
      settleT = setTimeout(activateCentered, 180);
    }, { passive: true });
    if ('onscrollend' in window) row.addEventListener('scrollend', activateCentered);

    /* Tapping a side peek glides it to the main position (then it autoplays). */
    row.addEventListener('click', e => {
      const card = e.target.closest('.ve-vcard');
      if (card && card !== activeCard) card.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' });
    });

    /* Sound-autoplay is blocked by the browser until the page has seen a user
       gesture, so unmute the live video on the first interaction anywhere (and
       whenever the viewer interacts thereafter). */
    function unmuteActive() {
      const f = row.querySelector('.ve-vcard--playing iframe');
      if (!f) return;
      try {
        const send = (func, args) => f.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
        send('unMute'); send('setVolume', [100]);
      } catch (_) {}
    }
    ['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
      window.addEventListener(ev, unmuteActive, { passive: true }));

    /* Only autoplay while the video section is actually on screen — start the
       main card when it scrolls into view, stop everything when it leaves (no
       audio from an off-screen video). */
    /* Retry until a card actually activates (covers first-paint / layout-not-yet
       timing); stops as soon as one is playing. */
    function kickstart() {
      let tries = 0;
      (function attempt() {
        if (!inView || activeCard) return;
        activateCentered();
        if (!activeCard && tries++ < 25) setTimeout(attempt, 150);
      })();
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          inView = e.isIntersecting;
          if (inView) kickstart();
          else stopAll();
        });
      }, { threshold: 0.35 });
      io.observe(row);
    } else {
      inView = true;
      kickstart();
    }
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
