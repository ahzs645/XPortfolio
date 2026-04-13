import React, { useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';
import { withBaseUrl } from '../../../utils/baseUrl';

const TABS = [
  { id: 'general', label: 'General', enabled: true },
];

function SystemProperties({ onClose, onMinimize }) {
  const { getOSName, getFullName } = useConfig();
  const [activeTab, setActiveTab] = useState('general');

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
        <section className="tabs" aria-label="System Properties Tabs">
          <TabsBar role="tablist" aria-label="System Properties">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id ? 'true' : 'false'}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                $active={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsBar>

          <TabPanel
            role="tabpanel"
            id="tab-general"
            hidden={activeTab !== 'general'}
            $active={activeTab === 'general'}
          >
            <SystemPane>
              <SplitView>
                <LeftColumn>
                  <SystemImage src={withBaseUrl('/gui/display/reference/systemmonitor.png')} alt="System" />
                </LeftColumn>
                <RightColumn>
                  <InfoSection>
                    <InfoLabel>System:</InfoLabel>
                    <InfoText>{getOSName()}</InfoText>
                    <InfoText>Professional x64 Edition</InfoText>
                    <InfoText>Version 1.0.0</InfoText>
                    <InfoText>Service Pack 3</InfoText>
                  </InfoSection>

                  <InfoSection>
                    <InfoLabel>Registered to:</InfoLabel>
                    <InfoText>{getFullName()}</InfoText>
                  </InfoSection>

                  <InfoSection>
                    <InfoLabel>Computer:</InfoLabel>
                    <InfoText>Intel Pentium 4 CPU</InfoText>
                    <InfoText>2.40GHz, 1.00 GB of RAM</InfoText>
                    <InfoText>XPortfolio Project</InfoText>
                  </InfoSection>
                </RightColumn>
              </SplitView>
            </SystemPane>
          </TabPanel>
        </section>

        <Actions>
          <ActionButton onClick={onClose}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
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

const TabsBar = styled.menu``;

const TabButton = styled.button``;

const TabPanel = styled.article`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SystemPane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SplitView = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

const LeftColumn = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const SystemImage = styled.img`
  width: 100px;
  height: auto;
`;

const RightColumn = styled.div`
  flex: 1;
  padding: 10px 0;
  font-size: 11px;
`;

const InfoSection = styled.div`
  margin-bottom: 10px;
`;

const InfoLabel = styled.p`
  margin: 0 0 2px 0;
  font-weight: normal;
`;

const InfoText = styled.p`
  margin: 0 0 2px 15px;
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
  cursor: pointer;

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

export default SystemProperties;
