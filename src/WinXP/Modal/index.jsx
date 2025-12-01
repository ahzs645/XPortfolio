import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { POWER_STATE } from '../constants';

function Modal({ onClose, onClickButton, mode }) {
  const isLogOff = mode === POWER_STATE.LOG_OFF;

  return ReactDOM.createPortal(
    <Overlay>
      <Container>
        <Header>{isLogOff ? 'Log Off Windows' : 'Turn off computer'}</Header>
        <Content>
          <Text>
            {isLogOff
              ? 'Are you sure you want to log off?'
              : 'What do you want the computer to do?'}
          </Text>
          <Buttons>
            {isLogOff ? (
              <>
                <Button onClick={onClickButton}>Log Off</Button>
                <Button onClick={onClose}>Cancel</Button>
              </>
            ) : (
              <>
                <PowerButton $color="red" onClick={onClickButton}>
                  <div className="icon stand-by" />
                  <span>Stand By</span>
                </PowerButton>
                <PowerButton $color="green" onClick={onClickButton}>
                  <div className="icon turn-off" />
                  <span>Turn Off</span>
                </PowerButton>
                <PowerButton $color="yellow" onClick={onClickButton}>
                  <div className="icon restart" />
                  <span>Restart</span>
                </PowerButton>
              </>
            )}
          </Buttons>
          {!isLogOff && (
            <CancelButton onClick={onClose}>Cancel</CancelButton>
          )}
        </Content>
      </Container>
    </Overlay>,
    document.body
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

const Container = styled.div`
  background: linear-gradient(to bottom, #3168d5 0%, #4078d8 100%);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  min-width: 400px;
  overflow: hidden;
`;

const Header = styled.div`
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const Content = styled.div`
  background: #ece9d8;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Text = styled.p`
  margin-bottom: 20px;
  color: #333;
`;

const Buttons = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const Button = styled.button`
  padding: 8px 25px;
  border: 1px solid #003c74;
  border-radius: 3px;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 100%);
  cursor: pointer;

  &:hover {
    background: linear-gradient(to bottom, #e3e3e3 0%, #fff 100%);
  }
`;

const PowerButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: 5px;
    background: ${({ $color }) =>
      $color === 'red'
        ? 'linear-gradient(to bottom, #ff6b6b 0%, #c0392b 100%)'
        : $color === 'green'
        ? 'linear-gradient(to bottom, #27ae60 0%, #1e8449 100%)'
        : 'linear-gradient(to bottom, #f1c40f 0%, #f39c12 100%)'};
  }

  span {
    font-size: 12px;
    color: #333;
  }
`;

const CancelButton = styled.button`
  padding: 5px 15px;
  border: 1px solid #666;
  border-radius: 3px;
  background: #f5f5f5;
  cursor: pointer;

  &:hover {
    background: #e5e5e5;
  }
`;

export default Modal;
