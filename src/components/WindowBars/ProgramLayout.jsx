import React from 'react';
import styled from 'styled-components';
import MenuBar from './MenuBar';
import Toolbar from './Toolbar';
import AddressBar from './AddressBar';
import StatusBar from './StatusBar';

/**
 * ProgramLayout Component - Complete Windows XP program layout with all bars
 *
 * This component provides a consistent layout for all "programs" in the portfolio.
 * Simply configure which bars you need and their options.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content of the program
 * @param {Object} props.windowActions - Window control functions { onClose, onMinimize, onMaximize }
 *
 * Menu Bar Props:
 * @param {Array} props.menus - Menu configurations (see MenuBar component)
 * @param {string} props.menuLogo - Logo for menu bar
 * @param {Function} props.onMenuAction - Menu action callback
 *
 * Toolbar Props:
 * @param {Array} props.toolbarItems - Toolbar button configurations (see Toolbar component)
 * @param {Function} props.onToolbarAction - Toolbar action callback
 *
 * Address Bar Props:
 * @param {string} props.addressTitle - Current address/path title
 * @param {string} props.addressIcon - Icon for address bar
 * @param {boolean} props.addressLoading - Whether address bar shows loading
 *
 * Status Bar Props:
 * @param {string|Array} props.statusFields - Status bar field(s)
 * @param {boolean} props.showStatusGrip - Whether to show resize grip
 *
 * Visibility Props:
 * @param {boolean} props.showMenuBar - Whether to show menu bar (default: true if menus provided)
 * @param {boolean} props.showToolbar - Whether to show toolbar (default: true if toolbarItems provided)
 * @param {boolean} props.showAddressBar - Whether to show address bar (default: true if addressTitle provided)
 * @param {boolean} props.showStatusBar - Whether to show status bar (default: true if statusFields provided)
 *
 * @example
 * <ProgramLayout
 *   menus={[
 *     { id: 'file', label: 'File', items: [{ label: 'Exit', action: 'exitProgram' }] },
 *     { id: 'view', label: 'View', items: [{ label: 'Maximize', action: 'maximizeWindow' }] },
 *     { id: 'help', label: 'Help', disabled: true }
 *   ]}
 *   menuLogo="/gui/toolbar/barlogo.webp"
 *   toolbarItems={[
 *     { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous', disabled: true },
 *     { type: 'separator' },
 *     { type: 'button', id: 'projects', icon: '/icons/projects.webp', label: 'My Projects', action: 'openProjects' },
 *   ]}
 *   addressTitle="About Me"
 *   addressIcon="/icons/about.webp"
 *   statusFields="Learn more about Ahmad"
 *   windowActions={{ onClose, onMinimize, onMaximize }}
 *   onMenuAction={(action) => console.log('Menu:', action)}
 *   onToolbarAction={(action) => console.log('Toolbar:', action)}
 * >
 *   <YourContent />
 * </ProgramLayout>
 */
function ProgramLayout({
  children,
  windowActions = {},

  // Menu Bar
  menus,
  menuLogo,
  onMenuAction,

  // Toolbar
  toolbarItems,
  onToolbarAction,

  // Address Bar
  addressTitle,
  addressIcon,
  addressLoading = false,
  addressProgress,

  // Status Bar
  statusFields,
  showStatusGrip = true,

  // Visibility overrides
  showMenuBar,
  showToolbar,
  showAddressBar,
  showStatusBar,
}) {
  // Determine visibility (default: show if data provided, unless explicitly overridden)
  const shouldShowMenuBar = showMenuBar ?? (menus && menus.length > 0);
  const shouldShowToolbar = showToolbar ?? (toolbarItems && toolbarItems.length > 0);
  const shouldShowAddressBar = showAddressBar ?? Boolean(addressTitle);
  const shouldShowStatusBar = showStatusBar ?? Boolean(statusFields);

  return (
    <ProgramContainer>
      {shouldShowMenuBar && (
        <MenuBar
          menus={menus}
          logo={menuLogo}
          onAction={onMenuAction}
          windowActions={windowActions}
        />
      )}

      {shouldShowToolbar && (
        <Toolbar
          items={toolbarItems}
          onAction={onToolbarAction}
        />
      )}

      {shouldShowAddressBar && (
        <AddressBar
          title={addressTitle}
          icon={addressIcon}
          loading={addressLoading}
          progress={addressProgress}
        />
      )}

      <ContentArea>
        {children}
      </ContentArea>

      {shouldShowStatusBar && (
        <StatusBar
          fields={statusFields}
          showGrip={showStatusGrip}
        />
      )}
    </ProgramContainer>
  );
}

const ProgramContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #ece9d8;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: auto;
  min-height: 0;
`;

export default ProgramLayout;
