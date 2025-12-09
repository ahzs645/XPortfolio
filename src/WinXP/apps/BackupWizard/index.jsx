import { useState } from 'react';
import styled from 'styled-components';

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

function BackupWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('backup'); // 'backup' or 'restore'
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleNext = () => {
    if (step === 2) {
      // Start backup/restore simulation
      setIsRunning(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setStep(3);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
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
              <strong>Warning:</strong> This feature will back up your C: drive and settings.
              It does not include D: or E: drives.
            </Paragraph>
            <Paragraph>To continue, click Next.</Paragraph>
          </>
        );

      case 1: // Choose mode
        return (
          <>
            <Title>Backup or Restore</Title>
            <Paragraph>
              You can use this wizard to back up your files and settings, or to restore
              your files and settings from a previous backup.
            </Paragraph>
            <RadioGroup>
              <div className="field-row">
                <input
                  id="radio-backup"
                  type="radio"
                  name="mode"
                  checked={mode === 'backup'}
                  onChange={() => setMode('backup')}
                />
                <label htmlFor="radio-backup">Back up files and settings</label>
              </div>
              <RadioDescription>
                Back up your desktop files, My Documents, and application settings.
              </RadioDescription>
              <div className="field-row" style={{ marginTop: 16 }}>
                <input
                  id="radio-restore"
                  type="radio"
                  name="mode"
                  checked={mode === 'restore'}
                  onChange={() => setMode('restore')}
                />
                <label htmlFor="radio-restore">Restore files and settings</label>
              </div>
              <RadioDescription>
                Restore your files and settings from a previous backup.
              </RadioDescription>
            </RadioGroup>
          </>
        );

      case 2: // Running
        return (
          <>
            <Title>{mode === 'backup' ? 'Backing Up' : 'Restoring'} Files and Settings</Title>
            <Paragraph>
              Please wait while the wizard {mode === 'backup' ? 'backs up' : 'restores'} your
              files and settings.
            </Paragraph>
            <StatusText>
              {isRunning
                ? `${mode === 'backup' ? 'Backing up' : 'Restoring'} files... ${progress}%`
                : 'Click Next to start.'}
            </StatusText>
            {isRunning && (
              <ProgressContainer>
                <div className="field-row">
                  <progress max="100" value={progress} style={{ width: '100%' }} />
                </div>
              </ProgressContainer>
            )}
            <Paragraph>
              This may take several minutes depending on the size of your files.
            </Paragraph>
          </>
        );

      case 3: // Complete
        return (
          <>
            <Title>Completing the Backup or Restore Wizard</Title>
            <Paragraph>
              You have successfully {mode === 'backup' ? 'backed up' : 'restored'} your
              files and settings.
            </Paragraph>
            <Paragraph>
              {mode === 'backup'
                ? 'Your backup has been saved and can be used to restore your settings on another device.'
                : 'Your files and settings have been restored from the backup.'}
            </Paragraph>
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
          <img src="/ui/ntbackup.png" alt="" />
        </LeftPane>
        <RightPane>{renderStep()}</RightPane>
      </ContentArea>
      <Footer>
        <Button onClick={handleBack} disabled={step === 0 || isRunning}>
          &lt; Back
        </Button>
        {step < 3 ? (
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
