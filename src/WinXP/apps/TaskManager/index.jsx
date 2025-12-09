import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useRunningApps } from '../../../contexts/RunningAppsContext';

const TABS = [
  { id: 'applications', label: 'Applications', enabled: true },
  { id: 'processes', label: 'Processes', enabled: false },
  { id: 'performance', label: 'Performance', enabled: false },
  { id: 'networking', label: 'Networking', enabled: false },
  { id: 'users', label: 'Users', enabled: false },
];

function TaskManager({ onClose, onMinimize }) {
  const { apps, onEndTask, onSwitchTo } = useRunningApps();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(12);
  const [processCount, setProcessCount] = useState(17);
  const [commitCharge, setCommitCharge] = useState({ used: 70532, total: 56045 });
  const listRef = useRef(null);

  // Simulate changing stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 5);
      setProcessCount(Math.floor(Math.random() * 10) + 15);
      setCommitCharge({
        used: Math.floor(Math.random() * 20000) + 60000,
        total: 56045 + Math.floor(Math.random() * 5000),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter apps that should appear in task manager (visible windows)
  const visibleApps = apps.filter(app =>
    app.header && !app.header.invisible && !app.header.noFooterWindow
  );

  const handleEndTask = () => {
    if (selectedAppId !== null && onEndTask) {
      onEndTask(selectedAppId);
      setSelectedAppId(null);
    }
  };

  const handleSwitchTo = () => {
    if (selectedAppId !== null && onSwitchTo) {
      onSwitchTo(selectedAppId);
    }
  };

  const handleNewTask = () => {
    // Could open Run dialog in the future
  };

  const handleAppClick = (id) => {
    setSelectedAppId(id);
  };

  const handleAppDoubleClick = (id) => {
    if (onSwitchTo) {
      onSwitchTo(id);
    }
  };

  const menus = [
    {
      name: 'File',
      items: [
        { name: 'New Task (Run...)', disabled: true },
        { type: 'separator' },
        { name: 'Exit Task Manager', action: onClose },
      ],
    },
    {
      name: 'Options',
      items: [
        { name: 'Always On Top', disabled: true },
        { name: 'Minimize On Use', disabled: true },
        { name: 'Hide When Minimized', disabled: true },
      ],
    },
    {
      name: 'View',
      items: [
        { name: 'Refresh Now', disabled: true },
        { type: 'separator' },
        { name: 'Update Speed', disabled: true },
      ],
    },
    {
      name: 'Windows',
      items: [
        { name: 'Tile Horizontally', disabled: true },
        { name: 'Tile Vertically', disabled: true },
        { name: 'Minimize', disabled: true },
        { name: 'Maximize', disabled: true },
        { name: 'Cascade', disabled: true },
        { name: 'Bring To Front', disabled: true },
      ],
    },
    {
      name: 'Shut Down',
      items: [
        { name: 'Stand By', disabled: true },
        { name: 'Hibernate', disabled: true },
        { name: 'Turn Off', disabled: true },
        { name: 'Restart', disabled: true },
        { type: 'separator' },
        { name: 'Log Off User', disabled: true },
        { name: 'Switch User', disabled: true },
        { name: 'Lock Computer', disabled: true },
      ],
    },
    {
      name: 'Help',
      items: [
        { name: 'Task Manager Help', disabled: true },
        { type: 'separator' },
        { name: 'About Task Manager', disabled: true },
      ],
    },
  ];

  return (
    <ProgramLayout
      menus={menus}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={true}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <WindowSurface>
        <section className="tabs" aria-label="Task Manager Tabs">
          <TabsBar role="tablist" aria-label="Task Manager">
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
            id="tab-applications"
            hidden={activeTab !== 'applications'}
            $active={activeTab === 'applications'}
          >
            <ApplicationsPane>
              <TaskListContainer>
                <TaskListHeader>
                  <TaskColumn style={{ flex: 3 }}>Task</TaskColumn>
                  <TaskColumn style={{ flex: 1 }}>Status</TaskColumn>
                </TaskListHeader>
                <TaskList ref={listRef}>
                  {visibleApps.map((app) => (
                    <TaskItem
                      key={app.id}
                      $selected={selectedAppId === app.id}
                      onClick={() => handleAppClick(app.id)}
                      onDoubleClick={() => handleAppDoubleClick(app.id)}
                    >
                      <TaskIcon src={app.header.icon} alt="" />
                      <TaskName>{app.header.title}</TaskName>
                      <TaskStatus>Running</TaskStatus>
                    </TaskItem>
                  ))}
                </TaskList>
              </TaskListContainer>
              <ButtonBar>
                <TaskButton onClick={handleEndTask} disabled={selectedAppId === null}>
                  End Task
                </TaskButton>
                <TaskButton onClick={handleSwitchTo} disabled={selectedAppId === null}>
                  Switch To
                </TaskButton>
                <TaskButton onClick={handleNewTask} disabled>
                  New Task...
                </TaskButton>
              </ButtonBar>
            </ApplicationsPane>
          </TabPanel>

          <TabPanel
            role="tabpanel"
            id="tab-processes"
            hidden={activeTab !== 'processes'}
            $active={activeTab === 'processes'}
          >
            <DisabledPane>
              <p>Processes tab is not available.</p>
            </DisabledPane>
          </TabPanel>
        </section>

        <StatusBar>
          <StatusItem>Processes: {processCount}</StatusItem>
          <StatusItem>CPU Usage: {cpuUsage}%</StatusItem>
          <StatusItem>Commit Charge: {commitCharge.used}K / {commitCharge.total}K</StatusItem>
        </StatusBar>
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
  gap: 8px;
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
  padding: 0 4px;
  display: flex;
  gap: 0;
  border-radius: 0;
  border-bottom: none;
  margin-bottom: -1px;
`;

const TabButton = styled.button`
  min-width: 70px;
  padding: 4px 8px 5px 8px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  border: 1px solid #919b9c;
  border-bottom: ${({ $active }) => ($active ? '1px solid #fbfbfc' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5)'
    : 'linear-gradient(180deg, #f7f7f7, #ededeb 40%, #e7e7e0 95%, #e2e2d8)')};
  color: ${({ $active }) => ($active ? '#000' : '#222')};
  position: relative;
  top: ${({ $active }) => ($active ? '0' : '1px')};
  margin-bottom: ${({ $active }) => ($active ? '-1px' : '0')};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  margin-right: -1px;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5);
  }
`;

const TabPanel = styled.article`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background: #fbfbfc;
  border: 1px solid #919b9c;
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe;
  border-radius: 0;
  margin-top: 0;
  min-height: 0;
  overflow: hidden;
`;

const ApplicationsPane = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
`;

const TaskListContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #7f9db9;
  background: #fff;
  min-height: 0;
`;

const TaskListHeader = styled.div`
  display: flex;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 100%);
  border-bottom: 1px solid #7f9db9;
  padding: 2px 4px;
  font-size: 11px;
  font-weight: normal;
`;

const TaskColumn = styled.div`
  padding: 2px 4px;
`;

const TaskList = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  font-size: 11px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#316ac5' : 'transparent')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#000')};

  &:hover {
    background: ${({ $selected }) => ($selected ? '#316ac5' : '#e8e8e8')};
  }
`;

const TaskIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 6px;
  flex-shrink: 0;
`;

const TaskName = styled.span`
  flex: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskStatus = styled.span`
  flex: 1;
  text-align: left;
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
`;

const TaskButton = styled.button`
  min-width: 80px;
  padding: 5px 12px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

const DisabledPane = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
  font-size: 11px;
`;

const StatusBar = styled.div`
  display: flex;
  gap: 16px;
  padding: 4px 8px;
  background: #ece9d8;
  border-top: 1px solid #919b9c;
  font-size: 11px;
  flex-shrink: 0;
`;

const StatusItem = styled.span`
  color: #000;
`;

export default TaskManager;
