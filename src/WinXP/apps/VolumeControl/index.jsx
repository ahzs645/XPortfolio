import React, { useCallback } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useShellSettings } from '../../../contexts/ShellSettingsContext';

function VolumeControl({ onClose, onMinimize }) {
  const { audio, setAudioSettings } = useShellSettings();

  const handleVolumeChange = useCallback((e) => {
    setAudioSettings({ volume: parseInt(e.target.value, 10) });
  }, [setAudioSettings]);

  const handleMuteToggle = useCallback(() => {
    setAudioSettings({ muted: !audio.muted });
  }, [audio.muted, setAudioSettings]);

  const menus = [
    {
      id: 'options',
      label: 'Options',
      items: [
        { label: 'Exit', action: 'exit' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', action: 'help:topics', disabled: true },
        { type: 'separator' },
        { label: 'About Volume Control', action: 'help:about', disabled: true },
      ],
    },
  ];

  const handleMenuAction = useCallback((action) => {
    if (action === 'exit') onClose();
  }, [onClose]);

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={true}
      showToolbar={false}
      showAddressBar={false}
      statusFields={[{ text: 'Creative SoundBlaster PCI' }]}
      showStatusBar={true}
    >
      <Container>
        <ChannelStrip>
          <ChannelForm>
            <ChannelName>System</ChannelName>
            <VolumeLabel>Volume:</VolumeLabel>
            <SliderContainer>
              <SliderTrack>
                <TickMarks>
                  {Array.from({ length: 9 }, (_, i) => (
                    <Tick key={i} />
                  ))}
                </TickMarks>
                <VerticalSlider
                  type="range"
                  min="0"
                  max="100"
                  value={audio.volume}
                  onChange={handleVolumeChange}
                  orient="vertical"
                />
              </SliderTrack>
              <SliderLabels>
                <span>High</span>
                <span>Low</span>
              </SliderLabels>
            </SliderContainer>
            <MuteRow>
              <label>
                <input
                  type="checkbox"
                  checked={audio.muted}
                  onChange={handleMuteToggle}
                />
                {' '}Mute
              </label>
            </MuteRow>
          </ChannelForm>
        </ChannelStrip>
      </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  background: #ece9d8;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 0 0 2px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  font-size: 11px;
`;

const ChannelStrip = styled.div`
  position: relative;
  min-width: 105px;
  max-width: 105px;
  height: 100%;
  padding: 0 6px;
`;

const ChannelForm = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 30px 24px 1fr 32px;
  height: 100%;
`;

const ChannelName = styled.span`
  grid-column: 1;
  grid-row: 1;
  display: block;
  text-align: center;
  height: 13px;
  padding: 8px 0;
  margin: 0 6px;
  border-bottom: 1px solid #919b9c;
  box-shadow: 0 1px #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const VolumeLabel = styled.span`
  grid-column: 1;
  grid-row: 2;
  padding: 6px 0;
`;

const SliderContainer = styled.div`
  grid-column: 1;
  grid-row: 3;
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding: 4px 0;
`;

const SliderTrack = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TickMarks = styled.div`
  position: absolute;
  top: 4px;
  bottom: 4px;
  right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
`;

const Tick = styled.div`
  width: 6px;
  height: 1px;
  background: #808080;
`;

const VerticalSlider = styled.input`
  writing-mode: vertical-lr;
  direction: rtl;
  appearance: slider-vertical;
  -webkit-appearance: slider-vertical;
  width: 24px;
  height: 100%;
  margin: 0 auto;
  cursor: pointer;
  background: transparent;

  &::-webkit-slider-runnable-track {
    width: 6px;
    background: transparent;
    border: 1px dotted #888;
  }

  &::-moz-range-track {
    width: 6px;
    background: transparent;
    border: 1px dotted #888;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 11px;
    border-radius: 5px;
    border: 1px solid;
    border-color: #b0b0b0 grey grey #b0b0b0;
    background: linear-gradient(to right, #f0f0f0 0%, #fff 50%, #f0f0f0 80%, #78dc63 95%, #58b848 100%);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 11px;
    border-radius: 5px;
    border: 1px solid;
    border-color: #b0b0b0 grey grey #b0b0b0;
    background: linear-gradient(to right, #f0f0f0 0%, #fff 50%, #f0f0f0 80%, #78dc63 95%, #58b848 100%);
    cursor: pointer;
  }
`;

const SliderLabels = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10px;
  color: #000;
  padding: 2px 0;

  span {
    white-space: nowrap;
  }
`;

const MuteRow = styled.div`
  grid-column: 1;
  grid-row: 4;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  label {
    display: flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    font-size: 11px;
  }

  input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }
`;

export default VolumeControl;
