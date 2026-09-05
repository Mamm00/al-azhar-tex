/* =========================================================
   Al Azhar Tex — shared site data layer
   Used by both the public site (index.html) and the admin
   control center (admin.html).

   Storage: browser localStorage (per-browser).
   The public site renders hero text, fabrics, contact
   details and the catalogue note from this data, falling
   back to the defaults below when nothing is stored yet.
   ========================================================= */
(function () {
  'use strict';

  var DATA_KEY = 'aatz_site_data_v1';
  var LEADS_KEY = 'aatz_leads_v1';
  var PIN_KEY = 'aatz_admin_pin_v1';
  var DEFAULT_PIN = '2006';

  var DEFAULTS = {
    updated: null,
    hero: {
      eyebrow: 'Established 2006 · Cairo, Egypt',
      title: 'Fine fabrics for <span class="text-red">women\'s fashion</span>, sold wholesale.',
      lead: 'Al Azhar Tex is an Egyptian wholesale textile house supplying premium women\'s fabrics — Silk 180, Warsaw L, Pirlanta, Rotana and Lexus — to boutiques and manufacturers across Egypt and the region.',
      badgeNum: '20',
      badgeLabel: 'Years of fine<br />fabric wholesale'
    },
    notice: '…and many more lines in stock. <a href="#contact">Request the full catalogue</a> with weights, colour charts and wholesale prices.',
    fabrics: [
      {
        name: 'Silk 180',
        chip: '180 g/m²',
        chipStyle: 'red',
        swatch: 'silk',
        type: 'Signature satin silk',
        desc: 'Our flagship. A liquid, lustrous drape with deep gloss — the go-to for evening gowns, formal dresses and premium tailoring.',
        bestFor: 'eveningwear · formal dresses · abayas'
      },
      {
        name: 'Warsaw L',
        chip: 'Lightweight',
        chipStyle: 'blue',
        swatch: 'warsaw',
        type: 'Airy georgette',
        desc: 'Soft, sheer and feather-light with a gentle matte hand. Moves beautifully and resists creasing through the season.',
        bestFor: 'summer dresses · blouses · scarves'
      },
      {
        name: 'Pirlanta',
        chip: 'Signature',
        chipStyle: 'blue',
        swatch: 'pirlanta',
        type: 'Crisp luxury satin',
        desc: 'A glossy, structured satin with body that holds a cut. A staple for tailored feminine lines that need a clean, sharp finish.',
        bestFor: 'tailored dresses · occasion wear'
      },
      {
        name: 'Rotana 150',
        chip: '150 g/m²',
        chipStyle: 'blue',
        swatch: 'rotana150',
        type: 'Lightweight satin',
        desc: 'Versatile mid-season satin with a soft sheen. An everyday workhorse for high-volume production at wholesale cost.',
        bestFor: 'ready-to-wear · daily dresses'
      },
      {
        name: 'Rotana 180',
        chip: '180 g/m²',
        chipStyle: 'red',
        swatch: 'rotana180',
        type: 'Medium satin',
        desc: 'Fuller weight, structured drape and a premium hand-feel. Cuts clean and hangs heavy — our best-selling mid-weight line.',
        bestFor: 'winter collections · formal wear'
      },
      {
        name: 'Lexus 150',
        chip: '150 g/m²',
        chipStyle: 'blue',
        swatch: 'lexus150',
        type: 'Ultra-soft satin',
        desc: 'Smooth, cool and silky with a low-key glow. Comfortant against the skin and easy to sew — a customer favourite for loungewear and abayas.',
        bestFor: 'abayas · loungewear · lining'
      },
      {
        name: 'Lexus 180',
        chip: '180 g/m²',
        chipStyle: 'red',
        swatch: 'lexus180',
        type: 'Premium heavy satin',
        desc: 'The richest in the Lexus line — deep gloss, heavy drape and a luxurious feel. The hero fabric for haute collections and special orders.',
        bestFor: 'haute couture · bridal · occasions'
      }
    ],
    contact: {
      phoneDisplay: '+20 100 123 4567',
      phoneHref: '+201001234567',
      email: 'sales@alazhartex.com',
      address: 'Cairo, Egypt — by appointment for walk-ins',
      hours: 'Mon – Sat · 10:00 AM – 9:00 PM'
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function write(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  /* ---- Site data ---- */

  function loadData() {
    var raw = read(DATA_KEY);
    var base = clone(DEFAULTS);
    if (!raw) return base;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        ['hero', 'contact', 'fabrics'].forEach(function (k) {
          if (parsed[k] !== undefined) base[k] = parsed[k];
        });
        if (typeof parsed.notice === 'string') base.notice = parsed.notice;
        base.updated = parsed.updated || null;
      }
    } catch (e) { /* corrupt storage — fall back to defaults */ }
    return base;
  }

  function saveData(data) {
    data.updated = new Date().toISOString();
    write(DATA_KEY, JSON.stringify(data));
    return data;
  }

  function resetData() {
    try { window.localStorage.removeItem(DATA_KEY); } catch (e) { /* ignore */ }
    return clone(DEFAULTS);
  }

  /* ---- Lightweight HTML sanitizer for admin-entered rich text ---- */
  function sanitizeHtml(value, fallback) {
    var out = (typeof value === 'string' && value !== '') ? value : (fallback || '');
    if (typeof document === 'undefined') return out;
    var tpl = document.createElement('template');
    tpl.innerHTML = out;
    var nodes = tpl.content.querySelectorAll('script, style, iframe, object, embed, link, meta, form');
    for (var i = 0; i < nodes.length; i++) nodes[i].parentNode.removeChild(nodes[i]);
    var all = tpl.content.querySelectorAll('*');
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      var attrs = Array.prototype.slice.call(el.attributes);
      for (var a = 0; a < attrs.length; a++) {
        var name = attrs[a].name;
        if (/^on/i.test(name)) el.removeAttribute(name);
        else if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attrs[a].value)) el.removeAttribute(name);
      }
    }
    return tpl.innerHTML;
  }

  /* ---- Leads (from the public contact form) ---- */

  function loadLeads() {
    var raw = read(LEADS_KEY);
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveLeads(leads) {
    write(LEADS_KEY, JSON.stringify(leads || []));
  }

  function addLead(lead) {
    var leads = loadLeads();
    lead.id = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    lead.date = new Date().toISOString();
    lead.read = false;
    leads.unshift(lead);
    saveLeads(leads);
    return lead;
  }

  /* ---- Admin PIN ---- */

  function getPin() {
    return read(PIN_KEY) || DEFAULT_PIN;
  }

  function setPin(pin) {
    write(PIN_KEY, pin);
  }

  window.AATX = {
    DEFAULTS: DEFAULTS,
    loadData: loadData,
    saveData: saveData,
    resetData: resetData,
    sanitizeHtml: sanitizeHtml,
    loadLeads: loadLeads,
    saveLeads: saveLeads,
    addLead: addLead,
    getPin: getPin,
    setPin: setPin
  };
})();
