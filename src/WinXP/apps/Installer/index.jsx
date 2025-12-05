import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useInstalledApps } from '../../../contexts/InstalledAppsContext';

// Sidebar action types
const VIEWS = {
  CHANGE_REMOVE: 'change_remove',
  ADD_NEW: 'add_new',
};

function Installer({ onClose }) {
  const { fetchManifest, installApp, uninstallApp, getInstalledAppsList, isInstalled, launchInstalledApp } = useInstalledApps();
  const [activeView, setActiveView] = useState(VIEWS.CHANGE_REMOVE);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appPreview, setAppPreview] = useState(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // name, size, lastUsed

  const installedApps = getInstalledAppsList();

  // Sort apps based on selected criteria
  const sortedApps = [...installedApps].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return (b.manifest?.size || 0) - (a.manifest?.size || 0);
      case 'lastUsed':
        return (b.lastRun || 0) - (a.lastRun || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAppPreview(null);
    setInstallSuccess(false);

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      const result = await fetchManifest(normalizedUrl);

      if (result.success) {
        const manifest = result.manifest;
        const appUrl = result.url || normalizedUrl;
        const icon = manifest.icons?.[0]?.src || manifest.icon || '/icons/xp/Programs.png';

        setAppPreview({
          url: appUrl,
          name: manifest.name || manifest.short_name || 'Untitled App',
          description: manifest.description || '',
          icon: icon.startsWith('http') || icon.startsWith('data:') ? icon : new URL(icon, appUrl).href,
          author: manifest.author || manifest.developer?.name || '',
          version: manifest.version || '1.0.0',
          permissions: manifest.permissions || [],
          windowSettings: {
            width: manifest.window?.width || manifest.defaultSize?.width || 800,
            height: manifest.window?.height || manifest.defaultSize?.height || 600,
            resizable: manifest.window?.resizable ?? manifest.resizable ?? true,
            minWidth: manifest.window?.minWidth || manifest.minSize?.width || 400,
            minHeight: manifest.window?.minHeight || manifest.minSize?.height || 300,
          },
          manifest,
          manifestType: result.type,
          githubInfo: result.githubInfo,
          alreadyInstalled: isInstalled(appUrl),
        });
      } else {
        if (result.githubInfo?.isGitHub) {
          setError(`Could not fetch app from GitHub. Make sure the repo has GitHub Pages enabled or contains an index.html.`);
        } else {
          setError(result.error || 'Could not fetch app information');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch app');
    } finally {
      setLoading(false);
    }
  }, [url, fetchManifest, isInstalled]);

  const handleInstall = useCallback(async () => {
    if (!appPreview) return;

    try {
      setLoading(true);
      await installApp(appPreview);
      setInstallSuccess(true);
      setAppPreview(null);
      setUrl('');
      // Switch to Change/Remove view to show the newly installed app
      setTimeout(() => setActiveView(VIEWS.CHANGE_REMOVE), 1500);
    } catch (err) {
      setError(err.message || 'Installation failed');
    } finally {
      setLoading(false);
    }
  }, [appPreview, installApp]);

  const handleUninstall = useCallback((appId, appName) => {
    if (window.confirm(`Are you sure you want to remove "${appName}" from your computer?`)) {
      uninstallApp(appId);
      setExpandedAppId(null);
    }
  }, [uninstallApp]);

  const handleRun = useCallback((appId) => {
    launchInstalledApp(appId);
    onClose?.();
  }, [launchInstalledApp, onClose]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && url.trim() && !loading) {
      handleFetch();
    }
  }, [url, loading, handleFetch]);

  const formatLastUsed = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getUsageFrequency = (app) => {
    if (!app.lastRun) return 'Rarely';
    const daysSinceRun = Math.floor((Date.now() - app.lastRun) / (1000 * 60 * 60 * 24));
    if (daysSinceRun < 1) return 'Frequently';
    if (daysSinceRun < 7) return 'Occasionally';
    return 'Rarely';
  };

  return (
    <Container>
      {/* Header Banner */}
      <Header>
        <HeaderIcon src="/icons/xp/programs/add.png" alt="" />
        <HeaderText>Add or Remove Programs</HeaderText>
      </Header>

      <MainContent>
        {/* Left Sidebar */}
        <Sidebar>
          <SidebarItem
            $active={activeView === VIEWS.CHANGE_REMOVE}
            onClick={() => setActiveView(VIEWS.CHANGE_REMOVE)}
          >
            <SidebarIcon src="/icons/xp/programs/change.png" alt="" />
            <SidebarLabel>Change or Remove Programs</SidebarLabel>
          </SidebarItem>

          <SidebarItem
            $active={activeView === VIEWS.ADD_NEW}
            onClick={() => setActiveView(VIEWS.ADD_NEW)}
          >
            <SidebarIcon src="/icons/xp/programs/add.png" alt="" />
            <SidebarLabel>Add New Programs</SidebarLabel>
          </SidebarItem>

          <SidebarDivider />

          <SidebarInfo>
            <InfoIcon src="/icons/xp/HelpandSupport.png" alt="" />
            <InfoText>
              Currently installed programs: <strong>{installedApps.length}</strong>
            </InfoText>
          </SidebarInfo>
        </Sidebar>

        {/* Right Content Area */}
        <ContentArea>
          {activeView === VIEWS.CHANGE_REMOVE && (
            <>
              <ContentHeader>
                <span>Currently installed programs:</span>
                <SortControl>
                  <label>Sort by:</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                    <option value="lastUsed">Last Used On</option>
                  </select>
                </SortControl>
              </ContentHeader>

              <ProgramList>
                {sortedApps.length === 0 ? (
                  <EmptyMessage>
                    <EmptyIcon src="/icons/xp/Programs.png" alt="" />
                    <p>No programs are currently installed.</p>
                    <p>Click "Add New Programs" to install web apps.</p>
                  </EmptyMessage>
                ) : (
                  sortedApps.map((app) => (
                    <ProgramItem
                      key={app.id}
                      $expanded={expandedAppId === app.id}
                      onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                    >
                      <ProgramHeader>
                        <ProgramIcon
                          src={app.icon}
                          alt=""
                          onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }}
                        />
                        <ProgramInfo>
                          <ProgramName>{app.name}</ProgramName>
                          <ProgramMeta>
                            {app.version && <span>Version {app.version}</span>}
                            {app.author && <span> • {app.author}</span>}
                          </ProgramMeta>
                        </ProgramInfo>
                        <ProgramUsage>
                          <UsageLabel>Used: {getUsageFrequency(app)}</UsageLabel>
                        </ProgramUsage>
                      </ProgramHeader>

                      {expandedAppId === app.id && (
                        <ProgramDetails onClick={(e) => e.stopPropagation()}>
                          <DetailRow>
                            <DetailLabel>URL:</DetailLabel>
                            <DetailValue>{app.url}</DetailValue>
                          </DetailRow>
                          <DetailRow>
                            <DetailLabel>Last Used:</DetailLabel>
                            <DetailValue>{formatLastUsed(app.lastRun)}</DetailValue>
                          </DetailRow>
                          <DetailRow>
                            <DetailLabel>Installed:</DetailLabel>
                            <DetailValue>{new Date(app.installedAt).toLocaleDateString()}</DetailValue>
                          </DetailRow>
                          {app.description && (
                            <DetailRow>
                              <DetailLabel>Description:</DetailLabel>
                              <DetailValue>{app.description}</DetailValue>
                            </DetailRow>
                          )}
                          <ButtonRow>
                            <ActionButton onClick={() => handleRun(app.id)}>
                              Run
                            </ActionButton>
                            <ActionButton $danger onClick={() => handleUninstall(app.id, app.name)}>
                              Remove
                            </ActionButton>
                          </ButtonRow>
                        </ProgramDetails>
                      )}
                    </ProgramItem>
                  ))
                )}
              </ProgramList>
            </>
          )}

          {activeView === VIEWS.ADD_NEW && (
            <>
              <ContentHeader>
                <span>Add programs from the Internet or your network</span>
              </ContentHeader>

              <AddProgramContent>
                <AddSection>
                  <AddSectionIcon src="/icons/xp/InternetExplorer6.png" alt="" />
                  <AddSectionContent>
                    <AddSectionTitle>Add a program from the Internet</AddSectionTitle>
                    <AddSectionDesc>
                      Enter the URL of a web app to install. Supports direct URLs, GitHub repos, and GitHub Pages.
                      For advanced features, apps can include a <code>xportfolio-manifest.json</code> file.
                    </AddSectionDesc>

                    <InputGroup>
                      <InputLabel>Web App URL:</InputLabel>
                      <InputRow>
                        <Input
                          type="text"
                          placeholder="https://example.com/app or github.com/user/repo"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={loading}
                        />
                        <FetchButton onClick={handleFetch} disabled={loading || !url.trim()}>
                          {loading ? 'Fetching...' : 'Fetch'}
                        </FetchButton>
                      </InputRow>
                    </InputGroup>

                    {error && (
                      <StatusMessage $error>
                        <StatusIcon src="/icons/xp/Critical.png" alt="" />
                        {error}
                      </StatusMessage>
                    )}

                    {installSuccess && (
                      <StatusMessage $success>
                        <StatusIcon src="/icons/xp/HelpandSupport.png" alt="" />
                        Program installed successfully! You can find it in the Start Menu under "Installed Apps".
                      </StatusMessage>
                    )}

                    {appPreview && (
                      <PreviewCard>
                        <PreviewHeader>
                          <PreviewIcon
                            src={appPreview.icon}
                            alt=""
                            onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }}
                          />
                          <PreviewInfo>
                            <PreviewName>{appPreview.name}</PreviewName>
                            {appPreview.author && <PreviewAuthor>by {appPreview.author}</PreviewAuthor>}
                            <PreviewVersion>Version {appPreview.version}</PreviewVersion>
                          </PreviewInfo>
                        </PreviewHeader>

                        {appPreview.description && (
                          <PreviewDesc>{appPreview.description}</PreviewDesc>
                        )}

                        <PreviewMeta>
                          <MetaItem>
                            <MetaLabel>Source:</MetaLabel>
                            <MetaValue>
                              {appPreview.manifestType === 'xportfolio' ? 'XPortfolio Manifest' :
                               appPreview.manifestType === 'webapp' ? 'Web App Manifest' :
                               appPreview.manifestType === 'package' ? 'package.json' : 'HTML metadata'}
                            </MetaValue>
                          </MetaItem>
                          {appPreview.githubInfo?.isGitHub && (
                            <MetaItem>
                              <MetaLabel>GitHub:</MetaLabel>
                              <MetaValue>{appPreview.githubInfo.user}/{appPreview.githubInfo.repo}</MetaValue>
                            </MetaItem>
                          )}
                          <MetaItem>
                            <MetaLabel>Window Size:</MetaLabel>
                            <MetaValue>{appPreview.windowSettings.width}x{appPreview.windowSettings.height}</MetaValue>
                          </MetaItem>
                        </PreviewMeta>

                        {appPreview.permissions?.length > 0 && (
                          <PermissionsSection>
                            <PermissionsTitle>Requested Permissions:</PermissionsTitle>
                            <PermissionsList>
                              {appPreview.permissions.map((perm, i) => (
                                <PermissionItem key={i}>{perm}</PermissionItem>
                              ))}
                            </PermissionsList>
                          </PermissionsSection>
                        )}

                        {appPreview.alreadyInstalled ? (
                          <StatusMessage $error style={{ marginTop: '12px' }}>
                            <StatusIcon src="/icons/xp/Critical.png" alt="" />
                            This program is already installed.
                          </StatusMessage>
                        ) : (
                          <InstallButtonRow>
                            <InstallButton onClick={handleInstall} disabled={loading}>
                              Install
                            </InstallButton>
                          </InstallButtonRow>
                        )}
                      </PreviewCard>
                    )}
                  </AddSectionContent>
                </AddSection>
              </AddProgramContent>
            </>
          )}
        </ContentArea>
      </MainContent>

      {/* Footer */}
      <Footer>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </Footer>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #fff 0%, #ece9d8 100%);
  border-bottom: 1px solid #aca899;
