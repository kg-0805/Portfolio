const Router = (function() {
  'use strict';
  const VALID_SECTIONS = ['home', 'about', 'projects', 'contact'];
  let state = { currentSection: 'home', previousSection: null };

  function initialize() {
    // Attach click handlers to nav links
    document.querySelectorAll('.nav-link, a[data-section]').forEach(function(link) {
      link.addEventListener('click', handleNavigation);
    });
    // Scroll spy
    window.addEventListener('scroll', debouncedScrollHandler);
    // Handle initial hash
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      var section = hash.substring(1).toLowerCase();
      if (VALID_SECTIONS.indexOf(section) !== -1) {
        setTimeout(function() { scrollToSection(section); }, 300);
      }
    }
    updateActiveNavLink('home');
  }

  function handleNavigation(event) {
    event.preventDefault();
    var link = event.currentTarget;
    var sectionId = link.getAttribute('data-section');
    if (!sectionId) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) sectionId = href.substring(1);
    }
    if (sectionId && VALID_SECTIONS.indexOf(sectionId) !== -1) {
      navigateTo(sectionId);
    }
  }

  function navigateTo(sectionId) {
    state.previousSection = state.currentSection;
    state.currentSection = sectionId;
    history.pushState(null, '', '#' + sectionId);
    updateActiveNavLink(sectionId);
    scrollToSection(sectionId);
    announceSection(sectionId);
  }

  function scrollToSection(sectionId) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    var navHeight = 80;
    var startPos = window.pageYOffset;
    var targetPos = el.getBoundingClientRect().top + startPos - navHeight;
    var distance = targetPos - startPos;
    var duration = 800;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      window.scrollTo(0, startPos + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function updateActiveNavLink(sectionId) {
    document.querySelectorAll('.nav-link').forEach(function(link) {
      var linkSection = link.getAttribute('data-section') || (link.getAttribute('href') || '').replace('#', '');
      if (linkSection === sectionId) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('nav-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('nav-active');
      }
    });
  }

  function announceSection(sectionId) {
    var announcer = document.getElementById('section-announcer');
    if (announcer) announcer.textContent = 'Navigated to ' + sectionId + ' section';
  }

  var scrollTimer = null;
  var lastScrollUpdate = 0;

  function updateActiveSection() {
    var navHeight = 80;
    var viewportHeight = window.innerHeight;
    var closest = null;
    var closestDist = Infinity;

    var threshold = navHeight + viewportHeight * 0.35;

    VALID_SECTIONS.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        var rect = el.getBoundingClientRect();
        var topRelative = rect.top - navHeight;
        if (topRelative <= threshold - navHeight) {
          var dist = Math.abs(topRelative);
          if (dist < closestDist) { closestDist = dist; closest = id; }
        }
      }
    });

    // Fallback: if nothing matched (e.g. at very top), pick the first visible
    if (!closest) {
      VALID_SECTIONS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !closest) {
          var rect = el.getBoundingClientRect();
          if (rect.bottom > navHeight) { closest = id; }
        }
      });
    }

    if (closest && closest !== state.currentSection) {
      state.previousSection = state.currentSection;
      state.currentSection = closest;
      updateActiveNavLink(closest);
      history.replaceState(null, '', '#' + closest);
    }
  }

  function debouncedScrollHandler() {
    var now = Date.now();
    // Fire immediately if enough time has passed (throttle at 50ms)
    if (now - lastScrollUpdate > 50) {
      lastScrollUpdate = now;
      updateActiveSection();
    }
    // Also schedule a trailing call to catch the final position
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      lastScrollUpdate = Date.now();
      updateActiveSection();
    }, 80);
  }

  function getCurrentSection() { return state.currentSection; }
  function getState() { return { currentSection: state.currentSection, previousSection: state.previousSection }; }

  return {
    initialize: initialize,
    navigateTo: navigateTo,
    handleNavigation: handleNavigation,
    getCurrentSection: getCurrentSection,
    getState: getState,
    scrollToSection: scrollToSection
  };
})();
