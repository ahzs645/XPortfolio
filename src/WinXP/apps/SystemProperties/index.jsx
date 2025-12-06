import React, { useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';

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
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                $active={activeTab === tab.id}
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
                  <SystemImage src="/gui/display/reference/systemmonitor.png" alt="System" />
                </LeftColumn>
                <RightColumn>
                  <InfoSection>
                    <InfoLabel>System:</InfoLabel>
                    <InfoText>{getOSName()} Windows XP</InfoText>
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

const TabsBar = styled.menu`
  margin: 0;
  padding: 6px 6px 0 6px;
  display: flex;
  gap: 2px;
  border-radius: 4px 4px 0 0;
  border-bottom: none;
  margin-bottom: -1px;
`;

const TabButton = styled.button`
  min-width: 76px;
  padding: 5px 10px 6px 10px;
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  border: 1px solid #91a7b4;
  border-bottom: ${({ $active }) => ($active ? '1px solid #fbfbfc' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5)'
    : 'linear-gradient(180deg, #f7f7f7, #ededeb 40%, #e7e7e0 95%, #e2e2d8)')};
  color: ${({ $active }) => ($active ? '#000' : '#222')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 2px #ffc73c, inset 0 1px 0 #fff' : 'none')};
  position: relative;
  top: ${({ $active }) => ($active ? '0' : '1px')};
  margin-bottom: ${({ $active }) => ($active ? '-1px' : '0')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};

  &:hover:not(:disabled) {
    border-top: 1px solid #e68b2c;
    box-shadow: inset 0 2px #ffc73c;
  }
`;

const TabPanel = styled.article`
  flex: 1;
  padding: 10px;
  background: #fbfbfc;
  border: 1px solid #919b9c;
  border-top: 1px solid #919b9c;
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208, 206, 191, 0.75);
  border-radius: 0 0 4px 4px;
  margin-top: 0;
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
