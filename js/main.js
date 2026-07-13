/*
 * main.js — progressive enhancement only.
 *
 * The page is fully rendered at build time from data/*.json (see
 * scripts/render-content.mjs), so nothing here builds content. This file just
 * wires up the theme toggle, the mobile menu, scroll-spy, and scroll reveal.
 * If it never runs, the site is still complete and readable.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- Theme */
  function initTheme() {
    var STORAGE_KEY = 'theme';
    var btn = document.getElementById('theme-toggle');
    var metaLight = '#a855f7';
    var metaDark = '#0a0f1e';

    function stored() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function isDark() { return root.classList.contains('dark'); }

    function sync() {
      var dark = isDark();
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? metaDark : metaLight);
      if (btn) {
        btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      }
    }

    function apply(dark, persist) {
      root.classList.toggle('dark', dark);
      if (persist) { try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (e) {} }
      sync();
    }

    sync();
    if (btn) btn.addEventListener('click', function () { apply(!isDark(), true); });

    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) { if (!stored()) apply(e.matches, false); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* -------------------------------------------------------- Mobile menu */
  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    function open() {
      menu.classList.add('nav-menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    function close() {
      menu.classList.remove('nav-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    function isOpen() { return menu.classList.contains('nav-menu-open'); }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? close() : open();
    });
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('.nav-link');
      if (link && link.id !== 'theme-toggle') close();
    });
    document.addEventListener('click', function (e) {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { close(); toggle.focus(); }
    });
    if (window.matchMedia) {
      var desktop = window.matchMedia('(min-width: 640px)');
      var onChange = function (e) { if (e.matches) close(); };
      if (desktop.addEventListener) desktop.addEventListener('change', onChange);
      else if (desktop.addListener) desktop.addListener(onChange);
    }
  }

  /* -------------------------------------------------- Nav scrolled state */
  function initNavScroll() {
    var nav = document.querySelector('.nav-floating');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('nav-scrolled', (window.pageYOffset || 0) > 24);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------- Scroll-spy */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[data-section]'));
    var sections = links
      .map(function (l) { return document.getElementById(l.getAttribute('data-section')); })
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    function setActive(id) {
      links.forEach(function (l) {
        var on = l.getAttribute('data-section') === id;
        l.classList.toggle('nav-active', on);
        if (on) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });
    }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      sections.forEach(function (s) {
        var r = visible[s.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = s.id; }
      });
      if (best) setActive(best);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ------------------------------------------------------- Scroll reveal */
  function initReveal() {
    if (reduceMotion) return;
    var groups = document.querySelectorAll(
      '.metric-card, .project-card, .timeline-item, .skill-group, .philosophy-card, .arch-card'
    );
    groups.forEach(function (el, i) { el.classList.add('reveal', 'reveal-delay-' + ((i % 6) + 1)); });

    var singles = document.querySelectorAll('.section-head, .featured, .contact-grid, .hero-now');
    singles.forEach(function (el) { el.classList.add('reveal'); });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); o.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  /* ------------------------------------------------------- Contact form */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('contact-status');
    var submit = form.querySelector('.contact-submit');
    var ACCESS_KEY = '5ff54038-93e3-410e-9ddf-e733c779bc7a';
    var fields = ['name', 'email', 'subject', 'message'].map(function (n) { return form.elements[n]; });

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg || '';
      status.className = 'contact-status' + (kind ? ' is-' + kind : '');
    }

    fields.forEach(function (el) {
      if (el) el.addEventListener('input', function () { el.classList.remove('field-invalid'); });
    });

    function validate() {
      var ok = true;
      fields.forEach(function (el) {
        if (!el) return;
        var val = (el.value || '').trim();
        var bad = !val || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
        el.classList.toggle('field-invalid', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', null);
      if (!validate()) { setStatus('Please fill in every field with a valid email.', 'error'); return; }

      var data = new FormData();
      data.append('access_key', ACCESS_KEY);
      data.append('from_name', 'Portfolio contact form');
      fields.forEach(function (el) { if (el) data.append(el.name, el.value.trim()); });

      var label = submit ? submit.innerHTML : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      setStatus('Sending your message…', null);

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) {
            setStatus("Thanks — your message is on its way. I'll reply soon.", 'success');
            form.reset();
          } else {
            setStatus('Something went wrong. Please email me directly at contact@kartikgupta.in.', 'error');
          }
        })
        .catch(function () {
          setStatus('Network error. Please email me directly at contact@kartikgupta.in.', 'error');
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.innerHTML = label; }
        });
    });
  }

  function init() {
    initTheme();
    initMobileMenu();
    initNavScroll();
    initScrollSpy();
    initReveal();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
