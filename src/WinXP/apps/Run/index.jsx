import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../../../contexts/AppContext';

const HISTORY_KEY = 'xp-run-history';
const MAX_HISTORY = 10;

// Load command history from localStorage
function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save command to history (most recent first, deduped)
function saveToHistory(cmd) {
  try {
    const history = loadHistory().filter(h => h.toLowerCase() !== cmd.toLowerCase());
    history.unshift(cmd);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors
  }
}

// Map common run commands to app names
const COMMAND_MAP = {
  // Windows-style shortcuts
  'calc': 'Calculator',
  'calc.exe': 'Calculator',
  'calculator': 'Calculator',
  'notepad': 'Notepad',
  'notepad.exe': 'Notepad',
  'cmd': 'Command Prompt',
  'cmd.exe': 'Command Prompt',
  'mspaint': 'Paint',
  'mspaint.exe': 'Paint',
  'paint': 'Paint',
  'winamp': 'Winamp',
  'winamp.exe': 'Winamp',
  'minesweeper': 'Minesweeper',
  'winmine': 'Minesweeper',
  'winmine.exe': 'Minesweeper',
  'sol': 'Solitaire',
  'sol.exe': 'Solitaire',
  'solitaire': 'Solitaire',
  'spider': 'Spider Solitaire',
  'spider.exe': 'Spider Solitaire',
  'pinball': 'Pinball',
  'wordpad': 'WordPad',
  'wordpad.exe': 'WordPad',
  'write': 'WordPad',
  'write.exe': 'WordPad',
  'iexplore': 'Internet Explorer',
  'iexplore.exe': 'Internet Explorer',
  'explorer': 'My Computer',
  'explorer.exe': 'My Computer',
  'msimn': 'Outlook Express',
  'msimn.exe': 'Outlook Express',
  'outlook': 'Outlook Express',
  'wmplayer': 'Windows Media Player',
  'wmplayer.exe': 'Windows Media Player',
  'mplayer2': 'Windows Media Player Classic',
  'mplayer2.exe': 'Windows Media Player Classic',
  'sndrec32': 'Sound Recorder',
  'sndrec32.exe': 'Sound Recorder',
  'soundrecorder': 'Sound Recorder',
  'taskmgr': 'Task Manager',
  'taskmgr.exe': 'Task Manager',
  'control': 'My Computer',
  'control.exe': 'My Computer',
  'sysdm.cpl': 'System Properties',
  'desk.cpl': 'Display Properties',
  'timedate.cpl': 'Date and Time Properties',
  'nusrmgr.cpl': 'User Accounts',
  'appwiz.cpl': 'Add or Remove Programs',
  'regedit': 'Registry Editor',
  'regedit.exe': 'Registry Editor',
  'msconfig': 'System Recovery',
  'msconfig.exe': 'System Recovery',
  'mstsc': 'MSN Messenger',
  'messenger': 'Windows Messenger',

  // Portfolio shortcuts
  'about': 'About Me',
  'resume': 'Resume',
  'cv': 'Resume',
  'projects': 'Projects',
  'contact': 'Contact',

  // Games
  'runescape': 'RuneScape Classic',
  'rs': 'RuneScape Classic',
  'wow': 'World of Warcraft',
  'warcraft': 'World of Warcraft',
  'wizard101': 'Wizard101',
  'wiz': 'Wizard101',
  'qqpet': 'QQ Penguin',
  'qqarcade': 'QQ Arcade',

  // Help
  'help': 'Help and Support',
  'helpctr': 'Help and Support',
  'helpctr.exe': 'Help and Support',
};

