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

    function getScrollTop() {
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    // Apply the initial state without animating (covers reloads at a scrolled
    // position, where an opening tween would look out of place).
    var expanded = getScrollTop() > scrollThreshold;
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
      setExpanded(getScrollTop() > scrollThreshold);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateNavState);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
