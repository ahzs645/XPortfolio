import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useApp } from '../../../contexts/AppContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import useSystemSounds from '../../../hooks/useSystemSounds';
import {
  DEFAULT_SOUND_SCHEME,
  DEFAULT_SOUND_SCHEME_NAME,
  SOUND_EVENT_DEFINITIONS,
  SOUND_FILE_OPTIONS,
  getEffectiveSoundSchemes,
  normalizeSoundSettings,
  pruneSoundSchemes,
} from '../../../utils/systemSounds';
import { withBaseUrl } from '../../../utils/baseUrl';

const TABS = [
  { id: 'sounds', label: 'Sounds' },
  { id: 'audio', label: 'Audio' },
  { id: 'voice', label: 'Voice' },
];

function cloneSchemes(schemes) {
  return Object.fromEntries(
    Object.entries(schemes).map(([name, scheme]) => [
      name,
      { name: scheme.name, sounds: { ...scheme.sounds } },
    ])
  );
}

function serializeState(activeSchemeName, schemes) {
  return JSON.stringify({
    activeSchemeName,
    schemes: Object.fromEntries(
      Object.entries(schemes).map(([name, scheme]) => [name, scheme.sounds])
    ),
  });
}

function SoundsAndAudioDevices({ onClose, onMinimize }) {
  const { openApp } = useApp();
  const { soundSettings, setSoundSettings, windowSoundsEnabled, setWindowSoundsEnabled, colorDepth } = useUserSettings();
  const { playByFileKey } = useSystemSounds();

  const persistedSettings = useMemo(
    () => normalizeSoundSettings(soundSettings),
    [soundSettings]
  );
  const persistedSchemes = useMemo(
    () => getEffectiveSoundSchemes(persistedSettings),
    [persistedSettings]
  );

  const [activeTab, setActiveTab] = useState('sounds');
  const [activeSchemeName, setActiveSchemeName] = useState(persistedSettings.activeSchemeName);
  const [schemes, setSchemes] = useState(() => cloneSchemes(persistedSchemes));
  const [selectedEventId, setSelectedEventId] = useState(SOUND_EVENT_DEFINITIONS[0].id);
  const [lastAppliedSnapshot, setLastAppliedSnapshot] = useState(() =>
    serializeState(persistedSettings.activeSchemeName, persistedSchemes)
  );

  /* eslint-disable react-hooks/set-state-in-effect -- synchronize local draft state when persisted settings change */
  useEffect(() => {
    setActiveSchemeName(persistedSettings.activeSchemeName);
    setSchemes(cloneSchemes(persistedSchemes));
    setLastAppliedSnapshot(serializeState(persistedSettings.activeSchemeName, persistedSchemes));
  }, [persistedSchemes, persistedSettings.activeSchemeName]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeScheme = schemes[activeSchemeName] || DEFAULT_SOUND_SCHEME;
  const selectedSoundKey = activeScheme?.sounds?.[selectedEventId] || '';
  const selectedSoundLabel = SOUND_FILE_OPTIONS.find((option) => option.key === selectedSoundKey)?.fileName || '(None)';
  const isApplyEnabled = serializeState(activeSchemeName, schemes) !== lastAppliedSnapshot;
  const isCustomScheme =
    activeSchemeName !== DEFAULT_SOUND_SCHEME_NAME ||
    Boolean(persistedSettings.schemes?.[DEFAULT_SOUND_SCHEME_NAME]);

  const updateActiveSchemeSound = useCallback((eventId, fileKey) => {
    setSchemes((prev) => {
      const current = prev[activeSchemeName] || {
        name: activeSchemeName,
        sounds: { ...DEFAULT_SOUND_SCHEME.sounds },
      };

      return {
        ...prev,
        [activeSchemeName]: {
          ...current,
          sounds: {
            ...current.sounds,
            [eventId]: fileKey,
          },
        },
      };
    });
  }, [activeSchemeName]);

  const handlePreview = useCallback(() => {
    if (!selectedSoundKey) return;
    playByFileKey(selectedSoundKey);
  }, [playByFileKey, selectedSoundKey]);

  const handleSaveAs = useCallback(() => {
    const suggestedName = activeSchemeName === DEFAULT_SOUND_SCHEME_NAME
      ? 'My Sound Scheme'
      : activeSchemeName;
    const nextName = window.prompt('Save this sound scheme as:', suggestedName)?.trim();

    if (!nextName) return;

    setSchemes((prev) => ({
      ...prev,
      [nextName]: {
        name: nextName,
        sounds: { ...(prev[activeSchemeName]?.sounds || DEFAULT_SOUND_SCHEME.sounds) },
      },
    }));
    setActiveSchemeName(nextName);
  }, [activeSchemeName]);

  const handleDeleteScheme = useCallback(() => {
    if (!isCustomScheme) return;

    const confirmed = window.confirm(`Delete the sound scheme "${activeSchemeName}"?`);
    if (!confirmed) return;

    setSchemes((prev) => {
      const next = { ...prev };
      delete next[activeSchemeName];
      return next;
    });
    setActiveSchemeName(DEFAULT_SOUND_SCHEME_NAME);
  }, [activeSchemeName, isCustomScheme]);

  const handleApply = useCallback(() => {
    const persisted = pruneSoundSchemes(schemes);
    const nextSettings = {
      activeSchemeName: schemes[activeSchemeName] ? activeSchemeName : DEFAULT_SOUND_SCHEME_NAME,
      schemes: persisted,
    };

    setSoundSettings(nextSettings);
    setLastAppliedSnapshot(
      serializeState(nextSettings.activeSchemeName, getEffectiveSoundSchemes(nextSettings))
    );
  }, [activeSchemeName, schemes, setSoundSettings]);

  const handleOk = useCallback(() => {
    if (isApplyEnabled) {
      handleApply();
    }
    onClose?.();
  }, [handleApply, isApplyEnabled, onClose]);

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
        <TabsBar role="tablist" aria-label="Sounds and Audio Devices tabs">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabsBar>

        <Panel>
          {activeTab === 'sounds' && (
            <SoundsTab>
              <Hero>
                <HeroIcon src={withBaseUrl('/icons/xp/speech.png')} alt="" />
                <div>
                  <HeroTitle>Program events</HeroTitle>
                  <HeroText>Choose a sound scheme or customize individual events for this user.</HeroText>
                </div>
              </Hero>

              <Fieldset>
                <Legend>Sound scheme</Legend>
                <Row>
                  <StretchSelect
                    value={activeSchemeName}
                    onChange={(e) => setActiveSchemeName(e.target.value)}
                  >
                    {Object.keys(schemes).sort((a, b) => a.localeCompare(b)).map((schemeName) => (
                      <option key={schemeName} value={schemeName}>
                        {schemeName}
                      </option>
                    ))}
                  </StretchSelect>
                  <SmallButton type="button" onClick={handleSaveAs}>Save As...</SmallButton>
                  <SmallButton type="button" onClick={handleDeleteScheme} disabled={!isCustomScheme}>
                    Delete
                  </SmallButton>
                </Row>
              </Fieldset>

              <Fieldset>
                <Legend>Sounds</Legend>
                <EventsArea>
                  <EventList role="listbox" aria-label="Program events">
                    {SOUND_EVENT_DEFINITIONS.map((event) => {
                      const eventSoundKey = activeScheme?.sounds?.[event.id] || '';
                      const eventSound = SOUND_FILE_OPTIONS.find((option) => option.key === eventSoundKey);

                      return (
                        <EventItem
                          key={event.id}
                          type="button"
                          $selected={selectedEventId === event.id}
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <EventIcon
                            src={withBaseUrl(eventSoundKey ? '/icons/xp/tray/sound.png' : '/icons/xp/Default.png')}
                            alt=""
                          />
                          <EventText>
                            <strong>{event.label}</strong>
                            <span>{eventSound?.fileName || '(None)'}</span>
                          </EventText>
                        </EventItem>
                      );
                    })}
                  </EventList>

                  <AssignmentArea>
                    <AssignmentLabel>Sounds:</AssignmentLabel>
                    <Row>
                      <StretchSelect
                        value={selectedSoundKey}
                        onChange={(e) => updateActiveSchemeSound(selectedEventId, e.target.value)}
                      >
                        {SOUND_FILE_OPTIONS.map((option) => (
                          <option key={option.key || 'none'} value={option.key}>
                            {option.fileName}
                          </option>
                        ))}
                      </StretchSelect>
                      <PreviewButton
                        type="button"
                        onClick={handlePreview}
                        disabled={!selectedSoundKey}
                        aria-label={`Preview ${selectedSoundLabel}`}
                      >
                        4
                      </PreviewButton>
                    </Row>
                    <Hint>{selectedSoundLabel}</Hint>
                  </AssignmentArea>
                </EventsArea>
              </Fieldset>
            </SoundsTab>
          )}

          {activeTab === 'audio' && (
            <InfoTab>
              <Fieldset>
                <Legend>Sound playback</Legend>
                <DeviceRow>
                  <DeviceLabel>Default device:</DeviceLabel>
                  <DeviceValue>Creative SoundBlaster PCI</DeviceValue>
                </DeviceRow>
                <DeviceHint>The system tray speaker and mixer use the same master volume.</DeviceHint>
                <Row>
                  <SmallButton type="button" onClick={() => openApp('Volume Control')}>Volume...</SmallButton>
                </Row>
              </Fieldset>

              <Fieldset>
                <Legend>Audio settings</Legend>
                <DeviceRow>
                  <DeviceLabel>Desktop color depth:</DeviceLabel>
                  <DeviceValue>{colorDepth}-bit</DeviceValue>
                </DeviceRow>
                <CheckRow>
                  <input
                    id="window-sounds-enabled"
                    type="checkbox"
                    checked={windowSoundsEnabled}
                    onChange={(e) => setWindowSoundsEnabled(e.target.checked)}
                  />
                  <label htmlFor="window-sounds-enabled">Play window sounds</label>
                </CheckRow>
              </Fieldset>
            </InfoTab>
          )}

          {activeTab === 'voice' && (
            <InfoTab>
              <Fieldset>
                <Legend>Voice playback</Legend>
                <DeviceRow>
                  <DeviceLabel>Speech engine:</DeviceLabel>
                  <DeviceValue>Browser speech synthesis</DeviceValue>
                </DeviceRow>
                <DeviceHint>Advanced voice options are managed in Speech Properties.</DeviceHint>
                <Row>
                  <SmallButton type="button" onClick={() => openApp('Speech Properties')}>
                    Speech...
                  </SmallButton>
                </Row>
              </Fieldset>
            </InfoTab>
          )}
        </Panel>

        <Actions>
          <ActionButton type="button" onClick={handleOk}>OK</ActionButton>
          <ActionButton type="button" onClick={onClose}>Cancel</ActionButton>
          <ActionButton type="button" onClick={handleApply} disabled={!isApplyEnabled}>
            Apply
          </ActionButton>
        </Actions>
      </WindowSurface>
    </ProgramLayout>
  );
}

