/**
 * Shared CV Data Parser
 * 
 * This module provides CV parsing functionality that can be used by both
 * the terminal system and the portfolio system. It handles YAML parsing
 * of CV data with proper error handling and fallbacks.
 */

export class CVParser {
    constructor() {
        // No state needed - this is a utility class
    }

    /**
     * Parse CV YAML text into structured data
     * @param {string} yamlText - Raw YAML content
     * @returns {Object} Parsed CV data structure
     */
    parseCV(yamlText) {
        const lines = yamlText.split('\n');
        const result = { cv: { sections: {} } };
        
        let currentSection = null;
        let currentItem = null;
        let currentPosition = null;
        let inHighlights = false;
        let inPositions = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const indent = line.search(/\S/);
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Handle basic CV info (name, email, etc.)
            if (indent === 2 && trimmed.includes(':') && !trimmed.startsWith('sections:')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                if (value) {
                    result.cv[key.trim()] = value;
                }
            }
            
            // Handle social array
            if (indent === 4 && trimmed.startsWith('- network:')) {
                if (!result.cv.social) result.cv.social = [];
                const network = trimmed.split(':')[1].trim();
                const social = { network };
                result.cv.social.push(social);
                
                // Look ahead for username and url
                if (i + 1 < lines.length && lines[i + 1].trim().startsWith('username:')) {
                    social.username = lines[i + 1].split(':')[1].trim();
                    i++;
                }
                if (i + 1 < lines.length && lines[i + 1].trim().startsWith('url:')) {
                    const urlLine = lines[i + 1];
                    const colonIndex = urlLine.indexOf(':');
                    social.url = urlLine.substring(colonIndex + 1).trim();
                    i++;
                }
            }
            
            // Handle sections
            if (indent === 4 && trimmed.endsWith(':') && !trimmed.startsWith('-')) {
                currentSection = trimmed.slice(0, -1);
                result.cv.sections[currentSection] = [];
                currentItem = null;
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle section items (experience, volunteer)
            if (indent === 6 && trimmed.startsWith('- company:')) {
                const company = trimmed.split(':')[1].trim();
                currentItem = { company };
                result.cv.sections[currentSection].push(currentItem);
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle education items
            if (indent === 6 && trimmed.startsWith('- institution:')) {
                const institution = trimmed.split(':')[1].trim();
                currentItem = { institution };
                result.cv.sections[currentSection].push(currentItem);
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle project items
            if (indent === 6 && trimmed.startsWith('- name:') && currentSection === 'projects') {
                const name = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                currentItem = { name };
                result.cv.sections[currentSection].push(currentItem);
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle award items  
            if (indent === 6 && trimmed.startsWith('- name:') && currentSection === 'awards') {
                const nameValue = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                currentItem = { name: nameValue };
                result.cv.sections[currentSection].push(currentItem);
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle publication items
            if (indent === 6 && trimmed.startsWith('- title:')) {
                const title = trimmed.split(':')[1].trim();
                currentItem = { title };
                result.cv.sections[currentSection].push(currentItem);
                inHighlights = false;
                inPositions = false;
            }
            
            // Handle item properties
            if (indent === 8 && currentItem && trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                const cleanKey = key.trim();
                
                if (cleanKey === 'positions') {
                    currentItem[cleanKey] = [];
                    inPositions = true;
                    inHighlights = false;
                } else if (cleanKey === 'highlights') {
                    currentItem[cleanKey] = [];
                    inHighlights = true;
                    inPositions = false;
                } else if (value) {
                    currentItem[cleanKey] = value;
                }
            }
            
            // Handle positions array
            if (indent === 10 && inPositions && trimmed.startsWith('- title:')) {
                const title = trimmed.split(':')[1].trim();
                currentPosition = { title };
                currentItem.positions.push(currentPosition);
            }
            
            // Handle position properties
            if (indent === 12 && currentPosition && trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                const cleanKey = key.trim();
                
                if (cleanKey === 'highlights') {
                    currentPosition[cleanKey] = [];
                    // Look ahead for highlight items
                    let j = i + 1;
                    while (j < lines.length) {
                        const nextLine = lines[j];
                        const nextTrimmed = nextLine.trim();
                        const nextIndent = nextLine.search(/\S/);
                        
                        if (nextIndent === 14 && nextTrimmed.startsWith('- ')) {
                            currentPosition.highlights.push(nextTrimmed.substring(2));
                            j++;
                        } else {
                            break;
                        }
                    }
                    i = j - 1; // Skip processed lines
                } else if (value) {
                    currentPosition[cleanKey] = value;
                }
            }
            
            // Handle highlights at item level
            if (indent === 10 && inHighlights && trimmed.startsWith('- ')) {
                currentItem.highlights.push(trimmed.substring(2));
            }
        }
        
        return result;
    }

    /**
     * Get default CV data structure for fallback
     * @returns {Object} Default CV data
     */
    getDefaultCVData() {
        return {
            cv: {
                name: 'User Name',
                location: 'Location',
                email: 'user@example.com',
                website: 'https://example.com',
                social: [],
                sections: {
                    experience: [],
                    education: [],
                    projects: [],
                    volunteer: [],
                    awards: [],
                    publications: [],
                    professional_development: []
                }
            }
        };
    }

    /**
     * Validate CV data structure
     * @param {Object} cvData - CV data to validate
     * @returns {boolean} True if data is valid
     */
    isValidCVData(cvData) {
        if (!cvData || typeof cvData !== 'object') return false;
        if (!cvData.cv || typeof cvData.cv !== 'object') return false;
        
        // Check required fields
        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!cvData.cv[field]) return false;
        }
        
        // Check sections structure
        if (!cvData.cv.sections || typeof cvData.cv.sections !== 'object') {
            return false;
        }
        
        return true;
    }

    /**
     * Sanitize CV data by removing invalid entries
     * @param {Object} cvData - CV data to sanitize
     * @returns {Object} Sanitized CV data
     */
    sanitizeCVData(cvData) {
        if (!this.isValidCVData(cvData)) {
            return this.getDefaultCVData();
        }

        const sanitized = JSON.parse(JSON.stringify(cvData)); // Deep clone

        // Ensure sections exist
        if (!sanitized.cv.sections) {
            sanitized.cv.sections = {};
        }

        // Ensure arrays are arrays
        const arrayFields = ['experience', 'education', 'projects', 'volunteer', 'awards', 'publications', 'professional_development'];
        arrayFields.forEach(field => {
            if (!Array.isArray(sanitized.cv.sections[field])) {
                sanitized.cv.sections[field] = [];
            }
        });

        // Ensure social is an array
        if (!Array.isArray(sanitized.cv.social)) {
            sanitized.cv.social = [];
        }

        return sanitized;
    }
}

/**
 * CV Data Loader - handles fetching and parsing CV data from various sources
 */
export class CVDataLoader {
    constructor() {
        this.parser = new CVParser();
        this.cache = new Map();
    }

    /**
     * Load CV data from a URL
     * @param {string} url - URL to load CV YAML from
     * @returns {Promise<Object>} Parsed CV data
     */
    async loadFromURL(url) {
        // Check cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch CV data: ${response.status} ${response.statusText}`);
            }

            const yamlText = await response.text();
            const cvData = this.parser.parseCV(yamlText);
            const sanitizedData = this.parser.sanitizeCVData(cvData);

            // Cache the result
            this.cache.set(url, sanitizedData);
            
            return sanitizedData;
        } catch (error) {
            console.error(`Error loading CV data from ${url}:`, error);
            return this.parser.getDefaultCVData();
        }
    }

    /**
     * Load CV data from text content
     * @param {string} yamlText - YAML content as string
     * @returns {Object} Parsed CV data
     */
    loadFromText(yamlText) {
        try {
            const cvData = this.parser.parseCV(yamlText);
            return this.parser.sanitizeCVData(cvData);
        } catch (error) {
            console.error('Error parsing CV data:', error);
            return this.parser.getDefaultCVData();
        }
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cached data for a URL
     * @param {string} url - URL to check cache for
     * @returns {Object|null} Cached data or null
     */
    getCached(url) {
        return this.cache.get(url) || null;
    }
}