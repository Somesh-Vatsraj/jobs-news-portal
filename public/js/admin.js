// Admin panel client-side logic.
(function () {
  'use strict';

  function csrf() {
    var el = document.querySelector('[data-csrf]');
    return el ? el.getAttribute('data-csrf') : '';
  }

  function api(method, url, body) {
    return fetch(url, {
      method: method,
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrf(),
        'accept': 'application/json'
      },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        return { ok: r.ok, status: r.status, data: d };
      });
    });
  }

  function formToObject(form) {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (v, k) { data[k] = v; });
    form.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      data[cb.name] = cb.checked;
    });
    return data;
  }

  function setStatus(form, msg, ok) {
    var el = form.querySelector('[data-status]');
    if (!el) return;
    el.textContent = msg;
    el.className = 'form-status ' + (ok ? 'success' : 'error');
  }

  // ---------- Admin login / setup ----------
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-admin-login]');
    if (!form) return;
    e.preventDefault();

    var mode = form.getAttribute('data-admin-login');
    var fd = new FormData(form);
    var status = form.querySelector('[data-status]');
    var btn = form.querySelector('button[type=submit]');

    var payload = {
      email: String(fd.get('email') || '').trim(),
      password: String(fd.get('password') || '')
    };
    if (mode === 'setup') payload.name = String(fd.get('name') || '').trim();

    var url = mode === 'setup' ? '/admin/setup' : '/api/auth/login';

    if (status) { status.textContent = 'Please wait…'; status.className = 'auth-status'; }
    if (btn) btn.disabled = true;

    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        return { ok: r.ok, status: r.status, data: d };
      });
    }).then(function (res) {
      if (res.ok && res.data.ok) {
        if (status) { status.textContent = 'Success! Redirecting…'; status.className = 'auth-status success'; }
        window.location = mode === 'setup' ? '/admin/login' : '/admin';
      } else {
        var msg = res.data.error || ('Login failed (HTTP ' + res.status + ')');
        if (status) { status.textContent = msg; status.className = 'auth-status error'; }
        if (btn) btn.disabled = false;
      }
    }).catch(function (err) {
      if (status) { status.textContent = 'Network error: ' + (err.message || 'unknown'); status.className = 'auth-status error'; }
      if (btn) btn.disabled = false;
    });
  });

  // ---------- Generic admin form submit (job / news / settings) ----------
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.hasAttribute('data-admin-login')) return; // handled above
    if (!form.matches('.admin-form') && !form.matches('[data-submit-form]')) return;
    e.preventDefault();

    if (form.matches('[data-submit-form]')) {
      var fd = new FormData(form);
      fetch('/api/submissions', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) {
          if (r.redirected) { window.location = r.url; return; }
          return r.json().then(function (d) {
            if (r.ok) window.location = '/submit?ok=1';
            else setStatus(form, d.error || 'Submission failed', false);
          });
        }).catch(function () { setStatus(form, 'Network error', false); });
      return;
    }

    var type = form.getAttribute('data-form');
    var id = form.getAttribute('data-id');
    if (type === 'job') {
      var data = formToObject(form);
      var isUpdate = id && id !== '';
      var url = isUpdate ? '/api/admin/jobs/' + id : '/api/admin/jobs';
      var method = isUpdate ? 'PUT' : 'POST';
      setStatus(form, 'Saving…', true);
      api(method, url, data).then(function (res) {
        if (res.ok) {
          setStatus(form, 'Saved!', true);
          window.showToast && window.showToast('Saved successfully');
          if (!isUpdate && res.data.id) setTimeout(function () { window.location = '/admin/jobs/' + res.data.id; }, 500);
        } else {
          setStatus(form, res.data.error || 'Save failed', false);
        }
      }).catch(function () { setStatus(form, 'Network error', false); });
    } else if (type === 'news') {
      var ndata = formToObject(form);
      var isUpd = id && id !== '';
      var nurl = isUpd ? '/api/admin/news/' + id : '/api/admin/news';
      var nmethod = isUpd ? 'PUT' : 'POST';
      setStatus(form, 'Saving…', true);
      api(nmethod, nurl, ndata).then(function (res) {
        if (res.ok) {
          setStatus(form, 'Saved!', true);
          window.showToast && window.showToast('Saved successfully');
          if (!isUpd && res.data.id) setTimeout(function () { window.location = '/admin/news/' + res.data.id; }, 500);
        } else {
          setStatus(form, res.data.error || 'Save failed', false);
        }
      }).catch(function () { setStatus(form, 'Network error', false); });
    } else if (type === 'settings') {
      var sdata = formToObject(form);
      setStatus(form, 'Saving…', true);
      api('POST', '/api/admin/settings', sdata).then(function (res) {
        if (res.ok) { setStatus(form, 'Saved!', true); window.showToast && window.showToast('Settings saved'); }
        else setStatus(form, res.data.error || 'Save failed', false);
      }).catch(function () { setStatus(form, 'Network error', false); });
    }
  });

  // ---------- Deletes, submissions, categories, logout ----------
  document.addEventListener('click', function (e) {
    var del = e.target.closest('[data-delete]');
    if (del) {
      e.preventDefault();
      var kind = del.getAttribute('data-delete');
      var id = del.getAttribute('data-id');
      if (!confirm('Delete this ' + kind + '?')) return;
      api('DELETE', '/api/admin/' + kind + 's/' + id).then(function (res) {
        if (res.ok) { var row = del.closest('tr'); if (row) row.remove(); window.showToast && window.showToast('Deleted'); }
        else window.showToast && window.showToast(res.data.error || 'Delete failed');
      });
    }

    var sub = e.target.closest('[data-sub-action]');
    if (sub) {
      e.preventDefault();
      var action = sub.getAttribute('data-sub-action');
      var sid = sub.getAttribute('data-id');
      api('POST', '/api/admin/submissions/' + sid + '/' + action).then(function (res) {
        if (res.ok) { var r = sub.closest('tr'); if (r) r.remove(); window.showToast && window.showToast('Done'); }
        else window.showToast && window.showToast(res.data.error || 'Failed');
      });
    }

    var cd = e.target.closest('[data-cat-delete]');
    if (cd) {
      e.preventDefault();
      var cid = cd.getAttribute('data-cat-delete');
      if (!confirm('Delete this category?')) return;
      api('DELETE', '/api/admin/categories/' + cid).then(function (res) {
        if (res.ok) { var li = cd.closest('li'); if (li) li.remove(); window.showToast && window.showToast('Deleted'); }
      });
    }

    if (e.target.id === 'adminLogout' || e.target.closest('#adminLogout')) {
      e.preventDefault();
      fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'accept': 'application/json' } })
        .finally(function () { window.location = '/admin/login'; });
    }
  });

  // ---------- Category add ----------
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-cat-add]');
    if (!form) return;
    e.preventDefault();
    var type = form.getAttribute('data-type');
    var name = form.querySelector('input[name=name]').value.trim();
    if (!name) return;
    api('POST', '/api/admin/categories', { name: name, type: type }).then(function (res) {
      if (res.ok) window.location.reload();
      else window.showToast && window.showToast(res.data.error || 'Failed');
    });
  });

  // ---------- Rich text toolbar ----------
  document.querySelectorAll('textarea[data-editor="rich"]').forEach(function (ta) {
    var wrap = document.createElement('div');
    wrap.className = 'rich-editor-wrap';
    var tb = document.createElement('div');
    tb.className = 'rich-toolbar';
    var btns = [
      ['H2', '<h2>Heading</h2>\n'],
      ['Bold', '<strong>bold</strong>'],
      ['Italic', '<em>italic</em>'],
      ['Link', '<a href="https://">link</a>'],
      ['UL', '<ul>\n  <li>Item</li>\n</ul>\n'],
      ['OL', '<ol>\n  <li>Item</li>\n</ol>\n'],
      ['Quote', '<blockquote>Quote</blockquote>\n'],
      ['Image', '<img src="https://" alt="">\n'],
      ['HR', '<hr>\n']
    ];
    btns.forEach(function (b) {
      var button = document.createElement('button');
      button.type = 'button'; button.textContent = b[0];
      button.addEventListener('click', function () { insertAtCursor(ta, b[1]); });
      tb.appendChild(button);
    });
    ta.parentNode.insertBefore(wrap, ta);
    wrap.appendChild(tb);
    wrap.appendChild(ta);
  });

  function insertAtCursor(ta, text) {
    var start = ta.selectionStart, end = ta.selectionEnd;
    var v = ta.value;
    ta.value = v.slice(0, start) + text + v.slice(end);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + text.length;
  }
})();
