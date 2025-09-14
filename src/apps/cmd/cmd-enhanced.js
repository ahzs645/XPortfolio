(async function() {
    const consoleElement = document.getElementById('console');
    let currentPath = 'C:\\';
    let promptPosition = 0;
    let hasOutput = false;
    let terminalCore = null;

    async function initializeTerminal() {
        try {
            const { TerminalCore } = await import('../../libs/terminal-core/terminalCore.js');
            terminalCore = new TerminalCore({
                yamlPath: '../../../public/CV.yaml',
                pdfPath: '../../../public/CV.pdf',
                prompt: currentPath + '> '
            });
            await terminalCore.initialize();
            
            terminalCore.registerCustomCommand('author', {
                description: 'About the developer',
                execute: () => {
                    const name = terminalCore.getCVData()?.cv?.name || 'Mitchell Ivin';
                    return `Designed and developed by ${name}, created with the assistance of AI coding tools`;
                }
            });

            terminalCore.registerCustomCommand('stack', {
                description: 'Tech stack information',
                execute: () => [
                    'Tech Stack: HTML, CSS, JavaScript',
                    'Key Dependencies: xp.css, jspaint',
                    'Terminal Core: CV-driven command system'
                ].join('\n')
            });

            terminalCore.registerCustomCommand('disclaimer', {
                description: 'Legal disclaimer',
                execute: () => 'This site is a personal portfolio project. All logos, artwork, and assets referenced remain the property of their respective owners. They are included here as inspiration, homage, or parody, not as original creations or with any claim of ownership. This project is independent and has no affiliation with or endorsement from the original creators.'
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize terminal core:', error);
            return false;
        }
    }

    function getPrompt() {
        return currentPath + '> ';
    }

    function appendToConsole(text) {
        if (text && text.length) {
            hasOutput = true;
        }
        consoleElement.value += text;
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    function newLine() {
        appendToConsole('\r\n');
    }

    function println(text) {
        appendToConsole(text);
        newLine();
    }

    function newPrompt() {
        if (hasOutput) {
            newLine();
        }
        appendToConsole(getPrompt());
        promptPosition = consoleElement.value.length;
    }

    async function executeCommand(input) {
        if (!terminalCore) {
            println('Terminal core not initialized. Please refresh the page.');
            return;
        }

        const result = terminalCore.executeCommand(input);
        
        if (typeof result === 'object' && result !== null) {
            if (result.action === 'clear') {
                consoleElement.value = '';
                hasOutput = false;
                promptPosition = 0;
                return { cleared: true };
            } else if (result.action === 'close') {
                try {
                    const message = { type: 'close-window' };
                    parent.postMessage(message, '*');
                } catch (error) {
                    println('Cannot close window in this context');
                }
            } else if (result.action === 'download') {
                const link = document.createElement('a');
                link.href = result.file;
                link.download = result.file.split('/').pop();
                link.click();
                println(`Downloading ${result.type.toUpperCase()} file...`);
            }
        } else if (result) {
            println(result);
        }

        return { cleared: false };
    }

    function enforceCursorPosition() {
        if (consoleElement.selectionStart < promptPosition || 
            consoleElement.selectionEnd < promptPosition) {
            consoleElement.setSelectionRange(
                consoleElement.value.length, 
                consoleElement.value.length
            );
        }
    }

    consoleElement.addEventListener('keydown', async event => {
        if ((event.key === 'Backspace' && 
             consoleElement.selectionStart <= promptPosition && 
             consoleElement.selectionEnd <= promptPosition) ||
            (event.key === 'Delete' && consoleElement.selectionStart < promptPosition) ||
            (event.key === 'ArrowLeft' && consoleElement.selectionStart <= promptPosition) ||
            event.key === 'Home') {
            event.preventDefault();
            consoleElement.setSelectionRange(promptPosition, promptPosition);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const input = consoleElement.value.slice(promptPosition).replace(/[\r\n]+/g, '');
            newLine();
            hasOutput = false;
            const result = await executeCommand(input);
            if (!result?.cleared) {
                newPrompt();
            } else {
                newPrompt();
            }
        } else if (event.key === 'ArrowUp') {
            if (terminalCore) {
                const prevCommand = terminalCore.getPreviousCommand();
                if (prevCommand !== null) {
                    consoleElement.value = consoleElement.value.slice(0, promptPosition) + prevCommand;
                    consoleElement.setSelectionRange(
                        consoleElement.value.length, 
                        consoleElement.value.length
                    );
                }
            }
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            if (terminalCore) {
                const nextCommand = terminalCore.getNextCommand();
                if (nextCommand !== null) {
                    consoleElement.value = consoleElement.value.slice(0, promptPosition) + nextCommand;
                    consoleElement.setSelectionRange(
                        consoleElement.value.length, 
                        consoleElement.value.length
                    );
                }
            }
            event.preventDefault();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            if (terminalCore) {
                const currentInput = consoleElement.value.slice(promptPosition);
                const suggestions = terminalCore.getAutocompleteSuggestions(currentInput);
                if (suggestions.length === 1) {
                    consoleElement.value = consoleElement.value.slice(0, promptPosition) + suggestions[0];
                    consoleElement.setSelectionRange(
                        consoleElement.value.length, 
                        consoleElement.value.length
                    );
                } else if (suggestions.length > 1) {
                    newLine();
                    println('Available commands: ' + suggestions.join(', '));
                    newPrompt();
                    consoleElement.value += currentInput;
                }
            }
        }
    });

    ['mouseup', 'keyup', 'focus', 'click'].forEach(eventName => 
        consoleElement.addEventListener(eventName, enforceCursorPosition)
    );

    consoleElement.addEventListener('click', () => {
        consoleElement.focus();
        consoleElement.setSelectionRange(
            consoleElement.value.length, 
            consoleElement.value.length
        );
    });

    consoleElement.addEventListener('paste', event => {
        if (consoleElement.selectionStart < promptPosition) {
            event.preventDefault();
            appendToConsole(
                (event.clipboardData || window.clipboardData).getData('text')
            );
        }
    });

    async function start() {
        const initialized = await initializeTerminal();

        if (initialized && terminalCore) {
            const cv = terminalCore.getCVData();
            const fullName = cv?.cv?.name || '';
            const firstName = (fullName || '').split(' ')[0] || 'User';

            const header = [
                `${firstName} DOS`,
                `❮C❯ Copyright ${firstName}`,
                `Type 'help' to see available commands`,
                ''
            ].join('\r\n');
            consoleElement.value = header + getPrompt();

            // Compute wrap width in columns based on textarea width and font metrics
            const computeWrapColumns = () => {
                const cw = (() => {
                    const probe = document.createElement('span');
                    probe.textContent = 'MMMMMMMMMM';
                    probe.style.visibility = 'hidden';
                    probe.style.position = 'absolute';
                    probe.style.whiteSpace = 'pre';
                    probe.style.fontFamily = getComputedStyle(consoleElement).fontFamily;
                    probe.style.fontSize = getComputedStyle(consoleElement).fontSize;
                    document.body.appendChild(probe);
                    const width = probe.getBoundingClientRect().width / 10;
                    document.body.removeChild(probe);
                    return width || 8;
                })();
                const cols = Math.floor(consoleElement.clientWidth / cw) - 4;
                return Math.max(30, cols);
            };

            try {
                terminalCore.commandRegistry.setWrapWidth(computeWrapColumns());
                window.addEventListener('resize', () => {
                    terminalCore.commandRegistry.setWrapWidth(computeWrapColumns());
                });
            } catch(_) {}
        } else {
            const fallbackMessage = [
                'MitchIvin XP v2.0 (Aug 2025)',
                'Inspired by classic desktop UIs',
                '',
                'Type \'help\' to see available commands',
                '',
                ''
            ].join('\r\n');
            consoleElement.value = fallbackMessage + getPrompt();
        }
        
        promptPosition = consoleElement.value.length;
        consoleElement.focus();
        consoleElement.setSelectionRange(
            consoleElement.value.length, 
            consoleElement.value.length
        );

        // Hide intro on first user interaction
        const intro = document.getElementById('intro');
        const hideIntro = () => { if (intro) intro.hidden = true; };
        // no intro overlay — console is immediate
    }

    start();
}());