`;

const HeaderIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;

const HeaderText = styled.h1`
  font-size: 16px;
  font-weight: bold;
  color: #003399;
  margin: 0;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 140px;
  background: #f5f4ef;
  border-right: 1px solid #aca899;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SidebarItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  background: ${props => props.$active ? 'linear-gradient(to bottom, #fff 0%, #e8e8e8 100%)' : 'transparent'};
  border-color: ${props => props.$active ? '#d8d8d8' : 'transparent'};
  box-shadow: ${props => props.$active ? 'inset 0 1px 0 #fff' : 'none'};

  &:hover {
    background: linear-gradient(to bottom, #fafafa 0%, #e8e8e8 100%);
    border-color: #d8d8d8;
  }
`;

const SidebarIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

const SidebarLabel = styled.span`
  font-size: 11px;
  color: #003399;
  line-height: 1.3;
`;

const SidebarDivider = styled.hr`
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #aca899, transparent);
  margin: 8px 0;
`;

const SidebarInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-align: center;
  margin-top: auto;
`;

const InfoIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  opacity: 0.7;
`;

const InfoText = styled.span`
  font-size: 10px;
  color: #666;
  line-height: 1.4;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #7f9db9;
  margin: 8px;
  border-radius: 2px;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f4ef;
  border-bottom: 1px solid #d4d4d4;
  font-size: 11px;
`;

const SortControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  label {
    color: #666;
  }

  select {
    font-size: 11px;
    padding: 2px 4px;
    border: 1px solid #7f9db9;
    background: #fff;
  }
`;

const ProgramList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px;
`;

const ProgramItem = styled.div`
  border: 1px solid ${props => props.$expanded ? '#7f9db9' : '#e0e0e0'};
  border-radius: 2px;
  margin-bottom: 4px;
  background: ${props => props.$expanded ? '#f5f9ff' : '#fff'};
  cursor: pointer;

  &:hover {
    background: ${props => props.$expanded ? '#f5f9ff' : '#f8f8f8'};
  }
`;

const ProgramHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 10px;
`;

const ProgramIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const ProgramInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProgramName = styled.div`
  font-weight: bold;
  font-size: 12px;
  color: #003399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgramMeta = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

const ProgramUsage = styled.div`
  text-align: right;
`;

const UsageLabel = styled.div`
  font-size: 10px;
  color: #666;
`;

const ProgramDetails = styled.div`
  padding: 10px 12px;
  border-top: 1px solid #d4d4d4;
  background: #fafafa;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 4px;
  font-size: 11px;
`;

const DetailLabel = styled.span`
  width: 80px;
  color: #666;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #333;
  word-break: break-all;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
`;

const ActionButton = styled.button`
  padding: 4px 16px;
  font-size: 11px;
  font-family: inherit;
  background: ${props => props.$danger
    ? 'linear-gradient(to bottom, #ff9999 0%, #ff6666 50%, #ff4444 51%, #ff6666 100%)'
    : 'linear-gradient(to bottom, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #e8e8e8 100%)'};
  border: 1px solid ${props => props.$danger ? '#cc0000' : '#707070'};
  border-radius: 3px;
  cursor: pointer;
  color: ${props => props.$danger ? '#fff' : '#000'};

  &:hover:not(:disabled) {
    background: ${props => props.$danger
      ? 'linear-gradient(to bottom, #ffaaaa 0%, #ff7777 50%, #ff5555 51%, #ff7777 100%)'
      : 'linear-gradient(to bottom, #fff 0%, #e8e8e8 50%, #dadada 51%, #efefef 100%)'};
  }

  &:active:not(:disabled) {
    background: linear-gradient(to bottom, #cfcfcf 0%, #d8d8d8 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #666;

  p {
    margin: 4px 0;
  }
`;

const EmptyIcon = styled.img`
  width: 48px;
  height: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
`;

// Add New Program styles
const AddProgramContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const AddSection = styled.div`
  display: flex;
  gap: 16px;
`;

const AddSectionIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

const AddSectionContent = styled.div`
  flex: 1;
`;

const AddSectionTitle = styled.h3`
  font-size: 13px;
  font-weight: bold;
  color: #003399;
  margin: 0 0 8px 0;
`;

const AddSectionDesc = styled.p`
  font-size: 11px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 16px 0;

  code {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 2px;
    font-family: 'Consolas', monospace;
    font-size: 10px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 12px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 5px 8px;
  font-size: 11px;
  font-family: inherit;
  border: 1px solid #7f9db9;
  border-radius: 2px;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }

  &:disabled {
    background: #f0f0f0;
  }
`;

const FetchButton = styled.button`
  padding: 5px 16px;
  font-size: 11px;
  font-family: inherit;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #e8e8e8 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #fff 0%, #e8e8e8 50%, #dadada 51%, #efefef 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  border-radius: 3px;
  margin-bottom: 12px;
  font-size: 11px;
  line-height: 1.4;

  ${props => props.$error && `
    background: #fff0f0;
    border: 1px solid #ffcccc;
    color: #cc0000;
  `}

  ${props => props.$success && `
    background: #f0fff0;
    border: 1px solid #ccffcc;
    color: #008000;
  `}
`;

const StatusIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const PreviewCard = styled.div`
  background: #fff;
  border: 1px solid #7f9db9;
  border-radius: 3px;
  padding: 16px;
  margin-top: 16px;
`;

const PreviewHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const PreviewIcon = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

const PreviewInfo = styled.div``;

const PreviewName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #003399;
`;

const PreviewAuthor = styled.div`
  font-size: 11px;
  color: #666;
`;

const PreviewVersion = styled.div`
  font-size: 10px;
  color: #999;
`;

const PreviewDesc = styled.p`
  font-size: 11px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 12px 0;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 2px;
`;

const PreviewMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 2px;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  font-size: 10px;
`;

const MetaLabel = styled.span`
  color: #666;
`;

const MetaValue = styled.span`
  color: #333;
  margin-left: 4px;
`;

const PermissionsSection = styled.div`
  padding: 8px;
  background: #fff9e6;
  border: 1px solid #ffcc00;
  border-radius: 2px;
  margin-bottom: 12px;
`;

const PermissionsTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: #996600;
  margin-bottom: 4px;
`;

const PermissionsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 10px;
`;

const PermissionItem = styled.li`
  color: #666;
  margin: 2px 0;
`;

const InstallButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const InstallButton = styled.button`
  padding: 6px 24px;
  font-size: 12px;
  font-family: inherit;
  font-weight: bold;
  background: linear-gradient(to bottom, #6699ff 0%, #3366cc 50%, #2255bb 51%, #3366cc 100%);
  border: 1px solid #003399;
  border-radius: 3px;
  color: #fff;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #77aaff 0%, #4477dd 50%, #3366cc 51%, #4477dd 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: #ece9d8;
  border-top: 1px solid #aca899;
`;

const CloseButton = styled.button`
  padding: 4px 20px;
  font-size: 11px;
  font-family: inherit;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #e8e8e8 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to bottom, #fff 0%, #e8e8e8 50%, #dadada 51%, #efefef 100%);
  }

  &:active {
    background: linear-gradient(to bottom, #cfcfcf 0%, #d8d8d8 100%);
  }
`;

export default Installer;
