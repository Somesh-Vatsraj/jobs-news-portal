// Share buttons and copy-link
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      e.preventDefault();
      var url = copyBtn.getAttribute('data-copy');
      copyUrl(url);
      return;
    }
    var nativeBtn = e.target.closest('[data-native-share]');
    if (nativeBtn) {
      e.preventDefault();
      var nurl = nativeBtn.getAttribute('data-share-url');
      var ntitle = nativeBtn.getAttribute('data-share-title') || document.title;
      if (navigator.share) {
        navigator.share({ title: ntitle, url: nurl }).catch(function () {});
      } else {
        copyUrl(nurl);
      }
    }
  });

  function copyUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        window.showToast && window.showToast('Link copied!');
      }).catch(function () { fallbackCopy(url); });
    } else {
      fallbackCopy(url);
    }
  }
  function fallbackCopy(url) {
    var ta = document.createElement('textarea');
    ta.value = url; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); window.showToast && window.showToast('Link copied!'); }
    catch (e) { window.showToast && window.showToast('Could not copy'); }
    document.body.removeChild(ta);
  }
})();
