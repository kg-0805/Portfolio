/**
 * renderer.js - Section Renderer
 * 
 * Dynamically generates and renders HTML for portfolio sections. Responsible for:
 * - Rendering Home section (introduction, call-to-action)
 * - Rendering About section (skills by category, experience timeline)
 * - Rendering Projects section (project cards grid)
 * - Rendering Contact section (contact info, form)
 * - Creating reusable card components (project cards, skill cards)
 * - Populating content from JSON data
 * - Attaching event listeners to interactive elements
 * - Handling responsive layout adjustments
 * - Using safe DOM APIs (textContent) to prevent XSS
 */

const SectionRenderer = (function () {
  'use strict';

  // --- Helper Functions ---

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
   * Create a Lucide icon element.
   * @param {string} iconName - The Lucide icon name
   * @returns {HTMLElement} The icon element
   */
  function createLucideIcon(iconName) {
    var i = document.createElement('i');
    var validName = (typeof iconName === 'string' && iconName.trim() !== '') ? iconName.trim() : 'code';
    i.setAttribute('data-lucide', validName);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  /**
   * Get color classes for a given color name.
   * @param {string} color - The color name
   * @returns {Object} Color class set
   */
  function getColorClasses(color) {
    var colorMap = {
      red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', bgLight: 'bg-red-500/10', glow: 'rgba(239, 68, 68, 0.3)' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', bgLight: 'bg-orange-500/10', glow: 'rgba(249, 115, 22, 0.3)' },
      yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400', bgLight: 'bg-yellow-500/10', glow: 'rgba(234, 179, 8, 0.3)' },
      green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-400', bgLight: 'bg-green-500/10', glow: 'rgba(34, 197, 94, 0.3)' },
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', bgLight: 'bg-blue-500/10', glow: 'rgba(59, 130, 246, 0.3)' },
      indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400', bgLight: 'bg-indigo-500/10', glow: 'rgba(99, 102, 241, 0.3)' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400', bgLight: 'bg-purple-500/10', glow: 'rgba(168, 85, 247, 0.3)' },
      pink: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-400', bgLight: 'bg-pink-500/10', glow: 'rgba(236, 72, 153, 0.3)' },
      gray: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-400', bgLight: 'bg-gray-500/10', glow: 'rgba(107, 114, 128, 0.3)' },
      teal: { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-400', bgLight: 'bg-teal-500/10', glow: 'rgba(20, 184, 166, 0.3)' },
      cyan: { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-400', bgLight: 'bg-cyan-500/10', glow: 'rgba(6, 182, 212, 0.3)' }
    };
    return colorMap[color] || colorMap['blue'];
  }

  /**
   * Truncate text to a maximum length, appending ellipsis if truncated.
   * @param {string} text - The text to truncate
   * @param {number} maxLength - Maximum character length
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength) {
    if (typeof text !== 'string') {
      return '';
    }
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  // --- Section Renderers ---

  /**
   * Render the Home section.
   * Displays profile image, name, descriptive text, and call-to-action buttons.
   */
  async function renderHome() {
    var section = document.getElementById('home');
    if (!section) {
      console.error('[SectionRenderer] Home section element not found');
      return;
    }

    section.innerHTML = '';

    // --- Hero Area ---
    var heroContainer = document.createElement('div');
    heroContainer.className = 'relative flex flex-col items-center text-center py-16 md:py-24';

    // Floating geometric shapes (background decoration)
    var shapesDiv = document.createElement('div');
    shapesDiv.className = 'hero-shapes';
    shapesDiv.setAttribute('aria-hidden', 'true');
    for (var s = 0; s < 3; s++) {
      var shape = document.createElement('div');
      shape.className = 'hero-shape';
      shapesDiv.appendChild(shape);
    }
    heroContainer.appendChild(shapesDiv);

    // Profile image with gradient ring
    var profileRing = document.createElement('div');
    profileRing.className = 'profile-ring mb-8 relative z-10';
    var profileImg = document.createElement('img');
    profileImg.src = 'assets/images/profile.jpg';
    profileImg.alt = 'Kartik Gupta profile photo';
    profileImg.className = 'w-32 h-32 md:w-40 md:h-40 rounded-full object-cover';
    profileRing.appendChild(profileImg);
    heroContainer.appendChild(profileRing);

    // Name heading with gradient text
    var nameHeading = document.createElement('h1');
    nameHeading.className = 'text-4xl md:text-5xl lg:text-6xl font-bold mb-4 relative z-10 gradient-text';
    nameHeading.textContent = 'Kartik Gupta';
    heroContainer.appendChild(nameHeading);

    // Subtitle with shimmer animation
    var subtitle = document.createElement('p');
    subtitle.className = 'text-xl md:text-2xl font-semibold mb-6 relative z-10 shimmer-text';
    subtitle.textContent = 'Backend Engineer & Cloud Architect';
    heroContainer.appendChild(subtitle);

    // Description text
    var description = document.createElement('p');
    description.className = 'text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed relative z-10 mb-8';
    description.textContent = 'I engineer robust backend systems that power products at scale. From designing high-throughput APIs to orchestrating cloud infrastructure on AWS, I turn complex technical challenges into reliable, production-grade solutions.';
    heroContainer.appendChild(description);

    // CTA Buttons
    var ctaContainer = document.createElement('div');
    ctaContainer.className = 'flex flex-wrap gap-4 justify-center relative z-10';

    var projectsBtn = document.createElement('a');
    projectsBtn.href = '#projects';
    projectsBtn.setAttribute('data-section', 'projects');
    projectsBtn.className = 'btn-gradient inline-flex items-center gap-2 text-sm no-underline';
    projectsBtn.textContent = 'Explore My Work';

    var contactBtn = document.createElement('a');
    contactBtn.href = '#contact';
    contactBtn.setAttribute('data-section', 'contact');
    contactBtn.className = 'inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl border border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all no-underline';
    contactBtn.textContent = 'Say Hello';

    ctaContainer.appendChild(projectsBtn);
    ctaContainer.appendChild(contactBtn);
    heroContainer.appendChild(ctaContainer);

    section.appendChild(heroContainer);

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /**
   * Render the Stats section — key numbers at a glance.
   * Reads stats only from the JSON data source (data/stats.json); renders
   * nothing when no stats are available.
   */
  async function renderStats() {
    var section = document.getElementById('stats');
    if (!section) return;

    section.innerHTML = '';

    // Load stats from the JSON-backed data source only — no predefined fallback.
    var stats = [];
    try {
      if (typeof DataManager !== 'undefined' && DataManager.fetchStats) {
        stats = await DataManager.fetchStats();
      }
    } catch (e) {
      console.error('[SectionRenderer] Error loading stats: ' + e.message);
    }

    // If there are no stats, leave the section empty rather than showing
    // predefined placeholder numbers.
    if (!stats || stats.length === 0) {
      return;
    }

    var container = document.createElement('div');
    container.className = 'py-16 md:py-20 max-w-5xl mx-auto';

    var grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-4 gap-6';

    for (var i = 0; i < stats.length; i++) {
      var card = document.createElement('div');
      card.className = 'stat-card glass-card rounded-2xl';

      var num = document.createElement('div');
      num.className = 'stat-number';
      num.textContent = stats[i].number;

      var label = document.createElement('div');
      label.className = 'stat-label';
      label.textContent = stats[i].label;

      card.appendChild(num);
      card.appendChild(label);
      grid.appendChild(card);
    }

    container.appendChild(grid);
    section.appendChild(container);
  }

  // --- About Section Renderers ---

  /**
   * Format a date string for display.
   * @param {string} dateStr - ISO date string or "Present"
   * @returns {string} Formatted date string
   */
  function formatDate(dateStr) {
    if (dateStr === 'Present') {
      return 'Present';
    }
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var parts = dateStr.split('-');
    var year = parts[0];
    var monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return months[monthIndex] + ' ' + year;
    }
    return dateStr;
  }

  /**
   * Get proficiency color configuration.
   * @param {string} proficiency - The proficiency level
   * @returns {Object} Color and label config
   */
  function getProficiencyConfig(proficiency) {
    var configs = {
      expert: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        barColor: 'progress-gradient',
        width: '100%',
        label: 'Expert'
      },
      advanced: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        barColor: 'progress-gradient',
        width: '75%',
        label: 'Advanced'
      },
      intermediate: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        barColor: 'progress-gradient',
        width: '50%',
        label: 'Intermediate'
      }
    };
    return configs[proficiency] || configs['intermediate'];
  }

  /**
   * Validate that a skill has all required fields.
   * @param {Object} skill - The skill object to validate
   * @returns {boolean} True if skill has all required fields
   */
  function isValidSkillForRendering(skill) {
    if (!skill || typeof skill !== 'object') return false;
    if (typeof skill.name !== 'string' || skill.name.trim() === '') return false;
    if (typeof skill.proficiency !== 'string' || skill.proficiency.trim() === '') return false;
    if (typeof skill.yearsOfExperience !== 'number' || skill.yearsOfExperience < 0) return false;
    return true;
  }

  /**
   * Create a single skill card element (modern chip/pill style).
   * @param {Object} skill - The skill data object
   * @returns {HTMLElement} The skill card element
   */
  function createSkillCard(skill) {
    var card = document.createElement('div');
    card.className = 'skill-card glass-card rounded-2xl p-5 hover-glow';

    // Header row: icon + name
    var header = document.createElement('div');
    header.className = 'flex items-center gap-3';

    var iconWrapper = document.createElement('div');
    iconWrapper.className = 'w-9 h-9 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400';
    var icon = createLucideIcon(skill.icon);
    icon.className = 'w-4 h-4';
    iconWrapper.appendChild(icon);

    var nameEl = document.createElement('h4');
    nameEl.className = 'text-sm font-semibold text-gray-900 flex-1';
    nameEl.textContent = skill.name;

    header.appendChild(iconWrapper);
    header.appendChild(nameEl);
    card.appendChild(header);

    return card;
  }

  /**
   * Render the skills subsection grouped by category.
   * @param {Array} skills - Array of validated skill objects
   * @returns {HTMLElement} The skills container element
   */
  function renderSkills(skills) {
    var container = document.createElement('div');
    container.className = 'mb-16';

    var heading = document.createElement('h3');
    heading.className = 'text-xl md:text-2xl font-bold text-gray-900 mb-2';
    heading.textContent = 'Skills & Expertise';
    container.appendChild(heading);

    var headingSub = document.createElement('p');
    headingSub.className = 'text-gray-500 mb-8';
    headingSub.textContent = 'The tools and platforms I rely on to deliver production systems';
    container.appendChild(headingSub);

    var validSkills = skills.filter(isValidSkillForRendering);

    if (validSkills.length === 0) {
      var emptyState = document.createElement('div');
      emptyState.className = 'text-center py-8 glass-card rounded-2xl';
      var emptyIcon = createLucideIcon('info');
      emptyIcon.className = 'w-8 h-8 mx-auto mb-3 text-gray-400';
      emptyState.appendChild(emptyIcon);
      var emptyText = document.createElement('p');
      emptyText.className = 'text-gray-500';
      emptyText.textContent = 'Skills information is currently unavailable.';
      emptyState.appendChild(emptyText);
      container.appendChild(emptyState);
      return container;
    }

    // Group skills by category
    var categories = {};
    var categoryOrder = ['backend', 'cloud', 'database', 'tools'];
    var categoryIcons = { backend: 'code-2', cloud: 'cloud', database: 'database', tools: 'wrench' };

    for (var i = 0; i < validSkills.length; i++) {
      var skill = validSkills[i];
      var cat = skill.category;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(skill);
    }

    for (var c = 0; c < categoryOrder.length; c++) {
      var categoryName = categoryOrder[c];
      var categorySkills = categories[categoryName];
      if (!categorySkills || categorySkills.length === 0) continue;

      var categoryGroup = document.createElement('div');
      categoryGroup.className = 'mb-8';

      var catHeader = document.createElement('div');
      catHeader.className = 'flex items-center gap-2 mb-4';
      var catIcon = createLucideIcon(categoryIcons[categoryName] || 'code');
      catIcon.className = 'w-4 h-4 text-purple-400';
      catHeader.appendChild(catIcon);
      var catHeading = document.createElement('h4');
      catHeading.className = 'text-base font-semibold text-gray-700 capitalize';
      catHeading.textContent = categoryName;
      catHeader.appendChild(catHeading);
      categoryGroup.appendChild(catHeader);

      var grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

      for (var sk = 0; sk < categorySkills.length; sk++) {
        var card = createSkillCard(categorySkills[sk]);
        grid.appendChild(card);
      }

      categoryGroup.appendChild(grid);
      container.appendChild(categoryGroup);
    }

    return container;
  }

  /**
   * Validate that an experience entry has all required fields.
   * @param {Object} entry - The experience entry to validate
   * @returns {boolean} True if entry has all required fields
   */
  function isValidExperienceForRendering(entry) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.title !== 'string' || entry.title.trim() === '') return false;
    if (typeof entry.company !== 'string' || entry.company.trim() === '') return false;
    if (typeof entry.startDate !== 'string' || entry.startDate.trim() === '') return false;
    if (typeof entry.endDate !== 'string' || entry.endDate.trim() === '') return false;
    return true;
  }

  /**
   * Render the experience subsection as a vertical timeline with glowing dots.
   * @param {Array} experience - Array of validated experience objects
   * @returns {HTMLElement} The experience container element
   */
  function renderExperience(experience) {
    var container = document.createElement('div');
    container.className = 'mb-12';

    var heading = document.createElement('h3');
    heading.className = 'text-xl md:text-2xl font-bold text-gray-900 mb-2';
    heading.textContent = 'Work Experience';
    container.appendChild(heading);

    var headingSub = document.createElement('p');
    headingSub.className = 'text-gray-500 mb-8';
    headingSub.textContent = 'Where I\'ve applied my craft over the years';
    container.appendChild(headingSub);

    var validEntries = experience.filter(isValidExperienceForRendering);

    if (validEntries.length === 0) {
      var emptyState = document.createElement('div');
      emptyState.className = 'text-center py-8 glass-card rounded-2xl';
      var emptyIcon = createLucideIcon('info');
      emptyIcon.className = 'w-8 h-8 mx-auto mb-3 text-gray-400';
      emptyState.appendChild(emptyIcon);
      var emptyText = document.createElement('p');
      emptyText.className = 'text-gray-500';
      emptyText.textContent = 'Experience information is currently unavailable.';
      emptyState.appendChild(emptyText);
      container.appendChild(emptyState);
      return container;
    }

    validEntries.sort(function (a, b) {
      return b.startDate.localeCompare(a.startDate);
    });

    // Timeline container
    var timeline = document.createElement('div');
    timeline.className = 'relative pl-0 md:pl-10';

    // Gradient timeline line
    var timelineLine = document.createElement('div');
    timelineLine.className = 'timeline-line left-[6px] md:left-[10px]';
    timelineLine.setAttribute('aria-hidden', 'true');
    timeline.appendChild(timelineLine);

    for (var i = 0; i < validEntries.length; i++) {
      var entry = validEntries[i];

      var entryEl = document.createElement('div');
      entryEl.className = 'relative pb-10' + (i === validEntries.length - 1 ? ' pb-0' : '');

      // Glowing timeline dot
      var dot = document.createElement('div');
      dot.className = 'timeline-dot -left-[21px] md:-left-[17px] top-1';
      dot.setAttribute('aria-hidden', 'true');
      entryEl.appendChild(dot);

      // Entry card (glassmorphism)
      var card = document.createElement('div');
      card.className = 'glass-card rounded-2xl p-6';

      var titleEl = document.createElement('h4');
      titleEl.className = 'text-lg font-semibold text-gray-900';
      titleEl.textContent = entry.title;
      card.appendChild(titleEl);

      var companyEl = document.createElement('p');
      companyEl.className = 'text-purple-600 font-medium mt-0.5';
      companyEl.textContent = entry.company;
      card.appendChild(companyEl);

      var dateEl = document.createElement('p');
      dateEl.className = 'text-sm text-gray-500 mt-1 flex items-center gap-1';
      dateEl.textContent = formatDate(entry.startDate) + ' — ' + formatDate(entry.endDate);
      card.appendChild(dateEl);

      if (entry.description && typeof entry.description === 'string' && entry.description.trim() !== '') {
        var descEl = document.createElement('p');
        descEl.className = 'text-sm text-gray-600 mt-3 leading-relaxed';
        descEl.textContent = entry.description;
        card.appendChild(descEl);
      }

      if (Array.isArray(entry.achievements) && entry.achievements.length > 0) {
        var achievementsHeading = document.createElement('p');
        achievementsHeading.className = 'text-sm font-medium text-gray-700 mt-4 mb-2';
        achievementsHeading.textContent = 'Key Achievements';
        card.appendChild(achievementsHeading);

        var achievementsList = document.createElement('ul');
        achievementsList.className = 'space-y-1.5';

        for (var j = 0; j < entry.achievements.length; j++) {
          var li = document.createElement('li');
          li.className = 'text-sm text-gray-600 flex items-start gap-2';
          var bullet = document.createElement('span');
          bullet.className = 'inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0';
          bullet.setAttribute('aria-hidden', 'true');
          li.appendChild(bullet);
          var liText = document.createElement('span');
          liText.textContent = entry.achievements[j];
          li.appendChild(liText);
          achievementsList.appendChild(li);
        }
        card.appendChild(achievementsList);
      }

      entryEl.appendChild(card);
      timeline.appendChild(entryEl);
    }

    container.appendChild(timeline);
    return container;
  }

  /**
   * Render the About section.
   */
  async function renderAbout() {
    var section = document.getElementById('about');
    if (!section) {
      console.error('[SectionRenderer] About section element not found');
      return;
    }

    section.innerHTML = '';

    var container = document.createElement('div');
    container.className = 'py-12 md:py-16 max-w-6xl mx-auto';

    var pageHeading = document.createElement('h2');
    pageHeading.className = 'text-3xl md:text-4xl font-bold text-center mb-2 gradient-text';
    pageHeading.textContent = 'About Me';
    container.appendChild(pageHeading);

    var pageSubtitle = document.createElement('p');
    pageSubtitle.className = 'text-gray-500 text-center mb-12';
    pageSubtitle.textContent = 'A closer look at what I bring to the table';
    container.appendChild(pageSubtitle);

    var skills = [];
    var experience = [];

    try {
      skills = await DataManager.fetchSkills();
    } catch (error) {
      console.error('[SectionRenderer] Error loading skills: ' + error.message);
    }

    try {
      experience = await DataManager.fetchExperience();
    } catch (error) {
      console.error('[SectionRenderer] Error loading experience: ' + error.message);
    }

    var skillsSection = renderSkills(skills);
    container.appendChild(skillsSection);

    var experienceSection = renderExperience(experience);
    container.appendChild(experienceSection);

    section.appendChild(container);

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /**
   * Create a project card element for the projects grid (bento style).
   * @param {Object} project - The project data object
   * @param {number} index - The index for bento sizing
   * @returns {HTMLElement|null} The card element, or null if project is invalid
   */
  function createProjectCard(project, index) {
    if (!project || !project.id || !project.title || typeof project.title !== 'string' || project.title.trim() === '') {
      return null;
    }

    var colors = getColorClasses(project.color);

    var card = document.createElement('div');
    card.className = 'project-card project-card-modern glass-card group cursor-pointer rounded-2xl p-6 flex flex-col h-full';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View details for ' + project.title);
    card.setAttribute('data-project-id', project.id);

    card.addEventListener('click', function () {
      if (typeof ModalSystem !== 'undefined' && ModalSystem.openModal) {
        ModalSystem.openModal(project.id);
      }
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof ModalSystem !== 'undefined' && ModalSystem.openModal) {
          ModalSystem.openModal(project.id);
        }
      }
    });

    // Color accent glow (top bar)
    var accentBar = document.createElement('div');
    accentBar.className = 'w-12 h-1 rounded-full mb-4 ' + colors.bg;
    accentBar.style.boxShadow = '0 0 10px ' + colors.glow;
    card.appendChild(accentBar);

    // Card header with icon
    var cardHeader = document.createElement('div');
    cardHeader.className = 'flex items-center gap-3 mb-4';

    var iconWrapper = document.createElement('div');
    iconWrapper.className = 'w-11 h-11 flex items-center justify-center rounded-xl ' + colors.bgLight + ' ' + colors.text;
    var icon = createLucideIcon(project.icon);
    icon.className = 'w-5 h-5';
    iconWrapper.appendChild(icon);

    var cardTitle = document.createElement('h3');
    cardTitle.className = 'text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors';
    cardTitle.textContent = project.title;

    cardHeader.appendChild(iconWrapper);
    cardHeader.appendChild(cardTitle);
    card.appendChild(cardHeader);

    // Description
    var descEl = document.createElement('p');
    descEl.className = 'text-sm text-gray-600 mb-4 flex-grow leading-relaxed';
    descEl.textContent = truncateText(project.description || '', 150);
    card.appendChild(descEl);

    // Status badge
    if (project.status) {
      var statusBadge = document.createElement('span');
      var statusColors = {
        'public': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'private': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'confidential': 'bg-red-500/10 text-red-400 border-red-500/20',
        'professional': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      };
      statusBadge.className = 'inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border mb-4 ' + (statusColors[project.status] || statusColors['private']);
      statusBadge.textContent = project.status.charAt(0).toUpperCase() + project.status.slice(1);
      card.appendChild(statusBadge);
    }

    // Technologies
    if (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) {
      var techContainer = document.createElement('div');
      techContainer.className = 'flex flex-wrap gap-2 mt-auto';

      var maxTags = Math.min(project.technologies.length, 5);
      for (var j = 0; j < maxTags; j++) {
        var tag = document.createElement('span');
        tag.className = 'tech-tag inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200';
        tag.textContent = project.technologies[j];
        techContainer.appendChild(tag);
      }

      if (project.technologies.length > 5) {
        var moreTag = document.createElement('span');
        moreTag.className = 'inline-block px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-500';
        moreTag.textContent = '+' + (project.technologies.length - 5) + ' more';
        techContainer.appendChild(moreTag);
      }

      card.appendChild(techContainer);
    }

    return card;
  }

  /**
   * Render the Projects section with bento grid layout.
   */
  async function renderProjects() {
    var section = document.getElementById('projects');
    if (!section) {
      console.error('[SectionRenderer] Projects section element not found');
      return;
    }

    section.innerHTML = '';

    var container = document.createElement('div');
    container.className = 'py-12 md:py-16 max-w-6xl mx-auto';

    var pageHeading = document.createElement('h2');
    pageHeading.className = 'text-3xl md:text-4xl font-bold text-center mb-2 gradient-text';
    pageHeading.textContent = 'Projects';
    container.appendChild(pageHeading);

    var pageSubtitle = document.createElement('p');
    pageSubtitle.className = 'text-gray-500 text-center mb-10';
    pageSubtitle.textContent = 'Systems I\'ve architected, built, and shipped to production';
    container.appendChild(pageSubtitle);

    var projects = [];
    try {
      projects = await DataManager.fetchProjects();
    } catch (error) {
      console.error('[SectionRenderer] Error loading projects: ' + error.message);
    }

    projects.sort(function (a, b) {
      var orderA = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
      var orderB = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    var validCards = [];
    for (var i = 0; i < projects.length; i++) {
      var card = createProjectCard(projects[i], i);
      if (card) {
        card.classList.add('animate-fade-in-up', 'animate-delay-' + Math.min(i + 1, 6));
        validCards.push(card);
      }
    }

    if (validCards.length === 0) {
      var emptyState = document.createElement('div');
      emptyState.className = 'text-center py-12 glass-card rounded-2xl';
      var emptyIcon = createLucideIcon('folder-open');
      emptyIcon.className = 'w-12 h-12 mx-auto mb-4 text-gray-400';
      emptyState.appendChild(emptyIcon);
      var emptyText = document.createElement('p');
      emptyText.className = 'text-gray-500 text-lg';
      emptyText.textContent = 'No projects are currently available.';
      emptyState.appendChild(emptyText);
      container.appendChild(emptyState);
    } else {
      var grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

      for (var g = 0; g < validCards.length; g++) {
        grid.appendChild(validCards[g]);
      }
      container.appendChild(grid);
    }

    section.appendChild(container);

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  /**
   * Render the Contact section with split layout and gradient panel.
   */
  async function renderContact() {
    var section = document.getElementById('contact');
    if (!section) {
      console.error('[SectionRenderer] Contact section element not found');
      return;
    }

    section.innerHTML = '';

    var contactInfo = {
      email: 'contact@kartikgupta.in',
      linkedin: 'https://linkedin.com/in/kg-0805',
      github: 'https://github.com/kg-0805'
    };

    var hasContactInfo = contactInfo.email || contactInfo.linkedin || contactInfo.github;

    var container = document.createElement('div');
    container.className = 'py-12 md:py-16 max-w-5xl mx-auto';

    var pageHeading = document.createElement('h2');
    pageHeading.className = 'text-3xl md:text-4xl font-bold text-center mb-2 gradient-text';
    pageHeading.textContent = 'Get In Touch';
    container.appendChild(pageHeading);

    var subtitle = document.createElement('p');
    subtitle.className = 'text-gray-500 text-center mb-4';
    subtitle.textContent = "Have a project in mind? I'd love to hear about it";
    subtitle.className = 'text-gray-500 text-center mb-10';
    container.appendChild(subtitle);

    if (!hasContactInfo) {
      var unavailable = document.createElement('div');
      unavailable.className = 'text-center py-12 glass-card rounded-2xl';
      var unavailableIcon = createLucideIcon('info');
      unavailableIcon.className = 'w-12 h-12 mx-auto mb-4 text-gray-400';
      unavailable.appendChild(unavailableIcon);
      var unavailableText = document.createElement('p');
      unavailableText.className = 'text-gray-500 text-lg';
      unavailableText.textContent = 'Contact information is currently unavailable.';
      unavailable.appendChild(unavailableText);
      container.appendChild(unavailable);
      section.appendChild(container);
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
      return;
    }

    // Grid layout: gradient panel on left, form on right
    var grid = document.createElement('div');
    grid.className = 'grid md:grid-cols-5 gap-8';

    // --- Left: Gradient Contact Panel ---
    var leftPanel = document.createElement('div');
    leftPanel.className = 'md:col-span-2 contact-gradient-panel flex flex-col justify-between';

    var panelContent = document.createElement('div');

    var panelTitle = document.createElement('h3');
    panelTitle.className = 'text-2xl font-bold text-white mb-3';
    panelTitle.textContent = "Let's Build Something";
    panelContent.appendChild(panelTitle);

    var panelDesc = document.createElement('p');
    panelDesc.className = 'text-white/80 text-sm leading-relaxed mb-6';
    panelDesc.textContent = "Whether it's a new API, a cloud migration, or scaling an existing system — I'm always up for a good engineering challenge.";
    panelContent.appendChild(panelDesc);

    // Contact details list with icons
    var contactDetails = document.createElement('div');
    contactDetails.className = 'space-y-4 mb-6';

    // Email detail
    if (contactInfo.email) {
      var emailRow = document.createElement('div');
      emailRow.className = 'flex items-center gap-3';
      var emailIconWrap = document.createElement('div');
      emailIconWrap.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-white/10';
      emailIconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
      var emailText = document.createElement('span');
      emailText.className = 'text-white/90 text-sm';
      emailText.textContent = contactInfo.email;
      emailRow.appendChild(emailIconWrap);
      emailRow.appendChild(emailText);
      contactDetails.appendChild(emailRow);
    }

    // Location detail
    var locationRow = document.createElement('div');
    locationRow.className = 'flex items-center gap-3';
    var locationIconWrap = document.createElement('div');
    locationIconWrap.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-white/10';
    locationIconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
    var locationText = document.createElement('span');
    locationText.className = 'text-white/90 text-sm';
    locationText.textContent = 'India';
    locationRow.appendChild(locationIconWrap);
    locationRow.appendChild(locationText);
    contactDetails.appendChild(locationRow);

    // Availability detail
    var availRow = document.createElement('div');
    availRow.className = 'flex items-center gap-3';
    var availIconWrap = document.createElement('div');
    availIconWrap.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-white/10';
    availIconWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    var availText = document.createElement('span');
    availText.className = 'text-white/90 text-sm';
    availText.textContent = 'Usually responds within 24 hours';
    availRow.appendChild(availIconWrap);
    availRow.appendChild(availText);
    contactDetails.appendChild(availRow);

    panelContent.appendChild(contactDetails);

    // Divider
    var divider = document.createElement('div');
    divider.className = 'w-full h-px bg-white/20 mb-6';
    divider.setAttribute('aria-hidden', 'true');
    panelContent.appendChild(divider);

    // Quick note
    var quickNote = document.createElement('p');
    quickNote.className = 'text-white/60 text-xs leading-relaxed';
    quickNote.textContent = 'Open to freelance projects, consulting, and full-time opportunities in backend engineering and cloud architecture.';
    panelContent.appendChild(quickNote);

    leftPanel.appendChild(panelContent);

    // Social icon circles
    var socialContainer = document.createElement('div');
    socialContainer.className = 'flex gap-3 mt-6';

    if (contactInfo.email) {
      var emailCircle = document.createElement('a');
      emailCircle.href = 'mailto:' + contactInfo.email;
      emailCircle.className = 'social-icon-circle bg-white/10 text-white hover:bg-white/20';
      emailCircle.setAttribute('aria-label', 'Send email to ' + contactInfo.email);
      emailCircle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
      socialContainer.appendChild(emailCircle);
    }

    if (contactInfo.linkedin && isValidUrl(contactInfo.linkedin)) {
      var linkedinCircle = document.createElement('a');
      linkedinCircle.href = contactInfo.linkedin;
      linkedinCircle.target = '_blank';
      linkedinCircle.rel = 'noopener noreferrer';
      linkedinCircle.className = 'social-icon-circle bg-white/10 text-white hover:bg-white/20';
      linkedinCircle.setAttribute('aria-label', 'Visit LinkedIn profile (opens in new tab)');
      linkedinCircle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>';
      socialContainer.appendChild(linkedinCircle);
    }

    if (contactInfo.github && isValidUrl(contactInfo.github)) {
      var githubCircle = document.createElement('a');
      githubCircle.href = contactInfo.github;
      githubCircle.target = '_blank';
      githubCircle.rel = 'noopener noreferrer';
      githubCircle.className = 'social-icon-circle bg-white/10 text-white hover:bg-white/20';
      githubCircle.setAttribute('aria-label', 'Visit GitHub profile (opens in new tab)');
      githubCircle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>';
      socialContainer.appendChild(githubCircle);
    }

    leftPanel.appendChild(socialContainer);
    grid.appendChild(leftPanel);

    // --- Right: Contact Form ---
    var formColumn = document.createElement('div');
    formColumn.className = 'md:col-span-3 glass-card rounded-2xl p-6 md:p-8';

    var formHeading = document.createElement('h3');
    formHeading.className = 'text-xl font-semibold text-gray-900 mb-6';
    formHeading.textContent = 'Drop Me a Line';
    formColumn.appendChild(formHeading);

    var form = document.createElement('form');
    form.id = 'contactForm';
    form.className = 'space-y-5';
    form.setAttribute('novalidate', '');

    // Name field
    var nameGroup = document.createElement('div');
    nameGroup.className = 'form-group-modern';
    var nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'contact-name');
    nameLabel.className = 'block text-sm font-medium text-gray-700 mb-2';
    nameLabel.textContent = 'Name';
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'contact-name';
    nameInput.name = 'name';
    nameInput.required = true;
    nameInput.className = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[44px]';
    nameInput.placeholder = 'Your name';
    nameInput.setAttribute('aria-required', 'true');
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // Email field
    var emailGroup = document.createElement('div');
    emailGroup.className = 'form-group-modern';
    var emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'contact-email');
    emailLabel.className = 'block text-sm font-medium text-gray-700 mb-2';
    emailLabel.textContent = 'Email';
    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'contact-email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.className = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[44px]';
    emailInput.placeholder = 'your.email@example.com';
    emailInput.setAttribute('aria-required', 'true');
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    // Subject field
    var subjectGroup = document.createElement('div');
    subjectGroup.className = 'form-group-modern';
    var subjectLabel = document.createElement('label');
    subjectLabel.setAttribute('for', 'contact-subject');
    subjectLabel.className = 'block text-sm font-medium text-gray-700 mb-2';
    subjectLabel.textContent = 'Subject';
    var subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.id = 'contact-subject';
    subjectInput.name = 'subject';
    subjectInput.required = true;
    subjectInput.className = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[44px]';
    subjectInput.placeholder = "What's this about?";
    subjectInput.setAttribute('aria-required', 'true');
    subjectGroup.appendChild(subjectLabel);
    subjectGroup.appendChild(subjectInput);
    form.appendChild(subjectGroup);

    // Message field
    var messageGroup = document.createElement('div');
    messageGroup.className = 'form-group-modern';
    var messageLabel = document.createElement('label');
    messageLabel.setAttribute('for', 'contact-message');
    messageLabel.className = 'block text-sm font-medium text-gray-700 mb-2';
    messageLabel.textContent = 'Message';
    var messageInput = document.createElement('textarea');
    messageInput.id = 'contact-message';
    messageInput.name = 'message';
    messageInput.rows = 4;
    messageInput.required = true;
    messageInput.className = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[100px] resize-y';
    messageInput.placeholder = 'Your message...';
    messageInput.setAttribute('aria-required', 'true');
    messageGroup.appendChild(messageLabel);
    messageGroup.appendChild(messageInput);
    form.appendChild(messageGroup);

    // Submit button (gradient)
    var submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-gradient w-full text-center min-h-[44px] min-w-[44px]';
    submitBtn.textContent = 'Send It Over';
    form.appendChild(submitBtn);

    formColumn.appendChild(form);

    // Confirmation message container
    var confirmationMsg = document.createElement('div');
    confirmationMsg.id = 'contact-form-message';
    confirmationMsg.className = 'mt-4 text-center hidden';
    confirmationMsg.setAttribute('role', 'status');
    confirmationMsg.setAttribute('aria-live', 'polite');
    formColumn.appendChild(confirmationMsg);

    grid.appendChild(formColumn);
    container.appendChild(grid);
    section.appendChild(container);

    // --- Form Submit Handler ---
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var subject = subjectInput.value.trim();
      var message = messageInput.value.trim();

      // Clear previous error states
      var inputs = [nameInput, emailInput, subjectInput, messageInput];
      inputs.forEach(function(input) {
        input.classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
        var errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();
      });

      // Validate all fields are filled
      var hasError = false;
      var fields = [
        { input: nameInput, value: name, label: 'Name is required' },
        { input: emailInput, value: email, label: 'Email is required' },
        { input: subjectInput, value: subject, label: 'Subject is required' },
        { input: messageInput, value: message, label: 'Message is required' }
      ];

      fields.forEach(function(field) {
        if (!field.value) {
          hasError = true;
          field.input.classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
          var errorMsg = document.createElement('p');
          errorMsg.className = 'field-error text-red-500 text-xs mt-1';
          errorMsg.textContent = field.label;
          field.input.parentElement.appendChild(errorMsg);
        }
      });

      // Validate email format
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        hasError = true;
        emailInput.classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
        var existingError = emailInput.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();
        var emailError = document.createElement('p');
        emailError.className = 'field-error text-red-500 text-xs mt-1';
        emailError.textContent = 'Please enter a valid email address';
        emailInput.parentElement.appendChild(emailError);
      }

      if (hasError) return;

      // Submit via Web3Forms API
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var formData = new FormData();
      formData.append('access_key', '5ff54038-93e3-410e-9ddf-e733c779bc7a');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('from_name', 'Portfolio Contact Form');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send It Over';

        if (data.success) {
          confirmationMsg.className = 'mt-4 text-center text-emerald-500 font-medium p-3 bg-emerald-500/10 rounded-xl';
          confirmationMsg.textContent = 'Message sent successfully! I\'ll get back to you soon.';
          form.reset();
        } else {
          confirmationMsg.className = 'mt-4 text-center text-red-500 font-medium p-3 bg-red-500/10 rounded-xl';
          confirmationMsg.textContent = 'Something went wrong. Please try again or email me directly.';
        }

        setTimeout(function () {
          confirmationMsg.className = 'mt-4 text-center hidden';
          confirmationMsg.textContent = '';
        }, 5000);
      })
      .catch(function(error) {
        console.error('[Contact] Form submission error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send It Over';
        confirmationMsg.className = 'mt-4 text-center text-red-500 font-medium p-3 bg-red-500/10 rounded-xl';
        confirmationMsg.textContent = 'Network error. Please check your connection and try again.';

        setTimeout(function () {
          confirmationMsg.className = 'mt-4 text-center hidden';
          confirmationMsg.textContent = '';
        }, 5000);
      });
    });

    // Clear error state on input
    [nameInput, emailInput, subjectInput, messageInput].forEach(function(input) {
      input.addEventListener('input', function() {
        input.classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
        var errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.remove();
      });
    });

    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // --- Public API ---
  return {
    renderHome: renderHome,
    renderStats: renderStats,
    renderAbout: renderAbout,
    renderProjects: renderProjects,
    renderContact: renderContact
  };
})();
