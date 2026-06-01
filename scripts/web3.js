/* web3.js — Section 06: holographic grid canvas + mouse reaction */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     HOLOGRAPHIC GRID CANVAS
     A perspective grid of green lines that warps
     subtly toward the mouse cursor position.
  ═══════════════════════════════════════════════════ */

  class Web3Canvas {
    constructor() {
      this.canvas    = document.getElementById('web3-canvas');
      if (!this.canvas) return;

      this.ctx       = this.canvas.getContext('2d');
      this.alive     = true;
      this.time      = 0;
      this.mouse     = { x: 0.5, y: 0.5 };
      this.target    = { x: 0.5, y: 0.5 };
      this.bootProg  = 0;      /* 0 → 1: sweep reveal on section entry */
      this.hasBooted = false;
      this.scrollVel = 0;      /* 0 → 1: boosts warp while scrolling */
      this._prevScrollY = window.scrollY;

      this._init();
    }

    _init() {
      this._resize();
      window.addEventListener('resize', () => this._resize());

      document.addEventListener('mousemove', (e) => {
        const section = this.canvas.closest('.web3-section');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        this.target.x = (e.clientX - rect.left) / rect.width;
        this.target.y = (e.clientY - rect.top)  / rect.height;
      });

      /* Track scroll velocity for warp boost */
      window.addEventListener('scroll', () => {
        const dy = Math.abs(window.scrollY - this._prevScrollY);
        this.scrollVel = Math.min(dy / 22, 1);
        this._prevScrollY = window.scrollY;
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        this.alive = !document.hidden;
        if (this.alive) this._loop();
      });

      const section = this.canvas.closest('.web3-section');
      if (section) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            this.alive = e.isIntersecting;
            if (this.alive) {
              this._loop();
              if (!this.hasBooted) {
                this.hasBooted = true;
                this._startBoot(section);
              }
            }
          });
        }, { threshold: 0.05 });
        io.observe(section);
      } else {
        this._loop();
      }
    }

    _startBoot(section) {
      section.classList.add('web3-section--booting');
      const start = performance.now();
      const dur   = 1800;
      const tick  = (now) => {
        this.bootProg = Math.min(1, (now - start) / dur);
        if (this.bootProg < 1) {
          requestAnimationFrame(tick);
        } else {
          section.classList.remove('web3-section--booting');
          section.classList.add('web3-section--booted');
        }
      };
      requestAnimationFrame(tick);
    }

    _resize() {
      const section = this.canvas.closest('.web3-section');
      this.canvas.width  = section ? section.offsetWidth  : window.innerWidth;
      this.canvas.height = section ? section.offsetHeight : window.innerHeight;
    }

    _loop() {
      if (!this.alive) return;

      this.time      += 0.0008;
      this.scrollVel *= 0.87;  /* velocity decay */
      this.mouse.x   += (this.target.x - this.mouse.x) * 0.04;
      this.mouse.y   += (this.target.y - this.mouse.y) * 0.04;

      const w   = this.canvas.width;
      const h   = this.canvas.height;
      const ctx = this.ctx;
      const t   = this.time;
      const mx  = this.mouse.x;
      const my  = this.mouse.y;
      const bp  = this.bootProg;
      const sv  = this.scrollVel;

      ctx.clearRect(0, 0, w, h);

      /* ─── Boot sweep line ──────────────────────────── */
      if (bp < 1) {
        const sweepY = bp * h;

        /* trailing glow above the line */
        const trail = ctx.createLinearGradient(0, Math.max(0, sweepY - 140), 0, sweepY);
        trail.addColorStop(0, 'rgba(0,248,8,0)');
        trail.addColorStop(1, 'rgba(0,248,8,0.07)');
        ctx.fillStyle = trail;
        ctx.fillRect(0, 0, w, sweepY);

        /* bright sweep edge */
        ctx.save();
        ctx.strokeStyle = `rgba(0,248,8,${0.9 - bp * 0.4})`;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = '#00f808';
        ctx.shadowBlur  = 16;
        ctx.beginPath();
        ctx.moveTo(0, sweepY);
        ctx.lineTo(w, sweepY);
        ctx.stroke();
        ctx.restore();
      }

      /* ─── Grid ─────────────────────────────────────── */
      const cols    = 18;
      const rows    = 12;
      const warpStr = 28 * (1 + sv * 4);   /* warp spikes while scrolling */

      ctx.lineWidth = 0.6;

      const warp = (nx, ny) => {
        const dx  = nx - mx;
        const dy  = ny - my;
        const d   = Math.sqrt(dx * dx + dy * dy);
        const mag = Math.max(0, 1 - d * 2.2);
        return {
          x: nx * w + (mx - nx) * mag * warpStr,
          y: ny * h + (my - ny) * mag * warpStr,
        };
      };

      /* reveal progress: rows above sweep are lit, below are dark */
      const revealed = bp * rows;
      const rowMult = (r) => {
        if (bp >= 1) return 1;
        if (r > revealed + 1) return 0;
        if (r > revealed)     return revealed + 1 - r;
        return 1;
      };

      const lineAlpha = (nx, ny, r) => {
        const rm   = rowMult(r);
        if (rm <= 0) return 0;
        const dist = Math.sqrt((nx - mx) * (nx - mx) + (ny - my) * (ny - my));
        const wave = Math.sin(t * 6 + dist * 8) * 0.12 + 0.12;
        return Math.max(0.04, Math.min(0.32, wave + (1 - dist * 1.4) * 0.1))
               * rm * (1 + sv * 0.7);
      };

      for (let c = 0; c <= cols; c++) {
        const nx = c / cols;
        ctx.beginPath();
        let started = false;
        for (let r = 0; r <= rows; r++) {
          const ny = r / rows;
          const a  = lineAlpha(nx, ny, r);
          const pt = warp(nx, ny);
          ctx.strokeStyle = `rgba(0,248,8,${a})`;
          if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
          else            ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      for (let r = 0; r <= rows; r++) {
        const ny = r / rows;
        if (rowMult(r) <= 0) continue;
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const nx = c / cols;
          const a  = lineAlpha(nx, ny, r);
          const pt = warp(nx, ny);
          ctx.strokeStyle = `rgba(0,248,8,${a})`;
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else         ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      /* ─── Intersection dots ────────────────────────── */
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const rm = rowMult(r);
          if (rm <= 0) continue;
          const nx   = c / cols;
          const ny   = r / rows;
          const dist = Math.sqrt((nx - mx) * (nx - mx) + (ny - my) * (ny - my));
          if (dist > 0.25) continue;
          const pt    = warp(nx, ny);
          const glow  = Math.max(0, 1 - dist / 0.25) * rm;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, glow * 2.5 * (1 + sv * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,248,8,${glow * 0.7})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(() => this._loop());
    }
  }

  /* ── Instagram feed via Behold ─────────────────── */
  async function loadInstagramFeed() {
    const tiles = document.querySelectorAll('.web3-ig-tile');
    if (!tiles.length) return;

    try {
      const res = await fetch('https://feeds.behold.so/NZZA0W4xZYEfZluAJdqY');
      if (!res.ok) return;
      const data = await res.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);

      posts.slice(0, tiles.length).forEach((post, i) => {
        const tile = tiles[i];
        const imgUrl = post.mediaUrl || post.thumbnailUrl || post.prunedMediaUrl;
        if (!imgUrl) return;

        tile.style.backgroundImage = `url(${imgUrl})`;
        tile.style.backgroundSize = 'cover';
        tile.style.backgroundPosition = 'center';
        tile.href = post.permalink;
        tile.setAttribute('aria-label', post.caption ? post.caption.slice(0, 80) : 'View on Instagram');
        tile.classList.add('web3-ig-tile--loaded');
      });
    } catch (err) {
      console.warn('[Behold] feed failed:', err);
    }
  }

  /* ── NFT Carousel ───────────────────────────────── */
  function initNFTCarousel() {
    const carousel = document.getElementById('web3-nft-carousel');
    const dotsWrap = document.getElementById('web3-nft-dots');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.web3-nft-slide'));
    const dots   = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.web3-nft-dot')) : [];
    if (slides.length < 2) return;

    let current  = 0;
    let timer    = null;
    let busy     = false;
    let paused   = false;

    function scheduleNext() {
      clearTimeout(timer);
      if (!paused) timer = setTimeout(() => goTo((current + 1) % slides.length), 2000);
    }

    function goTo(index) {
      if (busy) return;
      const next = ((index % slides.length) + slides.length) % slides.length;
      if (next === current) { scheduleNext(); return; }

      busy = true;
      const dir = next > current || (current === slides.length - 1 && next === 0) ? 'fwd' : 'bwd';

      /* scan flash on the container */
      carousel.classList.add('nft-scanning');
      setTimeout(() => carousel.classList.remove('nft-scanning'), 480);

      /* exit current slide */
      const exitClass = dir === 'fwd' ? 'nft-exit-left' : 'nft-exit-right';
      slides[current].classList.add(exitClass);
      dots[current]?.classList.remove('web3-nft-dot-active');

      setTimeout(() => {
        slides[current].classList.remove('web3-nft-slide-active', exitClass);

        current = next;

        /* position incoming slide off-screen */
        const enterFrom = dir === 'fwd' ? 'nft-enter-right' : 'nft-enter-left';
        slides[current].classList.add('web3-nft-slide-active', enterFrom);
        dots[current]?.classList.add('web3-nft-dot-active');

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            slides[current].classList.remove(enterFrom);
            slides[current].classList.add('nft-entering');

            setTimeout(() => {
              slides[current].classList.remove('nft-entering');
              busy = false;
              scheduleNext();
            }, 400);
          });
        });
      }, 260);
    }

    /* pause on hover */
    carousel.addEventListener('mouseenter', () => { paused = true;  clearTimeout(timer); });
    carousel.addEventListener('mouseleave', () => { paused = false; scheduleNext(); });

    /* dot clicks */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        paused = false;
        clearTimeout(timer);
        goTo(i);
      });
    });

    scheduleNext();
  }

  /* ── Init ───────────────────────────────────────── */
  function init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { if (!reduced) new Web3Canvas(); } catch(e) { /* canvas unavailable */ }
    loadInstagramFeed();
    initNFTCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
