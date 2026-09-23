/* graphic-design.js — Section 04: Iconiq Creatives design portfolio.
   Masonry grid of folder covers → click opens an image-carousel lightbox
   (swipe/drag like the social-media section, but pictures instead of video). */

(function () {
  'use strict';

  let lbEl = null;
  const lb = { images: [], idx: 0 };
  let projectsRef = [];
  let currentId = null;
  let preLbPath = '';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Per-project shareable links (/design/<id>) + share button ──────── */
  const designPath = id => '/design/' + encodeURIComponent(id);
  const matchDesignPath = () => (location.pathname || '').match(/^\/design\/(.+?)\/?$/);
  const SHARE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/></svg>';

  let toastEl, toastTimer;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'gd-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
    } catch (e) { return false; }
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
  function shareProject(project) {
    if (!project) return;
    const url = location.origin + designPath(project.id);
    if (navigator.share) {   // native sheet (Messenger, WhatsApp, Copy, …)
      navigator.share({ title: 'Iconiq Creatives — ' + project.title, url: url }).catch(() => {});
      return;
    }
    copyText(url).then(ok => showToast(ok ? 'Link copied' : 'Couldn’t copy — check the address bar'));
  }

  /* ── Masonry grid of covers ─────────────────────────── */
  function buildGrid(projects) {
    const grid = document.getElementById('gd-grid');
    if (!grid) return;
    grid.innerHTML = projects.map((p, i) =>
      '<div class="gd-item" data-idx="' + i + '">' +
        '<a class="gd-item__link" href="' + designPath(p.id) + '" aria-label="View ' + esc(p.title) + ' designs">' +
          '<img class="gd-item__img" src="' + p.cover + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async" draggable="false">' +
          '<span class="gd-item__label">' + esc(p.title) + '</span>' +
        '</a>' +
        '<button class="gd-item__share" type="button" aria-label="Share ' + esc(p.title) + '">' + SHARE_ICON + '</button>' +
      '</div>'
    ).join('');
    grid.querySelectorAll('.gd-item').forEach(item => {
      const idx = +item.dataset.idx;
      item.querySelector('.gd-item__link').addEventListener('click', e => {
        // Let modified clicks (new tab / new window / middle-click) use the real link.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        openLightbox(projects[idx]);
      });
      item.querySelector('.gd-item__share').addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        shareProject(projects[idx]);
      });
    });
    reveal(grid.querySelectorAll('.gd-item'));
  }

  function reveal(els) {
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in-view')); return; }
    const o = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); o.unobserve(e.target); } });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => o.observe(e));
  }

  /* ── Lightbox (image carousel) ──────────────────────── */
  function buildShell() {
    const el = document.createElement('div');
    el.className = 'gd-lb';
    el.id = 'gd-lb';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Design preview');
    el.innerHTML =
      '<div class="gd-lb__backdrop" data-close></div>' +
      '<div class="gd-lb__panel" role="document">' +
        '<button class="gd-lb__close" type="button" aria-label="Close">&times;</button>' +
        '<div class="gd-lb__stage">' +
          '<div class="gd-lb__track"></div>' +
          '<button class="gd-lb__nav gd-lb__prev" type="button" aria-label="Previous">&#8249;</button>' +
          '<button class="gd-lb__nav gd-lb__next" type="button" aria-label="Next">&#8250;</button>' +
          '<div class="gd-lb__dots" role="tablist"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.gd-lb__close').addEventListener('click', () => closeLightbox());
    el.querySelector('.gd-lb__backdrop').addEventListener('click', () => closeLightbox());
    el.querySelector('.gd-lb__prev').addEventListener('click', () => goTo(lb.idx - 1));
    el.querySelector('.gd-lb__next').addEventListener('click', () => goTo(lb.idx + 1));
    document.addEventListener('keydown', e => {
      if (el.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') goTo(lb.idx - 1);
      else if (e.key === 'ArrowRight') goTo(lb.idx + 1);
    });
    initDrag(el.querySelector('.gd-lb__stage'), el.querySelector('.gd-lb__track'));
    return el;
  }

  function openLightbox(project, fromHistory) {
    if (!lbEl) lbEl = buildShell();
    const track = lbEl.querySelector('.gd-lb__track');
    const dots = lbEl.querySelector('.gd-lb__dots');
    lbEl.setAttribute('aria-label', (project.title || 'Design') + ' preview');
    lb.images = project.images || [];
    lb.idx = 0;

    track.innerHTML = lb.images.map((src, i) =>
      '<div class="gd-lb__slide"><img src="' + src + '" alt="' + esc(project.title) + ' — ' + (i + 1) + '"' +
        (i === 0 ? '' : ' loading="lazy"') + ' draggable="false"></div>'
    ).join('');
    dots.innerHTML = lb.images.map((_, i) =>
      '<button class="gd-lb__dot" type="button" role="tab" aria-label="Image ' + (i + 1) + '"></button>'
    ).join('');
    dots.querySelectorAll('.gd-lb__dot').forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    currentId = String(project.id);
    document.body.classList.add('gd-lb-open');
    lbEl.hidden = false;
    requestAnimationFrame(() => { setX(0, false); syncNav(); });

    /* Give the open project its own shareable URL (/design/<id>). */
    if (!fromHistory) {
      preLbPath = location.pathname;
      history.pushState({ gdDesign: currentId }, '', designPath(currentId));
    }
  }

  function closeLightbox(fromHistory) {
    if (!lbEl || lbEl.hidden) return;
    lbEl.hidden = true;
    document.body.classList.remove('gd-lb-open');
    resetPanel(false);
    currentId = null;
    if (!fromHistory && matchDesignPath()) {
      history.replaceState(null, '', preLbPath || '/graphic-design');
    }
  }

  function step() { return lbEl.querySelector('.gd-lb__stage').clientWidth; }
  function setX(px, animate) {
    const t = lbEl.querySelector('.gd-lb__track');
    t.style.transition = animate ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    t.style.transform = 'translate3d(' + px + 'px,0,0)';
  }
  function goTo(i, animate) {
    if (animate === undefined) animate = true;
    i = Math.max(0, Math.min(lb.images.length - 1, i));
    lb.idx = i;
    setX(-i * step(), animate);
    syncNav();
  }
  function syncNav() {
    const n = lb.images.length;
    lbEl.querySelectorAll('.gd-lb__dot').forEach((d, k) => {
      d.setAttribute('aria-current', k === lb.idx ? 'true' : 'false');
      d.style.transform = 'scale(' + (k === lb.idx ? 1.4 : Math.max(0.5, 1 - Math.abs(k - lb.idx) * 0.22)) + ')';
    });
    lbEl.querySelector('.gd-lb__prev').hidden = lb.idx <= 0;
    lbEl.querySelector('.gd-lb__next').hidden = lb.idx >= n - 1;
    lbEl.querySelector('.gd-lb__dots').hidden = n <= 1;
  }

  /* Reset the panel/backdrop after a vertical drag (or before reopening). */
  function resetPanel(animate) {
    if (!lbEl) return;
    const panel = lbEl.querySelector('.gd-lb__panel');
    const backdrop = lbEl.querySelector('.gd-lb__backdrop');
    panel.style.transition = animate ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    panel.style.transform = '';
    backdrop.style.transition = animate ? 'opacity 0.28s ease' : 'none';
    backdrop.style.opacity = '';
  }

  /* Drag/swipe — horizontal 1:1 follow + snap; on touch, a vertical
     drag pulls the panel and releases into a close (Instagram-style). */
  function initDrag(stage, track) {
    let down = false, x0 = 0, y0 = 0, dx = 0, dy = 0, axis = null, pid = null, base = 0, vClose = false;
    const minX = () => -(lb.images.length - 1) * step();
    const CLOSE_DIST = 90;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.gd-lb__nav')) return;
      down = true; dx = 0; dy = 0; axis = null; pid = e.pointerId;
      x0 = e.clientX; y0 = e.clientY; base = -lb.idx * step();
      vClose = e.pointerType === 'touch' || window.matchMedia('(hover: none)').matches;
      track.style.transition = 'none';
      lbEl.querySelector('.gd-lb__panel').style.transition = 'none';
    });
    stage.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== pid) return;
      dx = e.clientX - x0; dy = e.clientY - y0;
      if (axis === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          if (!vClose) { down = false; return; }   // desktop: ignore vertical
          axis = 'y';
        } else {
          axis = 'x';
        }
        try { stage.setPointerCapture(pid); } catch (_) {}
      }
      if (e.cancelable) e.preventDefault();
      if (axis === 'x') {
        setX(Math.max(minX(), Math.min(0, base + dx)), false);
      } else {
        const panel = lbEl.querySelector('.gd-lb__panel');
        const backdrop = lbEl.querySelector('.gd-lb__backdrop');
        panel.style.transform = 'translateY(' + dy + 'px)';
        backdrop.style.opacity = String(Math.max(0, 1 - Math.abs(dy) / 420));
      }
    });
    function end() {
      if (!down) return; down = false;
      if (pid != null) { try { stage.releasePointerCapture(pid); } catch (_) {} }
      if (axis === 'y') {
        if (Math.abs(dy) > CLOSE_DIST) {
          const panel = lbEl.querySelector('.gd-lb__panel');
          const backdrop = lbEl.querySelector('.gd-lb__backdrop');
          const outY = (dy < 0 ? -1 : 1) * Math.max(Math.abs(dy), window.innerHeight * 0.6);
          panel.style.transition = 'transform 0.24s ease, opacity 0.24s ease';
          panel.style.transform = 'translateY(' + outY + 'px)';
          backdrop.style.transition = 'opacity 0.24s ease';
          backdrop.style.opacity = '0';
          setTimeout(() => { closeLightbox(); }, 200);
        } else {
          resetPanel(true);
        }
        axis = null; dx = 0; dy = 0; pid = null;
        return;
      }
      let target = lb.idx;
      if (axis === 'x' && Math.abs(dx) > Math.min(80, step() * 0.2)) target = lb.idx + (dx < 0 ? 1 : -1);
      axis = null; dx = 0; dy = 0; pid = null;
      goTo(target, true);
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    window.addEventListener('resize', () => { if (lbEl && !lbEl.hidden) setX(-lb.idx * step(), false); });
  }

  /* Back/forward + shared links: sync the lightbox to the URL. */
  window.addEventListener('popstate', () => {
    const m = matchDesignPath();
    if (m) {
      const id = decodeURIComponent(m[1]);
      const proj = projectsRef.find(p => String(p.id) === id);
      if (proj && (!lbEl || lbEl.hidden || currentId !== id)) openLightbox(proj, true);
    } else if (lbEl && !lbEl.hidden) {
      closeLightbox(true);
    }
  });

  /* ── Init ───────────────────────────────────────────── */
  async function init() {
    if (!window.PortfolioData) return;
    let data;
    try { data = await window.PortfolioData.loadDesign(); } catch (e) { return; }
    const projects = (data && data.projects) || [];
    if (!projects.length) return;
    projectsRef = projects;
    buildGrid(projects);

    /* Deep link: opened with /design/<id> → open that project's lightbox
       (and park the page on the graphic-design section beneath it, so closing
       lands there). */
    const m = matchDesignPath();
    if (m) {
      const proj = projects.find(p => String(p.id) === decodeURIComponent(m[1]));
      if (proj) {
        const sec = document.getElementById('graphic-design');
        if (sec) sec.scrollIntoView();
        openLightbox(proj, true);
      }
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
