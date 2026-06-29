/**
 * data-manager.js - Data Manager
 * 
 * Fetches, validates, and caches JSON data. Responsible for:
 * - Fetching projects.json, skills.json, and experience.json from /data/
 * - Caching fetched data in memory to avoid repeated network requests
 * - Validating data against defined schemas before use
 * - Providing accessor methods (getProjectById, getCachedData)
 * - Handling fetch errors gracefully (logging, fallback to cache or empty array)
 * - Supporting parallel data fetching on initialization
 * - Providing retry mechanism for failed fetches
 */

const DataManager = (function () {
  'use strict';

  // In-memory cache for fetched data
  const cache = {};

  // --- Validation ---

  // Predefined valid Tailwind color names
  const VALID_COLORS = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
    'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink',
    'rose', 'gray', 'slate', 'zinc', 'neutral', 'stone'
  ];

  // Valid project statuses
  const VALID_STATUSES = ['public', 'private', 'confidential'];

  /**
   * Check if a string is a valid URL with http or https protocol.
   * @param {string} str - The string to validate
   * @returns {boolean} True if valid http/https URL
   */
  function isValidUrl(str) {
    if (typeof str !== 'string') {
      return false;
    }
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      return false;
    }
    try {
      var url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /**
   * Validate projects data structure.
   * Validates each project against required schema rules and returns only valid projects.
   * Logs specific errors for each validation failure.
   * @param {Array} data - Raw projects array
   * @returns {Array} Validated projects array (only valid projects)
   */
  function validateProjects(data) {
    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error('[DataManager] Projects validation failed: data is not an array');
      return [];
    }

    var validProjects = [];
    var seenIds = {};

    for (var i = 0; i < data.length; i++) {
      var project = data[i];
      var identifier = (project && typeof project.id === 'string' && project.id.trim() !== '')
        ? project.id
        : 'index ' + i;
      var isValid = true;

      // Check that project is an object
      if (!project || typeof project !== 'object' || Array.isArray(project)) {
        console.error('[DataManager] Project (' + identifier + '): invalid project object');
        continue;
      }

      // Validate id: non-empty string
      if (typeof project.id !== 'string' || project.id.trim() === '') {
        console.error('[DataManager] Project (' + identifier + '): id must be a non-empty string');
        isValid = false;
      }

      // Validate id uniqueness (only if id is valid)
      if (isValid && seenIds[project.id]) {
        console.error('[DataManager] Project (' + identifier + '): duplicate id, keeping first occurrence only');
        continue;
      }

      // Validate title: 1-200 characters with at least 1 non-whitespace character
      if (typeof project.title !== 'string' || project.title.length === 0 || project.title.length > 200 || project.title.trim() === '') {
        console.error('[DataManager] Project (' + identifier + '): title must be 1-200 characters with at least 1 non-whitespace character');
        isValid = false;
      }

      // Validate technologies: array with 1-50 items
      if (!Array.isArray(project.technologies) || project.technologies.length < 1 || project.technologies.length > 50) {
        console.error('[DataManager] Project (' + identifier + '): technologies must be an array with 1-50 items');
        isValid = false;
      }

      // Validate color: must match predefined Tailwind color names
      if (typeof project.color !== 'string' || VALID_COLORS.indexOf(project.color) === -1) {
        console.error('[DataManager] Project (' + identifier + '): color must be a valid Tailwind color name');
        isValid = false;
      }

      // Validate status: must be one of the valid statuses
      if (typeof project.status !== 'string' || VALID_STATUSES.indexOf(project.status) === -1) {
        console.error('[DataManager] Project (' + identifier + '): status must be one of: "public", "private", "confidential"');
        isValid = false;
      }

      // Validate links: object with at least one entry with valid http/https URL
      if (!project.links || typeof project.links !== 'object' || Array.isArray(project.links)) {
        console.error('[DataManager] Project (' + identifier + '): links must be an object with at least one valid URL entry');
        isValid = false;
      } else {
        var linkKeys = Object.keys(project.links);
        var hasValidUrl = false;
        for (var j = 0; j < linkKeys.length; j++) {
          if (isValidUrl(project.links[linkKeys[j]])) {
            hasValidUrl = true;
            break;
          }
        }
        if (!hasValidUrl) {
          console.error('[DataManager] Project (' + identifier + '): links must contain at least one entry with a valid http/https URL');
          isValid = false;
        }
      }

      // If all validations passed, add to valid projects and track the id
      if (isValid) {
        seenIds[project.id] = true;
        validProjects.push(project);
      }
    }

    return validProjects;
  }

  /**
   * Validate skills data structure.
   * Validates each skill against the defined schema and excludes invalid entries.
   * @param {Array} data - Raw skills array
   * @returns {Array} Validated skills array (only valid skills included)
   */
  function validateSkills(data) {
    if (!Array.isArray(data)) {
      console.error('[DataManager] Skills validation failed: data is not an array');
      return [];
    }

    var validCategories = ['backend', 'cloud', 'database', 'tools'];
    var validProficiencies = ['expert', 'advanced', 'intermediate'];
    var seenIds = {};
    var validSkills = [];

    for (var i = 0; i < data.length; i++) {
      var skill = data[i];
      var identifier = (skill && skill.id) ? skill.id : 'index ' + i;
      var isValid = true;

      // Validate id: non-empty string, unique
      if (typeof skill.id !== 'string' || skill.id.length === 0) {
        console.error('[DataManager] Skill (' + identifier + '): id must be a non-empty string');
        isValid = false;
      } else if (seenIds[skill.id]) {
        console.error('[DataManager] Skill (' + identifier + '): duplicate id');
        isValid = false;
      }

      // Validate name: string, 1-100 characters
      if (typeof skill.name !== 'string' || skill.name.length < 1 || skill.name.length > 100) {
        console.error('[DataManager] Skill (' + identifier + '): name must be a string between 1 and 100 characters');
        isValid = false;
      }

      // Validate category: one of valid categories
      if (validCategories.indexOf(skill.category) === -1) {
        console.error('[DataManager] Skill (' + identifier + '): category must be one of: ' + validCategories.join(', '));
        isValid = false;
      }

      // Validate proficiency: one of valid proficiencies
      if (validProficiencies.indexOf(skill.proficiency) === -1) {
        console.error('[DataManager] Skill (' + identifier + '): proficiency must be one of: ' + validProficiencies.join(', '));
        isValid = false;
      }

      // Validate yearsOfExperience: integer between 1 and 50 inclusive
      if (typeof skill.yearsOfExperience !== 'number' ||
          !Number.isInteger(skill.yearsOfExperience) ||
          skill.yearsOfExperience < 1 ||
          skill.yearsOfExperience > 50) {
        console.error('[DataManager] Skill (' + identifier + '): yearsOfExperience must be an integer between 1 and 50');
        isValid = false;
      }

      if (isValid) {
        seenIds[skill.id] = true;
        validSkills.push(skill);
      }
    }

    return validSkills;
  }

  /**
   * Validate experience data structure.
   * Validates each experience entry against the defined schema:
   * - id: non-empty string, unique
   * - title: string, 1-100 characters
   * - company: string, 1-100 characters
   * - startDate: valid ISO 8601 date (YYYY-MM-DD), must be a real date
   * - endDate: valid ISO 8601 date (YYYY-MM-DD) or "Present"
   * - endDate >= startDate when endDate is not "Present"
   * - achievements: array with 1-20 items, each string 1-500 characters
   * @param {Array} data - Raw experience array
   * @returns {Array} Validated experience array (only valid entries)
   */
  function validateExperience(data) {
    if (!Array.isArray(data)) {
      console.error('[DataManager] Experience data is not an array');
      return [];
    }

    var seenIds = {};
    var validEntries = [];

    for (var i = 0; i < data.length; i++) {
      var entry = data[i];
      var entryId = (entry && typeof entry.id === 'string' && entry.id.length > 0) ? entry.id : 'index ' + i;
      var isValid = true;

      // Validate id: non-empty string, unique
      if (!entry || typeof entry.id !== 'string' || entry.id.length === 0) {
        console.error('[DataManager] Experience entry (' + entryId + '): id must be a non-empty string');
        isValid = false;
      } else if (seenIds[entry.id]) {
        console.error('[DataManager] Experience entry (' + entryId + '): duplicate id');
        isValid = false;
      }

      // Validate title: string, 1-100 characters
      if (isValid && (typeof entry.title !== 'string' || entry.title.length < 1 || entry.title.length > 100)) {
        console.error('[DataManager] Experience entry (' + entryId + '): title must be a string between 1 and 100 characters');
        isValid = false;
      }

      // Validate company: string, 1-100 characters
      if (isValid && (typeof entry.company !== 'string' || entry.company.length < 1 || entry.company.length > 100)) {
        console.error('[DataManager] Experience entry (' + entryId + '): company must be a string between 1 and 100 characters');
        isValid = false;
      }

      // Validate startDate: valid ISO 8601 date (YYYY-MM-DD), must be a real date
      if (isValid && !isValidISODate(entry.startDate)) {
        console.error('[DataManager] Experience entry (' + entryId + '): startDate must be a valid ISO 8601 date (YYYY-MM-DD)');
        isValid = false;
      }

      // Validate endDate: valid ISO 8601 date (YYYY-MM-DD) or "Present"
      if (isValid) {
        if (entry.endDate !== 'Present' && !isValidISODate(entry.endDate)) {
          console.error('[DataManager] Experience entry (' + entryId + '): endDate must be a valid ISO 8601 date (YYYY-MM-DD) or "Present"');
          isValid = false;
        }
      }

      // Validate endDate >= startDate when endDate is not "Present"
      if (isValid && entry.endDate !== 'Present') {
        if (entry.endDate < entry.startDate) {
          console.error('[DataManager] Experience entry (' + entryId + '): endDate must be greater than or equal to startDate');
          isValid = false;
        }
      }

      // Validate achievements: array with 1-20 items, each string 1-500 characters
      if (isValid) {
        if (!Array.isArray(entry.achievements) || entry.achievements.length < 1 || entry.achievements.length > 20) {
          console.error('[DataManager] Experience entry (' + entryId + '): achievements must be an array with 1 to 20 items');
          isValid = false;
        } else {
          for (var j = 0; j < entry.achievements.length; j++) {
            var achievement = entry.achievements[j];
            if (typeof achievement !== 'string' || achievement.length < 1 || achievement.length > 500) {
              console.error('[DataManager] Experience entry (' + entryId + '): achievement at index ' + j + ' must be a string between 1 and 500 characters');
              isValid = false;
              break;
            }
          }
        }
      }

      if (isValid) {
        seenIds[entry.id] = true;
        validEntries.push(entry);
      }
    }

    return validEntries;
  }

  /**
   * Validate that a string is a valid ISO 8601 date (YYYY-MM-DD) representing a real date.
   * @param {*} dateStr - The value to validate
   * @returns {boolean} True if valid ISO 8601 date
   */
  function isValidISODate(dateStr) {
    if (typeof dateStr !== 'string') {
      return false;
    }

    // Check format matches YYYY-MM-DD
    var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }

    // Parse components and verify it's a real date
    var parts = dateStr.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);

    // Month must be 1-12
    if (month < 1 || month > 12) {
      return false;
    }

    // Create date and verify components match (catches invalid days like Feb 30)
    var date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
  }

  // Map of data keys to their validation functions
  const validators = {
    projects: validateProjects,
    skills: validateSkills,
    experience: validateExperience
  };

  // --- Private Methods ---

  /**
   * Fetch data, preferring the JSON files so edits to /data/*.json are always
   * reflected on the site. Falls back to the embedded window.__PORTFOLIO_DATA__
   * only when the fetch fails (e.g. when the page is opened via the file://
   * protocol, where fetch is blocked).
   * @param {string} key - The data key (projects, skills, experience, stats)
   * @returns {Promise<Array>} The fetched and validated data array
   */
  async function fetchData(key) {
    // Check cache first
    if (cache[key]) {
      return cache[key];
    }

    var data = null;

    // Prefer the JSON file (source of truth when served over http://).
    const filePath = 'data/' + key + '.json';
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('HTTP error ' + response.status + ' fetching ' + filePath);
      }
      data = await response.json();
    } catch (fetchError) {
      // Fall back to embedded data (works with the file:// protocol).
      if (window.__PORTFOLIO_DATA__ && window.__PORTFOLIO_DATA__[key]) {
        console.warn('[DataManager] Could not fetch ' + filePath + ' (' + fetchError.message +
          '); using embedded fallback data for ' + key + '.');
        data = window.__PORTFOLIO_DATA__[key];
      } else {
        console.error('[DataManager] Error fetching ' + key + ': ' + fetchError.message);
        return cache[key] || [];
      }
    }

    try {

      // Validate data structure before caching
      const validator = validators[key];
      let validatedData;

      if (validator) {
        validatedData = validator(data);
      } else {
        validatedData = data;
      }

      // Ensure validated data is an array
      if (!Array.isArray(validatedData)) {
        throw new Error('Validation failed: ' + key + ' data is not an array');
      }

      // Cache the validated data
      cache[key] = validatedData;

      return validatedData;
    } catch (error) {
      console.error('[DataManager] Error fetching ' + key + ': ' + error.message);

      // Return cached data if available
      if (cache[key]) {
        return cache[key];
      }

      // Return empty array if no cache
      return [];
    }
  }

  // --- Public API ---

  /**
   * Fetch projects data from /data/projects.json.
   * Returns cached data if available, otherwise fetches from network.
   * @returns {Promise<Array>} Array of project objects
   */
  async function fetchProjects() {
    return fetchData('projects');
  }

  /**
   * Fetch skills data from /data/skills.json.
   * Returns cached data if available, otherwise fetches from network.
   * @returns {Promise<Array>} Array of skill objects
   */
  async function fetchSkills() {
    return fetchData('skills');
  }

  /**
   * Fetch experience data from /data/experience.json.
   * Returns cached data if available, otherwise fetches from network.
   * @returns {Promise<Array>} Array of experience objects
   */
  async function fetchExperience() {
    return fetchData('experience');
  }

  /**
   * Fetch stats data from /data/stats.json.
   * Returns cached data if available, otherwise fetches from network.
   * Falls back to embedded data if fetch fails.
   * @returns {Promise<Array>} Array of stat objects
   */
  async function fetchStats() {
    try {
      return await fetchData('stats');
    } catch (e) {
      // Fallback to embedded data
      if (window.__PORTFOLIO_DATA__ && window.__PORTFOLIO_DATA__.stats) {
        return window.__PORTFOLIO_DATA__.stats;
      }
      return [];
    }
  }

  /**
   * Initialize all data by fetching projects, skills, and experience in parallel.
   * Uses Promise.all for concurrent fetching.
   * @returns {Promise<{projects: Array, skills: Array, experience: Array}>}
   */
  async function initializeAll() {
    const [projects, skills, experience] = await Promise.all([
      fetchData('projects'),
      fetchData('skills'),
      fetchData('experience')
    ]);

    return { projects, skills, experience };
  }

  /**
   * Get a project by its ID from cached data.
   * @param {string} id - The project ID to look up
   * @returns {Object|null} The project object, or null if not found
   */
  function getProjectById(id) {
    const projects = cache['projects'];

    if (!projects || !Array.isArray(projects)) {
      console.error('[DataManager] No cached projects data available');
      return null;
    }

    const project = projects.find(function (p) {
      return p.id === id;
    });

    if (!project) {
      console.error('[DataManager] Project not found with id: ' + id);
      return null;
    }

    return project;
  }

  /**
   * Get cached data by key without triggering a fetch.
   * @param {string} key - The cache key (projects, skills, experience)
   * @returns {Array|null} The cached data, or null if not cached
   */
  function getCachedData(key) {
    return cache[key] || null;
  }

  /**
   * Retry fetching data for a specific key.
   * Clears the cache for that key and re-fetches from the network.
   * @param {string} key - The data key to retry (projects, skills, experience)
   * @returns {Promise<Array>} The freshly fetched data array
   */
  async function retryFetch(key) {
    // Clear cache for this key to force a fresh fetch
    delete cache[key];

    // Re-fetch the data
    return fetchData(key);
  }

  // Expose public API
  return {
    fetchProjects: fetchProjects,
    fetchSkills: fetchSkills,
    fetchExperience: fetchExperience,
    fetchStats: fetchStats,
    initializeAll: initializeAll,
    getProjectById: getProjectById,
    getCachedData: getCachedData,
    retryFetch: retryFetch,
    // Validation hooks (to be fully implemented in tasks 2.2-2.4)
    validateProjects: validateProjects,
    validateSkills: validateSkills,
    validateExperience: validateExperience
  };
})();
