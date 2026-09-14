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

  function poster(id)         { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
  function posterFallback(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

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

    /* Load the official YouTube IFrame Player API — it reliably fires the ENDED
       event (raw postMessage does not), which is what drives auto-advance. */
    let ytReady = !!(window.YT && window.YT.Player);
    const ytQueue = [];
    function whenYT(cb) { if (ytReady) cb(); else ytQueue.push(cb); }
    if (!ytReady) {
      const prevCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prevCb === 'function') { try { prevCb(); } catch (_) {} }
        ytReady = true; ytQueue.splice(0).forEach(cb => cb());
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }

    let userEngaged = false;

    const PLAY_SVG  = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    const PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

    function togglePlay(card) {
      const p = card && card._player;
      if (!p || !p.getPlayerState) return;
      if (p.getPlayerState() === YT.PlayerState.PLAYING) p.pauseVideo(); else p.playVideo();
    }

    /* Start the live player inside a card (autoplay; unmute once the browser
       allows). The player's iframe is pointer-events:none (CSS) so the carousel
       drag/swipe still works right over it — a dedicated play/pause button gives
       the viewer control. When the video ENDS, advance to the next card. */
    function playCard(card) {
      if (!card || card.classList.contains('ve-vcard--playing')) return;
      card.classList.add('ve-vcard--playing');
      const host = document.createElement('div');
      host.className = 've-vcard__player';
      card.appendChild(host);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 've-vcard__toggle';
      btn.setAttribute('aria-label', 'Pause');
      btn.innerHTML = PAUSE_SVG;
      btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });   // don't start a carousel drag
      btn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      btn.addEventListener('click', function (e) { e.stopPropagation(); togglePlay(card); });
      card.appendChild(btn);

      whenYT(function () {
        // The card may have been swiped away before the API finished loading.
        if (!card.isConnected || !card.classList.contains('ve-vcard--playing')) { host.remove(); btn.remove(); return; }
        card._player = new YT.Player(host, {
          videoId: card.dataset.id,
          playerVars: { autoplay: 1, mute: 1, rel: 0, modestbranding: 1, playsinline: 1, controls: 1, color: 'white' },
          events: {
            onReady: function (e) {
              try { e.target.playVideo(); if (userEngaged) { e.target.unMute(); e.target.setVolume(100); } } catch (_) {}
            },
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.ENDED) { advanceToNext(); return; }   // 0 = ended → next video
              if (e.data === YT.PlayerState.PLAYING) { btn.innerHTML = PAUSE_SVG; btn.setAttribute('aria-label', 'Pause'); }
              else if (e.data === YT.PlayerState.PAUSED) { btn.innerHTML = PLAY_SVG; btn.setAttribute('aria-label', 'Play'); }
            }
          }
        });
      });
    }
    function stopCard(card) {
      if (card._player) { try { card._player.destroy(); } catch (_) {} card._player = null; }
      card.querySelectorAll('iframe, .ve-vcard__player, .ve-vcard__toggle').forEach(el => el.remove());
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

    /* Glide to the next video (the card after the active one; the clone loop makes
       the last wrap round to the first). activateCentered plays it on settle. */
    function advanceToNext() {
      if (!activeCard) return;
      const next = activeCard.nextElementSibling;
      if (next && next.classList.contains('ve-vcard')) {
        next.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' });
      }
    }

    /* Sound-autoplay is blocked until the page has seen a user gesture, so unmute
       the active player on the first interaction anywhere (and thereafter). */
    function unmuteActive() {
      userEngaged = true;
      const p = activeCard && activeCard._player;
      if (p && p.unMute) { try { p.unMute(); p.setVolume(100); } catch (_) {} }
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
