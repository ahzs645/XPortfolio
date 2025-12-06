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
 * Toolbar Props (single toolbar):
 * @param {Array} props.toolbarItems - Toolbar button configurations (see Toolbar component)
 * @param {Function} props.onToolbarAction - Toolbar action callback
 * @param {string} props.toolbarVariant - 'default' | 'compact' - Toolbar size variant
 *
 * Toolbars Props (multiple toolbars):
 * @param {Array} props.toolbars - Array of toolbar configurations
 *   Each toolbar: { id: string, items: Array, variant?: string, bottomBorder?: boolean }
 * @param {Function} props.onToolbarChange - Callback for select/color changes: (toolbarId, itemId, value) => void
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
 * // Single toolbar (backwards compatible)
 * <ProgramLayout
 *   menus={[
 *     { id: 'file', label: 'File', items: [{ label: 'Exit', action: 'exitProgram' }] },
 *   ]}
 *   toolbarItems={[
 *     { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous' },
 *   ]}
 *   onToolbarAction={(action) => console.log('Toolbar:', action)}
 * >
 *   <YourContent />
 * </ProgramLayout>
 *
 * @example
 * // Multiple compact toolbars (WordPad style)
 * <ProgramLayout
 *   menus={[...]}
 *   toolbars={[
 *     {
 *       id: 'file-tools',
 *       variant: 'compact',
 *       items: [
 *         { type: 'button', id: 'new', icon: '/icons/new.png', action: 'file:new' },
 *         { type: 'button', id: 'save', icon: '/icons/save.png', action: 'file:save' },
 *       ]
 *     },
 *     {
 *       id: 'format-tools',
 *       variant: 'compact',
 *       items: [
 *         { type: 'select', id: 'font', value: fontName, options: fonts },
 *         { type: 'button', id: 'bold', icon: '/icons/bold.png', active: isBold, action: 'format:bold' },
 *         { type: 'color', id: 'textColor', value: textColor },
 *       ]
 *     }
 *   ]}
 *   onToolbarAction={(action, toolbarId) => handleAction(action, toolbarId)}
 *   onToolbarChange={(toolbarId, itemId, value) => handleChange(toolbarId, itemId, value)}
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

  // Single Toolbar (backwards compatible)
  toolbarItems,
  onToolbarAction,
  toolbarVariant = 'default',

  // Multiple Toolbars
  toolbars,
  onToolbarChange,

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
  const shouldShowSingleToolbar = showToolbar ?? (toolbarItems && toolbarItems.length > 0);
  const shouldShowMultipleToolbars = toolbars && toolbars.length > 0;
  const shouldShowAddressBar = showAddressBar ?? Boolean(addressTitle);
  const shouldShowStatusBar = showStatusBar ?? Boolean(statusFields);

  // Handler for toolbar actions that includes toolbar id for multiple toolbars
  const handleToolbarAction = (action, toolbarId) => {
    if (onToolbarAction) {
      onToolbarAction(action, toolbarId);
    }
  };

  // Handler for select/color changes
  const handleToolbarChange = (toolbarId, itemId, value) => {
    if (onToolbarChange) {
      onToolbarChange(toolbarId, itemId, value);
    }
  };

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

      {/* Multiple toolbars mode */}
      {shouldShowMultipleToolbars && toolbars.map((toolbar, index) => (
        <Toolbar
          key={toolbar.id || `toolbar-${index}`}
          items={toolbar.items}
          variant={toolbar.variant || 'default'}
          bottomBorder={toolbar.bottomBorder !== false}
          topBorder={toolbar.topBorder}
          onAction={(action) => handleToolbarAction(action, toolbar.id)}
          onChange={(itemId, value) => handleToolbarChange(toolbar.id, itemId, value)}
        />
      ))}

      {/* Single toolbar mode (backwards compatible) */}
      {!shouldShowMultipleToolbars && shouldShowSingleToolbar && (
        <Toolbar
          items={toolbarItems}
          variant={toolbarVariant}
          onAction={onToolbarAction}
          onChange={onToolbarChange ? (itemId, value) => onToolbarChange(null, itemId, value) : undefined}
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export default ProgramLayout;
