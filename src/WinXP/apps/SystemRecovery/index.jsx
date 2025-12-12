import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useFileSystem } from '../../../contexts/FileSystemContext';
import { useUserAccounts } from '../../../contexts/UserAccountsContext';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import * as idb from 'idb-keyval';
import { withBaseUrl } from '../../../utils/baseUrl';

function SystemRecovery({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { resetFileSystem } = useFileSystem();
  const { activeUserId, users } = useUserAccounts();
  const { resetSettings } = useUserSettings();

  // Reset current user's data only
  const handleResetCurrentUser = useCallback(async () => {
    const currentUser = users.find(u => u.id === activeUserId);
    const userName = currentUser?.name || 'current user';

    const confirmed = window.confirm(
      `Are you sure you want to reset ${userName}'s profile?\n\nThis will clear:\n• Files and folders\n• Desktop settings\n• Icon positions\n\nOther user accounts will not be affected.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setLoadingMessage(`Resetting ${userName}'s profile...`);

    try {
      // Reset file system for current user
      await resetFileSystem();

      // Reset user settings (wallpaper, icon positions, etc.)
      if (resetSettings) {
        resetSettings();
      }

      // Clear user-specific storage key
      const storageKey = activeUserId ? `fileSystem-${activeUserId}` : 'fileSystem';
      await idb.del(storageKey);

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      setIsLoading(false);
      setLoadingMessage('');
      alert('An error occurred during reset. Please try again.');
    }
  }, [activeUserId, users, resetFileSystem, resetSettings]);

  // Reset entire computer (all users and data)
  const handleResetAll = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to COMPLETELY RESET the computer?\n\nThis will permanently delete:\n• ALL user accounts\n• ALL files and folders\n• ALL settings and preferences\n• ALL saved data\n\n⚠️ This action CANNOT be undone!'
    );

    if (!confirmed) return;

    // Double confirmation for destructive action
    const doubleConfirm = window.confirm(
      '⚠️ FINAL WARNING ⚠️\n\nYou are about to erase EVERYTHING.\n\nAre you absolutely sure?'
    );

    if (!doubleConfirm) return;

    setIsLoading(true);
    setLoadingMessage('Resetting entire computer...');

    try {
      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB databases
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }

      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      setIsLoading(false);
      setLoadingMessage('');
      alert('An error occurred during reset. Please try again.');
    }
  }, []);

  const currentUser = users?.find(u => u.id === activeUserId);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderIcon src={withBaseUrl('/icons/xp/Recovery.png')} alt="Recovery" />
          <HeaderTitle>System Recovery</HeaderTitle>
        </HeaderContent>
      </Header>

      <Content>
        {!isLoading ? (
          <>
            <InfoSection>
              <InfoText>
                Choose a recovery option below. Please read each option carefully before proceeding.
              </InfoText>
            </InfoSection>

            <OptionsSection>
              <OptionCard>
                <OptionIcon src={withBaseUrl('/icons/xp/UserAccounts.png')} alt="" />
                <OptionContent>
                  <OptionTitle>Reset Current User</OptionTitle>
                  <OptionDescription>
                    Resets {currentUser?.name || 'your'} profile only. This will clear your files, desktop settings, and preferences. Other user accounts will not be affected.
                  </OptionDescription>
                  <ResetButton onClick={handleResetCurrentUser} $warning={false}>
                    Reset My Profile
                  </ResetButton>
                </OptionContent>
              </OptionCard>

              <Divider />

              <OptionCard>
                <OptionIcon src={withBaseUrl('/icons/xp/MyComputer.png')} alt="" />
                <OptionContent>
                  <OptionTitle>Reset Entire Computer</OptionTitle>
                  <OptionDescription>
                    <strong>⚠️ Destructive:</strong> Completely wipes all user accounts, files, and settings. Returns the computer to its initial state.
                  </OptionDescription>
                  <ResetButton onClick={handleResetAll} $warning>
                    Reset Everything
                  </ResetButton>
                </OptionContent>
              </OptionCard>
            </OptionsSection>

            <WarningText>
              ⚠️ Recovery actions cannot be undone!
            </WarningText>
          </>
        ) : (
          <LoadingSection>
            <LoadingText>{loadingMessage}</LoadingText>
            <ProgressBar />
          </LoadingSection>
        )}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
`;

const Header = styled.div`
  background-color: #003399;
  padding: 20px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const HeaderTitle = styled.span`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const InfoSection = styled.div`
  padding: 0 10px 10px 10px;
`;

const InfoText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 0;
  line-height: 1.5;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const OptionCard = styled.div`
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border: 1px solid #7f9db9;
  border-radius: 4px;
`;

const OptionIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

const OptionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: #003399;
`;

const OptionDescription = styled.p`
  margin: 0;
  font-size: 11px;
  color: #333;
  line-height: 1.4;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #d4d0c8;
  margin: 5px 0;
`;

const WarningText = styled.p`
  font-size: 11px;
  font-weight: bold;
  color: #666;
  margin: 10px 0 0 0;
  text-align: center;
`;

const ResetButton = styled.button`
  padding: 6px 16px;
  font-size: 11px;
  font-weight: bold;
  color: ${props => props.$warning ? 'red' : '#003399'};
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid ${props => props.$warning ? '#c00' : '#003c74'};
  border-radius: 3px;
  cursor: pointer;
  align-self: flex-start;
  margin-top: auto;

  &:hover {
    background: linear-gradient(180deg, #fff, #f5f4ef 50%, #e8e6dd);
  }

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

const LoadingSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const LoadingText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 0 0 15px 0;
`;

const ProgressBar = styled.progress`
  width: 200px;
  height: 20px;
`;

export default SystemRecovery;
