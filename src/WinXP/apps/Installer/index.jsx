import { useState, useCallback } from 'react';
import { useInstalledApps } from '../../../contexts/InstalledAppsContext';
import {
  Sidebar,
  VIEWS,
  ChangeRemovePrograms,
  AddNewProgram,
  SetProgramDefaults,
  Container,
  Header,
  HeaderIcon,
  HeaderText,
  MainContent,
  Footer,
  CloseButton,
} from './components';

function Installer({ onClose }) {
  const {
    fetchManifest,
    installApp,
    uninstallApp,
    getInstalledAppsList,
    isInstalled,
    launchInstalledApp,
  } = useInstalledApps();

  const [activeView, setActiveView] = useState(VIEWS.CHANGE_REMOVE);
  const installedApps = getInstalledAppsList();

  const handleRun = useCallback((appId) => {
    launchInstalledApp(appId);
    onClose?.();
  }, [launchInstalledApp, onClose]);

  const handleInstallSuccess = useCallback(() => {
    // Switch to Change/Remove view after 1.5s to show the new app
    setTimeout(() => setActiveView(VIEWS.CHANGE_REMOVE), 1500);
  }, []);

  return (
    <Container>
      <Header>
        <HeaderIcon src="/icons/xp/programs/add.png" alt="" />
        <HeaderText>Add or Remove Programs</HeaderText>
      </Header>

      <MainContent>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          installedCount={installedApps.length}
        />

        {activeView === VIEWS.CHANGE_REMOVE && (
          <ChangeRemovePrograms
            apps={installedApps}
            onRun={handleRun}
            onUninstall={uninstallApp}
          />
        )}

        {activeView === VIEWS.ADD_NEW && (
          <AddNewProgram
            fetchManifest={fetchManifest}
            installApp={installApp}
            isInstalled={isInstalled}
            onSuccess={handleInstallSuccess}
          />
        )}

        {activeView === VIEWS.SET_DEFAULTS && (
          <SetProgramDefaults
            installedApps={installedApps}
          />
        )}
      </MainContent>

      <Footer>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </Footer>
    </Container>
  );
}

export default Installer;
