/* graphic-design.js — Section 04: Behold Instagram feed (@iconiqcreatives) */

(function () {
  'use strict';

  function buildTile(post) {
    const imgUrl = post.mediaType === 'VIDEO' ? post.thumbnailUrl : post.mediaUrl;
    const caption = (post.caption || '').slice(0, 120);
    const permalink = post.permalink || 'https://www.instagram.com/iconiqcreatives';

    const imgHTML = imgUrl
      ? `<img class="gd-card-img" src="${imgUrl}" alt="${caption || 'Instagram post'}" loading="lazy">`
      : `<div class="gd-card-placeholder" aria-hidden="true"><span class="gd-placeholder-mark">IC</span></div>`;

    return `
      <a class="gd-card"
         href="${permalink}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="${caption || 'View on Instagram'} (opens in new tab)"
         data-reveal>
        ${imgHTML}
        <div class="gd-overlay">
          <p class="gd-overlay-category">@iconiqcreatives</p>
          ${caption ? `<p class="gd-overlay-desc">${caption}</p>` : ''}
          <div class="gd-overlay-row">
            <span class="gd-overlay-link">View Post ↗</span>
          </div>
        </div>
      </a>`;
  }

  async function init() {
    const grid = document.getElementById('gd-grid');
    if (!grid) return;

    try {
      const res = await fetch('https://feeds.behold.so/CdONk1YbmZP8sFaLdbvq');
      if (!res.ok) return;
      const data = await res.json();
      const posts = Array.isArray(data) ? data : (data.posts || []);

      if (!posts.length) return;

      grid.innerHTML = posts.slice(0, 6).map(buildTile).join('');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

      grid.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    } catch (_) {
      /* silently show empty grid */
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
