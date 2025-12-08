import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

/**
 * OpenWith Dialog Component - Windows XP style "Open With" dialog
 * Shows when trying to open an unsupported file type
 */

// Programs that can potentially open files
const AVAILABLE_PROGRAMS = [
  { id: 'calculator', name: 'Calculator', icon: '/icons/xp/Calculator.png' },
  { id: 'internet', name: 'Internet Explorer', icon: '/icons/xp/InternetExplorer6.png' },
  { id: 'messenger', name: 'Windows Messenger', icon: '/icons/xp/messenger.png' },
  { id: 'minesweeper', name: 'Minesweeper', icon: '/icons/xp/Minesweeper.png' },
  { id: 'notepad', name: 'Notepad', icon: '/icons/xp/Notepad.png' },
  { id: 'outlook', name: 'Outlook Express', icon: '/icons/outlook/outlook.png' },
  { id: 'paint', name: 'Paint', icon: '/icons/xp/Paint.png' },
  { id: 'pinball', name: 'Pinball', icon: '/icons/pinball-icon.png' },
  { id: 'player', name: 'Windows Media Player', icon: '/icons/xp/WindowsMediaPlayer9.png' },
  { id: 'solitaire', name: 'Solitaire', icon: '/icons/solitaire-icon.png' },
  { id: 'viewer', name: 'Windows Picture and Fax Viewer', icon: '/icons/image-viewer.png' },
  { id: 'wordpad', name: 'WordPad', icon: '/icons/xp/wordpad.png' },
];

// Map program IDs to app names used in appSettings
const PROGRAM_TO_APP = {
  calculator: 'Calculator',
  internet: 'Internet Explorer',
  messenger: 'Windows Messenger',
  minesweeper: 'Minesweeper',
  notepad: 'Notepad',
  outlook: 'Outlook Express',
  paint: 'Paint',
  pinball: 'Pinball',
  player: 'Windows Media Player',
  solitaire: 'Solitaire',
  viewer: 'Image Viewer',
  wordpad: 'WordPad',
};