function Run({ onClose }) {
  const [command, setCommand] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [history] = useState(loadHistory);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { openApp } = useApp();
  const selectedCommand = selectedIndex >= 0 && selectedIndex < history.length
    ? history[selectedIndex]
    : command;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  const handleRun = useCallback(() => {
    if (!selectedCommand.trim()) {
      return;
    }

    const trimmedCommand = selectedCommand.trim();
    const normalizedCommand = trimmedCommand.toLowerCase();

    // Save to history before executing
    saveToHistory(trimmedCommand);

    // Check command map first
    const appName = COMMAND_MAP[normalizedCommand];
    if (appName) {
      openApp(appName);
      onClose?.();
      return;
    }

    // Try to match app names directly (case-insensitive)
    const directMatch = Object.keys(COMMAND_MAP).find(
      key => COMMAND_MAP[key].toLowerCase() === normalizedCommand
    );
    if (directMatch) {
      openApp(COMMAND_MAP[directMatch]);
      onClose?.();
      return;
    }

    // Check if it's a URL
    if (normalizedCommand.startsWith('http://') ||
        normalizedCommand.startsWith('https://') ||
        normalizedCommand.startsWith('www.')) {
      const url = normalizedCommand.startsWith('www.')
        ? `https://${trimmedCommand}`
        : trimmedCommand;
      openApp('Internet Explorer', { initialUrl: url });
      onClose?.();
      return;
    }

    // Show error dialog for unrecognized commands
    const displayCommand = trimmedCommand.includes('.') ? trimmedCommand : `${trimmedCommand}.exe`;
    openApp('Error Dialog', {
      title: displayCommand,
      message: `${displayCommand} is not a valid Win32 application or could not be found.`,
      icon: 'error',
    });
  }, [openApp, onClose, selectedCommand]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      handleRun();
    } else if (e.key === 'Escape') {
      if (showDropdown) {
        setShowDropdown(false);
      } else {
        onClose?.();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown && history.length > 0) {
        setShowDropdown(true);
        setSelectedIndex(0);
      } else if (showDropdown) {
        setSelectedIndex(prev => Math.min(prev + 1, history.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown) {
        const newIndex = selectedIndex - 1;
        if (newIndex < 0) {
          setShowDropdown(false);
          setSelectedIndex(-1);
        } else {
          setSelectedIndex(newIndex);
        }
      }
    }
  };

  const handleHistorySelect = (item) => {
    setCommand(item);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleBrowse = () => {
    openApp('My Computer');
  };

  const toggleDropdown = () => {
    if (history.length > 0) {
      setShowDropdown(!showDropdown);
      setSelectedIndex(-1);
    }
  };

  return (
    <Container>
      <ContentArea>
        <IconWrapper>
          <RunIcon src="/icons/luna/run.png" alt="Run" />
        </IconWrapper>
        <TextContent>
          <Description>
            Type the name of a program, folder, document, or
            Internet resource, and Windows will open it for you.
          </Description>
          <InputRow>
            <Label>Open:</Label>
            <ComboBoxWrapper>
              <Input
                ref={inputRef}
                type="text"
                value={selectedCommand}
                onChange={(e) => {
                  setCommand(e.target.value);
                  setShowDropdown(false);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder=""
                autoComplete="off"
                spellCheck="false"
              />
              <DropdownButton
                onClick={toggleDropdown}
                tabIndex={-1}
                aria-label="Show command history"
                $hasHistory={history.length > 0}
              >
                <DropdownArrow />
              </DropdownButton>
              {showDropdown && history.length > 0 && (
                <DropdownList ref={dropdownRef}>
                  {history.map((item, index) => (
                    <DropdownItem
                      key={index}
                      $selected={index === selectedIndex}
                      onMouseDown={() => handleHistorySelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {item}
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </ComboBoxWrapper>
          </InputRow>
        </TextContent>
      </ContentArea>
      <ButtonRow>
        <Button onClick={handleRun} $primary>
          OK
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleBrowse}>
          Browse...
        </Button>
      </ButtonRow>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 12px;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
  min-width: 340px;
`;

const ContentArea = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
`;

const RunIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Description = styled.div`
  color: #000;
  line-height: 1.4;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  color: #000;
  white-space: nowrap;
`;

const ComboBoxWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
`;

const Input = styled.input`
  flex: 1;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  border-right: none;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const DropdownButton = styled.button`
  width: 17px;
  height: 100%;
  border: 1px solid #7f9db9;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  cursor: ${props => props.$hasHistory ? 'pointer' : 'default'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    ${props => props.$hasHistory && `
      background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
    `}
  }

  &:active {
    ${props => props.$hasHistory && `
      background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
    `}
  }
`;

const DropdownArrow = styled.span`
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 4px solid #000;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #7f9db9;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: 2px 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  background: ${props => props.$selected ? '#316ac5' : '#fff'};
  color: ${props => props.$selected ? '#fff' : '#000'};

  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 12px;
  background: ${props => props.$primary
    ? 'linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%)'
    : 'linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%)'};
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  ${props => props.$primary && `
    box-shadow: 0 0 0 1px #000 inset;
  `}

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
`;

export default Run;
