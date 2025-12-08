import { useState } from 'react';
import {
  ContentArea,
  ContentHeader,
  SortControl,
  Select,
  ProgramList,
  ProgramItem,
  ProgramHeader,
  ProgramIcon,
  ProgramInfo,
  ProgramName,
  ProgramMeta,
  ProgramDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  ButtonRow,
  Button,
  DangerButton,
  EmptyMessage,
  EmptyIcon,
} from './styles';
import styled from 'styled-components';

const ProgramUsage = styled.div`
  text-align: right;
  min-width: 70px;
`;

const UsageLabel = styled.div`
  font-size: 10px;
  color: #666;
`;

const SizeLabel = styled.div`
  font-size: 10px;
  color: #003399;
  font-weight: bold;
`;

const BuiltInBadge = styled.span`
  font-size: 9px;
  background: #e0e0e0;
  color: #666;
  padding: 1px 4px;
  border-radius: 2px;
  margin-left: 6px;
`;

const CategoryBadge = styled.span`
  font-size: 9px;
  background: #f0f0f0;
  color: #888;
  padding: 1px 4px;
  border-radius: 2px;
`;

const DisabledBadge = styled.span`
  font-size: 9px;
  background: #ffcccc;
  color: #990000;
  padding: 1px 4px;
  border-radius: 2px;
  margin-left: 6px;
`;

const ToggleButton = styled.button`
  padding: 3px 10px;
  font-size: 11px;
  border: 1px solid #808080;
  border-radius: 3px;
  cursor: pointer;
  background: ${({ $enabled }) => $enabled ? '#fff0f0' : '#f0fff0'};
  color: ${({ $enabled }) => $enabled ? '#990000' : '#006600'};

  &:hover {
    background: ${({ $enabled }) => $enabled ? '#ffe0e0' : '#e0ffe0'};
  }

  &:active {
    background: ${({ $enabled }) => $enabled ? '#ffd0d0' : '#d0ffd0'};
  }
`;

const DisabledItem = styled.div`
  opacity: 0.6;
`;

function ChangeRemovePrograms({ apps, onRun, onUninstall, onToggleApp }) {
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const sortedApps = [...apps].sort((a, b) => {
    switch (sortBy) {
      case 'size':
        return (b.size || b.manifest?.size || 0) - (a.size || a.manifest?.size || 0);
      case 'lastUsed':
        return (b.lastRun || 0) - (a.lastRun || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
    if (app.isBuiltIn) return null; // Don't show for built-in
    if (!app.lastRun) return 'Rarely';
    const daysSinceRun = Math.floor((Date.now() - app.lastRun) / (1000 * 60 * 60 * 24));
    if (daysSinceRun < 1) return 'Frequently';
    if (daysSinceRun < 7) return 'Occasionally';
    return 'Rarely';
  };

  const handleUninstall = (appId, appName) => {
    if (window.confirm(`Are you sure you want to remove "${appName}" from your computer?`)) {
      onUninstall(appId);
      setExpandedAppId(null);
    }
  };

  return (
    <ContentArea>
      <ContentHeader>
        <span>Currently installed programs:</span>
        <SortControl>
          <label>Sort by:</label>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="lastUsed">Last Used On</option>
          </Select>
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
                <ProgramInfo style={app.isDisabled ? { opacity: 0.6 } : {}}>
                  <ProgramName>
                    {app.name}
                    {app.isBuiltIn && <BuiltInBadge>Built-in</BuiltInBadge>}
                    {app.isDisabled && <DisabledBadge>Disabled</DisabledBadge>}
                  </ProgramName>
                  <ProgramMeta>
                    {app.version && <span>Version {app.version}</span>}
                    {app.author && <span> &bull; {app.author}</span>}
                    {app.category && (
                      <>
                        <span> &bull; </span>
                        <CategoryBadge>{app.category}</CategoryBadge>
                      </>
                    )}
                  </ProgramMeta>
                </ProgramInfo>
                <ProgramUsage>
                  <SizeLabel>{formatSize(app.size || app.manifest?.size)}</SizeLabel>
                  {getUsageFrequency(app) && (
                    <UsageLabel>Used: {getUsageFrequency(app)}</UsageLabel>
                  )}
                </ProgramUsage>
              </ProgramHeader>

              {expandedAppId === app.id && (
                <ProgramDetails onClick={(e) => e.stopPropagation()}>
                  {app.url && (
                    <DetailRow>
                      <DetailLabel>URL:</DetailLabel>
                      <DetailValue>{app.url}</DetailValue>
                    </DetailRow>
                  )}
                  {app.isBuiltIn ? (
                    // For built-in apps, show release date if available
                    app.installedAt && (
                      <DetailRow>
                        <DetailLabel>Released:</DetailLabel>
                        <DetailValue>{new Date(app.installedAt).toLocaleDateString()}</DetailValue>
                      </DetailRow>
                    )
                  ) : (
                    // For user-installed apps, show last used and installed dates
                    <>
                      <DetailRow>
                        <DetailLabel>Last Used:</DetailLabel>
                        <DetailValue>{formatLastUsed(app.lastRun)}</DetailValue>
                      </DetailRow>
                      <DetailRow>
                        <DetailLabel>Installed:</DetailLabel>
                        <DetailValue>{new Date(app.installedAt).toLocaleDateString()}</DetailValue>
                      </DetailRow>
                    </>
                  )}
                  {app.description && (
                    <DetailRow>
                      <DetailLabel>Description:</DetailLabel>
                      <DetailValue>{app.description}</DetailValue>
                    </DetailRow>
                  )}
                  <ButtonRow>
                    {!app.isDisabled && (
                      <Button onClick={() => onRun(app.id, app.appKey)}>
                        Run
                      </Button>
                    )}
                    {app.isBuiltIn && onToggleApp && (
                      <ToggleButton
                        $enabled={!app.isDisabled}
                        onClick={() => onToggleApp(app.appKey)}
                      >
                        {app.isDisabled ? 'Enable' : 'Disable'}
                      </ToggleButton>
                    )}
                    {!app.isBuiltIn && (
                      <DangerButton onClick={() => handleUninstall(app.id, app.name)}>
                        Remove
                      </DangerButton>
                    )}
                  </ButtonRow>
                </ProgramDetails>
              )}
            </ProgramItem>
          ))
        )}
      </ProgramList>
    </ContentArea>
  );
}

export default ChangeRemovePrograms;
