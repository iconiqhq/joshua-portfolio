/* tools.js — Section 07: single scrolling tool marquee */

(function () {
  'use strict';

  /* ── Tool icon definitions ──────────────────────────── */
  const ICONS = {
    'Adobe Photoshop': {
      accent: '#31A8FF',
      desc: 'Industry-standard photo editing & compositing. Retouching, color correction, and creative manipulation.',
      img: 'assets/images/tools/photoshop.png'
    },
    'Adobe Lightroom': {
      accent: '#74B8F3',
      desc: 'Photo organization & color grading. Batch editing, presets, and tone adjustments for professional shoots.',
      svg: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="9" fill="#001E36"/><text x="24" y="31" text-anchor="middle" font-family="'Arial Black',Arial,sans-serif" font-weight="900" font-size="18" fill="#74B8F3">Lr</text></svg>`
    },
    'Canva': {
      accent: '#7D2AE8',
      desc: 'Drag-and-drop graphic design. Social posts, presentations, and branded visuals built fast.',
      img: 'assets/images/tools/canva.png'
    },
    'Adobe Premiere Pro': {
      accent: '#9999FF',
      desc: 'Professional video editing with multi-track timelines, color grading, and precise cuts for any format.',
      img: 'assets/images/tools/premiere-pro.png'
    },
    'Adobe After Effects': {
      accent: '#9999FF',
      desc: 'Motion graphics & visual effects. Animations, kinetic titles, and VFX compositing for video.',
      img: 'assets/images/tools/after-effects.png'
    },
    'CapCut': {
      accent: '#ffffff',
      desc: 'Fast editing for Reels & Shorts. Trending effects, auto-captions, and quick social-ready content.',
      img: 'assets/images/tools/capcut.png'
    },
    'Filmora': {
      accent: '#01CF97',
      desc: 'User-friendly video editor with rich effects, transitions, and templates for polished social content.',
      img: 'assets/images/tools/filmora.png'
    },
    'DaVinci Resolve': {
      accent: '#E6A22F',
      desc: 'Cinema-grade color grading & editing. Used for high-end video finishing, correction, and visual mastering.',
      img: 'assets/images/tools/davinci-resolve.png'
    },
    'Meta Business Suite': {
      accent: '#0866FF',
      desc: 'Manage Facebook & Instagram in one place. Scheduling, audience insights, and ad campaign control.',
      img: 'assets/images/tools/meta-business-suite.png'
    },
    'YouTube Studio': {
      accent: '#FF0000',
      desc: 'Full YouTube channel control. Analytics, video management, comments, subtitles, and monetization tools.',
      img: 'assets/images/tools/youtube-studio.png'
    },
    'ChatGPT': {
      accent: '#10A37F',
      desc: 'AI writing & ideation assistant. Scripts, captions, content strategies, and creative brainstorming.',
      img: 'assets/images/tools/chatgpt.png'
    },
    'Gemini': {
      accent: '#4285F4',
      desc: "Google's multimodal AI. Research, summarization, and creative content generation across formats.",
      img: 'assets/images/tools/gemini.png'
    },
    'Claude': {
      accent: '#CC785C',
      desc: "Anthropic's AI for deep creative work. Long-form writing, strategic analysis, and complex workflows.",
      img: 'assets/images/tools/claude.png'
    },
    'Grok': {
      accent: '#ffffff',
      desc: "xAI's AI built into X (Twitter). Real-time web access, sharp reasoning, and unfiltered creative thinking.",
      img: 'assets/images/tools/grok.png'
    },
    'Higgsfield': {
      accent: '#8B5CF6',
      desc: 'AI-powered video generation. Cinematic motion effects and AI-driven video content from text prompts.',
      img: 'assets/images/tools/higgsfield.png'
    },
    'ElevenLabs': {
      accent: '#ffffff',
      desc: 'Realistic AI voice synthesis. Professional-grade voiceovers and audio content creation in any language.',
      img: 'assets/images/tools/eleven-labs.png'
    },
  };

  const DEFAULT_ICON = {
    accent: '#41BDFE',
    svg: `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="9" fill="#111"/><text x="24" y="30" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="14" fill="#41BDFE">?</text></svg>`
  };

  function getIcon(name) { return ICONS[name] || DEFAULT_ICON; }

  /* ── Build marquee ──────────────────────────────────── */
  function buildItem(tool) {
    const ic = getIcon(tool.name);
    const desc = (ic.desc || '').replace(/"/g, '&quot;');
    const iconHTML = ic.img
      ? `<img src="${ic.img}" alt="${tool.name}" loading="lazy" class="tool-item-img">`
      : ic.svg;
    return `<div class="tool-item" style="--tool-accent:${ic.accent}" data-tip-name="${tool.name}" data-tip-desc="${desc}">
      <div class="tool-item-icon">${iconHTML}</div>
      <span class="tool-item-name">${tool.name}</span>
    </div>`;
  }

  function buildMarquee(categories) {
    const allTools = categories.flatMap(cat => cat.tools || []);
    const items = allTools.map(buildItem).join('');
    return `<div class="tools-marquee">
      <div class="tools-track" id="tools-track">
        ${items}
        ${items}
      </div>
    </div>`;
  }

  /* ── Tooltip ────────────────────────────────────────── */
  let tip = null;

  function ensureTip() {
    if (tip) return;
    tip = document.createElement('div');
    tip.className = 'tool-hover-tip';
    tip.innerHTML = '<div class="tool-hover-tip-name"></div><div class="tool-hover-tip-desc"></div>';
    document.body.appendChild(tip);
  }

  function showTip(el) {
    ensureTip();
    tip.querySelector('.tool-hover-tip-name').textContent = el.dataset.tipName || '';
    tip.querySelector('.tool-hover-tip-desc').textContent = el.dataset.tipDesc || '';

    const accent = getComputedStyle(el).getPropertyValue('--tool-accent').trim();
    tip.style.setProperty('--tip-accent', accent);

    tip.classList.remove('visible');
    tip.style.left = '-9999px';
    tip.style.top  = '-9999px';

    requestAnimationFrame(() => {
      const rect  = el.getBoundingClientRect();
      const tipW  = tip.offsetWidth;
      const tipH  = tip.offsetHeight;
      let   left  = rect.left + rect.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
      const top   = rect.top - tipH - 12;
      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';
      tip.classList.add('visible');
    });
  }

  function hideTip() {
    if (tip) tip.classList.remove('visible');
  }

  function attachTips(container) {
    container.querySelectorAll('.tool-item').forEach(function (el) {
      el.addEventListener('mouseenter', function () { showTip(el); });
      el.addEventListener('mouseleave', hideTip);
    });
  }

  /* ── Scroll animation ───────────────────────────────── */
  function initMarquee(track) {
    let x = 0;
    let paused = false;
    const speed = 0.65;

    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });

    function tick() {
      if (!paused) {
        x -= speed;
        const half = track.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        track.style.transform = `translateX(${x}px)`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Main ───────────────────────────────────────────── */
  async function init() {
    if (!window.PortfolioData) return;

    let data;
    try { data = await window.PortfolioData.loadTools(); }
    catch (e) { return; }

    const categories = (data && data.categories) || [];
    if (!categories.length) return;

    const container = document.getElementById('tools-categories');
    if (!container) return;

    container.innerHTML = buildMarquee(categories);

    attachTips(container);

    const track = document.getElementById('tools-track');
    if (track) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) initMarquee(track);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
