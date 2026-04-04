
(function () {
  'use strict';
  function updateProgress() {
    var el = document.getElementById('progress-bar');
    if (!el) return;
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var dh = document.documentElement.scrollHeight - window.innerHeight;
    el.style.width = (dh > 0 ? Math.min(100, st / dh * 100) : 0) + '%';
  }
  function updateBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.classList.toggle('visible', (window.pageYOffset || document.documentElement.scrollTop) > 300);
  }
  function updateTocActive() {
    var hs = Array.from(document.querySelectorAll('#main h2[id]'));
    var ls = Array.from(document.querySelectorAll('#toc-right .toc-list a'));
    if (!hs.length || !ls.length) return;
    var active = -1;
    hs.forEach(function (h, i) { if (h.getBoundingClientRect().top <= 120) active = i; });
    ls.forEach(function (a, i) { a.classList.toggle('active', i === active); });
  }
  window.addEventListener('scroll', function () {
    updateProgress(); updateBackToTop(); updateTocActive();
  }, { passive: true });
  var btn = document.getElementById('back-to-top');
  if (btn) btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof hljs !== 'undefined') hljs.highlightAll();
    updateProgress(); updateTocActive();
  });
})();
