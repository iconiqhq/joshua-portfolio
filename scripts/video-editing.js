/* video-editing.js — Section 05: featured video carousel */

(function () {
  'use strict';

  const wrap    = document.getElementById('ve-featured-wrap');
  const frame   = document.getElementById('ve-featured-frame');
  const iframe  = document.getElementById('ve-iframe');
  const dotsEl  = document.getElementById('ve-nav-dots');
  const catcher = document.getElementById('ve-swipe-catcher');

  if (!wrap || !frame || !iframe) return;

  const videos = JSON.parse(wrap.dataset.videos || '[]');
  let current  = 0;
  let busy     = false;

  function buildSrc(id) {
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&autoplay=1&mute=1&loop=1&playlist=${id}&enablejsapi=1`;
  }

  /* Pause all section iframes except the one currently playing */
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

  function dotScale(dist) { dist = Math.abs(dist); return dist === 0 ? 1.4 : Math.max(0.5, 1 - dist * 0.22); }
  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.ve-dot').forEach((d, i) => {
      d.classList.toggle('ve-dot-active', i === current);
      d.style.transform = 'scale(' + dotScale(i - current) + ')';   // TikTok: outer dots smaller
    });
  }

  function goTo(index) {
    if (busy || index === current || !videos[index]) return;
    busy = true;

    const dir = index > current ? 'next' : 'prev';

    /* slide current out */
    frame.classList.add(dir === 'next' ? 've-exit-left' : 've-exit-right');

    setTimeout(() => {
      iframe.src = buildSrc(videos[index]);
      current = index;
      updateDots();

      frame.classList.remove('ve-exit-left', 've-exit-right');
      frame.classList.add(dir === 'next' ? 've-enter-right' : 've-enter-left');

      /* Force layout so the enter-state is actually applied before we
         transition out of it — avoids relying on requestAnimationFrame,
         which can stall (e.g. backgrounded tab) and leave the frame stuck
         invisible at opacity:0. */
      void frame.offsetWidth;

      frame.classList.remove('ve-enter-right', 've-enter-left');
      frame.classList.add('ve-entering');

      setTimeout(() => {
        frame.classList.remove('ve-entering');
        busy = false;
      }, 420);
    }, 300);
  }

  /* Wire up dots */
  if (dotsEl) {
    dotsEl.querySelectorAll('.ve-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  }

  updateDots();

  /* ── Swipe / drag to change video — left↔right, mouse + touch ──
     The catcher is a transparent overlay ON TOP of the YouTube <iframe>.
     The iframe is cross-origin, so during a drag it would normally swallow
     the move/up events and the swipe would die halfway. The fix is
     setPointerCapture: once a horizontal drag is confirmed we capture the
     pointer to the catcher, so every following move/up is delivered to us
     even while the finger/cursor is over the iframe.
       • The first ~8px lock the axis: horizontal → swipe (we capture + take
         over); vertical → we bail so the page scrolls normally.
       • Capture is taken only AFTER the horizontal lock, so a vertical scroll
         gesture is never interfered with. */
  if (catcher) {
    const SWIPE_THRESHOLD = 45;
    let dragging = false, startX = 0, startY = 0, dx = 0, axis = null, pid = null;

    function endSwipe() {
      if (!dragging) return;
      dragging = false;
      catcher.classList.remove('ve-swiping');
      if (pid !== null) { try { catcher.releasePointerCapture(pid); } catch (_) {} }
      frame.style.transition = '';
      frame.style.transform = '';

      const moved = axis === 'x' ? dx : 0;
      axis = null; dx = 0; pid = null;
      if (moved <= -SWIPE_THRESHOLD && videos[current + 1]) goTo(current + 1);
      else if (moved >= SWIPE_THRESHOLD && videos[current - 1]) goTo(current - 1);
    }

    catcher.addEventListener('pointerdown', e => {
      if (busy) return;
      dragging = true; dx = 0; axis = null; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      frame.style.transition = 'none';
    });

    catcher.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;         // wait until the drag commits
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // vertical → let the page scroll
        axis = 'x';
        catcher.classList.add('ve-swiping');
        try { catcher.setPointerCapture(pid); } catch (_) {}      // keep events over the iframe
      }
      if (e.cancelable) e.preventDefault();
      frame.style.transform = `translateX(${dx}px)`;
    });

    catcher.addEventListener('pointerup', endSwipe);
    catcher.addEventListener('pointercancel', endSwipe);
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
