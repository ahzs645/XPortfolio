import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';

const WALLPAPER_OPTIONS = [
  { id: 'bliss', name: 'Bliss', path: '/bliss.jpg' },
  { id: 'ahmadxp', name: 'Ahmad XP', path: '/Ahmadxp.png' },
];

function DisplayProperties({ onClose, onMinimize }) {
  const { getWallpaperPath, setWallpaperPath } = useConfig();
  const currentDesktop = getWallpaperPath(false);
  const [selected, setSelected] = useState(currentDesktop);
  const [applyToMobile, setApplyToMobile] = useState(true);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Apply', action: 'apply' },
        { separator: true },
        { label: 'Close', action: 'exitProgram' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      disabled: true,
    },
  ], []);

  const handleAction = (action) => {
    if (!action) return;
    if (action === 'apply') {
      applySelection();
    }
  };

  const applySelection = () => {
    setWallpaperPath(selected, { isMobile: false });
    if (applyToMobile) {
      setWallpaperPath(selected, { isMobile: true });
    }
    onClose?.();
  };

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleAction}
      windowActions={{ onClose, onMinimize }}
      menuLogo="/gui/toolbar/barlogo.webp"
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <Shell>
        <Heading>Desktop Background</Heading>
        <Content>
          <PreviewPane>
            <PreviewFrame>
              <PreviewImage style={{ backgroundImage: `url(${selected})` }} />
              <MonitorOverlay />
            </PreviewFrame>
          </PreviewPane>
          <SelectionPane>
            <Label>Backgrounds</Label>
            <List>
              {WALLPAPER_OPTIONS.map((option) => (
                <ListItem key={option.id} onClick={() => setSelected(option.path)}>
                  <input
                    type="radio"
                    name="wallpaper"
                    checked={selected === option.path}
                    onChange={() => setSelected(option.path)}
                  />
                  <span>{option.name}</span>
                </ListItem>
              ))}
            </List>
            <ApplyMobile>
              <input
                id="apply-mobile"
                type="checkbox"
                checked={applyToMobile}
                onChange={(e) => setApplyToMobile(e.target.checked)}
              />
              <label htmlFor="apply-mobile">Use for mobile too</label>
            </ApplyMobile>
          </SelectionPane>
        </Content>
        <Actions>
          <ActionButton onClick={applySelection}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
        </Actions>
      </Shell>
    </ProgramLayout>
  );
}

const Shell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 10px;
  gap: 10px;
  overflow: hidden;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #000;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  overflow: hidden;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewPane = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f4;
  border: 1px solid #b5b5b5;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #9a9a9a;
  padding: 12px;
`;

const PreviewFrame = styled.div`
  position: relative;
  width: 220px;
  height: 160px;
  background: #000;
  border: 1px solid #000;
  overflow: hidden;
`;

const PreviewImage = styled.div`
  position: absolute;
  inset: 8px 8px 24px 8px;
  background-size: cover;
  background-position: center;
  border: 1px solid #000;
`;

const MonitorOverlay = styled.div`
  position: absolute;
  inset: 0;
  border: 2px solid #4a4a4a;
  pointer-events: none;
`;

const SelectionPane = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 6px;
`;

const Label = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #000;
`;

const List = styled.div`
  flex: 1;
  border: 1px solid #7f7f7f;
  background: #fff;
  padding: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #c6c6c6;
`;

const ListItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: #cfe3ff;
  }
`;

const ApplyMobile = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #000;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 6px 12px;
  font-size: 12px;
  background: linear-gradient(#f3f3f3, #dcdcdc);
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  cursor: pointer;

  &:active {
    background: linear-gradient(#dcdcdc, #c2c2c2);
  }
`;

export default DisplayProperties;
