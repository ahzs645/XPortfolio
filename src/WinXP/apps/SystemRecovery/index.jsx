import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

function SystemRecovery({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset? This will clear all saved data and settings. This action cannot be undone!'
    );

    if (!confirmed) return;

    setIsLoading(true);

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
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Reset failed:', error);
      setIsLoading(false);
      alert('An error occurred during reset. Please try again.');
    }
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderIcon src="/icons/xp/Recovery.png" alt="Recovery" />
          <HeaderTitle>System Recovery</HeaderTitle>
        </HeaderContent>
      </Header>

      <Content>
        {!isLoading ? (
          <>
            <InfoSection>
              <InfoText>
                Use this utility to completely wipe all files, accounts and settings.
              </InfoText>
              <WarningText>
                Proceed with caution as this action cannot be undone!
              </WarningText>
            </InfoSection>

            <ButtonSection>
              <ResetButton onClick={handleReset}>
                Reset Now
              </ResetButton>
            </ButtonSection>
          </>
        ) : (
          <LoadingSection>
            <LoadingText>Please stand by...</LoadingText>
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
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InfoSection = styled.div`
  padding: 10px;
`;

const InfoText = styled.p`
  font-size: 12px;
  color: #000;
  margin: 0 0 10px 0;
  line-height: 1.5;
`;

const WarningText = styled.p`
  font-size: 12px;
  font-weight: bold;
  color: #000;
  margin: 0;
`;

const ButtonSection = styled.div`
  padding: 20px 10px;
`;

const ResetButton = styled.button`
  padding: 8px 20px;
  font-size: 12px;
  font-weight: bold;
  color: red;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, #fff, #f5f4ef 50%, #e8e6dd);
  }

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

const LoadingSection = styled.div`
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
