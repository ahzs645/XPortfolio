import {
  SidebarContainer,
  SidebarItem,
  SidebarIcon,
  SidebarLabel,
  SidebarDivider,
  SidebarInfo,
  InfoIcon,
  InfoText,
} from './styles';

export const VIEWS = {
  CHANGE_REMOVE: 'change_remove',
  ADD_NEW: 'add_new',
  SET_DEFAULTS: 'set_defaults',
};

function Sidebar({ activeView, setActiveView, installedCount }) {
  return (
    <SidebarContainer>
      <SidebarItem
        $active={activeView === VIEWS.CHANGE_REMOVE}
        onClick={() => setActiveView(VIEWS.CHANGE_REMOVE)}
      >
        <SidebarIcon src="/icons/xp/programs/change.png" alt="" />
        <SidebarLabel>Change or Remove Programs</SidebarLabel>
      </SidebarItem>

      <SidebarItem
        $active={activeView === VIEWS.ADD_NEW}
        onClick={() => setActiveView(VIEWS.ADD_NEW)}
      >
        <SidebarIcon src="/icons/xp/programs/add.png" alt="" />
        <SidebarLabel>Add New Programs</SidebarLabel>
      </SidebarItem>

      <SidebarItem
        $active={activeView === VIEWS.SET_DEFAULTS}
        onClick={() => setActiveView(VIEWS.SET_DEFAULTS)}
      >
        <SidebarIcon src="/icons/xp/programs/defaults.png" alt="" />
        <SidebarLabel>Set Program Access and Defaults</SidebarLabel>
      </SidebarItem>

      <SidebarDivider />

      <SidebarInfo>
        <InfoIcon src="/icons/xp/HelpandSupport.png" alt="" />
        <InfoText>
          Currently installed programs: <strong>{installedCount}</strong>
        </InfoText>
      </SidebarInfo>
    </SidebarContainer>
  );
}

export default Sidebar;