const WindowSurface = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 8px;
  background: linear-gradient(180deg, #f7f6f0 0%, #ece9d8 45%, #e2dfcf 100%);
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  overflow: hidden;
`;

const TabsBar = styled.div`
  display: flex;
  gap: 2px;
  padding: 4px 4px 0;
`;

const TabButton = styled.button`
  min-width: 86px;
  padding: 5px 10px 6px;
  border: 1px solid #91a7b4;
  border-bottom: ${({ $active }) => ($active ? '1px solid #fbfbfc' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5)'
    : 'linear-gradient(180deg, #f7f7f7, #ededeb 40%, #e7e7e0 95%, #e2e2d8)')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 2px #ffc73c, inset 0 1px 0 #fff' : 'none')};
  cursor: pointer;
  font-size: 12px;
  position: relative;
  top: ${({ $active }) => ($active ? '0' : '1px')};
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 10px;
  border: 1px solid #919b9c;
  background: #fbfbfc;
  box-shadow: inset 1px 1px #fff, inset -1px -1px #c7c1b7;
`;

const SoundsTab = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
`;

const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 2px;
`;

const HeroIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const HeroTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #003399;
`;

const HeroText = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: #333;
`;

const Fieldset = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 10px;
  border: 1px solid #919b9c;
`;

const Legend = styled.legend`
  padding: 0 4px;
  font-size: 11px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StretchSelect = styled.select`
  min-width: 0;
  flex: 1;
  height: 23px;
  padding: 0 6px;
  border: 1px solid #7f9db9;
  background: #fff;
  font-family: inherit;
  font-size: 11px;
`;

const SmallButton = styled.button`
  min-width: 78px;
  height: 24px;
  padding: 0 10px;
  border: 1px solid #003c74;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  box-shadow: inset 0 0 0 1px #fff;
  font-family: inherit;
  font-size: 11px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const EventsArea = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) minmax(180px, 0.8fr);
  gap: 12px;
  min-height: 0;
  flex: 1;
