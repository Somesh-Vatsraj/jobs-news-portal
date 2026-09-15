// Global site behaviors: mobile menu, back-to-top, toast helper.
(function () {
  'use strict';

  // Mobile menu
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Back to top
  var btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Toast helper (global)
  window.showToast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._hideId);
    t._hideId = setTimeout(function () { t.classList.remove('show'); }, 2200);
  };

  // Filters panel toggle on mobile
  var ft = document.getElementById('filtersToggle');
  var fp = document.getElementById('filtersPanel');
  if (ft && fp) {
    ft.addEventListener('click', function () { fp.classList.toggle('open'); });
  }

  // AdSense unit initialization (only renders real units when publisher has
  // installed ad slot IDs). If placeholder, nothing runs.
  if (window.adsbygoogle) {
    try {
      document.querySelectorAll('ins.adsbygoogle').forEach(function () {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) { /* ignore */ }
  }
})();
