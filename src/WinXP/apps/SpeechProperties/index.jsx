import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';

const TABS = [
  { id: 'textToSpeech', label: 'Text To Speech', enabled: true },
];

function SpeechProperties({ onClose, onMinimize }) {
  const [activeTab, setActiveTab] = useState('textToSpeech');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [speed, setSpeed] = useState(10);
  const [isApplyEnabled, setIsApplyEnabled] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synthRef.current.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice = availableVoices[0];
        setSelectedVoice(defaultVoice.name);
        setPreviewText(`You have selected ${defaultVoice.name} as the computer's default voice.`);
      }
    };

    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;

    return () => {
      synthRef.current.cancel();
    };
  }, []);

  const handleVoiceChange = (e) => {
    const voiceName = e.target.value;
    setSelectedVoice(voiceName);
    setPreviewText(`You have selected ${voiceName} as the computer's default voice.`);
    setIsApplyEnabled(true);
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
    setIsApplyEnabled(true);
  };

  const handlePreview = () => {
    synthRef.current.cancel();
    const voice = voices.find(v => v.name === selectedVoice);
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(previewText);
    utterance.voice = voice;
    utterance.rate = 0.1 + (speed / 20) * 1.9;
    synthRef.current.speak(utterance);
  };

  const handleApply = () => {
    // Save settings to localStorage
    localStorage.setItem('speechSettings', JSON.stringify({
      voice: selectedVoice,
      speed: speed,
    }));
    setIsApplyEnabled(false);
  };

  const handleOk = () => {
    handleApply();
    onClose?.();
  };

  return (
    <ProgramLayout
      menus={[]}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={false}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <WindowSurface>
        <section className="tabs" aria-label="Speech Properties Tabs">
          <TabsBar role="tablist" aria-label="Speech Properties">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                $active={activeTab === tab.id}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsBar>

          <TabPanel
            role="tabpanel"
            id="tab-textToSpeech"
            hidden={activeTab !== 'textToSpeech'}
            $active={activeTab === 'textToSpeech'}
          >
            <SpeechPane>
              <HeaderRow>
                <SpeechIcon src="/icons/xp/speech.png" alt="Speech" />
                <HeaderText>
                  You can control the voice properties, speed and other options for text-to-speech translation
                </HeaderText>
              </HeaderRow>

              <Fieldset>
                <Legend>Voice selection</Legend>
                <FieldsetContent>
                  <VoiceSelect
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </VoiceSelect>
                  <ButtonRow>
                    <SideButton type="button" disabled $disabled>Settings...</SideButton>
                  </ButtonRow>

                  <Spacer />

                  <PreviewLabel>Use the following text to preview the voice:</PreviewLabel>
                  <PreviewInput
                    type="text"
                    value={previewText}
                    onChange={(e) => {
                      setPreviewText(e.target.value);
                      setIsApplyEnabled(true);
                    }}
                  />
                  <ButtonRow>
                    <SideButton type="button" onClick={handlePreview}>Preview Voice</SideButton>
                  </ButtonRow>
                </FieldsetContent>
              </Fieldset>

              <Fieldset>
                <Legend>Voice speed</Legend>
                <FieldsetContent>
                  <SpeedSlider
                    type="range"
                    min="0"
                    max="20"
                    value={speed}
                    onChange={handleSpeedChange}
                  />
                  <SpeedLabels>
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </SpeedLabels>
                </FieldsetContent>
              </Fieldset>

              <ButtonRow>
                <SideButton type="button" disabled $disabled>Audio Output...</SideButton>
              </ButtonRow>
            </SpeechPane>
          </TabPanel>
        </section>

        <Actions>
          <ActionButton onClick={handleOk}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            onClick={handleApply}
            disabled={!isApplyEnabled}
            $disabled={!isApplyEnabled}
          >
            Apply
          </ActionButton>
        </Actions>
      </WindowSurface>
    </ProgramLayout>
  );
}

const WindowSurface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #f7f6f0 0%, #ece9d8 45%, #e2dfcf 100%);
  padding: 8px;
  gap: 10px;
  overflow: hidden;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;

  section.tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 2px;
    min-height: 0;
  }
`;

const TabsBar = styled.menu`
  margin: 0;
  padding: 6px 6px 0 6px;
  display: flex;
  gap: 2px;
  border-radius: 4px 4px 0 0;
  border-bottom: none;
  margin-bottom: -1px;
`;

const TabButton = styled.button`
  min-width: 100px;
  padding: 5px 10px 6px 10px;
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  border: 1px solid #91a7b4;
  border-bottom: ${({ $active }) => ($active ? '1px solid #fbfbfc' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5)'
    : 'linear-gradient(180deg, #f7f7f7, #ededeb 40%, #e7e7e0 95%, #e2e2d8)')};
  color: ${({ $active }) => ($active ? '#000' : '#222')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 2px #ffc73c, inset 0 1px 0 #fff' : 'none')};
  position: relative;
  top: ${({ $active }) => ($active ? '0' : '1px')};
  margin-bottom: ${({ $active }) => ($active ? '-1px' : '0')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};

  &:hover:not(:disabled) {
    border-top: 1px solid #e68b2c;
    box-shadow: inset 0 2px #ffc73c;
  }
`;

const TabPanel = styled.article`
  flex: 1;
  padding: 10px;
  background: #fbfbfc;
  border: 1px solid #919b9c;
  border-top: 1px solid #919b9c;
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208, 206, 191, 0.75);
  border-radius: 0 0 4px 4px;
  margin-top: 0;
  min-height: 0;
  overflow: hidden;
`;

const SpeechPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;

const SpeechIcon = styled.img`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  font-size: 12px;
  color: #000;
  line-height: 1.4;
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 8px 10px 10px 10px;
  border: 1px solid #919b9c;
`;

const Legend = styled.legend`
  background: #fbfbfc;
  padding: 0 4px;
  font-size: 12px;
  color: #003399;
`;

const FieldsetContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const VoiceSelect = styled.select`
  width: 100%;
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  background-color: #fff;
  margin-bottom: 5px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
`;

const Spacer = styled.div`
  height: 40px;
`;

const PreviewLabel = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
`;

const PreviewInput = styled.input`
  width: 100%;
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  margin-bottom: 5px;
  box-sizing: border-box;
`;

const SpeedSlider = styled.input`
  width: 100%;
  padding: 10px 0;
  margin: 0;
`;

const SpeedLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 5px;
`;

const SideButton = styled.button`
  padding: 4px 10px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  min-width: 90px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  box-shadow: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#666' : '#000')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover:not(:disabled) {
    box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 6px 12px;
  font-size: 11px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  box-shadow: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#666' : '#000')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

export default SpeechProperties;
