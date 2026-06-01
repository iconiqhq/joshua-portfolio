/* data-loader.js — Fetches JSON data files and provides to section renderers */

(function () {
  'use strict';

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load: ' + path);
    return res.json();
  }

  /* Expose loader globally for section scripts */
  window.PortfolioData = {
    loadProjects:    () => loadJSON('data/projects.json'),
    loadMentorship:  () => loadJSON('data/mentorship.json'),
    loadDesign:      () => loadJSON('data/design.json'),
    loadVideos:      () => loadJSON('data/videos.json'),
    loadTools:       () => loadJSON('data/tools.json'),
  };
})();
