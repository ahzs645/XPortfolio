import { CVDataLoader } from '../data/cvParser.js';

export class CVLoader {
    constructor() {
        this.dataLoader = new CVDataLoader();
        this.cvData = null;
        this.isLoaded = false;
    }

    async load(yamlPath = '/CV.yaml') {
        try {
            this.cvData = await this.dataLoader.loadFromURL(yamlPath);
            this.isLoaded = true;
            return this.cvData;
        } catch (error) {
            console.error('Failed to load CV data:', error);
            this.cvData = this.dataLoader.parser.getDefaultCVData();
            this.isLoaded = true;
            return this.cvData;
        }
    }

    parseCV(yamlText) {
        // Delegate to the shared parser
        return this.dataLoader.loadFromText(yamlText);
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