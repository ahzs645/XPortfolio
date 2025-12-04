import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useInstalledApps } from '../../../contexts/InstalledAppsContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  font-size: 11px;
  color: #000;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Title = styled.h2`
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #003399;
`;

const Description = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const Link = styled.a`
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: #003399;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid #7f9db9;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: inherit;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 50%, #cfcfcf 51%, #e8e8e8 100%);
  border: 1px solid #707070;
  border-radius: 3px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(to bottom, #fff 0%, #e8e8e8 50%, #dadada 51%, #efefef 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(to bottom, #cfcfcf 0%, #d8d8d8 100%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewCard = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #7f9db9;
  border-radius: 2px;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const AppIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const AppName = styled.h3`
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  color: #003399;
`;

const AppInfo = styled.div`
  font-size: 11px;
  color: #666;

  p {
    margin: 4px 0;
  }
`;

const PermissionsList = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #f5f5f5;
  border: 1px solid #d4d4d4;
  border-radius: 2px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 11px;
    font-weight: bold;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #d4d4d4;
  background: #f0f0f0;
`;

const StatusMessage = styled.div`
  margin-top: 12px;
  padding: 8px;
  border-radius: 2px;
  font-size: 11px;

  ${props => props.$error && `
    background: #fde0e0;
    border: 1px solid #c00;
    color: #900;
  `}

  ${props => props.$success && `
    background: #e0fde0;
    border: 1px solid #0a0;
    color: #060;
  `}

  ${props => props.$loading && `
    background: #e0e8fd;
    border: 1px solid #33c;
    color: #006;
  `}
`;

const InstalledAppsList = styled.div`
  margin-top: 16px;
  flex: 1;
  overflow-y: auto;
  border: 1px solid #7f9db9;
  background: #fff;
`;

const InstalledAppItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
  gap: 12px;

  &:hover {
    background: #e8f0ff;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AppDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const SmallButton = styled(Button)`
  min-width: 60px;
  padding: 2px 8px;
  font-size: 10px;
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #7f9db9;
  background: #f0f0f0;
`;

const Tab = styled.button`
  padding: 8px 16px;
  font-size: 11px;
  font-family: inherit;
  background: ${props => props.$active ? '#ece9d8' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#7f9db9' : 'transparent'};
  border-bottom: ${props => props.$active ? 'none' : '1px solid #7f9db9'};
  margin-bottom: ${props => props.$active ? '-1px' : '0'};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#ece9d8' : '#e8e8e8'};
  }
`;

function Installer({ onClose }) {
  const { fetchManifest, installApp, uninstallApp, getInstalledAppsList, isInstalled, launchInstalledApp } = useInstalledApps();
  const [activeTab, setActiveTab] = useState('install');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appPreview, setAppPreview] = useState(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  const installedApps = getInstalledAppsList();

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAppPreview(null);
    setInstallSuccess(false);

    // Normalize URL
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
        // If GitHub URL but failed, provide helpful error
        if (result.githubInfo?.isGitHub) {
          setError(`Could not fetch app from GitHub. Make sure the repo has GitHub Pages enabled or contains an index.html. Tried: ${result.githubInfo.pagesUrl}`);
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
    } catch (err) {
      setError(err.message || 'Installation failed');
    } finally {
      setLoading(false);
    }
  }, [appPreview, installApp]);

  const handleUninstall = useCallback((appId) => {
    if (window.confirm('Are you sure you want to uninstall this app?')) {
      uninstallApp(appId);
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

  return (
    <Container>
      <TabBar>
        <Tab $active={activeTab === 'install'} onClick={() => setActiveTab('install')}>
          Install New App
        </Tab>
        <Tab $active={activeTab === 'manage'} onClick={() => setActiveTab('manage')}>
          Manage Apps ({installedApps.length})
        </Tab>
      </TabBar>

      {activeTab === 'install' && (
        <>
          <Content>
            <Title>Install Web Apps</Title>
            <Description>
              The Installer helps you add web apps into Windows XP. Enter the URL of the web app you want to install.
            </Description>
            <Description>
              Supports direct URLs, GitHub repos (github.com/user/repo), and GitHub Pages.
              For developers, add a <code>xportfolio-manifest.json</code> to enable advanced features.
            </Description>

            <InputRow>
              <Input
                type="text"
                placeholder="https://example.com/myapp/ or github.com/user/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <Button onClick={handleFetch} disabled={loading || !url.trim()}>
                {loading ? 'Fetching...' : 'Fetch'}
              </Button>
            </InputRow>

            {loading && (
              <StatusMessage $loading>
                Fetching app information...
              </StatusMessage>
            )}

            {error && (
              <StatusMessage $error>
                Error: {error}
              </StatusMessage>
            )}

            {installSuccess && (
              <StatusMessage $success>
                App installed successfully! You can find it in the Start Menu under "Installed Apps".
              </StatusMessage>
            )}

            {appPreview && (
              <PreviewCard>
                <PreviewHeader>
                  <AppIcon src={appPreview.icon} alt="" onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }} />
                  <div>
                    <AppName>{appPreview.name}</AppName>
                    {appPreview.author && <span style={{ fontSize: '10px', color: '#666' }}>by {appPreview.author}</span>}
                  </div>
                </PreviewHeader>

                <AppInfo>
                  {appPreview.description && <p>{appPreview.description}</p>}
                  <p>Version: {appPreview.version}</p>
                  {appPreview.githubInfo?.isGitHub && (
                    <p style={{ color: '#333' }}>
                      GitHub: {appPreview.githubInfo.user}/{appPreview.githubInfo.repo}
                    </p>
                  )}
                  <p>URL: {appPreview.url}</p>
                  <p>Source: {appPreview.manifestType === 'xportfolio' ? 'XPortfolio Manifest' :
                              appPreview.manifestType === 'webapp' ? 'Web App Manifest' :
                              appPreview.manifestType === 'package' ? 'package.json' : 'HTML metadata'}</p>
                  <p>Window: {appPreview.windowSettings.width}x{appPreview.windowSettings.height}</p>
                </AppInfo>

                {appPreview.permissions?.length > 0 && (
                  <PermissionsList>
                    <h4>Requested Permissions:</h4>
                    <ul>
                      {appPreview.permissions.map((perm, i) => (
                        <li key={i}>{perm}</li>
                      ))}
                    </ul>
                  </PermissionsList>
                )}

                {appPreview.alreadyInstalled && (
                  <StatusMessage $error style={{ marginTop: '12px' }}>
                    This app is already installed.
                  </StatusMessage>
                )}
              </PreviewCard>
            )}
          </Content>

          <ButtonRow>
            <Button onClick={handleInstall} disabled={!appPreview || loading || appPreview?.alreadyInstalled}>
              Install
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </ButtonRow>
        </>
      )}

      {activeTab === 'manage' && (
        <Content>
          <Title>Installed Apps</Title>
          <Description>
            Manage your installed web apps. You can uninstall apps or view their details.
          </Description>

          {installedApps.length === 0 ? (
            <StatusMessage $loading style={{ marginTop: '16px' }}>
              No apps installed yet. Go to "Install New App" to add some!
            </StatusMessage>
          ) : (
            <InstalledAppsList>
              {installedApps.map(app => (
                <InstalledAppItem key={app.id}>
                  <AppIcon src={app.icon} alt="" onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }} />
                  <AppDetails>
                    <AppName style={{ fontSize: '11px' }}>{app.name}</AppName>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {app.url}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      Installed: {new Date(app.installedAt).toLocaleDateString()}
                    </div>
                  </AppDetails>
                  <SmallButton onClick={() => handleRun(app.id)} style={{ marginRight: '4px' }}>
                    Run
                  </SmallButton>
                  <SmallButton onClick={() => handleUninstall(app.id)}>
                    Uninstall
                  </SmallButton>
                </InstalledAppItem>
              ))}
            </InstalledAppsList>
          )}
        </Content>
      )}
    </Container>
  );
}

export default Installer;
