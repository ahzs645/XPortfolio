import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useApp } from '../../../../contexts/AppContext';
import { XP_ICONS } from '../../../../contexts/FileSystemContext';
import { TaskPanel } from '../../../../components';

// Control Panel items with their associated apps
const CONTROL_PANEL_ITEMS = [
  {
    id: 'accessibility',
    name: 'Accessibility Options',
    icon: '/icons/xp/HelpandSupport.png',
    description: 'Change accessibility options for your computer.',
    action: null,
  },
  {
    id: 'add-hardware',
    name: 'Add Hardware',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Install hardware on your computer.',
    action: null,
  },
  {
    id: 'add-remove-programs',
    name: 'Add or Remove Programs',
    icon: '/icons/xp/programs/add.png',
    description: 'Install and uninstall programs and Windows components.',
    action: 'Add or Remove Programs',
  },
  {
    id: 'administrative-tools',
    name: 'Administrative Tools',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Configure administrative settings for your computer.',
    action: null,
  },
  {
    id: 'automatic-updates',
    name: 'Automatic Updates',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Keep your computer up to date.',
    action: null,
  },
  {
    id: 'date-time',
    name: 'Date and Time',
    icon: '/icons/xp/DateTime.png',
    description: 'Set the date, time, and time zone for your computer.',
    action: 'Date and Time Properties',
  },
  {
    id: 'display',
    name: 'Display',
    icon: '/icons/xp/DisplayProperties.png',
    description: 'Change the appearance of your desktop.',
    action: 'Display Properties',
  },
  {
    id: 'folder-options',
    name: 'Folder Options',
    icon: '/icons/xp/FolderClosed.png',
    description: 'Customize the display of files and folders.',
    action: null,
  },
  {
    id: 'fonts',
    name: 'Fonts',
    icon: '/icons/xp/font.png',
    description: 'Add, change, and manage fonts on your computer.',
    action: 'Font Viewer',
  },
  {
    id: 'game-controllers',
    name: 'Game Controllers',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Add, remove, and configure game controllers.',
    action: null,
  },
  {
    id: 'internet-options',
    name: 'Internet Options',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Configure your Internet display and connection settings.',
    action: 'Internet Explorer',
  },
  {
    id: 'keyboard',
    name: 'Keyboard',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Customize your keyboard settings.',
    action: null,
  },
  {
    id: 'mouse',
    name: 'Mouse',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Customize your mouse settings.',
    action: null,
  },
  {
    id: 'network-connections',
    name: 'Network Connections',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Connect to other computers, networks, and the Internet.',
    action: null,
  },
  {
    id: 'phone-modem',
    name: 'Phone and Modem Options',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Configure your telephone dialing rules and modem settings.',
    action: null,
  },
  {
    id: 'power-options',
    name: 'Power Options',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Configure energy-saving settings for your computer.',
    action: null,
  },
  {
    id: 'printers-faxes',
    name: 'Printers and Faxes',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Show installed printers and fax printers.',
    action: null,
  },
  {
    id: 'regional-language',
    name: 'Regional and Language Options',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Customize settings for display of languages, numbers, times, and dates.',
    action: null,
  },
  {
    id: 'sounds-audio',
    name: 'Sounds and Audio Devices',
    icon: '/icons/xp/speech.png',
    description: 'Change sound scheme and configure the settings for speakers and recording devices.',
    action: 'Speech Properties',
  },
  {
    id: 'speech',
    name: 'Speech',
    icon: '/icons/xp/speech.png',
    description: 'Change settings for text-to-speech and speech recognition.',
    action: 'Speech Properties',
  },
  {
    id: 'system',
    name: 'System',
    icon: '/icons/xp/system.png',
    description: 'View information about your computer.',
    action: 'System Properties',
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    icon: '/icons/xp/taskmgr.png',
    description: 'View running applications and system performance.',
    action: 'Task Manager',
  },
  {
    id: 'taskbar-start',
    name: 'Taskbar and Start Menu',
    icon: '/icons/xp/DisplayProperties.png',
    description: 'Customize the Start menu and the taskbar.',
    action: 'Taskbar Properties',
  },
  {
    id: 'user-accounts',
    name: 'User Accounts',
    icon: '/icons/xp/UserAccounts.png',
    description: 'Change user account settings and passwords for people who share this computer.',
    action: 'User Accounts',
  },
];

