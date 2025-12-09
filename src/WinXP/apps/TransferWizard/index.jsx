import { useState, useCallback } from 'react';
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

const CheckboxGroup = styled.fieldset`
  border: none;
  margin: 10px 0 10px 10px;
  padding: 0;

  .field-row {
    margin-bottom: 8px;
  }
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

const TransferCode = styled.div`
  background: #f0f0f0;
  border: 1px solid #999;
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  letter-spacing: 2px;
  text-align: center;
  margin: 15px 0;
  user-select: all;
`;

const InputRow = styled.div`
  margin: 10px 0;

  input[type='text'] {
    padding: 4px 8px;
    width: 200px;
  }
`;

function TransferWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('export'); // 'export' or 'import'
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [transferCode, setTransferCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [selectedItems, setSelectedItems] = useState({
    desktop: true,
    settings: true,
    files: true,
    bookmarks: false,
  });

  const generateTransferCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }, []);

  const handleNext = () => {
    if (step === 2 && mode === 'export') {
      // Generate transfer code and start export
      setIsRunning(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setTransferCode(generateTransferCode());
            setStep(3);
            return 100;
          }
          return prev + 8;
        });
      }, 150);
    } else if (step === 2 && mode === 'import') {
      // Start import
      setIsRunning(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRunning(false);
            setStep(4);
            return 100;
          }
          return prev + 6;
        });
      }, 180);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleItemToggle = (item) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <>
            <Title>Welcome to the Files and Settings Transfer Wizard</Title>
            <Paragraph>
              This wizard helps you transfer your entire environment from one device or
              browser to another.
            </Paragraph>
            <Paragraph>Please close any other programs before you continue.</Paragraph>
            <Paragraph>To continue, click Next.</Paragraph>
          </>
        );

      case 1: // Choose mode
        return (
          <>
            <Title>Which computer is this?</Title>
            <Paragraph>
              Is this the computer you want to transfer files and settings from (old),
              or to (new)?
            </Paragraph>
            <RadioGroup>
              <div className="field-row">
                <input
                  id="radio-export"
                  type="radio"
                  name="mode"
                  checked={mode === 'export'}
                  onChange={() => setMode('export')}
                />
                <label htmlFor="radio-export">Old computer</label>
              </div>
              <RadioDescription>
                I want to transfer files and settings FROM this computer.
              </RadioDescription>
              <div className="field-row" style={{ marginTop: 16 }}>
                <input
                  id="radio-import"
                  type="radio"
                  name="mode"
                  checked={mode === 'import'}
                  onChange={() => setMode('import')}
                />
                <label htmlFor="radio-import">New computer</label>
              </div>
              <RadioDescription>
                I want to transfer files and settings TO this computer.
              </RadioDescription>
            </RadioGroup>
          </>
        );

      case 2: // Select items or enter code
        if (mode === 'export') {
          return (
            <>
              <Title>What do you want to transfer?</Title>
              <Paragraph>Select the items you want to transfer:</Paragraph>
              <CheckboxGroup>
                <div className="field-row">
                  <input
                    id="chk-desktop"
                    type="checkbox"
                    checked={selectedItems.desktop}
                    onChange={() => handleItemToggle('desktop')}
                  />
                  <label htmlFor="chk-desktop">Desktop icons and shortcuts</label>
                </div>
                <div className="field-row">
                  <input
                    id="chk-settings"
                    type="checkbox"
                    checked={selectedItems.settings}
                    onChange={() => handleItemToggle('settings')}
                  />
                  <label htmlFor="chk-settings">Application settings and preferences</label>
                </div>
                <div className="field-row">
                  <input
                    id="chk-files"
                    type="checkbox"
                    checked={selectedItems.files}
                    onChange={() => handleItemToggle('files')}
                  />
                  <label htmlFor="chk-files">My Documents and files</label>
                </div>
                <div className="field-row">
                  <input
                    id="chk-bookmarks"
                    type="checkbox"
                    checked={selectedItems.bookmarks}
                    onChange={() => handleItemToggle('bookmarks')}
                  />
                  <label htmlFor="chk-bookmarks">Internet Explorer favorites</label>
                </div>
              </CheckboxGroup>
              {isRunning && (
                <>
                  <StatusText>Collecting files and settings... {progress}%</StatusText>
                  <ProgressContainer>
                    <div className="field-row">
                      <progress max="100" value={progress} style={{ width: '100%' }} />
                    </div>
                  </ProgressContainer>
                </>
              )}
            </>
          );
        } else {
          return (
            <>
              <Title>Enter your transfer code</Title>
              <Paragraph>
                Enter the transfer code that was displayed on the old computer:
              </Paragraph>
              <InputRow>
                <div className="field-row">
                  <input
                    type="text"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                  />
                </div>
              </InputRow>
              {isRunning && (
                <>
                  <StatusText>Restoring files and settings... {progress}%</StatusText>
                  <ProgressContainer>
                    <div className="field-row">
                      <progress max="100" value={progress} style={{ width: '100%' }} />
                    </div>
                  </ProgressContainer>
                </>
              )}
            </>
          );
        }

      case 3: // Export complete - show code
        return (
          <>
            <Title>Transfer code ready</Title>
            <Paragraph>
              Your files and settings have been collected. Use the following code on
              your new computer to complete the transfer:
            </Paragraph>
            <TransferCode>{transferCode}</TransferCode>
            <Paragraph>
              <strong>Important:</strong> Write down this code or take a screenshot.
              You will need it to import your files and settings.
            </Paragraph>
            <Paragraph>Click Finish to close this wizard.</Paragraph>
          </>
        );

      case 4: // Import complete
        return (
          <>
            <Title>Completing the Files and Settings Transfer Wizard</Title>
            <Paragraph>
              You have successfully transferred your files and settings to this computer.
            </Paragraph>
            <Paragraph>
              Your desktop icons, application settings, and files have been restored.
              You may need to restart some applications for changes to take effect.
            </Paragraph>
            <Paragraph>To close this wizard, click Finish.</Paragraph>
          </>
        );

      default:
        return null;
    }
  };

  const isFinishStep = step === 3 || step === 4;
  const canProceed = step !== 2 || mode === 'export' || importCode.length >= 10;

  return (
    <WizardContainer>
      <ContentArea>
        <LeftPane>
          <img src="/ui/migwiz.png" alt="" />
        </LeftPane>
        <RightPane>{renderStep()}</RightPane>
      </ContentArea>
      <Footer>
        <Button onClick={handleBack} disabled={step === 0 || isRunning || isFinishStep}>
          &lt; Back
        </Button>
        {!isFinishStep ? (
          <Button
            className="default"
            onClick={handleNext}
            disabled={isRunning || !canProceed}
          >
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

export default TransferWizard;
