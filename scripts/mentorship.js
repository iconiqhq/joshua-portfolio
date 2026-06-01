/* mentorship.js — Section 03: mentee cards, before/after growth, Chart.js charts */

(function () {
  'use strict';

  /* ── Platform icons (subset) ────────────────────── */
  const ICONS = {
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    youtube:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    tiktok:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>`,
    facebook:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    threads:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>`,
    twitter:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  };

  function icon(name) {
    const key = (name || '').toLowerCase();
    return ICONS[key] || ICONS[key === 'x' ? 'twitter' : key] || ICONS.instagram;
  }

  /* ── Status ring colours ────────────────────────── */
  const STATUS = {
    active:    { from: '#22c55e', to: '#86efac', glow: 'rgba(34,197,94,',   label: 'Active'    },
    'on-hold': { from: '#f59e0b', to: '#fde68a', glow: 'rgba(245,158,11,',  label: 'On Hold'   },
    completed: { from: '#ef4444', to: '#fca5a5', glow: 'rgba(239,68,68,',   label: 'Completed' },
  };

  function statusOf(mentee) {
    if (mentee.status === 'on-hold') return STATUS['on-hold'];
    if (mentee.status === 'completed' || mentee.mentorshipTo) return STATUS.completed;
    return STATUS.active;
  }

  /* ── Formatting ─────────────────────────────────── */
  function fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function pct(before, after) {
    if (!before || before === 0) return after > 0 ? 'New' : '—';
    return '+' + Math.round((after - before) / before * 100) + '%';
  }

  function duration(from, to) {
    if (!from) return '';
    const start = new Date(from + '-01');
    const end   = to ? new Date(to + '-01') : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                   (end.getMonth() - start.getMonth());
    if (months < 1)  return 'Less than a month';
    if (months === 1) return '1 month';
    if (months < 12)  return `${months} months`;
    const yrs = Math.floor(months / 12);
    const rem = months % 12;
    return rem ? `${yrs}yr ${rem}mo` : `${yrs} year${yrs > 1 ? 's' : ''}`;
  }

  /* ── Card builder ───────────────────────────────── */
  function buildCard(mentee) {
    const initial  = (mentee.name || '?').charAt(0).toUpperCase();
    const hasPhoto = mentee.photo && !mentee.photo.includes('mentee-01');

    const photoHTML = hasPhoto
      ? `<img class="ms-ring-photo" src="${mentee.photo}" alt="" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const initStyle = hasPhoto ? 'style="display:none"' : '';

    const primary = mentee.platforms[0] || {};
    const dur     = duration(mentee.mentorshipFrom, mentee.mentorshipTo);

    const durHTML = dur
      ? `<p class="ms-duration">${mentee.mentorshipTo ? 'Mentored for' : 'Mentoring since'} ${dur}</p>`
      : '';

    const st = statusOf(mentee);

    return `
      <article class="ms-card status-${mentee.status === 'on-hold' ? 'on-hold' : mentee.mentorshipTo ? 'completed' : 'active'}"
               data-id="${mentee.id}" role="listitem"
               style="--ring-from:${st.from};--ring-to:${st.to};--ring-glow:${st.glow}">
        <div class="ms-ring">
          <div class="ms-ring-inner">
            ${photoHTML}
            <span class="ms-ring-initial" ${initStyle}>${initial}</span>
          </div>
        </div>

        <div class="ms-card-info">
          <h3 class="ms-mentee-name">${mentee.name}</h3>
          <div class="ms-mentee-meta">
            <span class="ms-mentee-niche">${mentee.niche}</span>
          </div>
        </div>

        <div class="ms-platforms">
          ${mentee.platforms.map(p => {
            const key  = (p.icon || p.name || '').toLowerCase();
            const Tag  = p.url ? 'a' : 'div';
            const linkAttrs = p.url
              ? `href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.name}: ${fmt(p.currentFollowers)} followers"`
              : '';
            const iconSVG = icon(p.icon || p.name);
            return `
              <${Tag} class="ms-platform-btn${p.url ? '' : ' no-link'}" ${linkAttrs}>
                <span class="ms-platform-icon" aria-hidden="true">${iconSVG}</span>
                <span class="ms-platform-count">${fmt(p.currentFollowers)}</span>
              </${Tag}>`;
          }).join('')}
        </div>

        <div class="ms-growth-block">
          ${mentee.platforms.map(p => {
            const g = pct(p.beforeFollowers, p.currentFollowers);
            return `
              <div class="ms-platform-growth">
                <div class="ms-pg-header">
                  <span class="ms-pg-icon">${icon(p.icon || p.name)}</span>
                  <span class="ms-pg-name">${p.name}</span>
                </div>
                <div class="ms-growth-row">
                  <div class="ms-growth-col">
                    <span class="ms-growth-col-label">Before</span>
                    <span class="ms-growth-num">${fmt(p.beforeFollowers || 0)}</span>
                  </div>
                  <div class="ms-growth-arrow">
                    <span class="ms-growth-arrow-icon" aria-hidden="true">→</span>
                    <span class="ms-growth-pct" aria-label="${g} growth">${g}</span>
                  </div>
                  <div class="ms-growth-col after">
                    <span class="ms-growth-col-label">After</span>
                    <span class="ms-growth-num after">${fmt(p.currentFollowers || 0)}</span>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>

        ${durHTML}
      </article>`;
  }

  /* ── Chart init ─────────────────────────────────── */
  function initCharts(mentees) {
    if (!window.Chart) return;

    mentees.forEach(mentee => {
      const canvas = document.querySelector(
        `.ms-chart-canvas[data-mentee="${mentee.id}"]`
      );
      if (!canvas) return;

      const platform = mentee.platforms[0];
      if (!platform || !platform.chartData || !platform.chartLabels) return;

      new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: platform.chartLabels,
          datasets: [{
            data: platform.chartData,
            borderColor: '#E111FB',
            backgroundColor: 'rgba(225,17,251,0.10)',
            borderWidth: 2,
            fill: true,
            tension: 0.42,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#E111FB',
            pointHoverBorderColor: '#000',
            pointHoverBorderWidth: 2,
          }],
        },
        options: {
          responsive: false,
          animation: { duration: 900, easing: 'easeInOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(8,8,8,0.92)',
              borderColor: '#E111FB',
              borderWidth: 1,
              titleColor: '#E111FB',
              titleFont: { family: 'JetBrains Mono', size: 10 },
              bodyColor: 'rgba(255,255,255,0.75)',
              bodyFont: { family: 'JetBrains Mono', size: 11 },
              padding: 8,
              callbacks: {
                label: ctx => ` ${fmt(ctx.raw)} followers`,
              },
            },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
          interaction: { intersect: false, mode: 'index' },
        },
      });
    });
  }

  /* ── Aggregate stats ────────────────────────────── */
  function computeStats(mentees) {
    let totalMentees   = mentees.length;
    let followersGained = 0;
    let growthRates    = [];

    mentees.forEach(m => {
      const p = m.platforms[0];
      if (!p) return;
      if (p.beforeFollowers && p.currentFollowers) {
        followersGained += (p.currentFollowers - p.beforeFollowers);
        growthRates.push((p.currentFollowers - p.beforeFollowers) / p.beforeFollowers * 100);
      }
    });

    const avgGrowth = growthRates.length
      ? Math.round(growthRates.reduce((a, b) => a + b, 0) / growthRates.length)
      : 0;

    return { totalMentees, followersGained, avgGrowth };
  }

  /* ── Counter animation ──────────────────────────── */
  function countUp(el, target, duration, suffix) {
    if (!el) return;
    const start = performance.now();
    (function tick(now) {
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val  = Math.round(target * ease);
      el.textContent = suffix ? fmt(val) + suffix : fmt(val);
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ── Drag-to-scroll ─────────────────────────────── */
  function initDrag(el) {
    let down = false, startX, sl;
    el.addEventListener('mousedown', e => {
      down = true; startX = e.pageX - el.offsetLeft; sl = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { down = false; });
    el.addEventListener('mouseup',    () => { down = false; });
    el.addEventListener('mousemove', e => {
      if (!down) return;
      e.preventDefault();
      el.scrollLeft = sl - (e.pageX - el.offsetLeft - startX) * 1.4;
    });
  }

  /* ── Carousel dots ──────────────────────────────── */
  function initDots(row, container, count) {
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Go to mentee ${i + 1}`);
      container.appendChild(btn);

      btn.addEventListener('click', () => {
        const cards = row.querySelectorAll('.ms-card');
        const gap   = parseInt(getComputedStyle(row).gap) || 20;
        const cardW = (cards[0]?.offsetWidth || 304) + gap;
        row.scrollTo({ left: i * cardW, behavior: 'smooth' });
      });
    }

    const dots = container.querySelectorAll('.carousel-dot');
    row.addEventListener('scroll', () => {
      const cards = row.querySelectorAll('.ms-card');
      const gap   = parseInt(getComputedStyle(row).gap) || 20;
      const cardW = (cards[0]?.offsetWidth || 304) + gap;
      const idx   = Math.round(row.scrollLeft / cardW);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });
  }

  /* ── Main init ──────────────────────────────────── */
  async function init() {
    if (!window.PortfolioData) return;

    let data;
    try { data = await window.PortfolioData.loadMentorship(); }
    catch (e) { return; }

    const mentees = (data && data.mentees) || [];
    if (!mentees.length) return;

    const row = document.getElementById('ms-cards-row');
    if (row) {
      row.innerHTML = mentees.map(buildCard).join('');
      initDrag(row);
    }

    const dotsEl = document.getElementById('ms-dots');
    if (row && dotsEl) initDots(row, dotsEl, mentees.length);

    const section = document.getElementById('mentorship');
    if (!section) return;

    const stats = computeStats(mentees);
    let statsTriggered  = false;
    let chartsTriggered = false;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        if (!statsTriggered) {
          statsTriggered = true;
          countUp(document.getElementById('ms-total-mentees'),       stats.totalMentees,    800);
          countUp(document.getElementById('ms-avg-growth'),          stats.avgGrowth,       1200, '%');
          countUp(document.getElementById('ms-followers-gained'),    stats.followersGained, 1400);
        }

        if (!chartsTriggered) {
          chartsTriggered = true;
          initCharts(mentees);
        }

        if (statsTriggered && chartsTriggered) observer.disconnect();
      });
    }, { threshold: 0.15 });

    observer.observe(section);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
