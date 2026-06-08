import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../../contexts/ThemeContext';
import { withBaseUrl } from '../../../utils/baseUrl';

function ThemeManager({ onClose, onMinimize }) {
  const {
    activeThemeId,
    builtinThemes,
    installedThemes,
    setActiveTheme,
    installTheme,
    uninstallTheme,
  } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(activeThemeId || 'luna');
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setStatus({ kind: 'busy', message: `Opening ${file.name}...` });
    try {
      const buffer = await file.arrayBuffer();
      const { parseWbaFile } = await import('../../../utils/wbaInstaller');
      const theme = await parseWbaFile(buffer, { archiveName: file.name });
      installTheme(theme);
      setSelectedThemeId(theme.id);
      setStatus({ kind: 'ok', message: `Added "${theme.name}". Click Apply to use it.` });
    } catch (err) {
      console.error('Failed to open theme:', err);
      setStatus({ kind: 'error', message: `Could not read ${file.name}. Is it a WindowBlinds .wba file?` });
    }
  };

  const themes = useMemo(() => [
    ...builtinThemes.map((theme) => ({ ...theme, sourceLabel: 'Built-in', removable: false })),
    ...installedThemes.map((theme) => ({ ...theme, sourceLabel: 'Installed', removable: true })),
  ], [builtinThemes, installedThemes]);

  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) || themes[0];
  const isSelectedActive = selectedTheme?.id === activeThemeId;
  const canDeleteSelected = Boolean(selectedTheme?.removable);

  const handleApply = () => {
    if (selectedTheme) {
      setActiveTheme(selectedTheme.id);
    }
  };

  const handleDelete = () => {
    if (!selectedTheme?.removable) {
      return;
    }

    uninstallTheme(selectedTheme.id);
    setSelectedThemeId('luna');
  };

  return (
    <WindowSurface className="xp-shell-surface">
      <Header>
        <Icon src="/icons/xp/DisplayProperties.png" alt="" />
        <div>
          <Title>Theme Settings</Title>
          <Description>Choose a theme, or open a WindowBlinds (.wba) file to add your own.</Description>
        </div>
      </Header>

      <Content>
        <ThemeList aria-label="Available themes">
          {themes.map((theme) => (
            <ThemeOption
              key={`${theme.sourceLabel}-${theme.id}`}
              type="button"
              onClick={() => setSelectedThemeId(theme.id)}
              onDoubleClick={() => setActiveTheme(theme.id)}
              $selected={theme.id === selectedThemeId}
            >
              <ThemeIcon src="/icons/xp/DisplayProperties.png" alt="" />
              <ThemeText>
                <ThemeName>
                  {theme.name}
                  {theme.id === activeThemeId && <ActiveBadge>Active</ActiveBadge>}
                </ThemeName>
                <ThemeMeta>{theme.sourceLabel}</ThemeMeta>
              </ThemeText>
            </ThemeOption>
          ))}
        </ThemeList>

        <DetailsPanel>
          <Preview>
            <PreviewDesktop $wallpaper={selectedTheme?.wallpaper ? withBaseUrl(selectedTheme.wallpaper) : null}>
              <PreviewWindow>
                <PreviewTitle $theme={selectedTheme}>Active Window</PreviewTitle>
                <PreviewBody $theme={selectedTheme}>
                  <PreviewLine />
                  <PreviewLine $short />
                </PreviewBody>
              </PreviewWindow>
              <PreviewTaskbar $theme={selectedTheme}>
                <PreviewStart $theme={selectedTheme}>start</PreviewStart>
                <PreviewTray $theme={selectedTheme} />
              </PreviewTaskbar>
            </PreviewDesktop>
          </Preview>

          <Details>
            <DetailRow>
              <DetailLabel>Name:</DetailLabel>
              <span>{selectedTheme?.name || 'None'}</span>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Type:</DetailLabel>
              <span>{selectedTheme?.sourceLabel || 'Unknown'}</span>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Status:</DetailLabel>
              <span>{isSelectedActive ? 'Currently active' : 'Available'}</span>
            </DetailRow>
          </Details>
        </DetailsPanel>
      </Content>

      {status && <StatusBar $kind={status.kind}>{status.message}</StatusBar>}

      <ButtonRow>
        <button type="button" onClick={handleOpenClick}>
          Open theme...
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".wba"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={handleApply} disabled={!selectedTheme || isSelectedActive}>
          Apply
        </button>
        <button type="button" onClick={handleDelete} disabled={!canDeleteSelected}>
          Delete
        </button>
        <Spacer />
        <button type="button" onClick={onMinimize}>
          Minimize
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </ButtonRow>
    </WindowSurface>
  );
}

