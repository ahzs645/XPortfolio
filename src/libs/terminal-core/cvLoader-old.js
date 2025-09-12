export class CVLoader {
    constructor() {
        this.cvData = null;
        this.isLoaded = false;
    }

    async load(yamlPath = '/CV.yaml') {
        try {
            const response = await fetch(yamlPath);
            const yamlText = await response.text();
            this.cvData = this.parseCV(yamlText);
            this.isLoaded = true;
            return this.cvData;
        } catch (error) {
            console.error('Failed to load CV data:', error);
            this.cvData = this.getDefaultData();
            this.isLoaded = true;
            return this.cvData;
        }
    }

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

    getDefaultData() {
        return {
            cv: {
                name: 'Mitchell Ivin',
                location: 'Remote',
                email: 'contact@mitchellivin.com',
                website: 'https://mitchellivin.com',
                sections: {
                    experience: [],
                    education: [],
                    projects: []
                }
            }
        };
    }

    getData() {
        return this.cvData;
    }

    getName() {
        return this.cvData?.cv?.name || 'User';
    }

    getFirstName() {
        const name = this.getName();
        return name.split(' ')[0];
    }

    getEmail() {
        return this.cvData?.cv?.email || '';
    }

    getWebsite() {
        return this.cvData?.cv?.website || '';
    }

    getLocation() {
        return this.cvData?.cv?.location || '';
    }

    getSocials() {
        return this.cvData?.cv?.social || [];
    }

    getSection(sectionName) {
        return this.cvData?.cv?.sections?.[sectionName] || [];
    }
}