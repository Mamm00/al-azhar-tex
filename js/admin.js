/* =========================================================
   Al Azhar Tex — Admin Control Center
   Sections: dashboard, fabrics CRUD, content editor,
   contact editor, leads manager, settings.
   ========================================================= */
(function () {
  'use strict';

  var AATX = window.AATX;
  if (!AATX) {
    document.body.textContent = 'Data layer failed to load (js/data.js missing).';
    return;
  }

  var AUTH_KEY = 'aatz_admin_ok';

  function $(id) { return document.getElementById(id); }
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    var date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    var time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return date + ' ' + time;
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2400);
  }

  /* =========================================================
     Auth gate (session-scoped)
     Note: client-side gate for a static site — real access
     control requires a backend.
     ========================================================= */
  var authScreen = $('auth-screen');
  var appShell = $('app-shell');
  var pinInput = $('pin');
  var authError = $('auth-error');

  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch (e) { return false; }
  }

  function enterApp() {
    authScreen.hidden = true;
    appShell.hidden = false;
    siteData = AATX.loadData();
    fillContent();
    fillContact();
    renderFabList();
    refreshDashboard();
    refreshLastUpdated();
  }
  // NOTE: enterApp() is invoked once, at the end of this file,
  // after all handlers and helpers are defined.

  var authForm = $('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = (pinInput.value || '').trim();
      if (val === AATX.getPin()) {
        try { sessionStorage.setItem(AUTH_KEY, '1'); } catch (err) { /* ignore */ }
        enterApp();
      } else {
        authError.textContent = 'Incorrect PIN — please try again.';
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  var signOut = $('sign-out');
  if (signOut) {
    signOut.addEventListener('click', function () {
      try { sessionStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ }
      window.location.reload();
    });
  }

  /* =========================================================
     Tabs
     ========================================================= */
  var TABS = {
    dashboard: 'Dashboard',
    fabrics: 'Fabrics',
    content: 'Site content',
    contact: 'Contact & hours',
    leads: 'Leads',
    settings: 'Settings'
  };

  function switchTab(name) {
    qa('.navitem').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === name);
    });
    Object.keys(TABS).forEach(function (k) {
      var panel = $('tab-' + k);
      if (panel) panel.hidden = (k !== name);
    });
    var title = $('tab-title');
    if (title) title.textContent = TABS[name] || '';
    if (name === 'dashboard') refreshDashboard();
    if (name === 'fabrics') renderFabList();
    if (name === 'leads') renderLeads();
    window.scrollTo({ top: 0 });
  }

  qa('.navitem').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  qa('[data-goto]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-goto'));
    });
  });

  /* =========================================================
     Shared state
     ========================================================= */
  var siteData = AATX.loadData();

  function refreshLastUpdated() {
    var el = $('last-updated');
    if (!el) return;
    el.textContent = siteData.updated
      ? 'Content last updated ' + formatDate(siteData.updated)
      : 'Using default content (no changes saved yet)';
  }

  function refreshDashboard() {
    var leads = AATX.loadLeads();
    setText('stat-leads', String(leads.length));
    setText('stat-unread', String(leads.filter(function (l) { return !l.read; }).length));
    setText('stat-fabrics', String((siteData.fabrics || []).length));
    setText('stat-updated', formatDate(siteData.updated));

    var unread = leads.filter(function (l) { return !l.read; }).length;
    var badge = $('leads-badge');
    if (badge) {
      badge.hidden = unread === 0;
      badge.textContent = String(unread);
    }
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  /* =========================================================
     Fabrics CRUD
     ========================================================= */
  var SWATCHES = [
    ['silk', 'Rose satin'],
    ['warsaw', 'Sky georgette'],
    ['pirlanta', 'Champagne satin'],
    ['rotana150', 'Sage satin'],
    ['rotana180', 'Steel satin'],
    ['lexus150', 'Lilac satin'],
    ['lexus180', 'Navy satin']
  ];

  var editingIdx = null; // index being edited, or -1 for "add new"

  function fabricCardHtml(f, i) {
    var chipClass = f.chipStyle === 'red' ? 'chip--red' : 'chip--blue';
    return '<div class="fab-item">' +
      '<div class="fab-item__swatch swatch--' + esc(f.swatch || '') + '"></div>' +
      '<div class="fab-item__info">' +
        '<div class="fab-item__top">' +
          '<strong>' + esc(f.name) + '</strong>' +
          (f.chip ? '<span class="chip ' + chipClass + '">' + esc(f.chip) + '</span>' : '') +
        '</div>' +
        (f.type ? '<p class="fab-item__type">' + esc(f.type) + '</p>' : '') +
        (f.desc ? '<p class="fab-item__desc">' + esc(f.desc) + '</p>' : '') +
      '</div>' +
      '<div class="fab-item__actions">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-action="edit" data-idx="' + i + '">Edit</button>' +
        '<button class="btn btn--danger-ghost btn--sm" type="button" data-action="delete" data-idx="' + i + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function fabricEditorHtml(f, i) {
    f = f || {};
    var swatchOpts = SWATCHES.map(function (s) {
      return '<option value="' + s[0] + '"' + (f.swatch === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
    }).join('');
    return '<div class="fab-editor" data-idx="' + i + '">' +
      '<div class="fab-editor__head"><strong>' + (i === -1 ? 'New fabric' : 'Editing: ' + esc(f.name || '')) + '</strong>' +
      '<button class="btn btn--ghost btn--sm" type="button" data-action="cancel">Cancel</button></div>' +
      '<div class="form-grid">' +
        '<label class="field" for="fe-name-' + i + '">Fabric name *<input id="fe-name-' + i + '" name="f-name" type="text" value="' + esc(f.name || '') + '" /></label>' +
        '<label class="field" for="fe-chip-' + i + '">Weight / tag text<input id="fe-chip-' + i + '" name="f-chip" type="text" value="' + esc(f.chip || '') + '" placeholder="e.g. 180 g/m²" /></label>' +
        '<label class="field" for="fe-chipstyle-' + i + '">Tag style<select id="fe-chipstyle-' + i + '" name="f-chipstyle">' +
          '<option value="blue"' + ((f.chipStyle || 'blue') !== 'red' ? ' selected' : '') + '>Blue</option>' +
          '<option value="red"' + (f.chipStyle === 'red' ? ' selected' : '') + '>Red</option>' +
        '</select></label>' +
        '<label class="field" for="fe-swatch-' + i + '">Swatch colour<select id="fe-swatch-' + i + '" name="f-swatch">' + swatchOpts + '</select></label>' +
        '<label class="field field--wide" for="fe-type-' + i + '">Fabric type<input id="fe-type-' + i + '" name="f-type" type="text" value="' + esc(f.type || '') + '" placeholder="e.g. Signature satin silk" /></label>' +
        '<label class="field field--wide" for="fe-desc-' + i + '">Description<textarea id="fe-desc-' + i + '" name="f-desc" rows="3">' + esc(f.desc || '') + '</textarea></label>' +
        '<label class="field field--wide" for="fe-best-' + i + '">Best for<input id="fe-best-' + i + '" name="f-bestfor" type="text" value="' + esc(f.bestFor || '') + '" placeholder="e.g. eveningwear · abayas" /></label>' +
      '</div>' +
      '<div class="fab-editor__actions">' +
        '<button class="btn btn--primary" type="button" data-action="save" data-idx="' + i + '">Save fabric</button>' +
      '</div>' +
    '</div>';
  }

  function renderFabList() {
    var list = $('fab-list');
    if (!list) return;
    siteData = AATX.loadData();
    var html = '';
    (siteData.fabrics || []).forEach(function (f, i) {
      html += (editingIdx === i) ? fabricEditorHtml(f, i) : fabricCardHtml(f, i);
    });
    if (editingIdx === (siteData.fabrics || []).length) {
      html += fabricEditorHtml({}, -1);
    }
    list.innerHTML = html;
    bindFabListEvents(list);
  }

  function bindFabListEvents(list) {
    list.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        var action = btn.getAttribute('data-action');

        if (action === 'edit') {
          editingIdx = idx;
          renderFabList();
        } else if (action === 'cancel') {
          editingIdx = null;
          renderFabList();
        } else if (action === 'delete') {
          var fab = (siteData.fabrics || [])[idx];
          if (fab && window.confirm('Delete "' + fab.name + '" from the catalogue?')) {
            siteData.fabrics.splice(idx, 1);
            AATX.saveData(siteData);
            editingIdx = null;
            renderFabList();
            refreshDashboard();
            refreshLastUpdated();
            toast('Fabric deleted');
          }
        } else if (action === 'save') {
          var card = btn.closest('.fab-editor');
          if (!card) return;
          var name = card.querySelector('[name="f-name"]').value.trim();
          if (!name) {
            toast('Fabric name is required');
            card.querySelector('[name="f-name"]').focus();
            return;
          }
          var rec = {
            name: name,
            chip: card.querySelector('[name="f-chip"]').value.trim(),
            chipStyle: card.querySelector('[name="f-chipstyle"]').value,
            swatch: card.querySelector('[name="f-swatch"]').value,
            type: card.querySelector('[name="f-type"]').value.trim(),
            desc: card.querySelector('[name="f-desc"]').value.trim(),
            bestFor: card.querySelector('[name="f-bestfor"]').value.trim()
          };
          if (idx === -1) {
            siteData.fabrics.push(rec);
          } else {
            siteData.fabrics[idx] = rec;
          }
          AATX.saveData(siteData);
          editingIdx = null;
          renderFabList();
          refreshDashboard();
          refreshLastUpdated();
          toast('Fabric saved — live on the main site');
        }
      });
    });
  }

  var fabAdd = $('fab-add');
  if (fabAdd) {
    fabAdd.addEventListener('click', function () {
      siteData = AATX.loadData();
      editingIdx = (siteData.fabrics || []).length;
      renderFabList();
      var editor = q('.fab-editor');
      if (editor) {
        if (typeof editor.scrollIntoView === 'function') {
          editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        var nameInput = editor.querySelector('[name="f-name"]');
        if (nameInput) nameInput.focus();
      }
    });
  }

  /* =========================================================
     Content editor (hero + catalogue note)
     ========================================================= */
  function fillContent() {
    setText2('c-eyebrow', siteData.hero.eyebrow);
    setText2('c-title', siteData.hero.title);
    setText2('c-lead', siteData.hero.lead);
    setText2('c-badge-num', siteData.hero.badgeNum);
    setText2('c-badge-label', siteData.hero.badgeLabel);
    setText2('c-notice', siteData.notice);
  }

  function setText2(id, value) {
    var el = $(id);
    if (el && value !== undefined && value !== null) el.value = value;
  }

  var contentSave = $('content-save');
  if (contentSave) {
    contentSave.addEventListener('click', function () {
      siteData = AATX.loadData();
      var title = $('c-title').value.trim();
      if (!title) { toast('Headline cannot be empty'); return; }
      siteData.hero = {
        eyebrow: $('c-eyebrow').value.trim(),
        title: title,
        lead: $('c-lead').value.trim(),
        badgeNum: $('c-badge-num').value.trim(),
        badgeLabel: $('c-badge-label').value
      };
      siteData.notice = $('c-notice').value;
      AATX.saveData(siteData);
      refreshDashboard();
      refreshLastUpdated();
      toast('Content saved — live on the main site');
    });
  }

  /* =========================================================
     Contact editor
     ========================================================= */
  function fillContact() {
    setText2('k-phone', siteData.contact.phoneDisplay);
    setText2('k-phonehref', siteData.contact.phoneHref);
    setText2('k-email', siteData.contact.email);
    setText2('k-address', siteData.contact.address);
    setText2('k-hours', siteData.contact.hours);
  }

  var contactSave = $('contact-save');
  if (contactSave) {
    contactSave.addEventListener('click', function () {
      siteData = AATX.loadData();
      var email = $('k-email').value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast('That email address doesn’t look valid');
        $('k-email').focus();
        return;
      }
      siteData.contact = {
        phoneDisplay: $('k-phone').value.trim(),
        phoneHref: $('k-phonehref').value.trim(),
        email: email,
        address: $('k-address').value.trim(),
        hours: $('k-hours').value.trim()
      };
      AATX.saveData(siteData);
      refreshDashboard();
      refreshLastUpdated();
      toast('Contact details saved — live on the main site');
    });
  }

  /* =========================================================
     Leads manager
     ========================================================= */
  function renderLeads() {
    var leads = AATX.loadLeads();
    var summary = $('leads-summary');
    if (summary) summary.textContent = leads.length + (leads.length === 1 ? ' lead' : ' leads');

    var empty = $('leads-empty');
    var wrap = q('.table-wrap');
    if (empty) empty.style.display = leads.length ? 'none' : 'block';
    if (wrap) wrap.style.display = leads.length ? 'block' : 'none';

    var tbody = $('leads-body');
    if (!tbody) return;

    tbody.innerHTML = leads.map(function (l) {
      var msg = l.message || '';
      var short = msg.length > 80 ? esc(msg.slice(0, 80)) + '…' : esc(msg);
      return '<tr class="' + (l.read ? '' : 'is-unread') + '" data-id="' + esc(l.id) + '">' +
        '<td style="white-space:nowrap">' + esc(formatDate(l.date)) + '</td>' +
        '<td><strong>' + esc(l.name) + '</strong></td>' +
        '<td>' + esc(l.company || '—') + '</td>' +
        '<td>' + esc(l.phone || '—') + '</td>' +
        '<td>' + esc(l.fabrics || '—') + '</td>' +
        '<td>' + (msg ? '<details><summary>' + short + '</summary><p>' + esc(msg) + '</p></details>' : '—') + '</td>' +
        '<td>' + (l.read ? '<span style="color:var(--admin-muted)">Read</span>' : '<span class="dot-unread">New</span>') + '</td>' +
        '<td class="row-actions">' +
          '<button class="icon-btn" type="button" data-action="toggle" title="Mark as read / unread">✓</button>' +
          '<button class="icon-btn icon-btn--danger" type="button" data-action="del" title="Delete lead">✕</button>' +
        '</td>' +
      '</tr>';
    }).join('');

    tbody.querySelectorAll('button[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('tr').getAttribute('data-id');
        var action = btn.getAttribute('data-action');
        var all = AATX.loadLeads();

        if (action === 'toggle') {
          all.forEach(function (l) { if (l.id === id) l.read = !l.read; });
          AATX.saveLeads(all);
        } else if (action === 'del') {
          if (window.confirm('Delete this lead? This cannot be undone.')) {
            AATX.saveLeads(all.filter(function (l) { return l.id !== id; }));
          }
        }
        renderLeads();
        refreshDashboard();
      });
    });

    // keep the sidebar unread badge in sync whenever leads are listed
    refreshDashboard();
  }

  function csvEscape(v) {
    v = (v === null || v === undefined) ? '' : String(v);
    if (/[",\n\r]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function exportLeadsCsv() {
    var leads = AATX.loadLeads();
    if (!leads.length) { toast('No leads to export'); return; }
    var headers = ['id', 'date', 'name', 'company', 'phone', 'fabrics', 'message', 'read'];
    var rows = [headers.join(',')].concat(leads.map(function (l) {
      return headers.map(function (h) { return csvEscape(l[h]); }).join(',');
    }));
    downloadFile('al-azhar-tex-leads.csv', rows.join('\n'), 'text/csv;charset=utf-8');
    toast('Leads exported as CSV');
  }

  function exportSiteJson() {
    var data = AATX.loadData();
    downloadFile('al-azhar-tex-content.json', JSON.stringify(data, null, 2), 'application/json');
    toast('Content exported as JSON');
  }

  var leadsExport = $('leads-export');
  if (leadsExport) leadsExport.addEventListener('click', exportLeadsCsv);

  var leadsClear = $('leads-clear');
  var leadsWipe = $('leads-wipe');
  [leadsClear, leadsWipe].forEach(function (btn) {
    if (btn) {
      btn.addEventListener('click', function () {
        if (window.confirm('Delete ALL leads? This cannot be undone.')) {
          AATX.saveLeads([]);
          renderLeads();
          refreshDashboard();
          toast('All leads cleared');
        }
      });
    }
  });

  /* =========================================================
     Settings
     ========================================================= */
  var pinSave = $('pin-save');
  if (pinSave) {
    pinSave.addEventListener('click', function () {
      var cur = $('s-pin-cur').value;
      var next = $('s-pin-next').value;
      var conf = $('s-pin-conf').value;
      if (cur !== AATX.getPin()) { toast('Current PIN is incorrect'); return; }
      if (!/^\d{4,8}$/.test(next)) { toast('New PIN must be 4–8 digits'); return; }
      if (next !== conf) { toast('New PINs do not match'); return; }
      AATX.setPin(next);
      $('s-pin-cur').value = '';
      $('s-pin-next').value = '';
      $('s-pin-conf').value = '';
      toast('PIN updated');
    });
  }

  var dataExport = $('data-export');
  if (dataExport) dataExport.addEventListener('click', exportSiteJson);

  var resetData = $('reset-data');
  if (resetData) {
    resetData.addEventListener('click', function () {
      if (window.confirm('Reset hero, fabrics, contact and note to the original defaults? This cannot be undone.')) {
        AATX.resetData();
        siteData = AATX.loadData();
        fillContent();
        fillContact();
        renderFabList();
        refreshDashboard();
        refreshLastUpdated();
        toast('Site content reset to defaults');
      }
    });
  }

  /* ---------- Auto-enter if a session is already active ---------- */
  if (isAuthed()) enterApp();
})();
