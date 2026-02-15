import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useRunningApps } from '../../../contexts/RunningAppsContext';
import { PerformanceTab, NetworkingTab } from './components';
import './taskmgr.css';

const MENUS = ['File', 'Options', 'View', 'Help'];
const HISTORY_POINTS = 300;
const SIMULATED_CPU_CORES = 4;

const initialAdapters = [
  {
    id: 'net-1',
    name: 'Local Area Connection',
    utilizationPercent: 0,
    linkSpeed: '100 Mbps',
    state: 'Operational',
  },
  {
    id: 'net-2',
    name: 'Wireless Network Connection',
    utilizationPercent: 2,
    linkSpeed: '54 Mbps',
    state: 'Operational',
  },
];

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function TaskManager() {
  const { apps, onEndTask, onSwitchTo, showClippy, onEndClippy } = useRunningApps();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  // processCount is derived below from allProcesses.length
  const [showAllProcesses, setShowAllProcesses] = useState(true);

  // Performance tab state
  const [cpuCoreCount] = useState(SIMULATED_CPU_CORES);
  const [cpuHistory, setCpuHistory] = useState(() => ({
    totalByCore: Array.from({ length: SIMULATED_CPU_CORES }, () =>
      Array.from({ length: HISTORY_POINTS }, () => 0),
    ),
    kernelByCore: Array.from({ length: SIMULATED_CPU_CORES }, () =>
      Array.from({ length: HISTORY_POINTS }, () => 0),
    ),
  }));
  const [pageFileHistory, setPageFileHistory] = useState(() =>
    Array.from({ length: HISTORY_POINTS }, () => 30),
  );
  const [physicalMemoryPercent, setPhysicalMemoryPercent] = useState(54);
  const [upTime, setUpTime] = useState('0:00:00');
  const [perfTick, setPerfTick] = useState(0);

  const commitChargeLimitMb = 2446;
  const pageFileUsagePercent = pageFileHistory[pageFileHistory.length - 1] ?? 0;
  const commitChargeTotalMb = Math.round(
    commitChargeLimitMb * (clampPercent(pageFileUsagePercent) / 100),
  );

  const cpuUsagePercent = useMemo(() => {
    if (cpuHistory.totalByCore.length === 0) return 0;
    const total = cpuHistory.totalByCore.reduce(
      (sum, series) => sum + (series[series.length - 1] ?? 0),
      0,
    );
    return Math.round(total / cpuHistory.totalByCore.length);
  }, [cpuHistory.totalByCore]);

  // Networking tab state
  const [networkAdapters, setNetworkAdapters] = useState(() => initialAdapters);
  const [selectedAdapterId, setSelectedAdapterId] = useState(() => initialAdapters[0]?.id ?? '');
  const [networkHistoryByAdapter, setNetworkHistoryByAdapter] = useState(() => {
    const entries = initialAdapters.map(
      (adapter) => [
        adapter.id,
        Array.from({ length: HISTORY_POINTS }, () => adapter.utilizationPercent),
      ],
    );
    return Object.fromEntries(entries);
  });

  // Uptime timer
  useEffect(() => {
    const startTimeMs = Date.now();
    const update = () => {
      const totalSeconds = Math.floor((Date.now() - startTimeMs) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setUpTime(
        `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };
    update();
    const intervalId = window.setInterval(update, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Performance simulation
  useEffect(() => {
    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const tick = () => {
      setCpuHistory((prev) => {
        const totalByCore = [];
        const kernelByCore = [];

        for (let i = 0; i < cpuCoreCount; i += 1) {
          const totalSeries = prev.totalByCore[i] ?? [];
          const kernelSeries = prev.kernelByCore[i] ?? [];

          const lastTotal = totalSeries[totalSeries.length - 1] ?? 0;
          const nextTotal = clampPercent(lastTotal + randomInt(-10, 10));

          const lastKernel = kernelSeries[kernelSeries.length - 1] ?? 0;
          const kernelTarget = nextTotal * 0.35;
          const drift = (kernelTarget - lastKernel) * 0.4;
          const nextKernelCandidate = clampPercent(lastKernel + drift + randomInt(-4, 4));
          const nextKernel = Math.min(nextTotal, nextKernelCandidate);

          totalByCore.push([...totalSeries.slice(1), nextTotal]);
          kernelByCore.push([...kernelSeries.slice(1), nextKernel]);
        }

        return { totalByCore, kernelByCore };
      });

      setPageFileHistory((prev) => {
        const last = prev[prev.length - 1] ?? 0;
        const next = clampPercent(last + randomInt(-2, 2));
        return [...prev.slice(1), next];
      });

      setPhysicalMemoryPercent((prev) => clampPercent(prev + randomInt(-1, 1)));
      setPerfTick((prev) => prev + 1);

      setNetworkAdapters((prevAdapters) => {
        const nextAdapters = prevAdapters.map((adapter) => {
          const drift = randomInt(-12, 18);
          const nextUtilization = clampPercent(adapter.utilizationPercent + drift);
          return { ...adapter, utilizationPercent: nextUtilization };
        });

        setNetworkHistoryByAdapter((prevHistory) => {
          const nextHistory = { ...prevHistory };
          for (const adapter of nextAdapters) {
            const series =
              prevHistory[adapter.id] ??
              Array.from({ length: HISTORY_POINTS }, () => adapter.utilizationPercent);
            nextHistory[adapter.id] = [...series.slice(1), adapter.utilizationPercent];
          }
          return nextHistory;
        });

        return nextAdapters;
      });
    };

    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [cpuCoreCount]);

  // Filter apps that should appear in task manager (visible windows)
  const visibleApps = apps.filter(app =>
    app.header && !app.header.invisible && !app.header.noFooterWindow
  );

  // Generate fake processes from running apps
  const processes = visibleApps.map((app) => ({
    id: app.id,
    name: getProcessName(app.header.title),
    pid: 30000 + app.id,
    user: 'Administrator',
  }));

  // Add taskmgr.exe and clippy
  const allProcesses = [
    { id: 'taskmgr', name: 'taskmgr.exe', pid: 31486, user: 'Administrator' },
    ...(showClippy ? [{ id: 'clippy', name: 'clippy.exe', pid: 31337, user: 'Administrator' }] : []),
    ...processes,
  ];

  const processCount = allProcesses.length;

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
    if (selectedProcess === 'clippy' && onEndClippy) {
      onEndClippy();
      setSelectedProcess(null);
    } else if (selectedProcess !== null && selectedProcess !== 'taskmgr') {
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

      <section className="tabs">
        <menu role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'processes'}
            onClick={() => setActiveTab('processes')}
          >
            Processes
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'networking'}
            onClick={() => setActiveTab('networking')}
          >
            Networking
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </menu>

        {/* Applications Tab */}
        <TabPanel role="tabpanel" hidden={activeTab !== 'applications'}>
          <ListContainer className="sunken-panel">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '70%' }}>Task</th>
                  <th style={{ width: '30%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleApps.map((app) => (
                  <tr
                    key={app.id}
                    className={selectedAppId === app.id ? 'highlighted' : ''}
                    onClick={() => handleAppClick(app.id)}
                    onDoubleClick={() => handleAppDoubleClick(app.id)}
                  >
                    <td>
                      <IconCell>
                        <img src={app.header.icon} alt="" />
                        {app.header.title}
                      </IconCell>
                    </td>
                    <td>Running</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ListContainer>
          <ButtonRow>
            <button onClick={handleEndTask} disabled={selectedAppId === null}>
              End Task
            </button>
            <button onClick={handleSwitchTo} disabled={selectedAppId === null}>
              Switch To
            </button>
            <button disabled>
              New Task...
            </button>
          </ButtonRow>
        </TabPanel>

        {/* Processes Tab */}
        <TabPanel role="tabpanel" hidden={activeTab !== 'processes'}>
          <ListContainer className="sunken-panel">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Image Name</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>PID</th>
                  <th style={{ width: '30%' }}>User Name</th>
                </tr>
              </thead>
              <tbody>
                {allProcesses.map((proc) => (
                  <tr
                    key={proc.id}
                    className={selectedProcess === proc.id ? 'highlighted' : ''}
                    onClick={() => handleProcessClick(proc.id)}
                  >
                    <td>{proc.name}</td>
                    <td style={{ textAlign: 'right' }}>{proc.pid}</td>
                    <td>{proc.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ListContainer>
          <CheckboxRow className="field-row">
            <input
              type="checkbox"
              id="show-all-processes"
              checked={showAllProcesses}
              onChange={(e) => setShowAllProcesses(e.target.checked)}
            />
            <label htmlFor="show-all-processes">Show processes from all users</label>
          </CheckboxRow>
          <ButtonRow>
            <button
              onClick={handleEndProcess}
              disabled={selectedProcess === null || selectedProcess === 'taskmgr'}
            >
              End Process
            </button>
          </ButtonRow>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel role="tabpanel" hidden={activeTab !== 'performance'}>
          <PerformanceTab
            cpuUsagePercent={cpuUsagePercent}
            cpuTotalHistoryByCore={cpuHistory.totalByCore}
            cpuKernelHistoryByCore={cpuHistory.kernelByCore}
            perfTick={perfTick}
            pageFileUsageMb={commitChargeTotalMb}
            pageFileHistory={pageFileHistory}
            physicalMemoryPercent={physicalMemoryPercent}
            upTime={upTime}
            processCount={processCount}
            commitChargeTotalMb={commitChargeTotalMb}
            commitChargeLimitMb={commitChargeLimitMb}
          />
        </TabPanel>

        {/* Networking Tab */}
        <TabPanel role="tabpanel" hidden={activeTab !== 'networking'}>
          <NetworkingTab
            adapters={networkAdapters}
            historyByAdapter={networkHistoryByAdapter}
            perfTick={perfTick}
            selectedAdapterId={selectedAdapterId}
            onSelectAdapterId={setSelectedAdapterId}
          />
        </TabPanel>

        {/* Users Tab */}
        <TabPanel role="tabpanel" hidden={activeTab !== 'users'}>
          <ListContainer className="sunken-panel">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '70%' }}>User</th>
                  <th style={{ width: '30%', textAlign: 'right' }}>ID</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={selectedUser === 'Administrator' ? 'highlighted' : ''}
                  onClick={() => handleUserClick('Administrator')}
                >
                  <td>Administrator</td>
                  <td style={{ textAlign: 'right' }}>0</td>
                </tr>
              </tbody>
            </table>
          </ListContainer>
          <ButtonRow>
            <button disabled={selectedUser === null}>
              Logoff
            </button>
            <button disabled>
              Send Message...
            </button>
          </ButtonRow>
        </TabPanel>
      </section>

      <div className="status-bar">
        <p className="status-bar-field">Processes: {processCount}</p>
      </div>
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

  section.tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 8px;
    min-height: 0;
  }

  section.tabs > menu[role="tablist"] {
    margin: 0;
    padding: 0 2px;
    display: flex;
    margin-bottom: -2px;
    position: relative;
    z-index: 1;
  }

  section.tabs > menu[role="tablist"] > button[role="tab"] {
    padding: 4px 12px;
    font-size: 11px;
    font-family: inherit;
    border: 1px solid #919b9c;
    border-bottom: 1px solid #919b9c;
    border-radius: 3px 3px 0 0;
    background: linear-gradient(180deg, #fafafa 0%, #e9e8dd 100%);
    margin-right: -1px;
    position: relative;
    cursor: pointer;
  }

  section.tabs > menu[role="tablist"] > button[role="tab"][aria-selected="true"] {
    background: #f1efe2;
    border-bottom-color: #f1efe2;
    z-index: 2;
  }

  .status-bar {
    flex-shrink: 0;
  }
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

const TabPanel = styled.article`
  flex: 1;
  display: ${({ hidden }) => (hidden ? 'none' : 'flex')};
  flex-direction: column;
  padding: 10px;
  background: #f1efe2;
  border: 1px solid #919b9c;
  border-radius: 0 3px 3px 3px;
  min-height: 0;
  overflow: hidden;
`;

const ListContainer = styled.div`
  flex: 1;
  overflow: auto;
  min-height: 0;
  background: #fff;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    background: #fff;
  }

  thead {
    position: sticky;
    top: 0;
    background: linear-gradient(180deg, #fff 0%, #ece9d8 100%);
  }

  th {
    text-align: left;
    padding: 3px 6px;
    font-weight: normal;
    border-bottom: 1px solid #aca899;
    border-right: 1px solid #d4d0c8;
  }

  th:last-child {
    border-right: none;
  }

  tbody {
    background: #fff;
  }

  td {
    padding: 2px 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  tr {
    cursor: pointer;
  }

  tr.highlighted {
    background: #0a246a;
    color: #fff;
  }

  tr.highlighted td {
    background: #0a246a;
  }
`;

const IconCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  flex-shrink: 0;

  button {
    min-width: 75px;
  }
`;

const CheckboxRow = styled.div`
  margin-top: 6px;
  margin-bottom: -12px;
`;

export default TaskManager;
