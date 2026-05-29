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

function stablePid(seed, base = 2200) {
  const text = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 50000;
  }
  return base + hash;
}

function getProcessNameFromApp(app) {
  const title = app.header?.title || '';
  const componentName = app.component?.displayName || app.component?.name || '';
  const source = `${title} ${componentName}`;
  if (/notepad/i.test(source)) return 'notepad.exe';
  if (/calculator/i.test(source)) return 'calc.exe';
  if (/paint/i.test(source)) return 'mspaint.exe';
  if (/internet explorer|iframe/i.test(source)) return 'iexplore.exe';
  if (/media player/i.test(source)) return 'wmplayer.exe';
  if (/command prompt|cmd/i.test(source)) return 'cmd.exe';
  if (/my computer|control panel|explorer/i.test(source)) return 'explorer.exe';
  if (/minesweeper/i.test(source)) return 'winmine.exe';
  if (/solitaire/i.test(source)) return 'sol.exe';
  if (/task manager/i.test(source)) return 'taskmgr.exe';
  if (/adobe reader|pdf/i.test(source)) return 'AcroRd32.exe';
  if (/outlook/i.test(source)) return 'msimn.exe';
  if (/wordpad/i.test(source)) return 'wordpad.exe';
  if (/word/i.test(source)) return 'winword.exe';
  return 'app.exe';
}

function getProcessStatus(app) {
  const title = app.header?.title || '';
  if (/blue screen|not responding|error/i.test(title)) return 'Not Responding';
  if (app.minimized) return 'Suspended';
  return 'Running';
}

function buildProcessTree({ apps, showClippy, showAllProcesses }) {
  const explorerPid = 1000;
  const taskmgrPid = 1212;
  const root = {
    id: 'explorer-root',
    name: 'explorer.exe',
    pid: explorerPid,
    parentPid: null,
    appId: null,
    user: 'Administrator',
    cpu: '00',
    memory: '18,944 K',
    status: 'Running',
    depth: 0,
    branch: '',
    protected: true,
  };

  const processes = [
    root,
    {
      id: 'taskmgr',
      name: 'taskmgr.exe',
      pid: taskmgrPid,
      parentPid: explorerPid,
      appId: null,
      user: 'Administrator',
      cpu: '01',
      memory: '12,608 K',
      status: 'Running',
      protected: true,
    },
  ];

  if (showClippy) {
    processes.push({
      id: 'clippy',
      name: 'clippy.exe',
      pid: 1337,
      parentPid: explorerPid,
      appId: null,
      user: 'Administrator',
      cpu: '00',
      memory: '5,184 K',
      status: 'Running',
    });
  }

  for (const app of apps) {
    const imageName = getProcessNameFromApp(app);
    const isDialog = /dialog|properties|options/i.test(app.header?.title || '');
    const isIframe = imageName === 'iexplore.exe' || /iframe/i.test(app.component?.name || '');
    const parentPid = isIframe ? explorerPid : explorerPid;
    const pid = stablePid(`${app.id}:${imageName}`, 2600);
    const memoryKb = 4200 + ((pid * 37) % 54000);
    const cpu = app.minimized ? '00' : String((pid + app.id) % 7).padStart(2, '0');

    processes.push({
      id: app.id,
      name: imageName,
      title: app.header?.title,
      pid,
      parentPid,
      appId: app.id,
      user: showAllProcesses ? 'Administrator' : 'Administrator',
      cpu,
      memory: `${memoryKb.toLocaleString()} K`,
      status: isDialog ? 'Running' : getProcessStatus(app),
    });
  }

  return flattenProcessTree(processes, explorerPid);
}

function flattenProcessTree(processes, rootPid) {
  const byParent = new Map();
  for (const process of processes) {
    const key = process.parentPid ?? 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(process);
  }

  for (const children of byParent.values()) {
    children.sort((a, b) => a.name.localeCompare(b.name) || a.pid - b.pid);
  }

  const result = [];
  const visit = (process, depth = 0, isLast = true) => {
    result.push({
      ...process,
      depth,
      branch: depth === 0 ? '' : `${isLast ? '└' : '├'} `,
    });

    const children = byParent.get(process.pid) || [];
    children.forEach((child, index) => visit(child, depth + 1, index === children.length - 1));
  };

  const root = processes.find(process => process.pid === rootPid);
  if (root) visit(root, 0, true);
  return result;
}

function getProcessDescendants(processes, parentPid) {
  const descendants = [];
  const visit = (pid) => {
    for (const process of processes) {
      if (process.parentPid === pid) {
        descendants.push(process);
        visit(process.pid);
      }
    }
  };
  visit(parentPid);
  return descendants;
}

