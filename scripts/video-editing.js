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

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.ve-dot').forEach((d, i) => {
      d.classList.toggle('ve-dot-active', i === current);
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

  /* ── Swipe / drag to change video (mouse + touch) ────── */
  if (catcher) {
    const SWIPE_THRESHOLD = 50;
    let dragging  = false;
    let startX    = 0;
    let dx        = 0;

    catcher.addEventListener('pointerdown', e => {
      if (busy) return;
      dragging = true;
      dx = 0;
      startX = e.clientX;
      frame.style.transition = 'none';
      catcher.classList.add('ve-swiping');
      if (catcher.setPointerCapture) catcher.setPointerCapture(e.pointerId);
    });

    catcher.addEventListener('pointermove', e => {
      if (!dragging) return;
      dx = e.clientX - startX;
      frame.style.transform = `translateX(${dx}px)`;
    });

    function endSwipe() {
      if (!dragging) return;
      dragging = false;
      catcher.classList.remove('ve-swiping');
      frame.style.transition = '';
      frame.style.transform = '';

      if (dx <= -SWIPE_THRESHOLD && videos[current + 1]) {
        goTo(current + 1);
      } else if (dx >= SWIPE_THRESHOLD && videos[current - 1]) {
        goTo(current - 1);
      }
      dx = 0;
    }

    catcher.addEventListener('pointerup', endSwipe);
    catcher.addEventListener('pointercancel', endSwipe);
    catcher.addEventListener('pointerleave', endSwipe);
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
})();