const WindowSurface = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
  color: var(--xp-window-text, #000);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
`;

const Title = styled.div`
  font-weight: 700;
`;

const Description = styled.div`
  margin-top: 2px;
  color: #555;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 10px;
  min-height: 0;
  flex: 1;
`;

const ThemeList = styled.div`
  min-height: 0;
  overflow: auto;
  background: var(--xp-menu-bg, #fff);
  border: 1px solid #7f9db9;
  padding: 2px;
`;

const ThemeOption = styled.button`
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border: 0;
  background: ${({ $selected }) => ($selected ? 'var(--xp-highlight, #316ac5)' : 'transparent')};
  color: ${({ $selected }) => ($selected ? 'var(--xp-highlight-text, #fff)' : 'var(--xp-menu-text, #000)')};
  text-align: left;

  &:hover {
    background: var(--xp-highlight, #316ac5);
    color: var(--xp-highlight-text, #fff);
  }
`;

const ThemeIcon = styled.img`
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
`;

const ThemeText = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
`;

const ThemeName = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-weight: 700;
`;

const ThemeMeta = styled.span`
  opacity: 0.78;
`;

const ActiveBadge = styled.span`
  padding: 1px 4px;
  border: 1px solid currentColor;
  font-size: 10px;
  font-weight: 400;
`;

const DetailsPanel = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
`;

const Preview = styled.div`
  border: 1px solid #7f9db9;
  background: #fff;
  padding: 8px;
`;

const PreviewDesktop = styled.div`
  position: relative;
  height: 160px;
  overflow: hidden;
  background-color: #004e98;
  background-image: ${({ $wallpaper }) => ($wallpaper ? `url(${$wallpaper})` : 'none')};
  background-size: cover;
  background-position: center;
`;

const PreviewWindow = styled.div`
  position: absolute;
  left: 24px;
  top: 22px;
  width: 190px;
  height: 92px;
  border: 1px solid #245edc;
  background: #ece9d8;
`;

const PreviewTitle = styled.div`
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  background: ${({ $theme }) => $theme?.colors?.activeTitle || '#0054e3'};
  color: ${({ $theme }) => $theme?.titleBar?.textColor || '#fff'};
  font-weight: 700;
`;

const PreviewBody = styled.div`
  height: calc(100% - 22px);
  padding: 12px;
  background: ${({ $theme }) => $theme?.colors?.surface || '#ece9d8'};
`;

const PreviewLine = styled.div`
  height: 8px;
  width: ${({ $short }) => ($short ? '55%' : '85%')};
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.22);
`;

const PreviewTaskbar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  height: 28px;
  background: ${({ $theme }) => $theme?.taskbar?.background || '#245edc'};
  background-size: ${({ $theme }) => $theme?.taskbar?.backgroundSize || 'auto'};
  background-repeat: ${({ $theme }) => $theme?.taskbar?.backgroundRepeat || 'repeat'};
`;

const PreviewStart = styled.div`
  width: 70px;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  box-sizing: border-box;
  color: #fff;
  font-weight: 700;
  background: ${({ $theme }) => (
    $theme?.startButton?.spriteSheet
      ? `url(${withBaseUrl($theme.startButton.spriteSheet)}) 0 0 / auto 100% no-repeat`
      : '#2a8b20'
  )};
`;

const PreviewTray = styled.div`
  width: 72px;
  height: 28px;
  background: ${({ $theme }) => $theme?.tray?.background || '#0d9ff1'};
  background-size: ${({ $theme }) => $theme?.tray?.backgroundSize || 'auto'};
  background-repeat: ${({ $theme }) => $theme?.tray?.backgroundRepeat || 'repeat'};
`;

const Details = styled.div`
  display: grid;
  gap: 6px;
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr;
`;

const DetailLabel = styled.span`
  font-weight: 700;
`;

const StatusBar = styled.div`
  padding: 4px 8px;
  border: 1px solid #7f9db9;
  background: #fff;
  font-size: 11px;
  color: ${({ $kind }) => ($kind === 'error' ? '#a00' : $kind === 'ok' ? '#0a6b0a' : '#333')};
`;

const ButtonRow = styled.footer`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Spacer = styled.div`
  flex: 1;
`;

export default ThemeManager;
