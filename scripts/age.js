/* age.js — Auto-calculates Joshua's age from birthday, updates every page load */

(function () {
  'use strict';

  const BIRTHDAY = '1998-03-11';

  function getAge(birthday) {
    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function renderAge() {
    const el = document.getElementById('hero-age');
    if (el) el.textContent = 'Age ' + getAge(BIRTHDAY);
  }

  document.addEventListener('DOMContentLoaded', renderAge);
})();