// Category view items (grouped)
const CONTROL_PANEL_CATEGORIES = [
  {
    id: 'appearance',
    name: 'Appearance and Themes',
    icon: '/icons/xp/DisplayProperties.png',
    description: 'Change the computer\'s appearance.',
    action: 'Display Properties',
  },
  {
    id: 'network',
    name: 'Network and Internet Connections',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Set up or change your Internet connection.',
    action: null,
  },
  {
    id: 'programs',
    name: 'Add or Remove Programs',
    icon: '/icons/xp/programs/add.png',
    description: 'Install or remove programs.',
    action: 'Add or Remove Programs',
  },
  {
    id: 'sounds',
    name: 'Sounds, Speech, and Audio Devices',
    icon: '/icons/xp/speech.png',
    description: 'Change the computer\'s sound scheme.',
    action: 'Speech Properties',
  },
  {
    id: 'performance',
    name: 'Performance and Maintenance',
    icon: '/icons/xp/system.png',
    description: 'Get information about your computer.',
    action: 'System Properties',
  },
  {
    id: 'printers',
    name: 'Printers and Other Hardware',
    icon: '/icons/xp/ControlPanel.png',
    description: 'Add or configure printers and hardware.',
    action: null,
  },
  {
    id: 'users',
    name: 'User Accounts',
    icon: '/icons/xp/UserAccounts.png',
    description: 'Create or remove user accounts.',
    action: 'User Accounts',
  },
  {
    id: 'datetime',
    name: 'Date, Time, Language, and Regional Options',
    icon: '/icons/xp/DateTime.png',
    description: 'Change date, time, and time zone.',
    action: 'Date and Time Properties',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Options',
    icon: '/icons/xp/HelpandSupport.png',
    description: 'Configure accessibility options.',
    action: null,
  },
  {
    id: 'security',
    name: 'Security Center',
    icon: '/icons/xp/ControlPanel.png',
    description: 'View security status and settings.',
    action: null,
  },
];

// Component for Category View (blue gradient with grouped items)
function CategoryView({ onItemClick, hoveredItem, setHoveredItem }) {
  return (
    <CategoryContent>
      <CategoryHeader>Pick a category</CategoryHeader>
      <CategoryGrid>
        {CONTROL_PANEL_CATEGORIES.map((category) => (
          <CategoryItem
            key={category.id}
            onClick={() => onItemClick(category)}
            onMouseEnter={() => setHoveredItem(category.id)}
            onMouseLeave={() => setHoveredItem(null)}
            $isHovered={hoveredItem === category.id}
            $isDisabled={!category.action}
          >
            <CategoryIcon src={category.icon} alt={category.name} />
            <CategoryName $isHovered={hoveredItem === category.id}>
              {category.name}
            </CategoryName>
          </CategoryItem>
        ))}
      </CategoryGrid>
    </CategoryContent>
  );
}

// Component for Classic View (file explorer style)
function ClassicView({ viewMode, selectedItems, onItemClick, onItemDoubleClick }) {
  const renderItem = (item) => {
    const isSelected = selectedItems.includes(item.id);
    const commonProps = {
      $selected: isSelected,
      onClick: (e) => onItemClick(e, item),
      onDoubleClick: () => onItemDoubleClick(item),
    };

    switch (viewMode) {
      case 'details':
        return (
          <DetailsRow key={item.id} {...commonProps}>
            <DetailsCell $width="50%">
              <ItemIconSmall src={item.icon} alt="" />
              <span>{item.name}</span>
            </DetailsCell>
            <DetailsCell $width="50%">Control Panel Item</DetailsCell>
          </DetailsRow>
        );
      case 'list':
        return (
          <ListItem key={item.id} {...commonProps}>
            <ItemIconSmall src={item.icon} alt="" />
            <ItemName>{item.name}</ItemName>
          </ListItem>
        );
      case 'tiles':
        return (
          <TileItem key={item.id} {...commonProps}>
            <ItemIconLarge src={item.icon} alt="" />
            <TileInfo>
              <TileName>{item.name}</TileName>
              <TileType>Control Panel Item</TileType>
            </TileInfo>
          </TileItem>
        );
      default: // icons
        return (
          <IconItem key={item.id} {...commonProps}>
            <ItemIconLarge src={item.icon} alt="" />
            <ItemName>{item.name}</ItemName>
          </IconItem>
        );
    }
  };

  return (
    <ClassicContent $viewMode={viewMode}>
      {viewMode === 'details' && (
        <DetailsHeader>
          <DetailsHeaderCell $width="50%">Name</DetailsHeaderCell>
          <DetailsHeaderCell $width="50%">Type</DetailsHeaderCell>
        </DetailsHeader>
      )}
      <ItemsContainer $viewMode={viewMode}>
        {CONTROL_PANEL_ITEMS.map(renderItem)}
      </ItemsContainer>
    </ClassicContent>
  );
}

