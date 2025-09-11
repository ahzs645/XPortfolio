(function() {
    const consoleElement = document.getElementById('console');
    let currentPath = 'C:\\';
    const commandHistory = [];
    let historyIndex = -0x1;
    const welcomeMessage = ['MitchIvin XP v2.0 (Aug 2025)', 'Inspired by Windows XP', '', 'Type \'help\' to see available commands', '', ''].join('\x0d\x0a');
    let promptPosition = 0x0,
        hasOutput = ![];

    function getPrompt() {
        return currentPath + '>\x20';
    }

    function appendToConsole(text) {
        text && text.length && (hasOutput = !![]), consoleElement.value += text, consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    function newLine() {
        appendToConsole('\x0d\x0a');
    }

    function println(text) {
        appendToConsole(text), newLine();
    }

    function newPrompt() {
        hasOutput && newLine(), appendToConsole(getPrompt()), promptPosition = consoleElement.value.length;
    }

    function executeCommand(input) {
        const parts = input.trim().split(/\s+/),
            command = (parts.shift() || '').toLowerCase();
        let cleared = ![];
        switch (command) {
            case 'help':
                println('Info: AUTHOR, STACK, DISCLAIMER'), println('Commands: DATE, TIME, VER, HELP, EXIT');
                break;
            case 'ver':
                println(welcomeMessage.split('\x0d\x0a')[0x0]);
                break;
            case 'time':
                println(new Date().toLocaleTimeString());
                break;
            case 'date':
                println(new Date().toLocaleDateString());
                break;
            case 'exit':
                try {
                    const message = {};
                    message.type = 'close-window', parent.postMessage(message, '*');
                } catch (error) {}
                break;
            case 'author':
                println('Designed and developed by Mitchell Ivin, created with the assistance of AI coding tools');
                break;
            case 'stack':
                println('Tech Stack: HTML, CSS, JavaScript'), println('Key Dependencies: xp.css, jspaint');
                break;
            case 'disclaimer':
                println('This site is a personal portfolio project. All logos, artwork, and assets referenced remain the property of their respective owners. They are included here as inspiration, homage, or parody, not as original creations or with any claim of ownership. This project is independent and has no affiliation with or endorsement from the original creators.');
                break;
            default:
                if (command) println('\'' + command + '\' is not recognized as an internal or external command.');
        }
        const result = {};
        return result.cleared = cleared, result;
    }

    function enforceCursorPosition() {
        (consoleElement.selectionStart < promptPosition || consoleElement.selectionEnd < promptPosition) && consoleElement.setSelectionRange(consoleElement.value.length, consoleElement.value.length);
    }
    consoleElement.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && consoleElement.selectionStart <= promptPosition && consoleElement.selectionEnd <= promptPosition || event.key === 'Delete' && consoleElement.selectionStart < promptPosition || event.key === 'ArrowLeft' && consoleElement.selectionStart <= promptPosition || event.key === 'Home') {
            event.preventDefault(), consoleElement.setSelectionRange(promptPosition, promptPosition);
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = consoleElement.value.slice(promptPosition).replace(/[\r\n]+/g, '');
            commandHistory.unshift(input), historyIndex = -0x1, newLine(), hasOutput = ![], executeCommand(input), newPrompt();
        } else {
            if (event.key === 'ArrowUp') commandHistory[historyIndex + 0x1] && (historyIndex++, consoleElement.value = consoleElement.value.slice(0x0, promptPosition) + commandHistory[historyIndex], consoleElement.setSelectionRange(consoleElement.value.length, consoleElement.value.length)), event.preventDefault();
            else event.key === 'ArrowDown' && (historyIndex > 0x0 ? (historyIndex--, consoleElement.value = consoleElement.value.slice(0x0, promptPosition) + commandHistory[historyIndex]) : (historyIndex = -0x1, consoleElement.value = consoleElement.value.slice(0x0, promptPosition)), consoleElement.setSelectionRange(consoleElement.value.length, consoleElement.value.length), event.preventDefault());
        }
    }), ['mouseup', 'keyup', 'focus', 'click'].forEach(eventName => consoleElement.addEventListener(eventName, enforceCursorPosition)), consoleElement.addEventListener('click', () => {
        consoleElement.focus(), consoleElement.setSelectionRange(consoleElement.value.length, consoleElement.value.length);
    }), consoleElement.addEventListener('paste', event => {
        consoleElement.selectionStart < promptPosition && (event.preventDefault(), appendToConsole((event.clipboardData || window.clipboardData).getData('text')));
    }), consoleElement.value = welcomeMessage + getPrompt(), promptPosition = consoleElement.value.length, consoleElement.focus(), consoleElement.setSelectionRange(consoleElement.value.length, consoleElement.value.length);
}());