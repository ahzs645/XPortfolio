import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import useSystemSounds from '../../../hooks/useSystemSounds';
import { getXpPortalRoot } from '../../../utils/portalRoot';

const BSOD_SCREEN_MS = 4000;

function BlueScreenOfDeath() {
  const { playError } = useSystemSounds();

  useEffect(() => {
    playError();

    const restartTimer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('xp:restart-request', {
        detail: { source: 'blue-screen-of-death' },
      }));
    }, BSOD_SCREEN_MS);

    return () => {
      window.clearTimeout(restartTimer);
    };
  }, [playError]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <Overlay>
      <BlueScreenContent>
        <div>
          A problem has been detected and Windows has been shut down to prevent damage
          <br />
          to your computer.
          <br />
          <br />
          UNMOUNTABLE_BOOT_VOLUME
          <br />
          <br />
          <DesktopOnly>
            If this is the first time you&apos;ve seen this Stop error screen,
            <br />
            restart your computer. If this screen appears again, follow
            <br />
            these steps:
            <br />
            <br />
            Check to make sure any new hardware or software is properly installed.
            <br />
            If this is a new installation, ask your hardware or software manufacturer
            <br />
            for any Windows updates you might need.
            <br />
            <br />
            If problems continue, disable or remove any newly installed hardware
            <br />
            or software. Disable BIOS memory options such as caching or shadowing.
            <br />
            If you need to use Safe Mode to remove or disable components, restart
            <br />
            your computer, press F8 to select Advanced Startup Options, and then
            <br />
            select Safe Mode.
          </DesktopOnly>
          <br />
          Technical Information
          <br />
          <br />
          *** STOP: 0X00000ED (0X80F128D0, 0X000009C, 0X00000000, 0X00000000)
        </div>
      </BlueScreenContent>
    </Overlay>,
    getXpPortalRoot()
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999999;
  cursor: none;
  background: #0000aa;
  color: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  font-family: 'Lucida Console', Monaco, monospace;
`;

const BlueScreenContent = styled.div`
  padding: 28px 24px 24px 18px;
  font-size: 24px;
  line-height: 1.18;
  letter-spacing: 0;
  text-align: left;

  @media (max-width: 1400px) {
    font-size: 20px;
  }

  @media (max-width: 800px) {
    padding: 24px 20px 20px 14px;
    font-size: 15px;
    line-height: 1.14;
  }

  @media (max-width: 600px) {
    padding: 18px 16px 16px 12px;
    font-size: 12px;
    line-height: 1.08;
  }
`;

const DesktopOnly = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`;

export default BlueScreenOfDeath;
