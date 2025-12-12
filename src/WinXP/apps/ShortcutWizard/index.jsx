import { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS } from '../../../contexts/FileSystemContext';
import { useApp } from '../../../contexts/AppContext';
import { withBaseUrl } from '../../../utils/baseUrl';

// Main wizard container
const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
`;

// Main content area with sidebar and content
const WizardBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

// Sidebar styled to match Windows XP wizard look
const SidebarImage = styled.div`
  width: 164px;
  flex-shrink: 0;
  background: #0a246a;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

// Content area (beige/cream)
const ContentArea = styled.div`
  flex: 1;
  background: #ece9d8;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ContentTitle = styled.p`
  margin: 0 0 16px 0;
  font-size: 11px;
  color: #000;
  line-height: 1.5;
`;

const InputLabel = styled.label`
  font-size: 11px;
  color: #000;
  margin-bottom: 6px;
  display: block;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  background: #fff;

  &:focus {
    outline: none;
  }
`;

const BrowseButton = styled.button`
  padding: 4px 12px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }
`;

const HelpText = styled.p`
  margin: auto 0 0 0;
  font-size: 11px;
  color: #000;
`;

// Footer with buttons
const WizardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ece9d8;
  border-top: 1px solid #fff;
  box-shadow: 0 -1px 0 #a0a0a0;
`;

const FooterButton = styled.button`
  min-width: 75px;
  padding: 4px 14px;
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

  &:disabled {
    color: #a0a0a0;
    cursor: default;
    border-color: #a0a0a0;
  }
`;

const ErrorText = styled.div`
  color: #c00;
  font-size: 11px;
  margin-top: -12px;
  margin-bottom: 12px;
`;

// Available shortcut targets (programs that can be launched)
const AVAILABLE_TARGETS = [
  { name: 'About Me', icon: '/icons/about.webp', target: 'About Me' },
  { name: 'Resume', icon: '/icons/pdf/PDF.ico', target: 'Resume' },
  { name: 'Contact', icon: '/icons/contact.webp', target: 'Contact' },
  { name: 'Calculator', icon: '/icons/xp/Calculator.png', target: 'Calculator' },
  { name: 'Notepad', icon: '/icons/xp/Notepad.png', target: 'Notepad' },
  { name: 'Paint', icon: '/icons/xp/Paint.png', target: 'Paint' },
  { name: 'Minesweeper', icon: '/icons/xp/Minesweeper.png', target: 'Minesweeper' },
  { name: 'Solitaire', icon: '/icons/solitaire-icon.png', target: 'Solitaire' },
  { name: 'Spider Solitaire', icon: '/icons/spider-solitaire-icon.webp', target: 'Spider Solitaire' },
  { name: '3D Pinball', icon: '/icons/pinball-icon.png', target: 'Pinball' },
  { name: 'Command Prompt', icon: '/icons/xp/CommandPrompt.png', target: 'Command Prompt' },
  { name: 'Windows Media Player', icon: '/icons/xp/WindowsMediaPlayer9.png', target: 'Windows Media Player' },
  { name: 'Internet Explorer', icon: '/icons/xp/InternetExplorer6.png', target: 'Internet Explorer' },
  { name: 'Sound Recorder', icon: '/icons/xp/SoundRecorder.webp', target: 'Sound Recorder' },
  { name: 'Winamp', icon: '/icons/winamp.png', target: 'Winamp' },
  { name: 'My Computer', icon: '/icons/xp/MyComputer.png', target: 'My Computer' },
  { name: 'Recycle Bin', icon: '/icons/xp/RecycleBinempty.png', target: 'Recycle Bin' },
  { name: 'Display Properties', icon: '/icons/xp/DisplayProperties.png', target: 'Display Properties' },
  { name: 'WordPad', icon: '/icons/xp/wordpad.png', target: 'WordPad' },
  { name: 'Help and Support', icon: '/icons/help.png', target: 'Help and Support' },
  { name: 'User Accounts', icon: '/icons/xp/UserAccounts.png', target: 'User Accounts' },
  { name: 'Add or Remove Programs', icon: '/icons/xp/programs/add.png', target: 'Add or Remove Programs' },
  { name: 'Windows Messenger', icon: '/icons/xp/messenger.png', target: 'Windows Messenger' },
  { name: 'Adobe Reader', icon: '/icons/pdf/acroaum_grp107_lang1033.ico', target: 'Adobe Reader' },
];

// Global callback registry for inter-window communication
const browseCallbacks = new Map();

