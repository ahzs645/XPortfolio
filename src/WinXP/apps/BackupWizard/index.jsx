import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

// All localStorage keys used by the XP environment
const BACKUP_KEYS = [
  'wallpaperOverrides',
  'screensaverSettings',
  'userAccounts',
  'activeUserId',
  'desktopIconPositions',
  'xp-volume',
  'xp-muted',
  'quickLaunchEnabled',
  'xp-footer-volume',
  'xp-footer-muted',
  'quickLaunchItems',
  'disabledApps',
  'programDefaults',
  'speechSettings',
  'fileTypeDefaults',
  'qqpet_skip_login',
  // User session keys
  'xp_session_timestamp',
  'xp_session_user_id',
  'xp_session_logged_in',
];

const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPane = styled.div`
  width: 164px;
  flex-shrink: 0;
  background-color: #4a608a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RightPane = styled.div`
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 25px;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-family: 'Tahoma', sans-serif;
  font-size: 18px;
  font-weight: normal;
  margin: 0 0 15px 0;
  color: #000;
`;

const Paragraph = styled.p`
  font-size: 11px;
  line-height: 1.5;
  margin: 0 0 12px 0;
  color: #000;
`;

const RadioGroup = styled.fieldset`
  border: none;
  margin: 15px 0 15px 10px;
  padding: 0;

  .field-row {
    margin-bottom: 12px;
  }

  .field-row label {
    font-weight: bold;
  }
`;

const RadioDescription = styled.div`
  margin-left: 22px;
  margin-top: 2px;
  font-size: 11px;
  color: #000;
`;

const Footer = styled.div`
  padding: 10px;
  border-top: 1px solid #ccc;
  text-align: right;
  flex-shrink: 0;
  background: #ece9d8;
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 14px;
  margin-left: 5px;
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

  &.default {
    border: 2px solid #003c74;
  }
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
`;

const StatusText = styled.div`
  font-size: 11px;
  color: #000;
  margin-bottom: 8px;
