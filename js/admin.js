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
    fillSeoAnnounce();
    fillContact();
    fillBrand();
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
        AATX.log('session', 'Signed in');
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
      AATX.log('session', 'Signed out');
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
    brand: 'Brand',
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
    if (name === 'brand') fillBrand();
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
    var visibleFabrics = (siteData.fabrics || []).filter(function (f) { return !f.hidden; }).length;
    setText('stat-fabrics', siteData.fabrics.length === visibleFabrics
      ? String(visibleFabrics)
      : visibleFabrics + '/' + siteData.fabrics.length);
    setText('stat-updated', formatDate(siteData.updated));

    var unread = leads.filter(function (l) { return !l.read; }).length;
    var badge = $('leads-badge');
    if (badge) {
      badge.hidden = unread === 0;
      badge.textContent = String(unread);
    }

    // maintenance toggle state
    var maint = $('maint-toggle');
    if (maint) {
      maint.checked = !!(siteData.maintenance && siteData.maintenance.enabled);
      var card = $('maint-card');
      if (card) card.classList.toggle('is-on', maint.checked);
    }

    renderLeadsChart(leads);
    renderActivity();
    renderRecentLeads(leads);
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
    var isHidden = !!f.hidden;
    return '<div class="fab-item' + (isHidden ? ' is-hidden-fab' : '') + '">' +
      '<div class="fab-item__swatch swatch--' + esc(f.swatch || '') + '"></div>' +
      '<div class="fab-item__info">' +
        '<div class="fab-item__top">' +
          '<strong>' + esc(f.name) + '</strong>' +
          (f.chip ? '<span class="chip ' + chipClass + '">' + esc(f.chip) + '</span>' : '') +
          (isHidden ? '<span class="fab-hidden-chip">Hidden from site</span>' : '') +
        '</div>' +
        (f.type ? '<p class="fab-item__type">' + esc(f.type) + '</p>' : '') +
        (f.desc ? '<p class="fab-item__desc">' + esc(f.desc) + '</p>' : '') +
      '</div>' +
      '<div class="fab-item__actions">' +
        '<button class="icon-btn" type="button" data-action="up" data-idx="' + i + '" title="Move up (shows earlier on the site)">↑</button>' +
        '<button class="icon-btn" type="button" data-action="down" data-idx="' + i + '" title="Move down (shows later on the site)">↓</button>' +
        '<button class="btn ' + (isHidden ? 'btn--primary' : 'btn--ghost') + ' btn--sm" type="button" data-action="toggle-hidden" data-idx="' + i + '">' +
          (isHidden ? 'Show on site' : 'Hide') +
        '</button>' +
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

        if (action === 'up' || action === 'down') {
          var arr = siteData.fabrics || [];
          var to = action === 'up' ? idx - 1 : idx + 1;
          if (to < 0 || to >= arr.length) return;
          var moved = arr.splice(idx, 1)[0];
          arr.splice(to, 0, moved);
          AATX.saveData(siteData);
          AATX.log('fabric', 'Moved "' + moved.name + '" ' + (action === 'up' ? 'up' : 'down'));
          renderFabList();
          toast('Order updated');
        } else if (action === 'toggle-hidden') {
          var fab2 = (siteData.fabrics || [])[idx];
          if (fab2) {
            fab2.hidden = !fab2.hidden;
            AATX.saveData(siteData);
            AATX.log('fabric', (fab2.hidden ? 'Hidden' : 'Shown') + ': "' + fab2.name + '"');
            renderFabList();
            refreshDashboard();
            toast(fab2.hidden ? 'Hidden from the site' : 'Visible on the site');
          }
        } else if (action === 'edit') {
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
            AATX.log('fabric', 'Deleted "' + fab.name + '"');
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
          AATX.log('fabric', (idx === -1 ? 'Added' : 'Updated') + ' "' + rec.name + '"');
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
      AATX.log('content', 'Hero & catalogue note saved');
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
      AATX.log('contact', 'Phone, email, address & hours saved');
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
      var waDigits = String(l.phone || '').replace(/[^\d]/g, '');
      return '<tr class="' + (l.read ? '' : 'is-unread') + '" data-id="' + esc(l.id) + '">' +
        '<td style="white-space:nowrap">' + esc(formatDate(l.date)) + '</td>' +
        '<td><strong>' + esc(l.name) + '</strong></td>' +
        '<td>' + esc(l.company || '—') + '</td>' +
        '<td>' + esc(l.phone || '—') + '</td>' +
        '<td>' + esc(l.fabrics || '—') + '</td>' +
        '<td>' + (msg ? '<details><summary>' + short + '</summary><p>' + esc(msg) + '</p></details>' : '—') + '</td>' +
        '<td>' + (l.read ? '<span style="color:var(--admin-muted)">Read</span>' : '<span class="dot-unread">New</span>') + '</td>' +
        '<td class="row-actions">' +
          (waDigits
            ? '<a class="icon-btn icon-btn--wa" href="https://wa.me/' + waDigits + '" target="_blank" rel="noopener" title="Open WhatsApp chat">WA</a>'
            : '') +
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
  AATX.log('leads', 'Exported CSV (' + leads.length + ' leads)');
  toast('Leads exported as CSV');
  }

  function exportSiteJson() {
    var data = AATX.loadData();
    downloadFile('al-azhar-tex-content.json', JSON.stringify(data, null, 2), 'application/json');
    AATX.log('data', 'Exported JSON snapshot');
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
          AATX.log('leads', 'Cleared all leads');
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
      AATX.log('settings', 'PIN changed');
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
        AATX.log('data', 'Reset to defaults');
        siteData = AATX.loadData();
        fillContent();
        fillSeoAnnounce();
        fillContact();
        fillBrand();
        renderFabList();
        refreshDashboard();
        refreshLastUpdated();
        toast('Site content reset to defaults');
      }
    });
  }

  /* =========================================================
     Brand — logo upload & colours
     ========================================================= */
  function fillBrand() {
    siteData = AATX.loadData();
    var preview = $('brand-logo-preview');
    if (preview) {
      preview.src = (siteData.brand && siteData.brand.logo) || 'assets/logo.jpg';
    }
    var colors = (siteData.brand && siteData.brand.colors) || {};
    setColor('col-primary', colors.primary || '#c8102e');
    setColor('col-blue', colors.blue || '#8fc1e3');
    setColor('col-navy', colors.navy || '#14304d');
  }

  function setColor(id, value) {
    var input = $(id);
    if (!input) return;
    input.value = value;
    var hex = $(id + '-hex');
    if (hex) hex.textContent = value;
  }

  ['col-primary', 'col-blue', 'col-navy'].forEach(function (id) {
    var input = $(id);
    if (input) {
      input.addEventListener('input', function () {
        var hex = $(id + '-hex');
        if (hex) hex.textContent = input.value;
      });
    }
  });

  /* Resize an image data URL to at most 256px on its longest side.
     Falls back to the original data URL when canvas is unavailable
     (rejects files that are too big for browser storage). */
  function resizeLogo(dataUrl) {
    return new Promise(function (resolve, reject) {
      var MAX = 256;
      var img = new Image();
      img.onload = function () {
        try {
          var scale = Math.min(1, MAX / Math.max(img.naturalWidth || img.width || MAX, 1));
          var w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
          var h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            if (dataUrl.length < 350000) resolve(dataUrl);
            else reject(new Error('Image too large — please use a smaller one (under ~350 KB)'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          var out = canvas.toDataURL('image/png');
          if (out.length < 400000) resolve(out);
          else reject(new Error('Image too large — please use a smaller one (under ~350 KB)'));
        } catch (e) {
          if (dataUrl.length < 350000) resolve(dataUrl);
          else reject(new Error('Image too large — please use a smaller one (under ~350 KB)'));
        }
      };
      img.onerror = function () { reject(new Error('Could not read that image')); };
      img.src = dataUrl;
    });
  }

  var logoUpload = $('logo-upload');
  if (logoUpload) {
    logoUpload.addEventListener('change', function () {
      var file = logoUpload.files && logoUpload.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        toast('Please choose an image file (PNG or JPG)');
        logoUpload.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        resizeLogo(reader.result).then(function (dataUrl) {
          siteData = AATX.loadData();
          siteData.brand = siteData.brand || {};
          siteData.brand.logo = dataUrl;
          AATX.saveData(siteData);
          AATX.log('brand', 'Logo updated');
          fillBrand();
          toast('Logo updated — live on the main site');
        }).catch(function (err) {
          toast(err && err.message ? err.message : 'Could not process that image');
        });
        logoUpload.value = '';
      };
      reader.onerror = function () { toast('Could not read that file'); };
      reader.readAsDataURL(file);
    });
  }

  var logoReset = $('logo-reset');
  if (logoReset) {
    logoReset.addEventListener('click', function () {
      siteData = AATX.loadData();
      siteData.brand = siteData.brand || {};
      siteData.brand.logo = null;
      AATX.saveData(siteData);
      AATX.log('brand', 'Logo reset to default');
      fillBrand();
      toast('Default logo restored');
    });
  }

  var colorsSave = $('colors-save');
  if (colorsSave) {
    colorsSave.addEventListener('click', function () {
      siteData = AATX.loadData();
      siteData.brand = siteData.brand || {};
      siteData.brand.colors = {
        primary: $('col-primary').value,
        blue: $('col-blue').value,
        navy: $('col-navy').value
      };
      AATX.saveData(siteData);
      AATX.log('brand', 'Colours updated');
      toast('Colours saved — live on the main site');
    });
  }

  var colorsReset = $('colors-reset');
  if (colorsReset) {
    colorsReset.addEventListener('click', function () {
      siteData = AATX.loadData();
      siteData.brand = siteData.brand || {};
      siteData.brand.colors = {
        primary: AATX.DEFAULTS.brand.colors.primary,
        blue: AATX.DEFAULTS.brand.colors.blue,
        navy: AATX.DEFAULTS.brand.colors.navy
      };
      AATX.saveData(siteData);
      AATX.log('brand', 'Colours reset to defaults');
      fillBrand();
      toast('Default colours restored');
    });
  }

  /* =========================================================
     Dashboard widgets — chart, activity, recent leads
     ========================================================= */
  function renderLeadsChart(leads) {
    var chart = $('leads-chart');
    if (!chart) return;
    if (!Array.isArray(leads)) leads = AATX.loadLeads();
    var days = 14;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var buckets = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      buckets.push({
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        count: 0
      });
    }
    leads.forEach(function (l) {
      if (!l.date) return;
      var ld = new Date(l.date);
      if (isNaN(ld.getTime())) return;
      ld.setHours(0, 0, 0, 0);
      var diff = Math.round((today.getTime() - ld.getTime()) / 86400000);
      if (diff >= 0 && diff < days) buckets[days - 1 - diff].count++;
    });
    var max = 0;
    buckets.forEach(function (b) { if (b.count > max) max = b.count; });
    var total = 0;
    chart.innerHTML = buckets.map(function (b) {
      total += b.count;
      var h = max ? Math.max(8, Math.round((b.count / max) * 100)) : 0;
      return '<div class="chart__bar-wrap" title="' + esc(b.label) + ' — ' + b.count + ' lead(s)">' +
        (b.count ? '<div class="chart__bar" style="height:' + h + '%"></div>' : '') +
        '</div>';
    }).join('');
    var note = $('leads-chart-note');
    if (note) {
      note.textContent = total === 0
        ? 'No leads in the last 14 days.'
        : total + (total === 1 ? ' lead' : ' leads') + ' in the last 14 days.';
    }
  }

  function renderActivity() {
    var list = $('activity-list');
    if (!list) return;
    var entries = AATX.getLog().slice(0, 8);
    if (!entries.length) {
      list.innerHTML = '<li class="activity__empty">No admin activity recorded yet.</li>';
      return;
    }
    list.innerHTML = entries.map(function (e) {
      return '<li><span class="activity__time">' + esc(formatDate(e.t)) + '</span>' +
        '<span class="activity__text">' + esc(e.action) + (e.detail ? ' — ' + esc(e.detail) : '') + '</span></li>';
    }).join('');
  }

  function renderRecentLeads(leads) {
    var list = $('recent-leads');
    if (!list) return;
    if (!Array.isArray(leads)) leads = AATX.loadLeads();
    var recent = leads.slice(0, 5);
    if (!recent.length) {
      list.innerHTML = '<li class="activity__empty">No leads yet — they appear here as they come in.</li>';
      return;
    }
    list.innerHTML = recent.map(function (l) {
      return '<li><strong>' + esc(l.name) + '</strong>' +
        '<span>' + esc(l.fabrics || 'general enquiry') + '</span>' +
        '<span class="activity__time">' + esc(formatDate(l.date)) + '</span></li>';
    }).join('');
  }

  /* =========================================================
     Maintenance mode
     ========================================================= */
  var maintToggle = $('maint-toggle');
  if (maintToggle) {
    maintToggle.addEventListener('change', function () {
      siteData = AATX.loadData();
      siteData.maintenance = siteData.maintenance || {};
      siteData.maintenance.enabled = !!maintToggle.checked;
      AATX.saveData(siteData);
      var card = $('maint-card');
      if (card) card.classList.toggle('is-on', maintToggle.checked);
      AATX.log('site', maintToggle.checked ? 'Maintenance mode ON' : 'Maintenance mode OFF');
      toast(maintToggle.checked
        ? 'Maintenance mode ON — visitors see the “we’ll be back” screen'
        : 'Maintenance mode OFF — the site is live again');
    });
  }

  /* =========================================================
     SEO + announcement
     ========================================================= */
  function fillSeoAnnounce() {
    var seo = siteData.seo || {};
    setText2('s-title', seo.title);
    setText2('s-desc', seo.description);
    var ann = siteData.announcement || {};
    var enabled = $('a-enabled');
    if (enabled) enabled.checked = !!ann.enabled;
    setText2('a-text', ann.text);
  }

  var seoSave = $('seo-save');
  if (seoSave) {
    seoSave.addEventListener('click', function () {
      siteData = AATX.loadData();
      siteData.seo = {
        title: $('s-title').value.trim(),
        description: $('s-desc').value.trim()
      };
      AATX.saveData(siteData);
      AATX.log('seo', 'Title & description updated');
      refreshDashboard();
      refreshLastUpdated();
      toast('SEO saved — live on the main site');
    });
  }

  var announceSave = $('announce-save');
  if (announceSave) {
    announceSave.addEventListener('click', function () {
      siteData = AATX.loadData();
      siteData.announcement = {
        enabled: !!$('a-enabled').checked,
        text: $('a-text').value.trim()
      };
      AATX.saveData(siteData);
      AATX.log('site', siteData.announcement.enabled ? 'Announcement enabled' : 'Announcement disabled');
      refreshDashboard();
      refreshLastUpdated();
      toast('Announcement saved — live on the main site');
    });
  }

  /* =========================================================
     Import snapshot (JSON)
     ========================================================= */
  var dataImport = $('data-import');
  if (dataImport) {
    dataImport.addEventListener('change', function () {
      var file = dataImport.files && dataImport.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          if (!parsed || typeof parsed !== 'object' ||
              !parsed.hero || !Array.isArray(parsed.fabrics) || !parsed.contact) {
            throw new Error('invalid snapshot');
          }
          if (!window.confirm('Replace ALL current site content with this snapshot?')) {
            dataImport.value = '';
            return;
          }
          AATX.saveData(parsed);
          AATX.log('data', 'Imported JSON snapshot');
          siteData = AATX.loadData();
          fillContent();
          fillSeoAnnounce();
          fillContact();
          fillBrand();
          renderFabList();
          refreshDashboard();
          refreshLastUpdated();
          toast('Snapshot restored');
        } catch (e) {
          toast('Import failed — that file is not a valid Al Azhar Tex snapshot');
        }
        dataImport.value = '';
      };
      reader.onerror = function () { toast('Could not read that file'); };
      reader.readAsText(file);
    });
  }

  /* ---------- Auto-enter if a session is already active ---------- */
  if (isAuthed()) enterApp();
})();