function ShortcutWizard({ onClose }) {
  const { createItem, fileSystem } = useFileSystem();
  const { openApp } = useApp();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [shortcutName, setShortcutName] = useState('');
  const [error, setError] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [browseSelection, setBrowseSelection] = useState(null); // Stores full selection from browse dialog
  const callbackIdRef = useRef(null);

  // Find target info from location (for manually typed entries)
  const findTargetInfo = useCallback((loc) => {
    return AVAILABLE_TARGETS.find(t =>
      t.name.toLowerCase() === loc.toLowerCase() ||
      t.target.toLowerCase() === loc.toLowerCase()
    );
  }, []);

  // Clean up callback on unmount
  useEffect(() => {
    return () => {
      if (callbackIdRef.current) {
        browseCallbacks.delete(callbackIdRef.current);
      }
    };
  }, []);

  const handleBrowse = useCallback(() => {
    // Create a unique callback ID
    const callbackId = `browse-${Date.now()}`;
    callbackIdRef.current = callbackId;

    // Register callback
    browseCallbacks.set(callbackId, (selection) => {
      if (selection) {
        setLocation(selection.name);
        setSelectedIcon(selection.icon);
        setBrowseSelection(selection); // Store full selection for folder shortcuts
      }
      browseCallbacks.delete(callbackId);
    });

    // Open Browse For Folder dialog
    openApp('Browse For Folder', {
      onSelect: (selection) => {
        const callback = browseCallbacks.get(callbackId);
        if (callback) {
          callback(selection);
        }
      },
      title: 'Select the target of the shortcut below:',
    });
  }, [openApp]);

  const handleNext = () => {
    if (step === 1) {
      if (!location.trim()) {
        setError('Please enter a location.');
        return;
      }

      // If user browsed and selected a folder, allow it
      // Otherwise, validate against available programs
      const target = findTargetInfo(location);
      if (!browseSelection && !target) {
        setError('The specified location could not be found. Please enter a valid program name or use Browse.');
        return;
      }

      setError('');
      // Pre-fill shortcut name from location with .lnk extension
      const baseName = location.endsWith('.lnk') ? location : `${location}.lnk`;
      setShortcutName(baseName);
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleFinish = async () => {
    if (!shortcutName.trim()) {
      setError('Please enter a name for the shortcut.');
      return;
    }

    // Use browse selection if available, otherwise find from available targets
    const target = findTargetInfo(location);
    const finalTarget = browseSelection?.target || target?.target || location;
    const finalIcon = selectedIcon || browseSelection?.icon || target?.icon || '/icons/xp/Shortcutoverlay.png';
    // Store fsId for folder/file shortcuts so they can be opened properly
    const finalFsId = browseSelection?.fsId || null;
    const finalItemType = browseSelection?.type || null;

    // Create the shortcut file on desktop
    const finalName = shortcutName.endsWith('.lnk') ? shortcutName : `${shortcutName}.lnk`;

    // Check for duplicate name on desktop
    const desktop = fileSystem[SYSTEM_IDS.DESKTOP];
    if (desktop) {
      const existingNames = desktop.children
        .map(id => fileSystem[id]?.name?.toLowerCase())
        .filter(Boolean);

      if (existingNames.includes(finalName.toLowerCase())) {
        setError('A shortcut with this name already exists on the desktop.');
        return;
      }
    }

    try {
      // Create shortcut using file system
      const id = await createItem(SYSTEM_IDS.DESKTOP, finalName, 'shortcut', {
        icon: finalIcon,
        target: finalTarget,
        fsId: finalFsId,
        targetType: finalItemType,
      });

      if (id) {
        onClose?.();
      } else {
        setError('Failed to create shortcut.');
      }
    } catch (err) {
      console.error('Error creating shortcut:', err);
      setError('Failed to create shortcut.');
    }
  };

  return (
    <WizardContainer>
      <WizardBody>
        <SidebarImage>
          <img src={withBaseUrl('/icons/wizard/shortcut-wizard-sidebar.png')} alt="" />
        </SidebarImage>

        <ContentArea>
          {step === 1 && (
            <>
              <ContentTitle>
                This wizard helps you to create shortcuts to local or network programs, files, folders, computers, or Internet addresses.
              </ContentTitle>

              <InputLabel>Type the location of the item:</InputLabel>
              <InputRow>
                <TextInput
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError('');
                    // Clear browse selection when user types manually
                    if (browseSelection) {
                      setBrowseSelection(null);
                      setSelectedIcon(null);
                    }
                  }}
                  autoFocus
                />
                <BrowseButton onClick={handleBrowse}>Browse...</BrowseButton>
              </InputRow>

              {error && <ErrorText>{error}</ErrorText>}

              <HelpText>Click Next to continue.</HelpText>
            </>
          )}

          {step === 2 && (
            <>
              <ContentTitle>
                Select a name for the shortcut:
              </ContentTitle>

              <InputLabel>Type a name for this shortcut:</InputLabel>
              <InputRow>
                <TextInput
                  type="text"
                  value={shortcutName}
                  onChange={(e) => {
                    setShortcutName(e.target.value);
                    setError('');
                  }}
                  autoFocus
                />
              </InputRow>

              {error && <ErrorText>{error}</ErrorText>}

              <HelpText>Click Finish to create the shortcut.</HelpText>
            </>
          )}
        </ContentArea>
      </WizardBody>

      <WizardFooter>
        <FooterButton onClick={handleBack} disabled={step === 1}>
          &lt; Back
        </FooterButton>
        {step === 1 ? (
          <FooterButton onClick={handleNext}>Next &gt;</FooterButton>
        ) : (
          <FooterButton onClick={handleFinish}>Finish</FooterButton>
        )}
        <FooterButton onClick={onClose}>Cancel</FooterButton>
      </WizardFooter>
    </WizardContainer>
  );
}

export default ShortcutWizard;
