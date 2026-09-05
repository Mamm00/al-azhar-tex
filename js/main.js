/* Al Azhar Tex — site interactions */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');

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

    // Close the menu after choosing a destination
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });

    // Close if the viewport grows back to desktop size
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- Sticky header shadow + back-to-top visibility ---------- */
  var backToTop = document.getElementById('back-to-top');

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
  var searchInput = document.getElementById('fabric-search');
  var fabricCards = Array.prototype.slice.call(document.querySelectorAll('.fabric-card'));
  var fabricCount = document.getElementById('fabric-count');
  var fabricEmpty = document.getElementById('fabric-empty');

  if (searchInput && fabricCards.length) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var visible = 0;

      fabricCards.forEach(function (card) {
        var haystack = (
          (card.getAttribute('data-name') || '') + ' ' + (card.textContent || '')
        ).toLowerCase();
        var match = query === '' || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });

      if (fabricCount) {
        fabricCount.textContent = visible + (visible === 1 ? ' fabric' : ' fabrics');
      }
      if (fabricEmpty) {
        fabricEmpty.classList.toggle('is-visible', visible === 0);
      }
    });
  }

  /* ---------- Contact form ----------
     The form is client-side only: it validates and shows a confirmation.
     To receive leads for real, POST the form data here to a backend or a
     service such as Formspree / Basin / your own API. */
  var form = document.getElementById('contact-form');

  if (form) {
    var formMessage = document.getElementById('form-message');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      // TODO: send `new FormData(form)` to your backend here.
      form.reset();
      if (formMessage) {
        formMessage.textContent =
          'Thank you — your wholesale request has been received. Our team will contact you within one business day.';
        formMessage.classList.add('is-visible');
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