function OpenWith({
  fileName = 'Unknown file',
  fileData,
  fileId,
  contentType,
  inlineContent,
  onOpenWithProgram,
  onClose,
  onUpdateHeader,
}) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [alwaysUse, setAlwaysUse] = useState(false);

  // Get file extension for the "always use" feature
  const fileExtension = useMemo(() => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : '';
  }, [fileName]);

  // Update window header
  useEffect(() => {
    if (onUpdateHeader) {
      onUpdateHeader({
        title: 'Open With',
        icon: '/icons/xp/Default.png',
        buttons: ['close'],
      });
    }
  }, [onUpdateHeader]);

  const handleProgramSelect = (programId) => {
    setSelectedProgram(programId);
  };

  const handleOk = () => {
    if (selectedProgram && onOpenWithProgram) {
      const appName = PROGRAM_TO_APP[selectedProgram];

      // Save the preference if "always use" is checked
      if (alwaysUse && fileExtension) {
        try {
          const savedDefaults = JSON.parse(localStorage.getItem('fileTypeDefaults') || '{}');
          savedDefaults[fileExtension] = appName;
          localStorage.setItem('fileTypeDefaults', JSON.stringify(savedDefaults));
        } catch (e) {
          console.error('Failed to save file type default:', e);
        }
      }

      onOpenWithProgram({
        appName,
        fileName,
        fileData,
        fileId,
        contentType,
        inlineContent,
      });
    }
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const handleDoubleClick = (programId) => {
    setSelectedProgram(programId);
    setTimeout(() => {
      handleOk();
    }, 100);
  };

  return (
    <DialogContainer>
      <HeaderSection>
        <IconImage src="/icons/xp/Default.png" alt="Unknown file" />
        <HeaderText>
          <div style={{ marginBottom: '5px' }}>
            Choose the program you want to use to open this file:
          </div>
          <div>
            File: &nbsp; <strong>{fileName}</strong>
          </div>
        </HeaderText>
      </HeaderSection>

      <ProgramsGroup>
        <GroupTitle>Programs</GroupTitle>
        <ProgramsPane>
          <ProgramsList>
            <OptGroup>
              <OptGroupLabel>Recommended Programs:</OptGroupLabel>
            </OptGroup>
            <OptGroup>
              <OptGroupLabel>Other Programs:</OptGroupLabel>
              {AVAILABLE_PROGRAMS.map((program) => (
                <ProgramOption
                  key={program.id}
                  selected={selectedProgram === program.id}
                  onClick={() => handleProgramSelect(program.id)}
                  onDoubleClick={() => handleDoubleClick(program.id)}
                >
                  <ProgramIcon src={program.icon} alt={program.name} />
                  <ProgramName>{program.name}</ProgramName>
                </ProgramOption>
              ))}
            </OptGroup>
          </ProgramsList>

          <CheckboxRow>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={alwaysUse}
                onChange={(e) => setAlwaysUse(e.target.checked)}
              />
              Always use the selected program to open this kind of file
            </CheckboxLabel>
          </CheckboxRow>

          <BrowseButtonRow>
            <BrowseButton disabled>Browse...</BrowseButton>
          </BrowseButtonRow>
        </ProgramsPane>
      </ProgramsGroup>

      <InfoText>
        If the program you want is not in the list or on your computer, you can{' '}
        <InfoLink
          href="https://www.google.com/search?q=file+opener"
          target="_blank"
          rel="noopener noreferrer"
        >
          look for the appropriate program on the Web
        </InfoLink>
        .
      </InfoText>

      <ButtonRow>
        <ActionButton onClick={handleOk} disabled={!selectedProgram}>
          OK
        </ActionButton>
        <ActionButton onClick={handleCancel}>Cancel</ActionButton>
      </ButtonRow>
    </DialogContainer>
  );
}

const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 12px;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
  min-width: 380px;
`;

const HeaderSection = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  overflow: hidden;
  color: #000;
`;

const ProgramsGroup = styled.div`
  margin-bottom: 10px;
`;

const GroupTitle = styled.div`
  background: linear-gradient(180deg, #fff 0%, #c8d7f0 100%);
  color: #215dc6;
  font-weight: bold;
  padding: 4px 8px;
  border: 1px solid #8eb8f0;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
`;

const ProgramsPane = styled.div`
  border: 1px solid #8eb8f0;
  border-top: none;
  background: #fff;
  padding: 8px;
`;

const ProgramsList = styled.div`
  height: 220px;
  overflow-y: auto;
  border: 1px solid #7f9db9;
  background: #fff;
  margin-bottom: 10px;
`;

const OptGroup = styled.div`
  margin-bottom: 4px;
`;

const OptGroupLabel = styled.div`
  padding: 2px 4px;
  font-weight: bold;
  color: #000;
  background: #ece9d8;
`;

const ProgramOption = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 4px 2px 20px;
  cursor: pointer;
  background: ${(props) => (props.selected ? '#316ac5' : 'transparent')};
  color: ${(props) => (props.selected ? '#fff' : '#000')};

  &:hover {
    background: ${(props) => (props.selected ? '#316ac5' : '#e8f0fb')};
  }
`;

const ProgramIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
`;

const ProgramName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CheckboxRow = styled.div`
  margin: 10px 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #000;
`;

const Checkbox = styled.input`
  margin-right: 6px;
`;

const BrowseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const BrowseButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  &:disabled {
    color: #a0a0a0;
    cursor: default;
  }
`;

const InfoText = styled.div`
  margin-bottom: 10px;
  color: #000;
  line-height: 1.4;
`;

const InfoLink = styled.a`
  color: #0000ff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #ff0000;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #d5d2c8;
`;

const ActionButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }

  &:disabled {
    color: #a0a0a0;
    cursor: default;
  }
`;

export default OpenWith;
