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
`;

const UsageLabel = styled.div`
  font-size: 10px;
  color: #666;
`;

function ChangeRemovePrograms({ apps, onRun, onUninstall }) {
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  const sortedApps = [...apps].sort((a, b) => {
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
                <ProgramInfo>
                  <ProgramName>{app.name}</ProgramName>
                  <ProgramMeta>
                    {app.version && <span>Version {app.version}</span>}
                    {app.author && <span> &bull; {app.author}</span>}
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
                    <Button onClick={() => onRun(app.id)}>
                      Run
                    </Button>
                    <DangerButton onClick={() => handleUninstall(app.id, app.name)}>
                      Remove
                    </DangerButton>
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
