(function () {
  'use strict';

  function hideLoadingIndicator() {
    var el = document.getElementById('loading-indicator');
    if (el) el.style.display = 'none';
  }

  function waitForLucide() {
    return new Promise(function(resolve) {
      if (typeof lucide !== 'undefined' && lucide.createIcons) { resolve(); return; }
      var start = Date.now();
      var check = setInterval(function() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) { clearInterval(check); resolve(); }
        else if (Date.now() - start > 5000) { clearInterval(check); resolve(); }
      }, 100);
    });
  }

  async function initializeApp() {
    try {
      // Wire up the light/dark theme toggle (theme class is already applied
      // pre-paint by the inline script in index.html).
      if (typeof ThemeManager !== 'undefined' && ThemeManager.initialize) {
        ThemeManager.initialize();
      }

      await waitForLucide();

      // Render all sections
      if (typeof SectionRenderer !== 'undefined') {
        await SectionRenderer.renderHome();
        SectionRenderer.renderStats();
        await SectionRenderer.renderAbout();
        await SectionRenderer.renderProjects();
        await SectionRenderer.renderContact();
      }

      // Initialize router (scroll spy + nav handlers)
      if (typeof Router !== 'undefined' && Router.initialize) {
        Router.initialize();
      }

      // Hide loading indicator
      hideLoadingIndicator();

      // Initialize Lucide icons
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }

      // Set up scroll reveal for cards and sections
      initScrollReveal();

      // Initialize navigation scroll behavior
      initNavScrollBehavior();

      // Initialize the mobile (hamburger) menu
      initMobileMenu();

      console.log('[App] Portfolio loaded successfully');
    } catch (error) {
      console.error('[App] Error: ' + error.message);
      hideLoadingIndicator();
    }
  }

  function initScrollReveal() {
    var revealElements = document.querySelectorAll('.project-card, .skill-card, .stat-card');
    revealElements.forEach(function(el, i) {
      el.classList.add('reveal');
      el.classList.add('reveal-delay-' + ((i % 6) + 1));
    });

    // Experience and contact cards get reveal but no stagger delay
    var noDelayElements = document.querySelectorAll('.contact-gradient-panel');
    noDelayElements.forEach(function(el) {
      el.classList.add('reveal');
    });

    // IntersectionObserver for fade-in AND fade-out
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.classList.remove('faded-out');
          } else {
            // Fade out when leaving viewport (only if already revealed)
            if (entry.target.classList.contains('revealed')) {
              entry.target.classList.add('faded-out');
              entry.target.classList.remove('revealed');
            }
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('revealed');
      });
    }

    // Scrollbar color change based on scroll position
    initScrollbarColorShift();
  }

  function initScrollbarColorShift() {
    var colors = [
      { start: '#a855f7', end: '#6366f1' },  // purple → indigo (top)
      { start: '#6366f1', end: '#3b82f6' },  // indigo → blue
      { start: '#3b82f6', end: '#06b6d4' },  // blue → cyan
      { start: '#06b6d4', end: '#10b981' },  // cyan → emerald
      { start: '#10b981', end: '#a855f7' }   // emerald → purple (bottom)
    ];

    function updateScrollbarColor() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      var index = Math.min(Math.floor(progress * colors.length), colors.length - 1);
      var color = colors[index];
      document.documentElement.style.setProperty('--scroll-color-start', color.start);
      document.documentElement.style.setProperty('--scroll-color-end', color.end);
    }

    window.addEventListener('scroll', updateScrollbarColor);
    updateScrollbarColor();
  }

  function initNavScrollBehavior() {
    var nav = document.querySelector('.nav-floating');
    if (!nav) return;

    var scrollThreshold = 50;
    var ticking = false;
    var widthAnim = null;
    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The pill only morphs into a docked header on desktop. On mobile it stays a
    // compact centered pill (links collapse into a dropdown instead), so the
    // morph is disabled below 640px.
    var desktopMq = window.matchMedia('(min-width: 640px)');
    function isDesktop() {
      return desktopMq.matches;
    }

    function getScrollTop() {
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    // Apply the initial state without animating (covers reloads at a scrolled
    // position, where an opening tween would look out of place).
    var expanded = isDesktop() && getScrollTop() > scrollThreshold;
    nav.classList.toggle('nav-expanded', expanded);

    // Toggle between the compact pill and the docked header. The width is the
    // only geometry that changes; CSS transitions handle background, padding,
    // shadow, etc. Width itself can't be CSS-transitioned (max-content <-> calc),
    // so we tween it with the Web Animations API between measured pixel values.
    function setExpanded(nextExpanded) {
      if (nextExpanded === expanded) return;

      var startWidth = nav.getBoundingClientRect().width;

      nav.classList.toggle('nav-expanded', nextExpanded);
      expanded = nextExpanded;

      if (widthAnim) {
        widthAnim.cancel();
        widthAnim = null;
      }

      // Without WAAPI (or with reduced motion) the class change still applies
      // the correct end state; width just snaps, which is an acceptable fallback.
      if (prefersReducedMotion || typeof nav.animate !== 'function') {
        return;
      }

      var endWidth = nav.getBoundingClientRect().width;
      if (Math.abs(endWidth - startWidth) < 1) return;

      widthAnim = nav.animate(
        [{ width: startWidth + 'px' }, { width: endWidth + 'px' }],
        { duration: 450, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'none' }
      );
    }

    function updateNavState() {
      setExpanded(isDesktop() && getScrollTop() > scrollThreshold);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateNavState);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Re-evaluate when crossing the mobile/desktop breakpoint (e.g. rotate or
    // resize): collapse the pill on mobile, restore the scroll state on desktop.
    var onBreakpointChange = function () {
      setExpanded(isDesktop() && getScrollTop() > scrollThreshold);
    };
    if (desktopMq.addEventListener) {
      desktopMq.addEventListener('change', onBreakpointChange);
    } else if (desktopMq.addListener) {
      desktopMq.addListener(onBreakpointChange);
    }
  }

  // Mobile navigation: the nav links collapse into a dropdown behind a hamburger
  // button. Desktop (>= 640px) is unaffected — the button is hidden via CSS and
  // the links render inline as before.
  function initMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    function isOpen() {
      return menu.classList.contains('nav-menu-open');
    }

    function openMenu() {
      menu.classList.add('nav-menu-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    function closeMenu() {
      menu.classList.remove('nav-menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Choosing a destination closes the menu; toggling the theme keeps it open.
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('.nav-link');
      if (link && link.id !== 'theme-toggle') {
        closeMenu();
      }
    });

    // Close on an outside tap/click.
    document.addEventListener('click', function (e) {
      if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape and return focus to the toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    // Reset to a clean state when entering the desktop layout.
    if (window.matchMedia) {
      var desktop = window.matchMedia('(min-width: 640px)');
      var onChange = function (e) {
        if (e.matches) {
          closeMenu();
        }
      };
      if (desktop.addEventListener) {
        desktop.addEventListener('change', onChange);
      } else if (desktop.addListener) {
        desktop.addListener(onChange);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
