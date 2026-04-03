import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';
import { withBaseUrl } from '../../../utils/baseUrl';

function AboutWindows({ onClose, onMinimize }) {
  const { getUsername } = useConfig();

  const memoryKB = useMemo(() => {
    if (navigator.deviceMemory) {
      return (navigator.deviceMemory * 1024 * 1024).toLocaleString();
    }
    return '2,096,624';
  }, []);

  return (
    <ProgramLayout
      menus={[]}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={false}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <Container>
        <Header>
          <Logo src={withBaseUrl('/gui/about-logo.png')} alt="" />
        </Header>
        <ColorBar />
        <TextContent>
          <AppName>Microsoft Windows XP</AppName><br />
          Version 5.1 (Build 2600.xpsp_sp2_gdr: Service Pack 2)<br />
          Copyright &copy; 1985 - 2001 Microsoft Corporation.<br />
          <br />
          <br />
          This product is licensed under the terms of the{' '}
          <EulaLink>End-User<br />License Agreement</EulaLink> to:<br /><br />
          <Username>{getUsername()}</Username><br />
          XPortfolio<br />
          <Divider />
          Physical memory available to Windows: {memoryKB} KB
        </TextContent>
        <OkButton onClick={onClose}>OK</OkButton>
      </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  font-size: 11px;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
  height: 72px;
  background: radial-gradient(circle at 69% 33%, #a3bff9 0, #85a5f0 28%, #81a1ee 33%, #6084e4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Logo = styled.img`
  width: 200px;
  height: 40px;
  object-fit: contain;
`;

const ColorBar = styled.div`
  width: 100%;
  height: 5px;
  background: linear-gradient(to right, #627cd7, #f79525, #698ae7);
  flex-shrink: 0;
`;

const TextContent = styled.div`
  margin: 15px 10px 0 52px;
  line-height: 1.4;
  color: #000;
`;

const AppName = styled.span`
  font-weight: bold;
`;

const EulaLink = styled.a`
  color: navy;
  text-decoration: underline;
  cursor: pointer;
`;

const Username = styled.span`
  font-weight: bold;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #fff;
  margin: 8px 0;
`;

const OkButton = styled.button`
  position: absolute;
  bottom: 11px;
  right: 9px;
  min-width: 72px;
  padding: 4px 16px;
  font-size: 11px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px #fff;

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -3px;
  }
`;

export default AboutWindows;
