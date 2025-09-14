export class MarkdownLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadMarkdown(path) {
        // Skip cache for now to ensure we get fresh content
        // if (this.cache.has(path)) {
        //     return this.cache.get(path);
        // }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            
            const markdown = await response.text();
            const processed = this.processMarkdown(markdown);
            
            // Cache the result
            this.cache.set(path, processed);
            return processed;
        } catch (error) {
            console.error(`Error loading markdown from ${path}:`, error);
            return {
                title: 'Content Not Found',
                content: `Sorry, the content at ${path} could not be loaded.`,
                html: `<p>Sorry, the content at ${path} could not be loaded.</p>`
            };
        }
    }

    processMarkdown(markdown) {
        // Extract title from first # heading
        const lines = markdown.split('\n');
        let title = 'Untitled';
        let contentLines = lines;
        
        const firstHeading = lines.find(line => line.startsWith('# '));
        if (firstHeading) {
            title = firstHeading.replace('# ', '').trim();
            // Remove the title from content if it's the first non-empty line
            const titleIndex = lines.findIndex(line => line.startsWith('# '));
            if (titleIndex === 0 || lines.slice(0, titleIndex).every(line => !line.trim())) {
                contentLines = lines.slice(titleIndex + 1);
            }
        }

        const content = contentLines.join('\n').trim();
        const html = this.markdownToHtml(markdown);

        return {
            title,
            content,
            html,
            raw: markdown
        };
    }

    // Simple markdown to HTML converter
    markdownToHtml(markdown) {
        // Split into lines for better processing
        const lines = markdown.split('\n');
        const htmlLines = [];
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines in lists but close list if double empty line
            if (!trimmedLine) {
                if (inList && i > 0 && !lines[i - 1].trim()) {
                    htmlLines.push('</ul>');
                    inList = false;
                }
                htmlLines.push('');
                continue;
            }

            // Headers
            if (trimmedLine.startsWith('### ')) {
                if (inList) { htmlLines.push('</ul>'); inList = false; }
                htmlLines.push(`<h3>${trimmedLine.substring(4)}</h3>`);
            } else if (trimmedLine.startsWith('## ')) {
                if (inList) { htmlLines.push('</ul>'); inList = false; }
                htmlLines.push(`<h2>${trimmedLine.substring(3)}</h2>`);
            } else if (trimmedLine.startsWith('# ')) {
                if (inList) { htmlLines.push('</ul>'); inList = false; }
                htmlLines.push(`<h1>${trimmedLine.substring(2)}</h1>`);
            }
            // Horizontal rules
            else if (trimmedLine === '---') {
                if (inList) { htmlLines.push('</ul>'); inList = false; }
                htmlLines.push('<hr>');
            }
            // Lists
            else if (trimmedLine.startsWith('- ')) {
                if (!inList) {
                    htmlLines.push('<ul>');
                    inList = true;
                }
                const listContent = trimmedLine.substring(2)
                    // Bold and italic
                    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    // Links
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                    // Code
                    .replace(/`([^`]+)`/g, '<code>$1</code>');
                htmlLines.push(`<li>${listContent}</li>`);
            }
            // Regular paragraphs
            else {
                if (inList) { htmlLines.push('</ul>'); inList = false; }
                const paragraphContent = trimmedLine
                    // Bold and italic
                    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    // Links
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                    // Code blocks
                    .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>');
                htmlLines.push(`<p>${paragraphContent}</p>`);
            }
        }

        // Close any remaining list
        if (inList) {
            htmlLines.push('</ul>');
        }

        return htmlLines.join('');
    }

    async loadProjectMarkdown(projectName) {
        // Convert project name to filename (lowercase, spaces to hyphens)
        const filename = projectName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
            
        const path = `/content/projects/${filename}.md`;
        return await this.loadMarkdown(path);
    }

    async loadAboutMarkdown() {
        return await this.loadMarkdown('/content/about.md');
    }

    async getAvailableProjects() {
        // This would typically list files in the projects directory
        // For now, return a hardcoded list based on what we know exists
        const knownProjects = [
            'whisperdesk',
            'aethalometer-analysis',
            'whisperdesk-diarization',
            'unbc-door-sign-generator',
            'card-printer-calibration',
            'markdown-milker'
        ];

        const projects = [];
        for (const project of knownProjects) {
            try {
                const content = await this.loadMarkdown(`/content/projects/${project}.md`);
                projects.push({
                    slug: project,
                    title: content.title,
                    hasMarkdown: true
                });
            } catch (error) {
                // Project markdown doesn't exist, but we might still want to show it
                projects.push({
                    slug: project,
                    title: project.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    hasMarkdown: false
                });
            }
        }

        return projects;
    }

    // Clear cache (useful for development)
    clearCache() {
        this.cache.clear();
    }

    // Get cached content
    getCached(path) {
        return this.cache.get(path);
    }
}