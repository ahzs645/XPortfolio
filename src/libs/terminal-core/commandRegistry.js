export class CommandRegistry {
    constructor(cvLoader) {
        this.cvLoader = cvLoader;
        this.commands = new Map();
        this.wrapWidth = 70; // default columns
        this.registerDefaultCommands();
    }

    setWrapWidth(width) {
        const n = Number(width);
        if (Number.isFinite(n) && n >= 30) {
            this.wrapWidth = Math.floor(n);
        }
    }

    registerDefaultCommands() {
        this.register('help', {
            description: 'Show available commands',
            execute: () => this.getHelpText()
        });

        this.register('clear', {
            description: 'Clear the terminal',
            execute: () => ({ action: 'clear' })
        });

        this.register('ver', {
            description: 'Show version information',
            execute: () => 'MitchIvin XP v2.0 (Aug 2025)\nPowered by Terminal Core'
        });

        this.register('date', {
            description: 'Show current date',
            execute: () => new Date().toLocaleDateString()
        });

        this.register('time', {
            description: 'Show current time',
            execute: () => new Date().toLocaleTimeString()
        });

        this.register('exit', {
            description: 'Close the terminal',
            execute: () => ({ action: 'close' })
        });

        this.register('debug', {
            description: 'Debug CV data structure',
            execute: () => {
                const data = this.cvLoader.getData();
                return 'CV Data Structure:\n' + JSON.stringify(data, null, 2);
            }
        });

        this.register('echo', {
            description: 'Print out anything',
            execute: (args) => {
                return args.join(' ') || '';
            }
        });

        this.register('pwd', {
            description: 'Print current working directory',
            execute: () => '/home/' + this.cvLoader.getFirstName().toLowerCase()
        });

        this.register('history', {
            description: 'View command history',
            execute: () => {
                // This would be implemented by the terminal core
                return 'Command history feature - use arrow keys to navigate history';
            }
        });


        this.register('welcome', {
            description: 'Display hero section', 
            execute: () => {
                const name = this.cvLoader.getName();
                const firstName = this.cvLoader.getFirstName();
                const website = this.cvLoader.getWebsite();
                
                return [
                    `Welcome to ${name}'s Terminal Portfolio!`,
                    '=' .repeat(50),
                    '',
                    `Hi there! I'm ${firstName}.`,
                    'This is my interactive terminal-based portfolio.',
                    '',
                    'Quick commands to get started:',
                    '  • about      - Learn about me',
                    '  • experience - View work history', 
                    '  • education  - See education background',
                    '  • projects   - Check out my projects',
                    '  • contact    - Get in touch',
                    '',
                    `Visit: ${website}`,
                    '',
                    'Type "help" to see all available commands!'
                ].join('\n');
            }
        });

        this.register('gui', {
            description: 'Go to my portfolio in GUI',
            execute: () => {
                const website = this.cvLoader.getWebsite();
                return [
                    'Opening portfolio website...',
                    `Redirecting to: ${website}`,
                    '',
                    'If the page doesn\'t open automatically, copy and paste the URL above.'
                ].join('\n');
            }
        });

        this.register('email', {
            description: 'Send an email to ' + this.cvLoader.getFirstName(),
            execute: () => {
                const email = this.cvLoader.getEmail();
                const name = this.cvLoader.getName();
                
                return [
                    `Email ${name}`,
                    '=' .repeat(30),
                    `📧 ${email}`,
                    '',
                    'Click the email address above or copy it to your email client.',
                    'I\'ll get back to you as soon as possible!'
                ].join('\n');
            }
        });

        this.register('whoami', {
            description: 'Show current user info',
            execute: () => {
                const name = this.cvLoader.getName();
                const location = this.cvLoader.getLocation();
                const website = this.cvLoader.getWebsite();
                return `${name}\n${location}\n${website}`;
            }
        });

        this.register('about', {
            description: 'About me',
            execute: () => {
                const name = this.cvLoader.getName();
                const firstName = this.cvLoader.getFirstName();
                const email = this.cvLoader.getEmail();
                const location = this.cvLoader.getLocation();
                const website = this.cvLoader.getWebsite();
                
                return [
                    `About ${name}`,
                    '=' .repeat(40),
                    `Name: ${name}`,
                    `Location: ${location}`,
                    `Email: ${email}`,
                    `Website: ${website}`,
                    '',
                    `Type 'experience' to see ${firstName}'s work history`,
                    `Type 'education' to see ${firstName}'s education`,
                    `Type 'projects' to see ${firstName}'s projects`
                ].join('\n');
            }
        });

        this.register('contact', {
            description: 'Contact information',
            execute: () => {
                const name = this.cvLoader.getName();
                const email = this.cvLoader.getEmail();
                const website = this.cvLoader.getWebsite();
                const socials = this.cvLoader.getSocials();
                
                let output = [`Contact ${name}`, '=' .repeat(40)];
                output.push(`Email: ${email}`);
                output.push(`Website: ${website}`);
                
                if (socials && socials.length > 0) {
                    output.push('', 'Social Media:');
                    socials.forEach(social => {
                        output.push(`  ${social.network}: ${social.url}`);
                    });
                }
                
                return output.join('\n');
            }
        });

        this.register('socials', {
            description: 'Check out ' + this.cvLoader.getFirstName() + '\'s social accounts',
            execute: () => {
                const firstName = this.cvLoader.getFirstName();
                const socials = this.cvLoader.getSocials();
                
                if (!socials || socials.length === 0) {
                    return 'No social media accounts available.';
                }
                
                let output = [`${firstName}'s Social Media`, '=' .repeat(40)];
                
                socials.forEach(social => {
                    output.push(`${social.network}: ${social.url}`);
                });
                
                return output.join('\n');
            }
        });

        this.register('awards', {
            description: 'View ' + this.cvLoader.getFirstName() + '\'s awards and achievements',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const awards = data?.cv?.sections?.awards;
                    
                    if (!awards || (Array.isArray(awards) && awards.length === 0)) {
                        return 'No awards data available.';
                    }
                    
                    const awardsArray = Array.isArray(awards) ? awards : [awards];
                    let output = ['Awards & Achievements', '=' .repeat(40)];
                    
                    awardsArray.forEach((award, index) => {
                        if (award.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${award.name || 'Award'} (${award.date || ''})`);
                        if (award.summary) output.push(`  ${award.summary}`);
                        
                        if (award.highlights && Array.isArray(award.highlights)) {
                            award.highlights.forEach(h => {
                                const wrapped = this.wrapText(h, this.wrapWidth, '    • ');
                                output.push(wrapped);
                            });
                        }
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return 'No awards data available.';
                }
            }
        });

        this.register('publications', {
            description: 'View ' + this.cvLoader.getFirstName() + '\'s published research papers',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const publications = data?.cv?.sections?.publications;
                    
                    if (!publications || (Array.isArray(publications) && publications.length === 0)) {
                        return 'No publications data available.';
                    }
                    
                    const pubArray = Array.isArray(publications) ? publications : [publications];
                    let output = ['Publications', '=' .repeat(40)];
                    
                    pubArray.forEach((pub, index) => {
                        if (pub.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${pub.title || 'Publication'} (${pub.date || ''})`);
                        if (pub.authors && Array.isArray(pub.authors)) {
                            output.push(`  Authors: ${pub.authors.join(', ')}`);
                        }
                        if (pub.journal) output.push(`  Journal: ${pub.journal}`);
                        if (pub.doi) output.push(`  DOI: ${pub.doi}`);
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return 'No publications data available.';
                }
            }
        });

        this.register('volunteer', {
            description: 'View ' + this.cvLoader.getFirstName() + '\'s volunteer experience',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const volunteer = data?.cv?.sections?.volunteer;
                    
                    if (!volunteer || (Array.isArray(volunteer) && volunteer.length === 0)) {
                        return 'No volunteer experience data available.';
                    }
                    
                    const volArray = Array.isArray(volunteer) ? volunteer : [volunteer];
                    let output = ['Volunteer Experience', '=' .repeat(40)];
                    
                    volArray.forEach((vol, index) => {
                        if (vol.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${vol.company || 'Organization'} - ${vol.location || ''}`);
                        output.push(`  ${vol.position || ''} (${vol.start_date || ''} - ${vol.end_date || ''})`);
                        
                        if (vol.highlights && Array.isArray(vol.highlights)) {
                            vol.highlights.forEach(h => {
                                const wrapped = this.wrapText(h, this.wrapWidth, '    • ');
                                output.push(wrapped);
                            });
                        }
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return 'No volunteer experience data available.';
                }
            }
        });

        this.register('professional', {
            description: 'View ' + this.cvLoader.getFirstName() + '\'s professional development',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const professional = data?.cv?.sections?.professional_development;
                    
                    if (!professional || (Array.isArray(professional) && professional.length === 0)) {
                        return 'No professional development data available.';
                    }
                    
                    const profArray = Array.isArray(professional) ? professional : [professional];
                    let output = ['Professional Development', '=' .repeat(40)];
                    
                    profArray.forEach((prof, index) => {
                        if (prof.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${prof.name || 'Course/Training'} (${prof.date || ''})`);
                        if (prof.location) output.push(`  Location: ${prof.location}`);
                        if (prof.summary) output.push(`  ${prof.summary}`);
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return 'No professional development data available.';
                }
            }
        });

        this.register('download-cv', {
            description: 'Download ' + this.cvLoader.getName() + '\'s CV (PDF)',
            execute: () => {
                return { action: 'download', file: '../../../public/CV.pdf', type: 'pdf' };
            }
        });

        this.register('experience', {
            description: 'Work experience',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const experiences = data?.cv?.sections?.experience;
                    
                    if (!experiences) {
                        return 'No experience data available.';
                    }
                    
                    // Handle both array and non-array cases
                    const expArray = Array.isArray(experiences) ? experiences : 
                                     (typeof experiences === 'object' ? [experiences] : []);
                    
                    if (expArray.length === 0) {
                        return 'No experience data available.';
                    }
                    
                    let output = ['Work Experience', '=' .repeat(40)];
                    
                    expArray.forEach((exp, index) => {
                        if (exp.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${exp.company || 'Unknown Company'} - ${exp.location || ''}`);
                        
                        if (exp.positions && Array.isArray(exp.positions)) {
                            exp.positions.forEach(pos => {
                                output.push(`  ${pos.title} (${pos.start_date} - ${pos.end_date})`);
                                if (pos.highlights && Array.isArray(pos.highlights)) {
                                    pos.highlights.forEach(h => {
                                        // Wrap long text with proper indentation
                                        const wrapped = this.wrapText(h, this.wrapWidth, '    • ');
                                        output.push(wrapped);
                                    });
                                }
                            });
                        } else if (exp.position) {
                            output.push(`  ${exp.position} (${exp.start_date || ''} - ${exp.end_date || ''})`);
                            if (exp.highlights && Array.isArray(exp.highlights)) {
                                exp.highlights.forEach(h => {
                                    const wrapped = this.wrapText(h, this.wrapWidth, '    • ');
                                    output.push(wrapped);
                                });
                            }
                        }
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return `Error displaying experience: ${error.message}`;
                }
            }
        });

        this.register('education', {
            description: 'Education background',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const education = data?.cv?.sections?.education;
                    
                    if (!education) {
                        return 'No education data available.';
                    }
                    
                    // Handle both array and non-array cases
                    const eduArray = Array.isArray(education) ? education : 
                                    (typeof education === 'object' ? [education] : []);
                    
                    if (eduArray.length === 0) {
                        return 'No education data available.';
                    }
                    
                    let output = ['Education', '=' .repeat(40)];
                    
                    eduArray.forEach((edu, index) => {
                        if (edu.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${edu.degree || ''} in ${edu.area || ''}`);
                        output.push(`  ${edu.institution || ''} - ${edu.location || ''}`);
                        output.push(`  ${edu.start_date || ''} - ${edu.end_date || ''}`);
                        
                        if (edu.highlights && Array.isArray(edu.highlights)) {
                            edu.highlights.forEach(h => output.push(`    • ${h}`));
                        }
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return `Error displaying education: ${error.message}`;
                }
            }
        });

        this.register('projects', {
            description: 'Projects and portfolio',
            execute: () => {
                try {
                    const data = this.cvLoader.getData();
                    const projects = data?.cv?.sections?.projects;
                    
                    if (!projects) {
                        return 'No projects data available.';
                    }
                    
                    // Handle both array and non-array cases
                    const projArray = Array.isArray(projects) ? projects : 
                                     (typeof projects === 'object' ? [projects] : []);
                    
                    if (projArray.length === 0) {
                        return 'No projects data available.';
                    }
                    
                    let output = ['Projects', '=' .repeat(40)];
                    
                    projArray.forEach((proj, index) => {
                        if (proj.show === false) return;
                        
                        if (index > 0) output.push('');
                        output.push(`${proj.name || 'Unnamed Project'}`);
                        if (proj.date) output.push(`  Date: ${proj.date}`);
                        if (proj.url) output.push(`  URL: ${proj.url}`);
                        if (proj.summary) {
                            const wrappedSummary = this.wrapText(proj.summary, this.wrapWidth, '  ');
                            output.push(wrappedSummary);
                        }
                        
                        if (proj.highlights && Array.isArray(proj.highlights)) {
                            proj.highlights.forEach(h => output.push(`    • ${h}`));
                        }
                    });
                    
                    return output.join('\n');
                } catch (error) {
                    return `Error displaying projects: ${error.message}`;
                }
            }
        });

        this.register('cv', {
            description: 'Download CV/Resume',
            execute: () => {
                const name = this.cvLoader.getName();
                return [
                    `${name}'s CV`,
                    '=' .repeat(40),
                    'Download options:',
                    '  • PDF: Type "download pdf"',
                    '  • YAML: Type "download yaml"',
                    '',
                    'Or visit the website to download directly.'
                ].join('\n');
            }
        });

        this.register('download', {
            description: 'Download CV files',
            execute: (args) => {
                const format = args[0]?.toLowerCase();
                if (format === 'pdf') {
                    return { action: 'download', file: '../../../public/CV.pdf', type: 'pdf' };
                } else if (format === 'yaml') {
                    return { action: 'download', file: '../../../public/CV.yaml', type: 'yaml' };
                } else {
                    return 'Usage: download [pdf|yaml]';
                }
            }
        });
    }

    register(command, handler) {
        this.commands.set(command.toLowerCase(), handler);
    }

    execute(commandLine) {
        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        if (!command) {
            return '';
        }

        const handler = this.commands.get(command);
        if (!handler) {
            return `'${command}' is not recognized as an internal or external command.`;
        }

        try {
            return handler.execute(args);
        } catch (error) {
            return `Error executing command: ${error.message}`;
        }
    }

    getHelpText() {
        const firstName = this.cvLoader.getFirstName();
        const data = this.cvLoader.getData();
        const sections = data?.cv?.sections || {};
        const hasContent = (val) => Array.isArray(val) ? val.length > 0 : (val && typeof val === 'object' ? Object.keys(val).length > 0 : !!val);

        let output = ['Available Commands:', '=' .repeat(40)];

        const categories = {
            'System': ['help', 'clear', 'ver', 'date', 'time', 'exit', 'debug', 'echo', 'pwd', 'history'],
            'Navigation': ['gui', 'welcome'],
            'Personal': ['whoami', 'about', 'contact', ...(this.cvLoader.getEmail() ? ['email'] : []), ...(Array.isArray(this.cvLoader.getSocials()) && this.cvLoader.getSocials().length ? ['socials'] : [])],
            'Professional': [
                ...(hasContent(sections.experience) ? ['experience'] : []),
                ...(hasContent(sections.education) ? ['education'] : []),
                ...(hasContent(sections.projects) ? ['projects'] : []),
                ...(hasContent(sections.volunteer) ? ['volunteer'] : []),
                ...(hasContent(sections.professional_development) ? ['professional'] : []),
                ...(hasContent(sections.awards) ? ['awards'] : []),
                ...(hasContent(sections.publications) ? ['publications'] : []),
            ],
            'Download': ['cv', 'download']
        };

        Object.entries(categories).forEach(([category, cmds]) => {
            if (!cmds.length) return;
            output.push('', `${category}:`);
            cmds.forEach(cmd => {
                const handler = this.commands.get(cmd);
                if (handler) {
                    output.push(`  ${cmd.padEnd(15)} - ${handler.description}`);
                }
            });
        });

        output.push('', `Type any command to learn more about ${firstName}!`);
        return output.join('\n');
    }

    getAvailableCommands() {
        return Array.from(this.commands.keys());
    }

    wrapText(text, maxLength, prefix = '') {
        const availableWidth = maxLength - prefix.length;
        
        if (text.length <= availableWidth) {
            return prefix + text;
        }

        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            
            if (testLine.length <= availableWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Word is longer than available width, hard-break it
                    let w = word;
                    while (w.length > availableWidth) {
                        lines.push(w.slice(0, availableWidth));
                        w = w.slice(availableWidth);
                    }
                    currentLine = w;
                }
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        // Add prefix to first line, and continuation prefix to other lines
        const continuationPrefix = ' '.repeat(prefix.length);
        return lines.map((line, index) => 
            index === 0 ? prefix + line : continuationPrefix + line
        ).join('\n');
    }
}
