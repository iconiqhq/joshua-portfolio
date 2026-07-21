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

  /* ── Short-form Video Carousel (same sliding as featured video) ── */
  (function initVerticalCarousel() {
    const vFrame   = document.getElementById('ve-vertical-frame');
    const vCatcher = document.getElementById('ve-vertical-swipe-catcher');
    const vDotsEl  = document.getElementById('ve-vertical-dots');
    if (!vFrame) return;

    const vSlides = Array.from(vFrame.querySelectorAll('.ve-vertical-slide'));
    const vDots   = vDotsEl ? Array.from(vDotsEl.querySelectorAll('.ve-dot')) : [];
    if (!vSlides.length) return;

    let vCurrent = 0;
    let vBusy    = false;

    function vUpdateDots() {
      vDots.forEach((d, i) => d.classList.toggle('ve-dot-active', i === vCurrent));
    }

    function playSlide(slide) {
      const fr = slide.querySelector('iframe');
      const overlay = slide.querySelector('.ve-play-overlay');
      if (!fr || !overlay || overlay.classList.contains('ve-playing')) return;
      overlay.classList.add('ve-playing');
      fr.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
        '*'
      );
    }

    function vGoTo(index) {
      if (vBusy || index === vCurrent || !vSlides[index]) return;
      vBusy = true;

      const dir = index > vCurrent ? 'next' : 'prev';
      const outgoing = vSlides[vCurrent];
      const incoming = vSlides[index];

      outgoing.classList.add(dir === 'next' ? 've-exit-left' : 've-exit-right');

      setTimeout(() => {
        outgoing.classList.remove('ve-vertical-slide-active', 've-exit-left', 've-exit-right');
        vCurrent = index;
        vUpdateDots();

        incoming.classList.add('ve-vertical-slide-active', dir === 'next' ? 've-enter-right' : 've-enter-left');

        /* Force layout so the enter-state is applied before we transition
           out of it — avoids relying on requestAnimationFrame. */
        void incoming.offsetWidth;

        incoming.classList.remove('ve-enter-right', 've-enter-left');
        incoming.classList.add('ve-entering');

        setTimeout(() => {
          incoming.classList.remove('ve-entering');
          vBusy = false;
        }, 420);
      }, 300);
    }

    vDots.forEach((dot, i) => {
      dot.addEventListener('click', () => vGoTo(i));
    });

    /* swipe / drag to change slide (mouse + touch); a plain tap plays the video */
    if (vCatcher) {
      const SWIPE_THRESHOLD = 50;
      let dragging = false;
      let startX   = 0;
      let dx       = 0;
      let moved    = false;

      vCatcher.addEventListener('pointerdown', e => {
        if (vBusy) return;
        dragging = true;
        moved = false;
        dx = 0;
        startX = e.clientX;
        if (vCatcher.setPointerCapture) vCatcher.setPointerCapture(e.pointerId);
      });

      vCatcher.addEventListener('pointermove', e => {
        if (!dragging) return;
        dx = e.clientX - startX;
        if (Math.abs(dx) > 8) moved = true;
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;

        if (dx <= -SWIPE_THRESHOLD && vSlides[vCurrent + 1]) {
          vGoTo(vCurrent + 1);
        } else if (dx >= SWIPE_THRESHOLD && vSlides[vCurrent - 1]) {
          vGoTo(vCurrent - 1);
        } else if (!moved) {
          playSlide(vSlides[vCurrent]);
        }
        dx = 0;
      }

      vCatcher.addEventListener('pointerup', endDrag);
      vCatcher.addEventListener('pointercancel', endDrag);
      vCatcher.addEventListener('pointerleave', endDrag);
    }

    vUpdateDots();
  })();
})();
