/* nav.js — Apple liquid-glass bottom pill nav */

(function () {
  'use strict';

  const nav   = document.getElementById('site-nav');
  const items = Array.from(document.querySelectorAll('.nav-item[data-section]'));

  if (!nav || !items.length) return;

  /* ── Sections list ──────────────────────────────── */
  const sections = items
    .map(i => document.getElementById(i.dataset.section))
    .filter(Boolean);

  /* ── Active state ───────────────────────────────── */
  let activeId = '';

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    items.forEach(i => i.classList.toggle('nav-active', i.dataset.section === id));
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

      /* Compact when scrolling down past 60px */
      if (goingDown && y > 60) {
        nav.classList.add('nav-compact');
      } else if (!goingDown) {
        nav.classList.remove('nav-compact');
      }

      updateActive();

      lastY   = y;
      ticking = false;
    });
  }, { passive: true });

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