function TaskManager() {
  const { apps, onEndTask, onSwitchTo, showClippy, onEndClippy } = useRunningApps();
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const allProcesses = useMemo(() => buildProcessTree({
    apps: visibleApps,
    showClippy,
    showAllProcesses,
  }), [visibleApps, showClippy, showAllProcesses]);

  const processCount = allProcesses.length;

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
    const proc = allProcesses.find((candidate) => candidate.id === selectedProcess);
    if (!proc || proc.protected) return;

    if (selectedProcess === 'clippy' && onEndClippy) {
      onEndClippy();
      setSelectedProcess(null);
    } else if (proc.appId != null) {
      onEndTask(proc.appId);
      setSelectedProcess(null);
    }
  };

  const handleEndProcessTree = () => {
    const proc = allProcesses.find((candidate) => candidate.id === selectedProcess);
    if (!proc || proc.protected) return;

    const descendants = getProcessDescendants(allProcesses, proc.pid);
    for (const child of [...descendants, proc]) {
      if (child.protected) continue;
      if (child.id === 'clippy' && onEndClippy) {
        onEndClippy();
      } else if (child.appId != null) {
        onEndTask(child.appId);
      }
    }
    setSelectedProcess(null);
  };

  const handleSwitchToProcess = () => {
    const proc = allProcesses.find((candidate) => candidate.id === selectedProcess);
    if (proc?.appId != null && onSwitchTo) {
      onSwitchTo(proc.appId);
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
            aria-selected={activeTab === 'applications' ? 'true' : 'false'}
            aria-controls="tab-applications"
            tabIndex={activeTab === 'applications' ? 0 : -1}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'processes' ? 'true' : 'false'}
            aria-controls="tab-processes"
            tabIndex={activeTab === 'processes' ? 0 : -1}
            onClick={() => setActiveTab('processes')}
          >
            Processes
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'performance' ? 'true' : 'false'}
            aria-controls="tab-performance"
            tabIndex={activeTab === 'performance' ? 0 : -1}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'networking' ? 'true' : 'false'}
            aria-controls="tab-networking"
            tabIndex={activeTab === 'networking' ? 0 : -1}
            onClick={() => setActiveTab('networking')}
          >
            Networking
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'users' ? 'true' : 'false'}
            aria-controls="tab-users"
            tabIndex={activeTab === 'users' ? 0 : -1}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </menu>

        {/* Applications Tab */}
        <TabPanel role="tabpanel" id="tab-applications" hidden={activeTab !== 'applications'}>
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
        <TabPanel role="tabpanel" id="tab-processes" hidden={activeTab !== 'processes'}>
          <ListContainer className="sunken-panel">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '34%' }}>Image Name</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>PID</th>
                  <th style={{ width: '18%' }}>User Name</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>CPU</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Mem Usage</th>
                  <th style={{ width: '12%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allProcesses.map((proc) => (
                  <tr
                    key={proc.id}
                    className={selectedProcess === proc.id ? 'highlighted' : ''}
                    onClick={() => handleProcessClick(proc.id)}
                    onDoubleClick={() => proc.appId != null && onSwitchTo?.(proc.appId)}
                  >
                    <td>
                      <ProcessName $depth={proc.depth}>
                        <ProcessBranch aria-hidden="true">{proc.branch}</ProcessBranch>
                        {proc.name}
                      </ProcessName>
                    </td>
                    <td style={{ textAlign: 'right' }}>{proc.pid}</td>
                    <td>{proc.user}</td>
                    <td style={{ textAlign: 'right' }}>{proc.cpu}</td>
                    <td style={{ textAlign: 'right' }}>{proc.memory}</td>
                    <td>{proc.status}</td>
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
              disabled={selectedProcess === null || allProcesses.find(proc => proc.id === selectedProcess)?.protected}
            >
              End Process
            </button>
            <button
              onClick={handleEndProcessTree}
              disabled={selectedProcess === null || allProcesses.find(proc => proc.id === selectedProcess)?.protected}
            >
              End Process Tree
            </button>
            <button
              onClick={handleSwitchToProcess}
              disabled={allProcesses.find(proc => proc.id === selectedProcess)?.appId == null}
            >
              Switch To
            </button>
          </ButtonRow>
        </TabPanel>

        {/* Performance Tab */}
        <TabPanel role="tabpanel" id="tab-performance" hidden={activeTab !== 'performance'}>
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
        <TabPanel role="tabpanel" id="tab-networking" hidden={activeTab !== 'networking'}>
          <NetworkingTab
            adapters={networkAdapters}
            historyByAdapter={networkHistoryByAdapter}
            perfTick={perfTick}
            selectedAdapterId={selectedAdapterId}
            onSelectAdapterId={setSelectedAdapterId}
          />
        </TabPanel>

        {/* Users Tab */}
        <TabPanel role="tabpanel" id="tab-users" hidden={activeTab !== 'users'}>
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
    padding: 8px 8px 0;
    min-height: 0;
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

const ProcessName = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${({ $depth }) => Math.max(0, $depth) * 12}px;
  min-width: 0;
`;

const ProcessBranch = styled.span`
  width: 14px;
  flex-shrink: 0;
  color: #666;
  font-family: "Courier New", monospace;

  tr.highlighted & {
    color: #fff;
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
