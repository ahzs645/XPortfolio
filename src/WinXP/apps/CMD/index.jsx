import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { useApp } from '../../../contexts/AppContext';
import { useFileSystem, SYSTEM_IDS } from '../../../contexts/FileSystemContext';

function CMD({ onClose }) {
  const { getFullName, getSkills, getSocialLinks, getTerminalWelcome } = useConfig();
  const { openFile, openApp } = useApp();
  const {
    fileSystem,
    isLoading: fsLoading,
    getFolderContents,
    getFileContent,
  } = useFileSystem();
  const [history, setHistory] = useState([]);
  const [currentLine, setCurrentLine] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [colors, setColors] = useState({ bg: '#000000', fg: '#c0c0c0' });
  const [cwd, setCwd] = useState('C:/');
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

  const prompt = `${cwd}>`;

  // Use custom welcome message if configured, otherwise use default
  const customWelcome = getTerminalWelcome();
  const defaultWelcome = `The XPerience Project [Version 1.1.0000]
(C) Copyright ${firstName}. All rights reserved.
`;
  const initialMessage = `${customWelcome || defaultWelcome}
Type 'help' to see available commands.
`;

  const padRight = useCallback((s, n) => {
    const str = String(s ?? '');
    return str + ' '.repeat(Math.max(0, n - str.length));
  }, []);

  const formatBytes = useCallback((bytes = 0) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
  }, []);

  const normalizeSeparators = useCallback((path) => {
    return (path || '').replace(/\\/g, '/').replace(/\/+/g, '/');
  }, []);

  const buildAbsolutePath = useCallback((input) => {
    if (!input) return cwd;
    let path = normalizeSeparators(input);
    if (/^[A-Za-z]:$/i.test(path)) return path.toUpperCase() + '/';
    if (/^[A-Za-z]:\//i.test(path)) return path;
    if (path === '..') {
      const parts = cwd.replace(/\/+$/, '').split('/');
      parts.pop();
      return (parts.join('/') || 'C:') + '/';
    }
    if (path.startsWith('/')) return `C:${path}`;
    return (cwd.endsWith('/') ? cwd : `${cwd}/`) + path;
  }, [cwd, normalizeSeparators]);

  const resolveNode = useCallback((inputPath) => {
    if (!fileSystem) return null;
    const abs = normalizeSeparators(buildAbsolutePath(inputPath));
    const driveMatch = abs.match(/^([A-Za-z]):/);
    if (!driveMatch || driveMatch[1].toUpperCase() !== 'C') return null;
    let rest = abs.replace(/^([A-Za-z]):/, '');
    rest = rest.replace(/^\/+/, '');

    let current = fileSystem[SYSTEM_IDS.C_DRIVE];
    if (!current) return null;
    if (!rest) return current;

    const parts = rest.split('/').filter(Boolean);
    for (const part of parts) {
      const children = getFolderContents(current.id) || [];
      const next = children.find(child => (child.name || '').toLowerCase() === part.toLowerCase());
      if (!next) return null;
      current = next;
    }
    return current;
  }, [buildAbsolutePath, fileSystem, getFolderContents, normalizeSeparators]);

  const readFileText = useCallback(async (item) => {
    const data = await getFileContent(item.id);
    if (!data) return '';
    if (data instanceof Blob) return data.text();
    if (typeof data === 'string') return data;
    try {
      if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
      if (ArrayBuffer.isView(data)) return new TextDecoder().decode(data.buffer);
    } catch {
      // ignore decode errors
    }
    return String(data);
  }, [getFileContent]);

  const runDir = useCallback(async (arg) => {
    if (fsLoading || !fileSystem) return 'File system is still loading...';
    const node = resolveNode(arg);
    if (!node) return 'File not found or directory is empty.';
    if (!node.children) return 'Not a directory.';
    const items = getFolderContents(node.id) || [];
    if (!items.length) return 'File not found or directory is empty.';
    const lines = [...items]
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((it) => {
        const label = it.name || '';
        if (it.children) return `${padRight(label, 30)}<DIR>`;
        return `${padRight(label, 30)}${padRight(formatBytes(it.size || 0), 12)}`;
      });
    return lines.join('\n');
  }, [fileSystem, fsLoading, formatBytes, getFolderContents, padRight, resolveNode]);

  const runCd = useCallback((arg) => {
    if (!arg) return cwd;
    const node = resolveNode(arg);
    if (!node) return 'The system cannot find the path specified.';
    if (!node.children) return 'The directory name is invalid.';
    const next = buildAbsolutePath(arg);
    setCwd(next.endsWith('/') ? next : `${next}/`);
    return null;
  }, [buildAbsolutePath, cwd, resolveNode]);

  const runType = useCallback(async (arg) => {
    if (!arg) return 'The syntax of the command is incorrect.';
    const node = resolveNode(arg);
    if (!node || node.children) return 'File not found.';
    const content = await readFileText(node);
    return content || '';
  }, [readFileText, resolveNode]);

  const runStart = useCallback(async (arg) => {
    if (!arg) return 'The syntax of the command is incorrect.';
    const node = resolveNode(arg);
    if (!node) return 'The system cannot find the file specified.';
    if (node.children) {
      const next = buildAbsolutePath(arg);
      setCwd(next.endsWith('/') ? next : `${next}/`);
      return `Opened folder ${next}`;
    }
    await openFile(node);
    return `Opening ${node.name || 'file'}...`;
  }, [buildAbsolutePath, openFile, resolveNode]);

  const commandHandlers = useMemo(() => {
    const colorMap = {
      '0': '#000000', '1': '#000080', '2': '#008000', '3': '#008080',
      '4': '#800000', '5': '#800080', '6': '#808000', '7': '#c0c0c0',
      '8': '#808080', '9': '#0000ff', 'a': '#00ff00', 'b': '#00ffff',
      'c': '#ff0000', 'd': '#ff00ff', 'e': '#ffff00', 'f': '#ffffff',
    };

    const handlers = {
      clear: { description: 'Clear the screen', execute: async () => ({ action: 'clear' }) },
      cls: { description: 'Clear the screen', execute: async () => ({ action: 'clear' }) },
      exit: { description: 'Close the command prompt', execute: async () => ({ action: 'close' }) },
      echo: { description: 'Display a message', execute: async (args) => args.join(' ') || '' },
      date: { description: 'Display current date', execute: async () => new Date().toLocaleDateString() },
      time: { description: 'Display current time', execute: async () => new Date().toLocaleTimeString() },
      ver: { description: 'Display version', execute: async () => `XPortfolio DOS [Version ${context.name || 'User'} 2.0]` },
      whoami: { description: 'Display current user', execute: async () => context.name || 'User' },
      about: { description: 'About the developer', execute: async () => context.name ? `Designed and developed by ${context.name}` : 'XPortfolio - Windows XP Style Portfolio' },
      skills: {
        description: 'List skills',
        execute: async () => {
          if (context.skills && context.skills.length > 0) {
            return `Skills:\n${context.skills.map(s => `  - ${s}`).join('\n')}`;
          }
          return 'No skills data available. Check CV configuration.';
        },
      },
      contact: {
        description: 'Display contact information',
        execute: async () => {
          const links = context.socialLinks || [];
          if (links.length > 0) {
            return `Contact:\n${links.map(l => `  ${l.network}: ${l.url}`).join('\n')}`;
          }
          return 'No contact information available.';
        },
      },
      resume: {
        description: 'Open resume',
        execute: async () => {
          openApp?.('Resume');
          return 'Opening Resume...';
        },
      },
      projects: {
        description: 'Open projects',
        execute: async () => {
          openApp?.('Projects');
          return 'Opening Projects...';
        },
      },
      color: {
        description: 'Change console colors (e.g., color 0a)',
        execute: async (args) => {
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
      dir: { description: 'List directory contents', execute: runDir },
      cd: { description: 'Change directory', execute: async (args) => runCd(args[0]) },
      type: { description: 'Display file contents', execute: runType },
      start: { description: 'Open a file or folder', execute: runStart },
      tree: {
        description: 'Display directory tree (static sample)',
        execute: async () => `C:.
├───Projects
├───Documents
│   └───Resume
└───Games
    ├───Minesweeper
    ├───Solitaire
    └───Pinball`,
      },
    };

    handlers.help = {
      description: 'Display available commands',
      execute: async () => {
        const cmds = Object.entries(handlers)
          .map(([name, cmd]) => `  ${name.padEnd(12)} - ${cmd.description}`)
          .join('\n');
        return `Commands:\n${cmds}`;
      },
    };

    return handlers;
  }, [context.name, context.skills, context.socialLinks, openApp, runCd, runDir, runStart, runType]);

  useEffect(() => {
    setHistory([{ type: 'output', text: initialMessage }]);
  }, [initialMessage]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = useCallback(async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (/^[CAD]:$/i.test(trimmed)) {
      const drive = trimmed.toUpperCase();
      setCwd(`${drive}/`);
      return null;
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const handler = commandHandlers[cmd];
    if (handler) {
      return await handler.execute(args, context);
    }

    return `'${cmd}' is not recognized as an internal or external command,
operable program or batch file.`;
  }, [commandHandlers]);

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
      (async () => {
        const result = await executeCommand(input);
        if (result) {
          if (typeof result === 'object') {
            if (result.action === 'clear') {
              setHistory([]);
            } else if (result.action === 'close') {
              onClose?.();
            } else if (result.action === 'color') {
              setColors({ bg: result.bg, fg: result.fg });
            } else if (result.action === 'open') {
              setHistory(prev => [...prev, { type: 'output', text: `Opening ${result.app}...` }]);
            }
          } else if (result.length) {
            setHistory(prev => [...prev, { type: 'output', text: result }]);
          }
        }
        setCurrentLine('');
      })();
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
      const matches = Object.keys(commandHandlers).filter(cmd => cmd.startsWith(input));
      if (matches.length === 1) {
        setCurrentLine(matches[0]);
      } else if (matches.length > 1) {
        setHistory(prev => [...prev,
          { type: 'input', text: `${prompt}${currentLine}` },
          { type: 'output', text: matches.join('  ') }
        ]);
      }
    }
  }, [commandHandlers, commandHistory, currentLine, executeCommand, historyIndex, onClose, prompt]);

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
