/* video-editing.js — Section 05: featured video carousel
   The featured video is a real sliding track (same motion as the social-media
   carousel): drag/flick moves the videos 1:1 and snaps to the nearest one.
   Each slide is a video — a YouTube poster that upgrades to a live, muted,
   looping embed once it settles at centre, so only ONE iframe is ever live. */

(function () {
  'use strict';

  const wrap    = document.getElementById('ve-featured-wrap');
  const frame   = document.getElementById('ve-featured-frame');
  const track   = document.getElementById('ve-track');
  const dotsEl  = document.getElementById('ve-nav-dots');
  const catcher = document.getElementById('ve-swipe-catcher');
  const prevBtn = document.getElementById('ve-prev');
  const nextBtn = document.getElementById('ve-next');

  if (!wrap || !frame || !track) return;

  const videos = JSON.parse(wrap.dataset.videos || '[]');
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  function embedSrc(id) {
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white&autoplay=1&mute=1&loop=1&playlist=${id}&enablejsapi=1`;
  }
  function posterSrc(id) { return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`; }
  function posterFallback(id) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

  /* ── Build one slide per video (poster + play affordance) ── */
  const slides = videos.map((id, i) => {
    const slide = document.createElement('div');
    slide.className = 've-slide';
    slide.dataset.id = id;
    slide.innerHTML =
      '<img class="ve-poster" src="' + posterSrc(id) + '" alt="Video ' + (i + 1) + '" ' +
        'loading="lazy" decoding="async" ' +
        'onerror="this.onerror=null;this.src=\'' + posterFallback(id) + '\'">' +
      '<span class="ve-slide-play" aria-hidden="true">' +
        '<svg viewBox="0 0 20 20" fill="none"><path d="M6 4L16 10L6 16V4Z" fill="currentColor"/></svg>' +
      '</span>';
    track.appendChild(slide);
    return slide;
  });

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

  /* ── Geometry + transform ─────────────────────────────── */
  function step() { return frame.clientWidth; }           // one slide per view, no gap
  function setX(px, animate) {
    track.style.transition = animate && !REDUCED
      ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';
    track.style.transform = 'translate3d(' + px + 'px,0,0)';
  }

  /* ── Only the settled slide holds a live iframe ───────── */
  let activeTimer = 0;
  function setActiveIframe(i) {
    slides.forEach((slide, k) => {
      const has = !!slide.querySelector('iframe');
      if (k === i && !has) {
        const f = document.createElement('iframe');
        f.src = embedSrc(slide.dataset.id);
        f.title = 'Featured video ' + (i + 1);
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.setAttribute('allowfullscreen', '');
        slide.appendChild(f);
        slide.classList.add('ve-slide--live');
      } else if (k !== i && has) {
        slide.querySelector('iframe').remove();
        slide.classList.remove('ve-slide--live');
      }
    });
  }

  function dotScale(dist) { dist = Math.abs(dist); return dist === 0 ? 1.4 : Math.max(0.5, 1 - dist * 0.22); }
  function updateDots() {
    if (dotsEl) {
      dotsEl.querySelectorAll('.ve-dot').forEach((d, i) => {
        d.classList.toggle('ve-dot-active', i === current);
        d.style.transform = 'scale(' + dotScale(i - current) + ')';   // TikTok: outer dots smaller
      });
    }
    if (prevBtn) prevBtn.disabled = current <= 0;
    if (nextBtn) nextBtn.disabled = current >= videos.length - 1;
  }

  function goTo(index, animate = true) {
    index = Math.max(0, Math.min(videos.length - 1, index));
    current = index;
    setX(-index * step(), animate);
    updateDots();
    // Load the live embed once the slide has settled at centre.
    clearTimeout(activeTimer);
    activeTimer = setTimeout(() => setActiveIframe(index), animate && !REDUCED ? 480 : 0);
  }

  /* Dots + edge arrows */
  if (dotsEl) dotsEl.querySelectorAll('.ve-dot').forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  /* ── Drag — the SAME model as the social-media carousel ──
     Social maps the drag 1:1 onto the track's scroll position (you can drag
     freely across the whole strip), hard-clamps at the first/last edge, and on
     release snaps to the NEAREST slide (a quick flick nudges one further, like
     native momentum). Here the track is a transform instead of scrollLeft (so a
     drag over the cross-origin iframe isn't swallowed — the catcher captures the
     pointer once the drag goes horizontal), but the feel is identical. A vertical
     drag is handed back so the page keeps scrolling. */
  if (catcher) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const minX = () => -(videos.length - 1) * step();       // furthest-left scroll (last slide)
    let dragging = false, startX = 0, startY = 0, dx = 0, axis = null, pid = null, baseX = 0, t0 = 0;

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      catcher.classList.remove('ve-swiping');
      if (pid !== null) { try { catcher.releasePointerCapture(pid); } catch (_) {} }

      let target = current;
      if (axis === 'x') {
        const frac = -clamp(baseX + dx, minX(), 0) / step(); // fractional slide position now
        target = Math.round(frac);                           // snap to nearest (social's snapTarget)
        const vx = dx / Math.max(1, performance.now() - t0); // px/ms — flick momentum
        if (Math.abs(vx) > 0.5) target = dx < 0 ? Math.ceil(frac) : Math.floor(frac);
      }
      axis = null; dx = 0; pid = null;
      goTo(target, true);
    }

    catcher.addEventListener('pointerdown', e => {
      dragging = true; dx = 0; axis = null; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      baseX = -current * step(); t0 = performance.now();
      track.style.transition = 'none';
    });

    catcher.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;    // wait until the drag commits
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // vertical → let the page scroll
        axis = 'x';
        catcher.classList.add('ve-swiping');
        try { catcher.setPointerCapture(pid); } catch (_) {} // keep events over the iframe
      }
      if (e.cancelable) e.preventDefault();
      setX(clamp(baseX + dx, minX(), 0), false);             // 1:1, hard-clamped at both ends
    });

    catcher.addEventListener('pointerup', endDrag);
    catcher.addEventListener('pointercancel', endDrag);
  }

  /* Keep the current slide centred on resize/orientation change */
  window.addEventListener('resize', () => setX(-current * step(), false));

  /* Init: seat slide 0 and play it */
  goTo(0, false);

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
