/* social-media.js — Section 02: brand cards, story rings, Chart.js growth charts */

(function () {
  'use strict';

  /* ── Platform SVG icons ─────────────────────────── */
  const PLATFORM_ICONS = {
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    youtube:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    tiktok:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>`,
    facebook:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    threads:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>`,
    twitter:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  };

  function platformIcon(name) {
    const key = (name || '').toLowerCase();
    return PLATFORM_ICONS[key] || PLATFORM_ICONS[key === 'x' ? 'twitter' : key] || '';
  }

  /* ── Status ring colours ────────────────────────── */
  const STATUS = {
    active:   { from: '#22c55e', to: '#86efac', label: 'Active'    },
    inactive: { from: '#f59e0b', to: '#fde68a', label: 'On Hold'   },
    past:     { from: '#ef4444', to: '#fca5a5', label: 'Completed' },
  };

  function statusOf(s) { return STATUS[s] || STATUS.active; }

  /* ── Formatting ─────────────────────────────────── */
  function fmt(n) {
    if (n === null || n === undefined || n === 0) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function fmtFull(n) {
    if (!n) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function fmtPeriod(project) {
    if (project.status === 'active') return '';
    const from = project.managedFrom || '';
    const to   = project.managedTo   || 'Present';
    return from ? `${from} – ${to}` : '';
  }

  /* ── Helpers ────────────────────────────────────── */
  function totalReach(platforms) {
    return platforms.reduce((s, p) => s + (p.currentFollowers || 0), 0);
  }

  /* Escape HTML, then turn @handles into links to the matching X profile.
     Opens in a new tab per the project's external-link rule. */
  function escHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function linkifyBio(text) {
    return escHTML(text).replace(
      /@([A-Za-z0-9_]{1,15})/g,
      '<a class="sm-bio-link" href="https://x.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>'
    );
  }

  /* ── Silver Play Button achievement card ─────────── */
  function buildAchievementCard() {
    return `
      <article class="sm-card sm-achievement-card" role="listitem" aria-label="YouTube Silver Play Button Achievement">
        <div class="sm-achievement-photo" aria-hidden="true">
          <img src="assets/images/profile/silver-play-button.jpg" alt="Joshua holding the YouTube Silver Play Button" loading="lazy">
        </div>
        <div class="sm-achievement-body">
          <div class="sm-achievement-yt" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <span class="sm-achievement-label">Achievement Unlocked</span>
          <h3 class="sm-achievement-title">YouTube Silver Play Button</h3>
          <p class="sm-achievement-milestone">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            100,000 Subscribers
          </p>
          <span class="sm-achievement-hover-hint" aria-hidden="true">Hover to reveal</span>
        </div>
      </article>`;
  }

  /* ── Card builder ───────────────────────────────── */
  function buildCard(project) {
    const st      = statusOf(project.status);
    const initial = (project.brandName || '?').charAt(0).toUpperCase();
    const hasLogo = project.logo && !project.logo.includes('example') && !project.logo.includes('brand-02');

    const logoHTML  = hasLogo
      ? `<img class="sm-ring-logo" src="${project.logo}" alt="" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const initStyle = hasLogo ? 'style="display:none"' : '';

    const reach = totalReach(project.platforms);

    /* Per-profile banner: an image path, or a solid "#hex" colour.
       Falls back to the brand-tinted gradient placeholder when absent. */
    const bannerStyle = project.banner
      ? (project.banner.charAt(0) === '#'
          ? ` style="background:${project.banner}"`
          : ` style="background-image:url('${project.banner}')"`)
      : '';
    const bioHTML = project.bio
      ? `<p class="sm-bio">${linkifyBio(project.bio)}</p>`
      : '';

    return `
      <article class="sm-card status-${project.status || 'active'}" data-id="${project.id}"
               style="--ring-from:${st.from};--ring-to:${st.to};--brand:${project.brandColor || '#41BDFE'}"
               role="listitem">

        <div class="sm-banner"${bannerStyle}></div>

        <div class="sm-body">
          <div class="sm-ring">
            <div class="sm-ring-inner">
              ${logoHTML}
              <span class="sm-ring-initial" ${initStyle}>${initial}</span>
            </div>
          </div>

          <h3 class="sm-brand-name">
            ${project.brandName}${project.verified ? '<svg class="sm-verified-badge" viewBox="0 0 22 22" fill="none" aria-label="Verified" role="img"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.275.213-1.815.568s-.972.854-1.247 1.44c-.606-.222-1.262-.268-1.897-.14-.634.132-1.218.437-1.687.882-.445.47-.749 1.054-.88 1.688-.13.633-.085 1.29.139 1.896-.587.274-1.087.705-1.441 1.246-.354.54-.551 1.17-.569 1.816.018.647.215 1.276.569 1.817.354.54.854.972 1.441 1.246-.224.606-.269 1.262-.14 1.896.131.634.436 1.218.881 1.688.469.443 1.053.748 1.687.879.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.606.22 1.262.267 1.897.137.634-.132 1.218-.437 1.687-.882.445-.469.749-1.053.881-1.687.13-.633.086-1.29-.136-1.897.587-.274 1.087-.706 1.441-1.246.354-.54.551-1.17.569-1.816z" fill="#1D9BF0"/><path d="M6.5 11.5l2.8 2.8 5.7-5.6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
          </h3>
          <span class="sm-brand-industry">${project.industry}</span>

          ${bioHTML}

          <div class="sm-total-reach">
            <span class="sm-reach-value">${fmtFull(reach)}</span>
            <span class="sm-reach-label">Total Reach</span>
          </div>
        </div>

      </article>`;
  }


  /* ── Aggregate stats ────────────────────────────── */
  function computeStats(projects) {
    let total = 0, platformCount = 0;
    projects.forEach(p => {
      platformCount += p.platforms.length;
      p.platforms.forEach(pl => { total += pl.currentFollowers || 0; });
    });
    return { total, activeBrands: projects.length, platformCount };
  }

  /* ── Counter animation ──────────────────────────── */
  function countUp(el, target, duration) {
    if (!el) return;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ── Drag scroll ────────────────────────────────── */
  /* ── Swipe carousel with coverflow (ported from Artsons projects) ──
     Cards spin + scale + fade in from the right and out to the left as you
     swipe/drag. Native horizontal scroll + an infinite clone loop + snap. */
  function initCarousel(track, dots) {
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const real = Array.from(track.children);
    const n = real.length;
    if (!n) return;
    const CLONES = Math.min(n, 4);

    function prepClone(node) {
      node.classList.add('sm-clone');
      node.setAttribute('aria-hidden', 'true');
      node.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    }
    /* [ last CLONES ] + [ real cards ] + [ first CLONES ] → seamless loop */
    const head = document.createDocumentFragment();
    for (let a = 0; a < CLONES; a++) {
      const c = real[(n - CLONES + a) % n].cloneNode(true); prepClone(c); head.appendChild(c);
    }
    track.insertBefore(head, track.firstChild);
    for (let b = 0; b < CLONES; b++) {
      const c = real[b].cloneNode(true); prepClone(c); track.appendChild(c);
    }

    const kids = () => Array.from(track.children);

    /* Geometry measured straight from the DOM so the loop wrap is pixel-exact.
       (Deriving it as n*(offsetWidth+gap) rounds off and makes the wrap jerk.) */
    let geoBase = 0, geoStep = 360, geoLoop = 2880, centerOffset = 0;
    function measure() {
      const items = kids();
      const first = items[CLONES], nextSet = items[CLONES + n];
      if (first && nextSet) {
        geoBase = first.offsetLeft;                       // raw offset of the first real card
        geoLoop = nextSet.offsetLeft - first.offsetLeft;  // exact pixel period of one full set
        geoStep = geoLoop / n;                            // exact per-card distance
      }
    }
    function step() { return geoStep; }
    /* The cards fill the track's content box exactly and the track's own
       symmetric padding provides equal left/right margins, so a rest on the
       first real card is already centred — no extra offset (that double-shifted it). */
    function restBase() { return geoBase; }
    function realStart() { return restBase(); }
    function realWidth() { return geoLoop; }
    function setInstant(x) {
      const sb = track.style.scrollBehavior; track.style.scrollBehavior = 'auto';
      track.scrollLeft = x; track.style.scrollBehavior = sb;
    }
    function realIndex() { return ((Math.round((track.scrollLeft - restBase()) / geoStep) % n) + n) % n; }
    function snapTarget() { return restBase() + Math.round((track.scrollLeft - restBase()) / geoStep) * geoStep; }

    /* Dots — one per real card */
    const dotBtns = [];
    if (dots) {
      dots.innerHTML = '';
      for (let j = 0; j < n; j++) {
        const d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Go to brand ' + (j + 1));
        d.addEventListener('click', () => { track.scrollLeft = realStart() + j * step(); });
        dots.appendChild(d);
        dotBtns.push(d);
      }
    }
    function syncDots() {
      const active = realIndex();
      dotBtns.forEach((d, k) => d.setAttribute('aria-current', k === active ? 'true' : 'false'));
    }

    /* Coverflow: scroll-driven spin + scale + fade (geometry cached, so the
       inline transforms we apply never feed back into the measurement). */
    let cfMeta = [];
    function cfMeasure() { measure(); cfMeta = kids().map(c => ({ el: c, left: c.offsetLeft, w: c.offsetWidth })); }
    function coverflow() {
      if (REDUCED) return;
      const sl = track.scrollLeft, vw = track.clientWidth;
      for (const m of cfMeta) {
        /* Scale each card by how far its centre is from the viewport centre:
           middle = big, sides = small. As the row swipes, every card grows
           toward the centre and shrinks toward the edges (small → big → small). */
        const cardCentre = (m.left + m.w / 2) - sl;
        const off = (cardCentre - vw / 2) / vw;      // 0 at centre; ± toward the sides
        const d = Math.min(1, Math.abs(off) * 2);    // 0 centre → 1 near the edges
        const scale = (1 - 0.17 * d).toFixed(3);     // pure scale: big in the middle, small at the sides
        const op    = (1 - 0.45 * d).toFixed(3);     // sides fade back
        m.el.style.transform = 'scale(' + scale + ')';   // no rotateY → symmetric edges, no directional bleed
        m.el.style.opacity = op;
        m.el.classList.add('sm-cf');
      }
    }

    /* Infinite-loop wrap */
    function normalize() {
      const s = step(), rs = realStart(), sl = track.scrollLeft;
      const k = Math.round((sl - rs) / s);
      if (k < 0) setInstant(sl + realWidth());
      else if (k >= n) setInstant(sl - realWidth());
    }

    /* Smooth eased auto-advance (easeInOutCubic — softer than native smooth-scroll).
       normalize() is suppressed mid-tween so it never jumps, then re-run at the end. */
    let tweening = false, tweenRAF = null;
    function tweenTo(target, dur) {
      cancelAnimationFrame(tweenRAF);
      const start = track.scrollLeft, dist = target - start, t0 = performance.now();
      const prevBehav = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      tweening = true;
      function frame(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;   // easeInOutCubic — eases in AND out, no lurch/jump
        track.scrollLeft = Math.round(start + dist * e);   // integer → no sub-pixel jitter
        coverflow();                                        // drive the spin in-sync each frame
        if (p < 1) { tweenRAF = requestAnimationFrame(frame); }
        else { tweening = false; track.style.scrollBehavior = prevBehav; normalize(); coverflow(); syncDots(); }
      }
      tweenRAF = requestAnimationFrame(frame);
    }

    /* Desktop snap once a scroll settles (mobile uses native CSS scroll-snap) */
    let dotTick = false, cfTick = false, settleTimer;
    function settle() {
      if (tweening || track.classList.contains('sm-dragging') || window.innerWidth < 640) return;
      const t = snapTarget();
      if (Math.abs(t - track.scrollLeft) > 2) track.scrollLeft = t;
    }
    track.addEventListener('scroll', () => {
      if (tweening) return;
      normalize();
      if (!cfTick) { cfTick = true; requestAnimationFrame(() => { cfTick = false; coverflow(); }); }
      if (!dotTick) { dotTick = true; requestAnimationFrame(() => { dotTick = false; syncDots(); }); }
    }, { passive: true });

    /* Edge arrows (optional, if present in the markup) */
    function nudge(dir) { track.scrollLeft = snapTarget() + dir * step(); }
    const prev = document.getElementById('sm-prev'), next = document.getElementById('sm-next');
    if (prev) prev.addEventListener('click', () => nudge(-1));
    if (next) next.addEventListener('click', () => nudge(1));

    /* Desktop click-drag — moves 1:1 with the cursor and snaps on release,
       exactly like Artsons (no momentum fling). Incremental deltas keep the
       infinite loop seamless in both directions. */
    if (window.matchMedia('(pointer: fine)').matches) {
      let down = false, startX = 0, lastX = 0, moved = false;
      track.addEventListener('mousedown', e => {
        if (e.target.closest('a')) return;      // let bio @mention links click through
        cancelAnimationFrame(tweenRAF); tweening = false;   // take over from any in-flight auto-glide
        down = true; moved = false; startX = lastX = e.clientX;
        track.classList.add('sm-dragging'); e.preventDefault();
      });
      window.addEventListener('mousemove', e => {
        if (!down) return;
        const dx = e.clientX - lastX;
        if (Math.abs(e.clientX - startX) > 4) moved = true;
        track.scrollLeft -= dx;                 // follow the cursor
        normalize();                            // wrap right away so a long drag never hits an edge
        lastX = e.clientX;
      });
      const end = () => {
        if (!down) return; down = false;
        track.classList.remove('sm-dragging');
        // no snap — the continuous auto-scroll simply resumes from here
      };
      window.addEventListener('mouseup', end);
      window.addEventListener('mouseleave', end);
      /* Swallow the click that follows a drag so bio links don't fire mid-swipe */
      track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    }

    /* Auto-scroll: a continuous, constant-speed drift right → left so the motion
       is ALWAYS visibly moving — never a jump from one project to the next. The
       coverflow keeps scaling as projects flow through the centre, and it loops
       seamlessly via normalize(). Pauses on hover / drag / hidden tab. */
    if (!REDUCED) {
      let hovering = false, pointerActive = false;
      const SPEED = 0.6;                 // px per frame — matches the original marquee speed (was `x -= 0.6`)
      let pos = track.scrollLeft;
      (function autoTick() {
        const active = !hovering && !pointerActive && !tweening &&
                       !track.classList.contains('sm-dragging') && !document.hidden;
        if (active) {
          pos += SPEED;
          track.scrollLeft = pos;
          const before = track.scrollLeft;
          normalize();                              // seamless wrap at the loop point
          const after = track.scrollLeft;
          if (after !== before) pos += (after - before);   // keep the accumulator in sync after a wrap
          coverflow();
        } else {
          pos = track.scrollLeft;                   // stay in sync while paused/dragging
        }
        requestAnimationFrame(autoTick);
      })();
      track.addEventListener('mouseenter', () => { hovering = true; });
      track.addEventListener('mouseleave', () => { hovering = false; });
      track.addEventListener('pointerdown', () => { pointerActive = true; cancelAnimationFrame(tweenRAF); tweening = false; });
      window.addEventListener('pointerup', () => { pointerActive = false; });
      window.addEventListener('pointercancel', () => { pointerActive = false; });
    }

    /* Start on the first real card */
    cfMeasure();
    setInstant(realStart());
    requestAnimationFrame(() => { cfMeasure(); setInstant(realStart()); coverflow(); syncDots(); });
    window.addEventListener('load', () => { cfMeasure(); coverflow(); });
    window.addEventListener('resize', () => {
      const i = realIndex();
      cfMeasure(); setInstant(realStart() + i * step()); coverflow(); syncDots();
    });
  }

  /* ── Main ───────────────────────────────────────── */
  async function init() {
    if (!window.PortfolioData) return;
    let data;
    try { data = await window.PortfolioData.loadProjects(); } catch (e) { return; }
    const projects = (data && data.projects) || [];
    if (!projects.length) return;

    const row = document.getElementById('sm-cards-row');
    if (row) {
      row.innerHTML = projects.map(buildCard).join('');
      initCarousel(row, document.getElementById('sm-dots'));
    }

    const section = document.getElementById('social-media');
    if (!section) return;

    const stats = computeStats(projects);
    let statsOk = false;

    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!statsOk) {
          statsOk = true;
          countUp(document.getElementById('sm-total-followers'), stats.total,         1400);
          countUp(document.getElementById('sm-active-brands'),   stats.activeBrands,  900);
          countUp(document.getElementById('sm-platform-count'),  stats.platformCount, 900);
        }
      });
    }, { threshold: 0.15 }).observe(section);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
