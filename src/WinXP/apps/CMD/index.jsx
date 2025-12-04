import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';

const COMMANDS = {
  help: {
    description: 'Display available commands',
    execute: (args, ctx) => {
      const cmds = Object.entries(COMMANDS)
        .map(([name, cmd]) => `  ${name.padEnd(12)} - ${cmd.description}`)
        .join('\n');
      return `Available commands:\n${cmds}`;
    },
  },
  clear: {
    description: 'Clear the screen',
    execute: () => ({ action: 'clear' }),
  },
  cls: {
    description: 'Clear the screen',
    execute: () => ({ action: 'clear' }),
  },
  exit: {
    description: 'Close the command prompt',
    execute: () => ({ action: 'close' }),
  },
  echo: {
    description: 'Display a message',
    execute: (args) => args.join(' ') || '',
  },
  date: {
    description: 'Display current date',
    execute: () => new Date().toLocaleDateString(),
  },
  time: {
    description: 'Display current time',
    execute: () => new Date().toLocaleTimeString(),
  },
  ver: {
    description: 'Display version',
    execute: (args, ctx) => `XPortfolio DOS [Version ${ctx.name || 'User'} 2.0]`,
  },
  whoami: {
    description: 'Display current user',
    execute: (args, ctx) => ctx.name || 'User',
  },
  about: {
    description: 'About the developer',
    execute: (args, ctx) => ctx.name ? `Designed and developed by ${ctx.name}` : 'XPortfolio - Windows XP Style Portfolio',
  },
  skills: {
    description: 'List skills',
    execute: (args, ctx) => {
      if (ctx.skills && ctx.skills.length > 0) {
        return `Skills:\n${ctx.skills.map(s => `  - ${s}`).join('\n')}`;
      }
      return 'No skills data available. Check CV configuration.';
    },
  },
  contact: {
    description: 'Display contact information',
    execute: (args, ctx) => {
      const links = ctx.socialLinks || [];
      if (links.length > 0) {
        return `Contact:\n${links.map(l => `  ${l.network}: ${l.url}`).join('\n')}`;
      }
      return 'No contact information available.';
    },
  },
  resume: {
    description: 'Open resume',
    execute: () => ({ action: 'open', app: 'Resume' }),
  },
  projects: {
    description: 'Open projects',
    execute: () => ({ action: 'open', app: 'Projects' }),
  },
  color: {
    description: 'Change console colors (e.g., color 0a)',
    execute: (args) => {
      const colorMap = {
        '0': '#000000', '1': '#000080', '2': '#008000', '3': '#008080',
        '4': '#800000', '5': '#800080', '6': '#808000', '7': '#c0c0c0',
        '8': '#808080', '9': '#0000ff', 'a': '#00ff00', 'b': '#00ffff',
        'c': '#ff0000', 'd': '#ff00ff', 'e': '#ffff00', 'f': '#ffffff',
      };
      if (args[0] && args[0].length === 2) {
        const bg = colorMap[args[0][0].toLowerCase()];
        const fg = colorMap[args[0][1].toLowerCase()];
        if (bg && fg) {
          return { action: 'color', bg, fg };
        }
      }
      return 'Invalid color. Use: color [bg][fg] (e.g., color 0a)';
    },
  },
  dir: {
    description: 'List directory contents',
    execute: () => {
      return ` Volume in drive C is XPORTFOLIO
 Volume Serial Number is 1337-XP

 Directory of C:\\

12/01/2025  12:00 PM    <DIR>          .
12/01/2025  12:00 PM    <DIR>          ..
12/01/2025  12:00 PM    <DIR>          Projects
12/01/2025  12:00 PM    <DIR>          Documents
12/01/2025  12:00 PM             1,337 README.txt
               1 File(s)          1,337 bytes
               4 Dir(s)   42,000,000,000 bytes free`;
    },
  },
  tree: {
    description: 'Display directory tree',
    execute: () => {
      return `C:.
├───Projects
├───Documents
│   └───Resume
└───Games
    ├───Minesweeper
    ├───Solitaire
    └───Pinball`;
    },
  },
};

function CMD({ onClose }) {
  const { getFullName, getSkills, getSocialLinks, getTerminalWelcome } = useConfig();
  const [history, setHistory] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [colors, setColors] = useState({ bg: '#000000', fg: '#c0c0c0' });
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const name = getFullName();
  const firstName = name ? name.split(' ')[0] : 'User';

  const context = {
    name,
    firstName,
    skills: getSkills(),
    socialLinks: getSocialLinks(),
  };

  const prompt = `C:\\>`;

  // Use custom welcome message if configured, otherwise use default
  const customWelcome = getTerminalWelcome();
  const initialMessage = customWelcome || `${firstName} DOS [Version 2.0]
(C) Copyright ${firstName}. All rights reserved.

Type 'help' to see available commands.
`;

  useEffect(() => {
    setHistory([{ type: 'output', text: initialMessage }]);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = useCallback((input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (COMMANDS[cmd]) {
      return COMMANDS[cmd].execute(args, context);
    }

    return `'${cmd}' is not recognized as an internal or external command,
operable program or batch file.`;
  }, [context]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = currentLine;

      // Add command to history display
      setHistory(prev => [...prev, { type: 'input', text: `${prompt}${input}` }]);

      // Add to command history for up/down navigation
      if (input.trim()) {
        setCommandHistory(prev => [...prev, input]);
      }
      setHistoryIndex(-1);

      // Execute command
      const result = executeCommand(input);

      if (result) {
        if (typeof result === 'object') {
          if (result.action === 'clear') {
            setHistory([]);
          } else if (result.action === 'close') {
            onClose?.();
          } else if (result.action === 'color') {
            setColors({ bg: result.bg, fg: result.fg });
          } else if (result.action === 'open') {
            // Could dispatch to open another app
            setHistory(prev => [...prev, { type: 'output', text: `Opening ${result.app}...` }]);
          }
        } else {
          setHistory(prev => [...prev, { type: 'output', text: result }]);
        }
      }

      setCurrentLine('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentLine(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentLine(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentLine('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const input = currentLine.toLowerCase();
      const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(input));
      if (matches.length === 1) {
        setCurrentLine(matches[0]);
      } else if (matches.length > 1) {
        setHistory(prev => [...prev,
          { type: 'input', text: `${prompt}${currentLine}` },
          { type: 'output', text: matches.join('  ') }
        ]);
      }
    }
  }, [currentLine, commandHistory, historyIndex, executeCommand, onClose, prompt]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <Container
      ref={containerRef}
      onClick={handleContainerClick}
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      <Content>
        {history.map((item, i) => (
          <Line key={i} style={{ color: colors.fg }}>{item.text}</Line>
        ))}
        <InputLine>
          <span style={{ color: colors.fg }}>{prompt}</span>
          <Input
            ref={inputRef}
            value={currentLine}
            onChange={(e) => setCurrentLine(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            style={{ color: colors.fg, caretColor: colors.fg }}
          />
        </InputLine>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  background: #000;
  overflow: auto;
  cursor: text;

  /* Hide scrollbar - matches original */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  padding: 12px 8px;
  min-height: 100%;
  font-family: monospace;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: #c0c0c0;
  caret-color: #c0c0c0;
`;

const Line = styled.pre`
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const InputLine = styled.div`
  display: flex;
  align-items: flex-start;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  padding: 0;
  margin: 0;
`;

export default CMD;
