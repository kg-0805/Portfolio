/**
 * theme.js - Theme Manager (light / dark)
 *
 * Manages the site color theme:
 * - Applies the `dark` class on <html> (Tailwind class-based dark mode)
 * - Persists the user's explicit choice in localStorage ('theme')
 * - Falls back to the OS preference (prefers-color-scheme) when no choice is saved
 * - Keeps the meta theme-color and the toggle button (aria + icon) in sync
 *
 * Note: a tiny inline script in index.html applies the stored/system theme
 * before first paint to avoid a flash of the wrong theme. This module wires up
 * the toggle button and keeps everything in sync after load.
 */

const ThemeManager = (function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var META_LIGHT = '#a855f7';
  var META_DARK = '#0a0f1e';

  var root = document.documentElement;

  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function store(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* storage unavailable (private mode, etc.) — theme still applies for the session */
    }
  }

  function getCurrentTheme() {
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  function updateMeta(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? META_DARK : META_LIGHT);
    }
  }

  function updateToggleButton(theme) {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /**
   * Apply a theme to the document without persisting it.
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    var isDark = theme === 'dark';
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    updateMeta(isDark ? 'dark' : 'light');
    updateToggleButton(isDark ? 'dark' : 'light');
  }

  /**
   * Set and persist a theme.
   * @param {string} theme - 'dark' or 'light'
   */
  function setTheme(theme) {
    var normalized = theme === 'dark' ? 'dark' : 'light';
    applyTheme(normalized);
    store(normalized);
  }

  /** Toggle between light and dark (persisted). */
  function toggleTheme() {
    setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
  }

  /** Wire up the toggle button and system-preference listener. */
  function initialize() {
    // Sync state with whatever the no-FOUC inline script already applied.
    applyTheme(getCurrentTheme());

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }

    // Follow the OS preference while the user hasn't made an explicit choice.
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        if (!getStored()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      };
      if (mq.addEventListener) {
        mq.addEventListener('change', onChange);
      } else if (mq.addListener) {
        mq.addListener(onChange);
      }
    }
  }

  return {
    getCurrentTheme: getCurrentTheme,
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    applyTheme: applyTheme,
    initialize: initialize
  };
})();
