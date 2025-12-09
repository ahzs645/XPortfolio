import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useRunningApps } from '../../../contexts/RunningAppsContext';

const MENUS = ['File', 'Options', 'View', 'Help'];

function TaskManager({ onClose, onMinimize }) {
  const { apps, onEndTask, onSwitchTo } = useRunningApps();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [processCount, setProcessCount] = useState(1);
  const [showAllProcesses, setShowAllProcesses] = useState(true);
  const listRef = useRef(null);

  // Filter apps that should appear in task manager (visible windows)
  const visibleApps = apps.filter(app =>
    app.header && !app.header.invisible && !app.header.noFooterWindow
  );

  // Generate fake processes from running apps
  const processes = visibleApps.map((app, index) => ({
    id: app.id,
    name: getProcessName(app.header.title),
    pid: 30000 + app.id,
    user: 'Administrator',
  }));

  // Add taskmgr.exe itself
  const allProcesses = [
    { id: 'taskmgr', name: 'taskmgr.exe', pid: 31486, user: 'Administrator' },
    ...processes,
  ];

  useEffect(() => {
    setProcessCount(allProcesses.length);
  }, [allProcesses.length]);

  function getProcessName(title) {
    // Convert window title to a fake process name
    if (title.includes('Notepad')) return 'notepad.exe';
    if (title.includes('Calculator')) return 'calc.exe';
    if (title.includes('Paint')) return 'mspaint.exe';
    if (title.includes('Internet Explorer')) return 'iexplore.exe';
    if (title.includes('Media Player')) return 'wmplayer.exe';
    if (title.includes('Command Prompt')) return 'cmd.exe';
    if (title.includes('My Computer') || title.includes('Control Panel')) return 'explorer.exe';
    if (title.includes('Minesweeper')) return 'winmine.exe';
    if (title.includes('Solitaire')) return 'sol.exe';
    if (title.includes('Task Manager')) return 'taskmgr.exe';
    if (title.includes('Adobe Reader')) return 'AcroRd32.exe';
    if (title.includes('Outlook')) return 'msimn.exe';
    if (title.includes('WordPad')) return 'wordpad.exe';
    return 'app.exe';
  }

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

  const handleEndProcess = () => {
    if (selectedProcess !== null && selectedProcess !== 'taskmgr') {
      onEndTask(selectedProcess);
      setSelectedProcess(null);
    }
  };

  const handleAppClick = (id) => {
    setSelectedAppId(id);
  };

  const handleAppDoubleClick = (id) => {
    if (onSwitchTo) {
      onSwitchTo(id);
    }
  };

  const handleProcessClick = (id) => {
    setSelectedProcess(id);
  };

  const handleUserClick = (username) => {
    setSelectedUser(username);
  };

  return (
    <Container>
      <MenuBar>
        {MENUS.map((menu) => (
          <MenuItem key={menu}>{menu}</MenuItem>
        ))}
      </MenuBar>

      <TabUI>
        <TabHolder>
          <TabList>
            <Tab
              $selected={activeTab === 'applications'}
              onClick={() => setActiveTab('applications')}
            >
              Applications
            </Tab>
            <Tab
              $selected={activeTab === 'processes'}
              onClick={() => setActiveTab('processes')}
            >
              Processes
            </Tab>
            <Tab
              $selected={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            >
              Users
            </Tab>
          </TabList>
        </TabHolder>

        {/* Applications Tab */}
        <TabContent $selected={activeTab === 'applications'}>
          <ContentPane>
            <Items>
              <DetailsHeader>
                <HeaderName>Task</HeaderName>
                <HeaderStatus>Status</HeaderStatus>
              </DetailsHeader>
              {visibleApps.map((app) => (
                <Entry
                  key={app.id}
                  $selected={selectedAppId === app.id}
                  onClick={() => handleAppClick(app.id)}
                  onDoubleClick={() => handleAppDoubleClick(app.id)}
                >
                  <EntryIcon src={app.header.icon} alt="" />
                  <EntryName>{app.header.title}</EntryName>
                  <EntryStatus>Running</EntryStatus>
                </Entry>
              ))}
            </Items>
          </ContentPane>
          <ButtonContainer>
            <WinButton onClick={handleEndTask} disabled={selectedAppId === null}>
              End Task
            </WinButton>
            <WinButton onClick={handleSwitchTo} disabled={selectedAppId === null}>
              Switch To
            </WinButton>
            <WinButton disabled>
              New Task...
            </WinButton>
          </ButtonContainer>
        </TabContent>

        {/* Processes Tab */}
        <TabContent $selected={activeTab === 'processes'}>
          <ContentPane>
            <Items>
              <DetailsHeader>
                <HeaderImageName>Image Name</HeaderImageName>
                <HeaderPID>PID</HeaderPID>
                <HeaderUser>User Name</HeaderUser>
              </DetailsHeader>
              {allProcesses.map((proc) => (
                <Entry
                  key={proc.id}
                  $selected={selectedProcess === proc.id}
                  onClick={() => handleProcessClick(proc.id)}
                >
                  <ProcessIcon />
                  <ProcessName>{proc.name}</ProcessName>
                  <ProcessPID>{proc.pid}</ProcessPID>
                  <ProcessUser>{proc.user}</ProcessUser>
                </Entry>
              ))}
            </Items>
          </ContentPane>
          <CheckboxRow>
            <CheckboxLabel>
              <span>Show processes from all users</span>
              <CheckboxInput
                type="checkbox"
                checked={showAllProcesses}
                onChange={(e) => setShowAllProcesses(e.target.checked)}
              />
              <WinCheckbox $checked={showAllProcesses} />
            </CheckboxLabel>
          </CheckboxRow>
          <ButtonContainer style={{ marginTop: '-20px' }}>
            <WinButton
              onClick={handleEndProcess}
              disabled={selectedProcess === null || selectedProcess === 'taskmgr'}
            >
              End Process
            </WinButton>
          </ButtonContainer>
        </TabContent>

        {/* Users Tab */}
        <TabContent $selected={activeTab === 'users'}>
          <ContentPane>
            <Items>
              <DetailsHeader>
                <HeaderUser style={{ flex: 2 }}>User</HeaderUser>
                <HeaderID>ID</HeaderID>
              </DetailsHeader>
              <Entry
                $selected={selectedUser === 'Administrator'}
                onClick={() => handleUserClick('Administrator')}
              >
                <UserIcon />
                <UserName>Administrator</UserName>
                <UserID>0</UserID>
              </Entry>
            </Items>
          </ContentPane>
          <ButtonContainer>
            <WinButton disabled={selectedUser === null}>
              Logoff
            </WinButton>
            <WinButton disabled>
              Send Message...
            </WinButton>
          </ButtonContainer>
        </TabContent>
      </TabUI>

      <StatusBar>
        <span>Processes: {processCount}</span>
        <Grabber />
      </StatusBar>
    </Container>
  );
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  font-family: "Tahoma", "MS Sans Serif", sans-serif;
  font-size: 11px;
  overflow: hidden;
`;

const MenuBar = styled.div`
  display: flex;
  background: #ece9d8;
  padding: 2px 0;
  border-bottom: 1px solid #aca899;
`;

const MenuItem = styled.div`
  padding: 2px 8px;
  cursor: pointer;
  color: #000;

  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const TabUI = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  min-height: 0;
`;

const TabHolder = styled.div`
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
`;

const TabList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0 2px;
  gap: 0;
`;

const Tab = styled.li`
  padding: 4px 12px 5px 12px;
  font-size: 11px;
  border: 1px solid #919b9c;
  border-bottom: ${({ $selected }) => ($selected ? '1px solid #f1efe2' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $selected }) => ($selected ? '#f1efe2' : 'linear-gradient(180deg, #fafafa 0%, #e9e8dd 100%)')};
  color: #000;
  cursor: pointer;
  position: relative;
  top: ${({ $selected }) => ($selected ? '1px' : '2px')};
  margin-right: -1px;
  z-index: ${({ $selected }) => ($selected ? '2' : '1')};

  &:hover {
    background: ${({ $selected }) => ($selected ? '#f1efe2' : '#f5f4eb')};
  }
`;

const TabContent = styled.div`
  flex: 1;
  display: ${({ $selected }) => ($selected ? 'flex' : 'none')};
  flex-direction: column;
  padding: 10px;
  background: #f1efe2;
  border: 1px solid #919b9c;
  border-radius: 0 3px 3px 3px;
  min-height: 0;
  overflow: hidden;
`;

const ContentPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Items = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px inset #d4d0c8;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;
`;

const DetailsHeader = styled.div`
  display: flex;
  background: linear-gradient(180deg, #fff 0%, #ece9d8 100%);
  border-bottom: 1px solid #aca899;
  padding: 0;
  font-size: 11px;
  font-weight: normal;
  flex-shrink: 0;
`;

const HeaderName = styled.div`
  flex: 3;
  padding: 3px 6px;
  border-right: 1px solid #d4d0c8;
`;

const HeaderStatus = styled.div`
  flex: 1;
  padding: 3px 6px;
`;

const HeaderImageName = styled.div`
  flex: 2;
  padding: 3px 6px;
  border-right: 1px solid #d4d0c8;
`;

const HeaderPID = styled.div`
  width: 60px;
  padding: 3px 6px;
  border-right: 1px solid #d4d0c8;
  text-align: right;
`;

const HeaderUser = styled.div`
  flex: 1;
  padding: 3px 6px;
`;

const HeaderID = styled.div`
  width: 50px;
  padding: 3px 6px;
  text-align: right;
`;

const Entry = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  font-size: 11px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#316ac5' : 'transparent')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#000')};
  flex-shrink: 0;
`;

const EntryIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
`;

const EntryName = styled.span`
  flex: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EntryStatus = styled.span`
  flex: 1;
  text-align: left;
`;

const ProcessIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
`;

const ProcessName = styled.span`
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProcessPID = styled.span`
  width: 60px;
  text-align: right;
  padding-right: 6px;
`;

const ProcessUser = styled.span`
  flex: 1;
`;

const UserIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
`;

const UserName = styled.span`
  flex: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserID = styled.span`
  width: 50px;
  text-align: right;
  padding-right: 6px;
`;

const CheckboxRow = styled.div`
  margin-top: 6px;
  margin-left: 4px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 11px;
`;

const CheckboxInput = styled.input`
  display: none;
`;

const WinCheckbox = styled.div`
  width: 13px;
  height: 13px;
  border: 1px solid #7f9db9;
  background: #fff;
  position: relative;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    position: absolute;
    left: 2px;
    top: 0px;
    width: 4px;
    height: 8px;
    border: solid #000;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  flex-shrink: 0;
`;

const WinButton = styled.button`
  min-width: 75px;
  padding: 4px 10px;
  font-size: 11px;
  font-family: "Tahoma", "MS Sans Serif", sans-serif;
  background: linear-gradient(180deg, #fff 0%, #ece9d8 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: ${({ disabled }) => (disabled ? '#a0a0a0' : '#000')};

  &:not(:disabled):hover {
    background: linear-gradient(180deg, #fff 0%, #ddd8c8 100%);
  }

  &:not(:disabled):active {
    background: linear-gradient(180deg, #ddd8c8 0%, #ece9d8 100%);
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #ece9d8;
  border-top: 1px solid #fff;
  font-size: 11px;
  flex-shrink: 0;
`;

const Grabber = styled.div`
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg,
    transparent 0%, transparent 30%,
    #aca899 30%, #aca899 35%,
    transparent 35%, transparent 45%,
    #aca899 45%, #aca899 50%,
    transparent 50%, transparent 60%,
    #aca899 60%, #aca899 65%,
    transparent 65%, transparent 100%
  );
`;

export default TaskManager;