`;

const EventList = styled.div`
  min-height: 0;
  overflow: auto;
  border: 1px solid #7f9db9;
  background: #fff;
`;

const EventItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  background: ${({ $selected }) => ($selected ? '#316ac5' : '#fff')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#000')};
  text-align: left;
  cursor: pointer;
`;

const EventIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const EventText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 11px;
    font-weight: normal;
  }

  span {
    font-size: 10px;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const AssignmentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AssignmentLabel = styled.label`
  font-size: 11px;
`;

const PreviewButton = styled.button`
  width: 30px;
  height: 23px;
  border: 1px solid #003c74;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  box-shadow: inset 0 0 0 1px #fff;
  font-family: "Marlett", sans-serif;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

const Hint = styled.div`
  font-size: 10px;
  color: #555;
`;

const InfoTab = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
`;

const DeviceRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
`;

const DeviceLabel = styled.span`
  min-width: 120px;
  color: #333;
`;

const DeviceValue = styled.strong`
  font-weight: normal;
`;

const DeviceHint = styled.p`
  margin: 0 0 10px;
  font-size: 11px;
  color: #444;
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 4px 2px;
`;

const ActionButton = styled.button`
  min-width: 78px;
  height: 24px;
  padding: 0 12px;
  border: 1px solid #003c74;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  box-shadow: inset 0 0 0 1px #fff;
  font-family: inherit;
  font-size: 11px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export default SoundsAndAudioDevices;
