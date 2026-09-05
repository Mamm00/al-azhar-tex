/* Al Azhar Tex — site interactions + data-driven rendering */
(function () {
  'use strict';

  var AATX = window.AATX || {};

  /* =========================================================
     Render admin-managed data (hero, fabrics, contact, brand,
     SEO, announcement, maintenance). Falls back gracefully
     when the data layer is unavailable.
     ========================================================= */

  function $(id) { return document.getElementById(id); }

  function setHtml(el, value, fallbackHtml) {
    if (!el) return;
    if (typeof AATX.sanitizeHtml === 'function') {
      el.innerHTML = AATX.sanitizeHtml(value, fallbackHtml);
    } else if (value !== undefined && value !== null) {
      el.innerHTML = String(value);
    }
  }

  function telHref(value) {
    return 'tel:' + String(value || '').replace(/[^\d+]/g, '');
  }

  /* ---- small colour utilities for brand theming ---- */
  function clamp255(n) { return Math.max(0, Math.min(255, Math.round(n))); }
  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    var m = /^([0-9a-f]{6})$/i.exec(h);
    if (!m) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map(function (v) {
      return clamp255(v).toString(16).padStart(2, '0');
    }).join('');
  }
  function darken(rgb, f) {
    return [rgb[0] * f, rgb[1] * f, rgb[2] * f];
  }

  function renderBrand(data) {
    if (!data.brand) return;

    // custom logo (data URL) on header, footer and maintenance screens
    if (data.brand.logo) {
      var logos = document.querySelectorAll('img.brand__logo, #js-maintenance-logo');
      for (var i = 0; i < logos.length; i++) logos[i].src = data.brand.logo;
    }

    // brand colours -> CSS custom properties
    var colors = data.brand.colors;
    if (colors) {
      var root = document.documentElement.style;
      var p = colors.primary && hexToRgb(colors.primary);
      if (p) {
        root.setProperty('--red', colors.primary);
        root.setProperty('--red-dark', rgbToHex(darken(p, 0.82)));
      }
      var b = colors.blue && hexToRgb(colors.blue);
      if (b) {
        root.setProperty('--blue', colors.blue);
        root.setProperty('--blue-mid', rgbToHex(darken(b, 0.62)));
      }
      var n = colors.navy && hexToRgb(colors.navy);
      if (n) {
        root.setProperty('--navy', colors.navy);
        root.setProperty('--navy-deep', rgbToHex(darken(n, 0.72)));
      }
    }
  }

  function renderSeo(data) {
    if (!data.seo) return;
    if (data.seo.title) document.title = data.seo.title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.seo.description) metaDesc.setAttribute('content', data.seo.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && data.seo.title) ogTitle.setAttribute('content', data.seo.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && data.seo.description) ogDesc.setAttribute('content', data.seo.description);
  }

  function renderAnnouncement(data) {
    var annEl = $('js-announcement');
    if (!annEl) return;
    var ann = data.announcement;
    var show = !!(ann && ann.enabled && ann.text && String(ann.text).trim());
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('aatz_announce_dismissed') === '1'; } catch (e) { /* ignore */ }
    annEl.hidden = !(show && !dismissed);
    if (show) {
      var textEl = $('js-announcement-text');
      if (textEl) textEl.textContent = String(ann.text).trim();
      var closeBtn = $('js-announcement-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          annEl.hidden = true;
          try { sessionStorage.setItem('aatz_announce_dismissed', '1'); } catch (e) { /* ignore */ }
        });
      }
    }
  }

  function renderMaintenance(data) {
    var mEl = $('js-maintenance');
    if (!mEl) return;
    var m = data.maintenance;
    mEl.hidden = !(m && m.enabled);
    if (m && m.enabled) {
      var msg = $('js-maintenance-message');
      if (msg && m.message) msg.textContent = String(m.message);
      var phone = $('js-maintenance-phone');
      if (phone && data.contact) {
        phone.textContent = data.contact.phoneDisplay;
        phone.setAttribute('href', telHref(data.contact.phoneHref || data.contact.phoneDisplay));
      }
    }
  }

  function renderFabrics(fabrics) {
    var grid = $('fabrics-grid');
    if (!grid) return;

    var list = (Array.isArray(fabrics) ? fabrics : [])
      .filter(function (f) { return f && !f.hidden; });

    grid.innerHTML = list.map(function (f) {
      var name = String(f.name || 'Untitled fabric');
      var chip = String(f.chip || '');
      var chipClass = f.chipStyle === 'red' ? 'chip--red' : 'chip--blue';
      var swatch = String(f.swatch || '');
      var swatchClass = swatch ? ' swatch--' + swatch : '';
      var type = String(f.type || '');
      var desc = String(f.desc || '');
      var best = String(f.bestFor || '');
      var esc = function (s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      };
      return '<article class="fabric-card" data-name="' + esc(name.toLowerCase()) + '">' +
        '<div class="fabric-card__swatch' + swatchClass + '" aria-hidden="true"></div>' +
        '<div class="fabric-card__body">' +
          '<div class="fabric-card__top">' +
            '<h3 class="fabric-card__name">' + esc(name) + '</h3>' +
            (chip ? '<span class="chip ' + chipClass + '">' + esc(chip) + '</span>' : '') +
          '</div>' +
          (type ? '<p class="fabric-card__type">' + esc(type) + '</p>' : '') +
          (desc ? '<p class="fabric-card__desc">' + esc(desc) + '</p>' : '') +
          (best ? '<p class="fabric-card__meta">Best for: ' + esc(best) + '</p>' : '') +
        '</div>' +
      '</article>';
    }).join('');

    var countEl = $('fabric-count');
    if (countEl) {
      countEl.textContent = list.length + (list.length === 1 ? ' fabric' : ' fabrics');
    }
  }

  function renderSite(data) {
    if (!data || typeof data !== 'object') return;

    // Brand (logo + colours) first, so overlays can use the custom logo
    renderBrand(data);
    renderSeo(data);

    // Hero
    if (data.hero) {
      if (data.hero.eyebrow !== undefined) { var e = $('js-hero-eyebrow'); if (e) e.textContent = data.hero.eyebrow; }
      setHtml($('js-hero-title'), data.hero.title);
      if (data.hero.lead !== undefined) { var l = $('js-hero-lead'); if (l) l.textContent = data.hero.lead; }
      if (data.hero.badgeNum !== undefined) { var b = $('js-hero-badge-num'); if (b) b.textContent = data.hero.badgeNum; }
      setHtml($('js-hero-badge-label'), data.hero.badgeLabel);
    }

    // Catalogue note
    setHtml($('js-fabrics-notice'), data.notice);

    // Fabrics (hidden lines filtered out)
    renderFabrics(data.fabrics);

    // Contact (main + top bar + footer)
    if (data.contact) {
      var c = data.contact;
      var phone = $('js-contact-phone');
      if (phone && c.phoneDisplay !== undefined) {
        phone.textContent = c.phoneDisplay;
        phone.setAttribute('href', telHref(c.phoneHref || c.phoneDisplay));
      }
      var email = $('js-contact-email');
      if (email && c.email !== undefined) {
        email.textContent = c.email;
        email.setAttribute('href', 'mailto:' + c.email);
      }
      var addr = $('js-contact-address');
      if (addr && c.address !== undefined) addr.textContent = c.address;
      var hours = $('js-contact-hours');
      if (hours && c.hours !== undefined) hours.textContent = c.hours;

      var topbarHours = $('js-topbar-hours');
      if (topbarHours && c.hours !== undefined) topbarHours.textContent = c.hours;

      if (c.phoneDisplay !== undefined) {
        var fp = document.querySelectorAll('.js-footer-phone');
        for (var i = 0; i < fp.length; i++) {
          fp[i].textContent = c.phoneDisplay;
          fp[i].setAttribute('href', telHref(c.phoneHref || c.phoneDisplay));
        }
      }
      if (c.email !== undefined) {
        var fe = document.querySelectorAll('.js-footer-email');
        for (var j = 0; j < fe.length; j++) {
          fe[j].textContent = c.email;
          fe[j].setAttribute('href', 'mailto:' + c.email);
        }
      }
      if (c.address !== undefined) {
        var fa = document.querySelectorAll('.js-footer-address');
        for (var k = 0; k < fa.length; k++) fa[k].textContent = c.address;
      }
      if (c.hours !== undefined) {
        var fh = document.querySelectorAll('.js-footer-hours');
        for (var m = 0; m < fh.length; m++) fh[m].textContent = c.hours;
      }
    }

    // Announcement bar + maintenance overlay (last, on top of everything)
    renderAnnouncement(data);
    renderMaintenance(data);
  }

  if (typeof AATX.loadData === 'function') {
    renderSite(AATX.loadData());
  }

  /* ---------- Mobile navigation ---------- */
  var header = $('site-header');
  var navToggle = $('nav-toggle');
  var navMenu = $('nav-menu');

  if (navToggle && navMenu) {
    var nav = navMenu.closest('.nav') || navMenu;

    var closeNav = function () {
      nav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-locked');
    };

    navToggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-locked', open);
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- Sticky header shadow + back-to-top visibility ---------- */
  var backToTop = $('back-to-top');

  var onScroll = function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');

  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    var tick = function (now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Fabric search / filter ---------- */
  var searchInput = $('fabric-search');
  var fabricEmpty = $('fabric-empty');
  var fabricCountEl = $('fabric-count');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('#fabrics-grid .fabric-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (
          (card.getAttribute('data-name') || '') + ' ' + (card.textContent || '')
        ).toLowerCase();
        var match = query === '' || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });

      if (fabricCountEl) {
        fabricCountEl.textContent = visible + (visible === 1 ? ' fabric' : ' fabrics');
      }
      if (fabricEmpty) {
        fabricEmpty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  /* ---------- Contact form ----------
     Validates client-side, then stores the lead in localStorage
     where it can be reviewed in the Admin Control Center
     (admin.html → Leads). To receive leads by email/WhatsApp too,
     additionally POST `new FormData(form)` to a real endpoint. */
  var form = $('contact-form');

  if (form) {
    var formMessage = $('form-message');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var fd = new FormData(form);
      if (typeof AATX.addLead === 'function') {
        AATX.addLead({
          name: String(fd.get('name') || '').trim(),
          company: String(fd.get('company') || '').trim(),
          phone: String(fd.get('phone') || '').trim(),
          fabrics: String(fd.get('fabrics') || '').trim(),
          message: String(fd.get('message') || '').trim()
        });
      }

      form.reset();
      if (formMessage) {
        formMessage.textContent =
          'Thank you — your wholesale request has been received. Our team will contact you within one business day.';
        formMessage.classList.add('is-visible');
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = $('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
