/* video-editing.js — Section 05: featured video carousel */

(function () {
  'use strict';

  const wrap   = document.getElementById('ve-featured-wrap');
  const frame  = document.getElementById('ve-featured-frame');
  const iframe = document.getElementById('ve-iframe');
  const dotsEl = document.getElementById('ve-nav-dots');

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

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          frame.classList.remove('ve-enter-right', 've-enter-left');
          frame.classList.add('ve-entering');

          setTimeout(() => {
            frame.classList.remove('ve-entering');
            busy = false;
          }, 420);
        });
      });
    }, 300);
  }

  /* Wire up dots */
  if (dotsEl) {
    dotsEl.querySelectorAll('.ve-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });
  }

  updateDots();

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