`;

const BackupInfo = styled.div`
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
  font-size: 10px;
  max-height: 120px;
  overflow-y: auto;

  ul {
    margin: 5px 0;
    padding-left: 20px;
  }

  li {
    margin: 2px 0;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const BrowseButton = styled.button`
  padding: 4px 12px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }
`;

const ErrorText = styled.div`
  color: #c00;
  font-size: 11px;
  margin: 10px 0;
`;

const SuccessText = styled.div`
  color: #080;
  font-size: 11px;
  margin: 10px 0;
`;

function BackupWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('backup'); // 'backup' or 'restore'
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [error, setError] = useState(null);
  const [itemsBackedUp, setItemsBackedUp] = useState([]);

  // Collect all settings from localStorage
  const collectBackupData = useCallback(() => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings: {},
    };

    const backedUpItems = [];

    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        data.settings[key] = value;
        backedUpItems.push(key);
      }
    });

    setItemsBackedUp(backedUpItems);
    return data;
  }, []);

  // Download backup as JSON file
  const downloadBackup = useCallback((data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Handle file selection for restore
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.version || !data.settings) {
          setError('Invalid backup file format.');
          return;
        }
        setRestoreFile({ file, data });
      } catch {
        setError('Failed to read backup file. Make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Restore settings from backup
  const restoreFromBackup = useCallback((data) => {
    const restoredItems = [];
    Object.entries(data.settings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
      restoredItems.push(key);
    });
    return restoredItems;
  }, []);

  const handleNext = () => {
    setError(null);

    if (step === 1 && mode === 'restore' && !restoreFile) {
      setError('Please select a backup file to restore.');
      return;
    }

    if (step === 1) {
      // Start backup/restore
      setIsRunning(true);
      setProgress(0);

      if (mode === 'backup') {
        // Simulate progress while collecting data
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              const data = collectBackupData();
              setBackupData(data);
              downloadBackup(data);
              setIsRunning(false);
              setStep(2);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      } else {
        // Restore from file
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              const restored = restoreFromBackup(restoreFile.data);
              setItemsBackedUp(restored);
              setIsRunning(false);
              setStep(2);
              return 100;
            }
            return prev + 8;
          });
        }, 120);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <>
            <Title>Welcome to the Backup or Restore Wizard</Title>
            <Paragraph>
              This wizard helps you back up or restore your files and settings.
            </Paragraph>
            <Paragraph>
              <strong>What gets backed up:</strong>
            </Paragraph>
            <BackupInfo>
              <ul>
                <li>Desktop wallpaper and screensaver settings</li>
                <li>User accounts and preferences</li>
                <li>Desktop icon positions</li>
                <li>Volume and audio settings</li>
                <li>Quick Launch items</li>
                <li>Program defaults and disabled apps</li>
                <li>Speech settings</li>
                <li>File type associations</li>
              </ul>
            </BackupInfo>
            <Paragraph>To continue, click Next.</Paragraph>
          </>
        );

      case 1: // Choose mode and execute
        return (
          <>
            <Title>Backup or Restore</Title>
            <Paragraph>
              Select whether you want to back up your current settings or restore from a previous backup.
            </Paragraph>
            <RadioGroup>
              <div className="field-row">
                <input
                  id="radio-backup"
                  type="radio"
                  name="mode"
                  checked={mode === 'backup'}
                  onChange={() => { setMode('backup'); setRestoreFile(null); setError(null); }}
                  disabled={isRunning}
                />
                <label htmlFor="radio-backup">Back up files and settings</label>
              </div>
              <RadioDescription>
                Save your current settings to a file that you can download.
              </RadioDescription>
              <div className="field-row" style={{ marginTop: 16 }}>
                <input
                  id="radio-restore"
                  type="radio"
                  name="mode"
                  checked={mode === 'restore'}
                  onChange={() => { setMode('restore'); setError(null); }}
                  disabled={isRunning}
                />
                <label htmlFor="radio-restore">Restore files and settings</label>
              </div>
              <RadioDescription>
                Restore your settings from a previously saved backup file.
              </RadioDescription>
            </RadioGroup>

            {mode === 'restore' && !isRunning && (
              <>
                <Paragraph style={{ marginTop: 10 }}>
                  Select the backup file to restore:
                </Paragraph>
                <FileInput
                  type="file"
                  id="backup-file"
                  accept=".json"
                  onChange={handleFileSelect}
                />
                <BrowseButton onClick={() => document.getElementById('backup-file').click()}>
                  Browse...
                </BrowseButton>
                {restoreFile && (
                  <BackupInfo style={{ marginTop: 10 }}>
                    <strong>Selected file:</strong> {restoreFile.file.name}<br />
                    <strong>Backup date:</strong> {new Date(restoreFile.data.timestamp).toLocaleString()}<br />
                    <strong>Items to restore:</strong> {Object.keys(restoreFile.data.settings).length}
                  </BackupInfo>
                )}
              </>
            )}

            {error && <ErrorText>{error}</ErrorText>}

            {isRunning && (
              <>
                <StatusText>
                  {mode === 'backup' ? 'Backing up' : 'Restoring'} settings... {progress}%
                </StatusText>
                <ProgressContainer>
                  <div className="field-row">
                    <progress max="100" value={progress} style={{ width: '100%' }} />
                  </div>
                </ProgressContainer>
              </>
            )}
          </>
        );

      case 2: // Complete
        return (
          <>
            <Title>Completing the Backup or Restore Wizard</Title>
            {mode === 'backup' ? (
              <>
                <SuccessText>Your settings have been backed up successfully!</SuccessText>
                <Paragraph>
                  A backup file has been downloaded to your computer. Keep this file safe -
                  you can use it to restore your settings later.
                </Paragraph>
                <BackupInfo>
                  <strong>Items backed up ({itemsBackedUp.length}):</strong>
                  <ul>
                    {itemsBackedUp.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </BackupInfo>
              </>
            ) : (
              <>
                <SuccessText>Your settings have been restored successfully!</SuccessText>
                <Paragraph>
                  Your settings have been restored from the backup file.
                  <strong> Please refresh the page</strong> to see the changes take effect.
                </Paragraph>
                <BackupInfo>
                  <strong>Items restored ({itemsBackedUp.length}):</strong>
                  <ul>
                    {itemsBackedUp.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </BackupInfo>
              </>
            )}
            <Paragraph>To close this wizard, click Finish.</Paragraph>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <WizardContainer>
      <ContentArea>
        <LeftPane>
          <img src={withBaseUrl('/ui/ntbackup.png')} alt="" />
        </LeftPane>
        <RightPane>{renderStep()}</RightPane>
      </ContentArea>
      <Footer>
        <Button onClick={handleBack} disabled={step === 0 || isRunning}>
          &lt; Back
        </Button>
        {step < 2 ? (
          <Button className="default" onClick={handleNext} disabled={isRunning}>
            Next &gt;
          </Button>
        ) : (
          <Button className="default" onClick={onClose}>
            Finish
          </Button>
        )}
        <Button onClick={onClose} disabled={isRunning}>
          Cancel
        </Button>
      </Footer>
    </WizardContainer>
  );
}

export default BackupWizard;
