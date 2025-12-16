import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useApp } from '../../../contexts/AppContext';

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
  const inputRef = useRef(null);
  const { openApp } = useApp();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleRun = () => {
    if (!command.trim()) {
      return;
    }

    const normalizedCommand = command.trim().toLowerCase();

    // Check command map first
    const appName = COMMAND_MAP[normalizedCommand];
    if (appName) {
      openApp(appName);
      onClose?.();
      return;
    }

    // Try to match app names directly (case-insensitive)
    // This allows users to type "Calculator" or "Notepad" directly
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
        ? `https://${command.trim()}`
        : command.trim();
      openApp('Internet Explorer', { initialUrl: url });
      onClose?.();
      return;
    }

    // Show error dialog for unrecognized commands
    // Format the command name - add .exe if not already present
    const displayCommand = command.trim().includes('.') ? command.trim() : `${command.trim()}.exe`;
    openApp('Error Dialog', {
      title: displayCommand,
      message: `${displayCommand} is not a valid Win32 application or could not be found.`,
      icon: 'error',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRun();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const handleBrowse = () => {
    // For now, just open My Computer as a file browser
    openApp('My Computer');
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
            <Input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              autoComplete="off"
              spellCheck="false"
            />
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

const Input = styled.input`
  flex: 1;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;

  &:focus {
    outline: none;
    border-color: #316ac5;
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
