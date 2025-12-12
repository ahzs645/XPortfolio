import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { POWER_STATE } from '../constants';
import { withBaseUrl } from '../../utils/baseUrl';

function Modal({ onClose, onRestart, onLogOff, onShutDown, onShutDownWithoutUpdates, mode, hasUpdates = false }) {
  const isLogOff = mode === POWER_STATE.LOG_OFF;
  const isTurnOff = mode === POWER_STATE.TURN_OFF;

  return ReactDOM.createPortal(
    <Overlay>
      <DialogContainer $hasUpdates={hasUpdates && isTurnOff}>
        <DialogBody>
          <DialogHeader>
            <DialogHeaderText>
              {isLogOff ? 'Log Off Windows' : 'Turn off computer'}
            </DialogHeaderText>
            <DialogHeaderIcon
              src={withBaseUrl('/assets/gui/boot/favicon.png')}
              alt=""
            />
          </DialogHeader>
          <DialogButtonContainer>
            {isLogOff ? (
              <>
                <DialogButton onClick={onRestart} role="button" tabIndex={0}>
                  <img src={withBaseUrl('/assets/gui/start-menu/restart.webp')} alt="" />
                  <span>Restart</span>
                </DialogButton>
                <DialogButton onClick={onLogOff} role="button" tabIndex={0}>
                  <img src={withBaseUrl('/assets/gui/start-menu/logoff.webp')} alt="" />
                  <span>Log Off</span>
                </DialogButton>
              </>
            ) : (
              <>
                <DialogButton onClick={() => {}} role="button" tabIndex={0} $disabled>
                  <HibernateIcon>
                    <img src={withBaseUrl('/assets/gui/start-menu/standby.webp')} alt="" />
                  </HibernateIcon>
                  <span>Hibernate</span>
                </DialogButton>
                <DialogButton onClick={hasUpdates ? onShutDown : onShutDown} role="button" tabIndex={0} $hasUpdateOverlay={hasUpdates}>
                  <ButtonIconWrapper>
                    <img src={withBaseUrl('/assets/gui/start-menu/shutdown.webp')} alt="" />
                    {hasUpdates && <UpdateShieldOverlay src={withBaseUrl('/icons/security-center.png')} alt="" />}
                  </ButtonIconWrapper>
                  <span>Turn Off</span>
                </DialogButton>
                <DialogButton onClick={onRestart} role="button" tabIndex={0}>
                  <img src={withBaseUrl('/assets/gui/start-menu/restart.webp')} alt="" />
                  <span>Restart</span>
                </DialogButton>
              </>
            )}
          </DialogButtonContainer>
          {hasUpdates && isTurnOff && (
            <UpdateNotice>
              <UpdateNoticeIcon src={withBaseUrl('/icons/security-center.png')} alt="" />
              <UpdateNoticeText>
                Click Turn Off to install important updates and turn off your computer.{' '}
                <UpdateNoticeLink onClick={onShutDownWithoutUpdates}>
                  Click here to turn off without installing updates.
                </UpdateNoticeLink>
              </UpdateNoticeText>
            </UpdateNotice>
          )}
          <DialogFooter>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
          </DialogFooter>
        </DialogBody>
      </DialogContainer>
    </Overlay>,
    document.body
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  background: transparent;
`;

const DialogContainer = styled.div`
  background-color: #ece9d8;
  border: 1px solid #2b2b2b;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: #000;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  padding: 0;
  position: relative;
  width: ${({ $hasUpdates }) => ($hasUpdates ? '400px' : '350px')};
  z-index: 2;
`;

const DialogBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #002a8c, #0039a9 50%, #002a8c);
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 500;
  height: 50px;
  padding: 4px 4px 4px 16px;
  position: relative;
  letter-spacing: 0.1px;
  box-sizing: border-box;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 25%,
      #bad7f8 45%,
      #bad7f8 55%,
      transparent 75%
    );
    pointer-events: none;
  }
`;

const DialogHeaderText = styled.span`
  flex-grow: 1;
`;

const DialogHeaderIcon = styled.img`
  width: 36px;
  height: 36px;
  margin-right: 10px;
`;

const DialogButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background: linear-gradient(90deg, #587cdb, #688ceb 50%, #587cdb);
  padding: 36px 0;
  margin: 0;
  flex-grow: 1;
  width: auto;
`;

const ButtonIconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
`;

const HibernateIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
  background: linear-gradient(180deg, #f5d96b 0%, #e8a815 50%, #d4940a 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 0 rgba(0, 0, 0, 0.2),
    1px 1px 2px rgba(0, 0, 0, 0.3);

  img {
    width: 28px !important;
    height: 28px !important;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
  }
`;

const UpdateShieldOverlay = styled.img`
  position: absolute;
  top: -15px;
  left: 19px;
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
`;

const DialogButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none !important;
  border: none !important;
  color: #fff;
  text-align: center;
  width: 80px;
  cursor: pointer;
  opacity: ${({ $disabled }) => ($disabled ? '0.6' : '1')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover img {
    filter: brightness(1.06) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
  }

  img {
    background: none !important;
    border: none !important;
    width: 40px;
    height: 40px;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.4));
    transition: filter 0.15s ease-in-out;
  }

  ${ButtonIconWrapper} img {
    margin-bottom: 0;
  }

  span {
    color: #fff;
    font-family: Tahoma, Arial, sans-serif;
    font-size: 13.5px;
    line-height: 1.2;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
  }
`;

const UpdateNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(90deg, #002a8c, #0039a9 50%, #002a8c);
`;

const UpdateNoticeIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const UpdateNoticeText = styled.div`
  font-size: 11px;
  line-height: 1.4;
  color: #fff;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
`;

const UpdateNoticeLink = styled.a`
  color: #b8d4ff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`;

const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: linear-gradient(90deg, #002a8c, #0039a9 50%, #002a8c);
  height: 50px;
  padding: 0 15px;
  position: relative;
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: 1.5px solid transparent;
  border-top: 1.5px solid #fff;
  border-left: 1.5px solid #fff;
  border-right: 1.5px solid #6d6d6d;
  border-bottom: 1.5px solid #6d6d6d;
  border-radius: 3px;
  box-shadow: 1px 1px 0 #6d6d6d;
  color: #222;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  padding: 2px 12px;
  cursor: pointer;
  user-select: none;
  transition: box-shadow 0.13s, border 0.13s, background 0.13s;

  &:hover {
    background: #fff;
    border-top-color: #fff;
    border-left-color: #fff;
    border-right-color: #b0b0b0;
    border-bottom-color: #b0b0b0;
    box-shadow: 1px 1px 0 #b0b0b0;
  }

  &:active {
    background: #d4d0c8;
    border-top-color: #6d6d6d;
    border-left-color: #6d6d6d;
    border-right-color: #fff;
    border-bottom-color: #fff;
    box-shadow: inset 1px 1px 0 #6d6d6d;
  }
`;

export default Modal;
