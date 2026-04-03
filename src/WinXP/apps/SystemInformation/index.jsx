import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';

const TREE_ITEMS = [
  { id: 'summary', label: 'System Summary', depth: 0 },
  { id: 'hardware', label: 'Hardware Resources', depth: 0, expandable: true },
  { id: 'components', label: 'Components', depth: 0, expandable: true },
  { id: 'software', label: 'Software Environment', depth: 0, expandable: true },
  { id: 'internet', label: 'Internet Settings', depth: 0, expandable: true },
];

function getUptime() {
  const days = Math.floor(Math.random() * 14) + 1;
  const hours = Math.floor(Math.random() * 24);
  const mins = Math.floor(Math.random() * 60);
  const secs = Math.floor(Math.random() * 60);
  return `${days} day(s), ${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function SystemInformation({ onClose, onMinimize }) {
  const { getOSName, getFullName } = useConfig();
  const [selected, setSelected] = useState('summary');
  const [findText, setFindText] = useState('');

  const uptime = useMemo(() => getUptime(), []);
  const osName = getOSName() || 'Microsoft Windows XP';
  const userName = getFullName() || 'XPUser';

  const summaryData = useMemo(() => [
    { item: 'OS Name', value: `${osName} Professional` },
    { item: 'Version', value: '5.1.2600 Service Pack 3 Build 2600' },
    { item: 'OS Manufacturer', value: 'Microsoft Corporation' },
    { item: 'System Name', value: 'VIRTUALXP-16333' },
    { item: 'System Manufacturer', value: 'Microsoft Corporation' },
    { item: 'System Model', value: 'Virtual Machine' },
    { item: 'System Type', value: 'X86-based PC' },
    { item: 'Processor', value: 'x86 Family 6 Model 58 Stepping 9 GenuineIntel ~3424 Mhz' },
    { item: 'BIOS Version/Date', value: 'American Megatrends Inc. 080002, 8/14/2009' },
    { item: 'SMBIOS Version', value: '2.3' },
    { item: 'Windows Directory', value: 'C:\\WINDOWS' },
    { item: 'System Directory', value: 'C:\\WINDOWS\\system32' },
    { item: 'Boot Device', value: '\\Device\\HarddiskVolume1' },
    { item: 'Locale', value: 'United States' },
    { item: 'Hardware Abstraction Layer', value: 'Version = "5.1.2600.5512 (xpsp.080413-2111)"' },
    { item: 'User Name', value: `VIRTUALXP-16333\\${userName}` },
    { item: 'Time Zone', value: 'Eastern Daylight Time' },
    { item: 'Total Physical Memory', value: '64.00 MB' },
    { item: 'Available Physical Memory', value: '279.05 MB' },
    { item: 'Total Virtual Memory', value: '2.00 GB' },
    { item: 'Available Virtual Memory', value: '1.95 GB' },
    { item: 'Page File Space', value: '1.22 GB' },
    { item: 'Page File', value: 'C:\\pagefile.sys' },
  ], [osName, userName]);

  const hardwareData = [
    { item: 'IRQ 0', value: 'System timer' },
    { item: 'IRQ 1', value: 'Standard 101/102-Key Keyboard' },
    { item: 'IRQ 3', value: 'Communications Port (COM2)' },
    { item: 'IRQ 4', value: 'Communications Port (COM1)' },
    { item: 'IRQ 6', value: 'Standard floppy disk controller' },
    { item: 'IRQ 8', value: 'System CMOS/real time clock' },
    { item: 'IRQ 12', value: 'PS/2 Compatible Mouse' },
    { item: 'IRQ 13', value: 'Numeric data processor' },
    { item: 'IRQ 14', value: 'Primary IDE Channel' },
    { item: 'IRQ 15', value: 'Secondary IDE Channel' },
  ];

  const componentsData = [
    { item: 'Display', value: 'VMware SVGA II' },
    { item: 'Adapter RAM', value: '128.00 MB' },
    { item: 'Resolution', value: '1024 x 768 x 60 hertz' },
    { item: 'Bits/Pixel', value: '32' },
    { item: 'Sound Device', value: 'Creative AudioPCI (ES1371,ES1373)' },
    { item: 'Network Adapter', value: 'AMD PCNET Family PCI Ethernet Adapter' },
    { item: 'IP Address', value: '192.168.1.100' },
    { item: 'CD-ROM', value: 'NECVMWar VMware IDE CDR10' },
    { item: 'Disk Drive', value: 'VMware Virtual IDE Hard Drive' },
    { item: 'Disk Size', value: '40.00 GB' },
  ];

  const softwareData = [
    { item: 'System Drivers', value: '128 loaded' },
    { item: 'Environment Variables', value: '14 defined' },
    { item: 'Print Jobs', value: '0 pending' },
    { item: 'Network Connections', value: '2 active' },
    { item: 'Running Tasks', value: '42' },
    { item: 'Loaded Modules', value: '287' },
    { item: 'Services', value: '86 running' },
    { item: 'Startup Programs', value: '12 registered' },
    { item: 'System Uptime', value: uptime },
  ];

  const internetData = [
    { item: 'Internet Explorer', value: '6.0.2900.5512' },
    { item: 'Connection Type', value: 'LAN' },
    { item: 'Proxy Server', value: 'None' },
    { item: 'Default Home Page', value: 'http://www.msn.com' },
    { item: 'Cache Size', value: '250 MB' },
    { item: 'History Days', value: '20' },
    { item: 'Cookies', value: 'Enabled' },
    { item: 'JavaScript', value: 'Enabled' },
    { item: 'ActiveX', value: 'Enabled' },
  ];

  const dataMap = {
    summary: summaryData,
    hardware: hardwareData,
    components: componentsData,
    software: softwareData,
    internet: internetData,
  };

  const currentData = dataMap[selected] || summaryData;

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Save...', disabled: true },
        { separator: true },
        { label: 'Exit', action: 'exit' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Copy', disabled: true },
        { label: 'Select All', disabled: true },
        { separator: true },
        { label: 'Find...', disabled: true },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Basic', disabled: true },
        { label: 'Advanced', disabled: true },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { label: 'System Restore', disabled: true },
        { label: 'Network Diagnostics', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', disabled: true },
        { separator: true },
        { label: 'About System Information', disabled: true },
      ],
    },
  ];

  const handleMenuAction = (action) => {
    if (action === 'exit') onClose?.();
  };

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={true}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <Shell>
        <Content>
          <TreePane>
            {TREE_ITEMS.map((node) => (
              <TreeNode
                key={node.id}
                $selected={selected === node.id}
                $depth={node.depth}
                onClick={() => setSelected(node.id)}
              >
                {node.label}
              </TreeNode>
            ))}
          </TreePane>

          <DetailPane>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Value</Th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, i) => (
                  <Tr key={i} $even={i % 2 === 0}>
                    <Td>{row.item}</Td>
                    <TdValue>{row.value}</TdValue>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </DetailPane>
        </Content>

        <FindBar>
          <FindRow>
            <FindLabel>Find what:</FindLabel>
            <FindInput
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <FindButton>Find</FindButton>
            <FindButton>Close Find</FindButton>
          </FindRow>
          <FindOptions>
            <label>
              <input type="checkbox" /> Search selected category only
            </label>
            <label>
              <input type="checkbox" /> Search category names only
            </label>
          </FindOptions>
        </FindBar>
      </Shell>
    </ProgramLayout>
  );
}

const Shell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  font-size: 11px;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  border: 1px solid #919b9c;
  margin: 0 4px;
`;

const TreePane = styled.div`
  width: 200px;
  min-width: 140px;
  background: #fff;
  border-right: 1px solid #919b9c;
  overflow-y: auto;
  padding: 2px 0;
`;

const TreeNode = styled.div`
  padding: 2px 4px 2px ${({ $depth }) => 8 + ($depth || 0) * 16}px;
  cursor: pointer;
  white-space: nowrap;
  background: ${({ $selected }) => ($selected ? '#316ac5' : 'transparent')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#000')};

  &:hover {
    background: ${({ $selected }) => ($selected ? '#316ac5' : '#e8e8e0')};
  }
`;

const DetailPane = styled.div`
  flex: 1;
  background: #fff;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  background: #ece9d8;
  border: 1px solid #fff;
  border-bottom: 1px solid #919b9c;
  border-right: 1px solid #919b9c;
  padding: 2px 6px;
  text-align: left;
  font-weight: bold;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #919b9c;
`;

const Tr = styled.tr`
  &:hover {
    background: #e8e8e0;
  }
`;

const Td = styled.td`
  padding: 1px 6px;
  border-bottom: none;
  white-space: nowrap;
  color: #000;
  font-weight: bold;
`;

const TdValue = styled.td`
  padding: 1px 6px;
  border-bottom: none;
  white-space: nowrap;
  color: #000;
`;

const FindBar = styled.div`
  padding: 4px 8px 6px;
  background: #ece9d8;
  border-top: 1px solid #919b9c;
`;

const FindRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const FindLabel = styled.label`
  font-size: 11px;
  white-space: nowrap;
`;

const FindInput = styled.input`
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
`;

const FindButton = styled.button`
  min-width: 72px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

const FindOptions = styled.div`
  display: flex;
  gap: 16px;
  font-size: 11px;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  input[type='checkbox'] {
    margin: 0;
  }
`;

export default SystemInformation;
