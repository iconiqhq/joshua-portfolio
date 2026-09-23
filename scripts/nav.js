/* nav.js — Apple liquid-glass bottom pill nav */

(function () {
  'use strict';

  const nav      = document.getElementById('site-nav');
  const pill     = document.getElementById('nav-pill');
  const items    = Array.from(document.querySelectorAll('.nav-item[data-section]'));
  const indicator = document.getElementById('nav-indicator');

  if (!nav || !items.length) return;

  /* ── Sections list ──────────────────────────────── */
  const sections = items
    .map(i => document.getElementById(i.dataset.section))
    .filter(Boolean);

  /* ── Sliding indicator — glides to sit behind the active item ──
     Uses transform (translateX + scaleX) rather than animating left/width
     directly, so the browser can composite the slide instead of running
     layout on every frame. Base width is 1px, so scaleX(N) reads as Npx. */
  function moveIndicator(item) {
    if (!indicator || !pill || !item) return;
    const pillRect = pill.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const left = itemRect.left - pillRect.left;
    indicator.style.transform = `translateX(${left}px) scaleX(${itemRect.width})`;
    indicator.classList.add('nav-indicator--visible');
  }

  /* ── Active state ───────────────────────────────── */
  let activeId = '';

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    items.forEach(i => i.classList.toggle('nav-active', i.dataset.section === id));
    const activeItem = items.find(i => i.dataset.section === id);
    moveIndicator(activeItem);
  }

  /* Which section the viewport is currently "in":
     Walk sections; last one whose top is above the
     viewport midpoint wins.                          */
  function updateActive() {
    const mid = window.innerHeight * 0.5;
    let winner = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= mid) winner = s;
    }
    setActive(winner.id);
  }

  /* ── Scroll: compact / expand + active update ───── */
  let lastY   = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y         = window.scrollY;
      const goingDown = y > lastY;
      const wasCompact = nav.classList.contains('nav-compact');

      /* Compact when scrolling down past 60px */
      if (goingDown && y > 60) {
        nav.classList.add('nav-compact');
      } else if (!goingDown) {
        nav.classList.remove('nav-compact');
      }

      updateActive();

      /* Compact toggle resizes the items — re-track the indicator
         once that size transition has settled. */
      if (wasCompact !== nav.classList.contains('nav-compact')) {
        setTimeout(() => moveIndicator(items.find(i => i.dataset.section === activeId)), 320);
      }

      lastY   = y;
      ticking = false;
    });
  }, { passive: true });

  /* Keep the indicator aligned across viewport/orientation changes */
  window.addEventListener('resize', () => {
    moveIndicator(items.find(i => i.dataset.section === activeId));
  });

  /* Initial active state on load */
  updateActive();

  /* ── Smooth scroll on click ─────────────────────── */
  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const id = item.dataset.section;

      /* Hero → scroll to absolute top */
      if (id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.getElementById(id);
      if (!target) return;

      /* Nav is at the bottom on all devices — no top offset needed.
         Just a small clearance (20px) from the top edge.           */
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });

})();


/* ── Per-section URL (Artsons-style) ──────────────────────────────
   The address bar reflects the section in view (#social-media, #mentorship, …)
   so each section is shareable/bookmarkable. Uses replaceState so it never
   floods the back-history; paused while a project lightbox is open (that owns
   the URL). The first section (hero) shows the bare path, no hash. */
(function () {
  'use strict';
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!sections.length) return;
  let current = null, ticking = false;

  const ids = new Set(sections.map(s => s.id));

  /* A project lightbox (social or graphic design) owns the URL while open. */
  function lbOpen() {
    return document.body.classList.contains('sm-lb-open') ||
           document.body.classList.contains('gd-lb-open');
  }

  function pick() {
    if (lbOpen()) return;
    // A project deep-link (/project/… or /design/…) owns the URL — never clobber it.
    if (/^\/(project|design)\//.test(location.pathname || '')) return;
    const mark = window.innerHeight * 0.35;
    let winner = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= mark) winner = s;
    }
    const id = winner.id;
    if (id === current) return;
    current = id;
    const isFirst = winner === sections[0];
    const want = isFirst ? '/' : ('/' + id);   // clean path, no '#'
    if (location.pathname !== want) history.replaceState(null, '', want);
  }

  /* Landing on a shared section path (e.g. /graphic-design) → jump there.
     Sections below shift as images/carousels load, so re-settle a few times
     until the target rests near the top (or the viewer takes over).
     Project paths (/project/…, /design/…) are handled by their own scripts. */
  let userTookOver = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev =>
    window.addEventListener(ev, () => { userTookOver = true; }, { passive: true, once: true }));

  function applyPath() {
    const seg = (location.pathname || '/').replace(/^\/+|\/+$/g, '');
    if (!seg || !ids.has(seg)) return false;
    const target = document.getElementById(seg);
    if (!target) return false;
    current = seg;
    let tries = 0;
    (function settle() {
      if (userTookOver) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      if (++tries < 14 && Math.abs(target.getBoundingClientRect().top - 20) > 4) {
        setTimeout(settle, 110);
      }
    })();
    return true;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; pick(); });
  }, { passive: true });

  const hadPath = applyPath();                       // best-effort now
  window.addEventListener('load', () => { if (!applyPath()) pick(); });   // authoritative after layout
  if (!hadPath) pick();                              // home load reflects the section in view
})();
