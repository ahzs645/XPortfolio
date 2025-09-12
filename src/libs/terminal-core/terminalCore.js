import { CVLoader } from './cvLoader.js';
import { CommandRegistry } from './commandRegistry.js';

export class TerminalCore {
    constructor(options = {}) {
        this.cvLoader = new CVLoader();
        this.commandRegistry = new CommandRegistry(this.cvLoader);
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.options = {
            yamlPath: options.yamlPath || '/CV.yaml',
            pdfPath: options.pdfPath || '/CV.pdf',
            welcomeMessage: options.welcomeMessage || this.getDefaultWelcomeMessage(),
            prompt: options.prompt || 'C:\\> ',
            ...options
        };
    }

    async initialize() {
        await this.cvLoader.load(this.options.yamlPath);
        return this;
    }

    getDefaultWelcomeMessage() {
        return [
            'MitchIvin XP v2.0 (Terminal Core Edition)',
            'Powered by CV-driven terminal system',
            '',
            'Type \'help\' to see available commands',
            ''
        ].join('\n');
    }

    getWelcomeMessage() {
        const name = this.cvLoader.getName();
        const firstName = this.cvLoader.getFirstName();
        
        return [
            `Welcome to ${name}'s Terminal`,
            '=' .repeat(40),
            '',
            `Hi! I'm ${firstName}. This is my interactive terminal portfolio.`,
            'Type \'help\' to see available commands',
            'Type \'about\' to learn more about me',
            ''
        ].join('\n');
    }

    executeCommand(commandLine) {
        if (!commandLine.trim()) return '';
        
        this.addToHistory(commandLine);
        const result = this.commandRegistry.execute(commandLine);
        
        if (typeof result === 'object' && result !== null) {
            return result;
        }
        
        return result || '';
    }

    addToHistory(command) {
        if (command && command.trim()) {
            this.commandHistory.unshift(command);
            if (this.commandHistory.length > 100) {
                this.commandHistory.pop();
            }
            this.historyIndex = -1;
        }
    }

    getPreviousCommand() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            return this.commandHistory[this.historyIndex];
        }
        return null;
    }

    getNextCommand() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            return this.commandHistory[this.historyIndex];
        } else if (this.historyIndex === 0) {
            this.historyIndex = -1;
            return '';
        }
        return null;
    }

    getAutocompleteSuggestions(partial) {
        const commands = this.commandRegistry.getAvailableCommands();
        if (!partial) return commands;
        
        return commands.filter(cmd => 
            cmd.toLowerCase().startsWith(partial.toLowerCase())
        );
    }

    registerCustomCommand(name, handler) {
        this.commandRegistry.register(name, handler);
    }

    getCVData() {
        return this.cvLoader.getData();
    }
}

export { CVLoader, CommandRegistry };