// Main ControlPanelView component
function ControlPanelView({
  viewMode = 'icons',
  selectedItems = [],
  onItemClick,
  onItemDoubleClick,
  isCategoryView = true,
  onToggleView,
}) {
  const { openApp } = useApp();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleItemClick = useCallback((e, item) => {
    if (onItemClick) {
      onItemClick(e, item);
    }
  }, [onItemClick]);

  const handleItemDoubleClick = useCallback((item) => {
    if (item.action) {
      openApp(item.action);
    }
    if (onItemDoubleClick) {
      onItemDoubleClick(item);
    }
  }, [openApp, onItemDoubleClick]);

  const handleCategoryClick = useCallback((category) => {
    if (category.action) {
      openApp(category.action);
    }
  }, [openApp]);

  return (
    <Container>
      <TaskPanel width={200}>
        <TaskPanel.Section title="Control Panel" variant="primary" icon={XP_ICONS.controlPanel}>
          <TaskPanel.Item
            icon={XP_ICONS.controlPanel}
            onClick={onToggleView}
          >
            {isCategoryView ? 'Switch to Classic View' : 'Switch to Category View'}
          </TaskPanel.Item>
        </TaskPanel.Section>
        <TaskPanel.Section title="See Also">
          <TaskPanel.Item
            icon="/icons/xp/InternetExplorer6.png"
            onClick={() => window.open('https://www.microsoft.com/windows', '_blank')}
          >
            Windows Update
          </TaskPanel.Item>
          <TaskPanel.Item
            icon={XP_ICONS.help}
            onClick={() => openApp('Help and Support')}
          >
            Help and Support
          </TaskPanel.Item>
        </TaskPanel.Section>
      </TaskPanel>

      {isCategoryView ? (
        <CategoryView
          onItemClick={handleCategoryClick}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
        />
      ) : (
        <ClassicView
          viewMode={viewMode}
          selectedItems={selectedItems}
          onItemClick={handleItemClick}
          onItemDoubleClick={handleItemDoubleClick}
        />
      )}
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

// Category View Styles
const CategoryContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: linear-gradient(180deg, #5a7edc 0%, #3c5eb5 50%, #2647a0 100%);
  padding: 16px 24px;
`;

const CategoryHeader = styled.h1`
  font-size: 22px;
  font-weight: normal;
  color: #fff;
  margin: 0 0 24px 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-family: 'Franklin Gothic Medium', 'Trebuchet MS', Tahoma, sans-serif;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 32px;
  max-width: 800px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: ${({ $isDisabled }) => $isDisabled ? 'default' : 'pointer'};
  border-radius: 3px;
  opacity: ${({ $isDisabled }) => $isDisabled ? 0.6 : 1};

  &:hover {
    background-color: ${({ $isDisabled }) => $isDisabled ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const CategoryIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

const CategoryName = styled.span`
  font-size: 11px;
  color: #fff;
  text-decoration: ${({ $isHovered }) => $isHovered ? 'underline' : 'none'};
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  font-family: Tahoma, Arial, sans-serif;
  line-height: 1.4;
`;

// Classic View Styles
const ClassicContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: white;
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? 'nowrap' : 'wrap'};
  flex-direction: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? 'column' : 'row'};
  gap: ${({ $viewMode }) => $viewMode === 'details' ? '0' : '4px'};
  padding: ${({ $viewMode }) => $viewMode === 'details' ? '0' : '8px'};
  align-content: flex-start;
`;

// Icons view
const IconItem = styled.div`
  width: 80px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 3px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const ItemIconLarge = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

const ItemIconSmall = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const ItemName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
`;

// List view
const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  width: 200px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};

  &:hover {
    background: ${({ $selected }) => $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

// Details view
const DetailsHeader = styled.div`
  display: flex;
  background: #ece9d8;
  border-bottom: 1px solid #808080;
`;

const DetailsHeaderCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 3px 8px;
  font-size: 11px;
  font-weight: normal;
  border-right: 1px solid #808080;

  &:last-child {
    border-right: none;
  }
`;

const DetailsRow = styled.div`
  display: flex;
  width: 100%;
  padding: 2px 0;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};

  &:hover {
    background: ${({ $selected }) => $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const DetailsCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 2px 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Tiles view
const TileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 200px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const TileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const TileName = styled.span`
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TileType = styled.span`
  font-size: 10px;
  color: #666;
`;

// Export the items for use elsewhere
export { CONTROL_PANEL_ITEMS, CONTROL_PANEL_CATEGORIES };
export default ControlPanelView;
