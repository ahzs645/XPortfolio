import { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  ContentArea,
  ContentHeader,
  ScrollContent,
  Section,
  SectionIcon,
  SectionContent,
  SectionTitle,
  SectionDesc,
  InputGroup,
  InputLabel,
  InputRow,
  Input,
  Button,
  PrimaryButton,
  StatusMessage,
  StatusIcon,
  PreviewCard,
  PreviewHeader,
  PreviewIcon,
  PreviewInfo,
  PreviewName,
  PreviewAuthor,
  PreviewVersion,
  PreviewDesc,
  PreviewMeta,
  MetaItem,
  MetaLabel,
  MetaValue,
} from './styles';

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

function AddNewProgram({ fetchManifest, installApp, isInstalled, onSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appPreview, setAppPreview] = useState(null);
  const [installSuccess, setInstallSuccess] = useState(false);

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
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Installation failed');
    } finally {
      setLoading(false);
    }
  }, [appPreview, installApp, onSuccess]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && url.trim() && !loading) {
      handleFetch();
    }
  }, [url, loading, handleFetch]);

  return (
    <ContentArea>
      <ContentHeader>
        <span>Add programs from the Internet or your network</span>
      </ContentHeader>

      <ScrollContent>
        <Section>
          <SectionIcon src="/icons/xp/InternetExplorer6.png" alt="" />
          <SectionContent>
            <SectionTitle>Add a program from the Internet</SectionTitle>
            <SectionDesc>
              Enter the URL of a web app to install. Supports direct URLs, GitHub repos, and GitHub Pages.
              For advanced features, apps can include a <code>xportfolio-manifest.json</code> file.
            </SectionDesc>

            <InputGroup>
              <InputLabel>Web App URL:</InputLabel>
              <InputRow>
                <Input
                  type="text"
                  placeholder="https://example.com/app or github.com/user/repo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <Button onClick={handleFetch} disabled={loading || !url.trim()}>
                  {loading ? 'Fetching...' : 'Fetch'}
                </Button>
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
                  <StatusMessage $error style={{ marginTop: '12px', marginBottom: 0 }}>
                    <StatusIcon src="/icons/xp/Critical.png" alt="" />
                    This program is already installed.
                  </StatusMessage>
                ) : (
                  <InstallButtonRow>
                    <PrimaryButton onClick={handleInstall} disabled={loading}>
                      Install
                    </PrimaryButton>
                  </InstallButtonRow>
                )}
              </PreviewCard>
            )}
          </SectionContent>
        </Section>
      </ScrollContent>
    </ContentArea>
  );
}

export default AddNewProgram;
