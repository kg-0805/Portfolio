/**
 * modal.js - Modal System
 * 
 * Manages the project detail modal overlay. Responsible for:
 * - Opening modals with fade-in animation
 * - Closing modals with fade-out animation (close button, backdrop click, Escape key)
 * - Rendering project details (title, description, technologies, links, images, metrics)
 * - Preventing body scroll while modal is open
 * - Trapping keyboard focus within the modal for accessibility
 * - Restoring focus to the triggering element on close
 * - Managing modal state (isOpen, currentProjectId)
 */

const ModalSystem = (function () {
  'use strict';

  // --- State ---
  let state = {
    isOpen: false,
    currentProjectId: null,
    animating: false
  };

  let triggerElement = null; // Element that opened the modal (for focus restoration)
  let animationTimer = null; // Timer for animation completion
  let scrollLocked = false; // Tracks whether background scroll is currently locked

  // --- Helpers ---

  /**
   * Lock background page scroll while the modal is open.
   *
   * The page's scroll container is the <html> element (it is promoted to a
   * scroll container by `overflow-x: hidden` in the stylesheet), so setting
   * `overflow: hidden` on <body> alone does not stop the page from scrolling.
   * We therefore lock both <html> and <body>. The reserved scrollbar gutter
   * (`scrollbar-gutter: stable` in CSS) keeps the layout from shifting when the
   * scrollbar is hidden.
   */
  function lockBodyScroll() {
    if (scrollLocked) {
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
  }

  /**
   * Restore background page scroll when the modal closes.
   */
  function unlockBodyScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    scrollLocked = false;
  }

  /**
   * Validate that a URL uses only http or https protocol.
   * @param {string} url - The URL to validate
   * @returns {boolean} True if valid http/https URL
   */
  function isValidUrl(url) {
    if (typeof url !== 'string') {
      return false;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    try {
      var parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /**
   * Sanitize HTML content by stripping script elements, event handler attributes,
   * and javascript: URIs. Returns safe text content.
   * @param {string} content - The content to sanitize
   * @returns {string} Sanitized content safe for display
   */
  function sanitizeContent(content) {
    if (typeof content !== 'string') {
      return '';
    }
    // Strip script tags and their content
    var sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Strip event handler attributes (on*)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    // Strip javascript: URIs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    return sanitized;
  }

  /**
   * Escape text for safe insertion as text content.
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeText(text) {
    if (typeof text !== 'string') {
      return '';
    }
    return text;
  }

  /**
   * Get all focusable elements within a container.
   * @param {HTMLElement} container - The container to search within
   * @returns {Array<HTMLElement>} Array of focusable elements
   */
  function getFocusableElements(container) {
    var selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(container.querySelectorAll(selectors.join(', ')));
  }

  /**
   * Handle keyboard focus trapping within the modal.
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleFocusTrap(event) {
    if (event.key !== 'Tab') {
      return;
    }

    var container = document.getElementById('modal-container');
    if (!container) {
      return;
    }

    var focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Handle keydown events for Escape key and focus trapping.
   * @param {KeyboardEvent} event - The keyboard event
   */
  function handleKeydown(event) {
    if (!state.isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    handleFocusTrap(event);
  }

  // --- Rendering ---

  /**
   * Render the modal content HTML from project data.
   * Uses textContent for text data and validates URLs before rendering links.
   * @param {Object} projectData - The project data object
   * @returns {HTMLElement} The modal backdrop element
   */
  function renderModalContent(projectData) {
    // Create backdrop
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
    backdrop.id = 'modal-backdrop';

    // Create modal content container
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative modal-responsive';
    modalContent.id = 'modal-content';
    modalContent.setAttribute('role', 'document');

    // Prevent backdrop click from closing when clicking on content
    modalContent.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // --- Header with close button ---
    var header = document.createElement('div');
    header.className = 'flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10';

    var titleEl = document.createElement('h2');
    titleEl.className = 'text-2xl font-bold text-gray-900 pr-4';
    titleEl.id = 'modal-title';
    titleEl.textContent = escapeText(projectData.title || '');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500';
    closeBtn.id = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.setAttribute('type', 'button');
    closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);

    // --- Body ---
    var body = document.createElement('div');
    body.className = 'p-6 space-y-6';

    // Status badge
    var statusSection = document.createElement('div');
    statusSection.className = 'flex items-center gap-2';
    var statusBadge = document.createElement('span');
    var statusText = (projectData.status && typeof projectData.status === 'string' && projectData.status.trim() !== '')
      ? projectData.status
      : 'Unknown';
    statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + getStatusClasses(statusText);
    statusBadge.textContent = statusText.charAt(0).toUpperCase() + statusText.slice(1);
    statusSection.appendChild(statusBadge);
    body.appendChild(statusSection);

    // Description
    var descSection = document.createElement('div');
    var descLabel = document.createElement('h3');
    descLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
    descLabel.textContent = 'Description';
    var descText = document.createElement('p');
    descText.className = 'text-gray-700 leading-relaxed';
    descText.textContent = escapeText(projectData.fullDescription || projectData.description || '');
    descSection.appendChild(descLabel);
    descSection.appendChild(descText);
    body.appendChild(descSection);

    // Architecture notes (only if project has them)
    if (projectData.architectureNotes && Array.isArray(projectData.architectureNotes) && projectData.architectureNotes.length > 0) {
      var architectureSection = document.createElement('div');
      var architectureLabel = document.createElement('h3');
      architectureLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
      architectureLabel.textContent = 'Architecture Notes';
      architectureSection.appendChild(architectureLabel);

      var architectureList = document.createElement('ul');
      architectureList.className = 'space-y-3';

      for (var archIndex = 0; archIndex < projectData.architectureNotes.length; archIndex++) {
        var note = projectData.architectureNotes[archIndex];
        var noteItem = document.createElement('li');
        noteItem.className = 'text-gray-700 leading-relaxed';
        noteItem.innerHTML = '<span class="font-semibold text-gray-900">' + escapeText(note.focus || '') + ':</span> ' + escapeText(note.detail || '');
        architectureList.appendChild(noteItem);
      }

      architectureSection.appendChild(architectureList);
      body.appendChild(architectureSection);
    }

    // Technologies
    if (projectData.technologies && Array.isArray(projectData.technologies) && projectData.technologies.length > 0) {
      var techSection = document.createElement('div');
      var techLabel = document.createElement('h3');
      techLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
      techLabel.textContent = 'Technologies';
      techSection.appendChild(techLabel);

      var techContainer = document.createElement('div');
      techContainer.className = 'flex flex-wrap gap-2';

      for (var i = 0; i < projectData.technologies.length; i++) {
        var tag = document.createElement('span');
        tag.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800';
        tag.textContent = escapeText(projectData.technologies[i]);
        techContainer.appendChild(tag);
      }

      techSection.appendChild(techContainer);
      body.appendChild(techSection);
    }

    // Links section (only if project has links with valid URLs)
    if (projectData.links && typeof projectData.links === 'object' && !Array.isArray(projectData.links)) {
      var linkKeys = Object.keys(projectData.links);
      var validLinks = [];

      for (var j = 0; j < linkKeys.length; j++) {
        var linkUrl = projectData.links[linkKeys[j]];
        if (isValidUrl(linkUrl)) {
          validLinks.push({ type: linkKeys[j], url: linkUrl });
        }
      }

      if (validLinks.length > 0) {
        var linksSection = document.createElement('div');
        var linksLabel = document.createElement('h3');
        linksLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
        linksLabel.textContent = 'Links';
        linksSection.appendChild(linksLabel);

        var linksContainer = document.createElement('div');
        linksContainer.className = 'flex flex-wrap gap-3';

        for (var k = 0; k < validLinks.length; k++) {
          var link = document.createElement('a');
          link.href = validLinks[k].url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-blue-600 hover:bg-gray-200 transition-colors min-w-[44px] min-h-[44px]';
          link.textContent = validLinks[k].type.charAt(0).toUpperCase() + validLinks[k].type.slice(1);
          linksContainer.appendChild(link);
        }

        linksSection.appendChild(linksContainer);
        body.appendChild(linksSection);
      }
    }

    // Images section (only if project has non-empty images array)
    if (projectData.images && Array.isArray(projectData.images) && projectData.images.length > 0) {
      var imagesSection = document.createElement('div');
      var imagesLabel = document.createElement('h3');
      imagesLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
      imagesLabel.textContent = 'Screenshots';
      imagesSection.appendChild(imagesLabel);

      var imagesContainer = document.createElement('div');
      imagesContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';

      for (var m = 0; m < projectData.images.length; m++) {
        var imgSrc = projectData.images[m];
        if (typeof imgSrc === 'string' && imgSrc.trim() !== '') {
          var imgWrapper = document.createElement('div');
          imgWrapper.className = 'rounded-lg overflow-hidden border border-gray-200';
          var img = document.createElement('img');
          img.src = sanitizeContent(imgSrc);
          img.alt = escapeText(projectData.title) + ' screenshot ' + (m + 1);
          img.className = 'w-full h-auto object-cover';
          img.loading = 'lazy';
          imgWrapper.appendChild(img);
          imagesContainer.appendChild(imgWrapper);
        }
      }

      if (imagesContainer.children.length > 0) {
        imagesSection.appendChild(imagesContainer);
        body.appendChild(imagesSection);
      }
    }

    // Metrics section (only if project has non-empty metrics object)
    if (projectData.metrics && typeof projectData.metrics === 'object' && !Array.isArray(projectData.metrics)) {
      var metricKeys = Object.keys(projectData.metrics);
      if (metricKeys.length > 0) {
        var metricsSection = document.createElement('div');
        var metricsLabel = document.createElement('h3');
        metricsLabel.className = 'text-lg font-semibold text-gray-900 mb-2';
        metricsLabel.textContent = 'Metrics';
        metricsSection.appendChild(metricsLabel);

        var metricsContainer = document.createElement('div');
        metricsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';

        for (var n = 0; n < metricKeys.length; n++) {
          var metricCard = document.createElement('div');
          metricCard.className = 'p-4 rounded-lg bg-gray-50 border border-gray-200';

          var metricLabel = document.createElement('div');
          metricLabel.className = 'text-sm text-gray-500 mb-1';
          metricLabel.textContent = metricKeys[n].charAt(0).toUpperCase() + metricKeys[n].slice(1);

          var metricValue = document.createElement('div');
          metricValue.className = 'text-lg font-semibold text-gray-900';
          metricValue.textContent = escapeText(String(projectData.metrics[metricKeys[n]]));

          metricCard.appendChild(metricLabel);
          metricCard.appendChild(metricValue);
          metricsContainer.appendChild(metricCard);
        }

        metricsSection.appendChild(metricsContainer);
        body.appendChild(metricsSection);
      }
    }

    modalContent.appendChild(body);
    backdrop.appendChild(modalContent);

    return backdrop;
  }

  /**
   * Get CSS classes for status badge based on status value.
   * @param {string} status - The status string
   * @returns {string} Tailwind CSS classes
   */
  function getStatusClasses(status) {
    switch (status.toLowerCase()) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'private':
        return 'bg-yellow-100 text-yellow-800';
      case 'confidential':
        return 'bg-red-100 text-red-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // --- Core Modal Operations ---

  /**
   * Open the modal for a given project ID.
   * Validates the ID, fetches project data, creates modal HTML, triggers animation.
   * @param {string} projectId - The project ID to display
   */
  function openModal(projectId) {
    // Validate projectId
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      console.error('[ModalSystem] Invalid projectId: must be a non-empty string');
      return;
    }

    // Block if currently animating (either opening or closing)
    if (state.animating) {
      return;
    }

    // Block if already open
    if (state.isOpen) {
      return;
    }

    // Get project data from DataManager
    var projectData = DataManager.getProjectById(projectId);
    if (!projectData) {
      console.error('[ModalSystem] Project not found for id: ' + projectId);
      return;
    }

    // Store the trigger element for focus restoration
    triggerElement = document.activeElement;

    // Set animating state
    state.animating = true;

    // Get modal container
    var container = document.getElementById('modal-container');
    if (!container) {
      console.error('[ModalSystem] Modal container element not found');
      state.animating = false;
      return;
    }

    // Render modal content
    var backdrop = renderModalContent(projectData);
    container.innerHTML = '';
    container.appendChild(backdrop);

    // Prevent body scroll
    lockBodyScroll();

    // Attach close button listener
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (!state.animating) {
          closeModal();
        }
      });
    }

    // Attach backdrop click listener (close on backdrop, not on content)
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop && !state.animating) {
        closeModal();
      }
    });

    // Attach keyboard listener
    document.addEventListener('keydown', handleKeydown);

    // Trigger fade-in animation (use requestAnimationFrame to ensure DOM is painted first)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        backdrop.classList.add('modal-open');

        // Set up animation end handler
        animationTimer = setTimeout(function () {
          state.animating = false;
          state.isOpen = true;
          state.currentProjectId = projectId;

          // Set focus to close button for accessibility
          var closeBtnEl = document.getElementById('modal-close');
          if (closeBtnEl) {
            closeBtnEl.focus();
          }
        }, 250); // Match CSS transition duration
      });
    });

    // Update state immediately for isOpen tracking during animation
    state.isOpen = true;
    state.currentProjectId = projectId;
  }

  /**
   * Close the currently open modal with fade-out animation.
   * Restores body scroll and focus to the trigger element.
   */
  function closeModal() {
    if (!state.isOpen && !state.animating) {
      return;
    }

    // If currently in fade-in animation, cancel it and start fade-out
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }

    // Block further actions during close animation
    state.animating = true;

    var container = document.getElementById('modal-container');
    if (!container) {
      resetState();
      return;
    }

    var backdrop = container.querySelector('.modal-backdrop');
    if (!backdrop) {
      // No backdrop found, just clean up
      container.innerHTML = '';
      resetState();
      return;
    }

    // Remove modal-open and add modal-closing for fade-out
    backdrop.classList.remove('modal-open');
    backdrop.classList.add('modal-closing');

    // Wait for fade-out animation to complete
    animationTimer = setTimeout(function () {
      // Remove modal from DOM
      container.innerHTML = '';

      // Restore body scroll
      unlockBodyScroll();

      // Remove keyboard listener
      document.removeEventListener('keydown', handleKeydown);

      // Restore focus to trigger element
      if (triggerElement && typeof triggerElement.focus === 'function') {
        triggerElement.focus();
      }
      triggerElement = null;

      // Reset state
      resetState();
    }, 200); // Match CSS closing transition duration
  }

  /**
   * Reset modal state to closed/idle.
   */
  function resetState() {
    state.isOpen = false;
    state.currentProjectId = null;
    state.animating = false;
    animationTimer = null;

    // Ensure body scroll is restored
    unlockBodyScroll();

    // Ensure keyboard listener is removed
    document.removeEventListener('keydown', handleKeydown);
  }

  /**
   * Check if the modal is currently open.
   * @returns {boolean} True if modal is open
   */
  function isModalOpen() {
    return state.isOpen;
  }

  /**
   * Close modal without animation (for navigation events).
   * Immediately removes modal and resets state.
   */
  function closeModalImmediate() {
    if (!state.isOpen && !state.animating) {
      return;
    }

    // Cancel any pending animation
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }

    var container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = '';
    }

    // Restore body scroll
    unlockBodyScroll();

    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeydown);

    // Restore focus to trigger element
    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    }
    triggerElement = null;

    // Reset state
    state.isOpen = false;
    state.currentProjectId = null;
    state.animating = false;
  }

  /**
   * Get the current modal state (for external inspection/testing).
   * @returns {Object} Copy of the current state
   */
  function getState() {
    return {
      isOpen: state.isOpen,
      currentProjectId: state.currentProjectId,
      animating: state.animating
    };
  }

  // --- Public API ---
  return {
    openModal: openModal,
    closeModal: closeModal,
    closeModalImmediate: closeModalImmediate,
    isModalOpen: isModalOpen,
    renderModalContent: renderModalContent,
    getState: getState
  };
})();
