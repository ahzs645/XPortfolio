import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function MSNMessenger() {
  const chatContainerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Create and inject Chatango script
    const container = chatContainerRef.current;
    if (container && !scriptRef.current) {
      const config = {
        handle: 'reborn-xp',
        arch: 'js',
        styles: {
          a: 'D7E4F5',
          b: 100,
          c: 'FFFFFF',
          d: 'FFFFFF',
          e: 'D7E4F5',
          f: 100,
          g: 'FFFFFF',
          h: 'FFFFFF',
          i: 100,
          j: 'FFFFFF',
          k: '70809C',
          l: 'D7E4F5',
          m: 'D7E4F5',
          p: '11',
          q: '9DB2CE',
          sbc: 'D7E4F5',
          surl: 0,
          showhdr: 0,
          cnrs: 0,
        },
      };

      const script = document.createElement('script');
      script.id = 'cid0020000418786072130';
      script.src = '//st.chatango.com/js/gz/emb.js';
      script.dataset.cfasync = 'false';
      script.async = true;
      script.style.width = '100%';
      script.style.height = '100%';
      script.text = JSON.stringify(config);

      // Observer to hide header if it appears
      const observer = new MutationObserver((mutations, obs) => {
        const header = container.querySelector('#HEAD');
        if (header) {
          header.style.display = 'none';
          obs.disconnect();
        }
      });

      observer.observe(container, { childList: true, subtree: true });

      container.appendChild(script);
      scriptRef.current = script;

      return () => {
        observer.disconnect();
        // Clean up script on unmount
        if (scriptRef.current && scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        }
        // Also clean up any iframe chatango might have created
        const iframe = container.querySelector('iframe');
          if (iframe) {
            iframe.remove();
          }
      };
    }
  }, []);

  return (
    <MSNContainer>
      <ToolbarStatic>
        <ToolbarMainButtons>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/invite.png')} alt="Invite" />
            <ButtonText><span>I</span>nvite</ButtonText>
          </StaticImageButton>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/send.png')} alt="Send Files" />
            <ButtonText>Send Fi<span>l</span>es</ButtonText>
          </StaticImageButton>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/video.png')} alt="Video" />
            <ButtonText>Vide<span>o</span></ButtonText>
          </StaticImageButton>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/voice.png')} alt="Voice" />
            <ButtonText>Voi<span>c</span>e</ButtonText>
          </StaticImageButton>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/activities.png')} alt="Activities" />
            <ButtonText>Acti<span>v</span>ities</ButtonText>
          </StaticImageButton>
          <StaticImageButton>
            <img src={withBaseUrl('/apps/msn-messenger/toolbar/games.png')} alt="Games" />
            <ButtonText><span>G</span>ames</ButtonText>
          </StaticImageButton>
        </ToolbarMainButtons>
        <ToolbarLogoArea>
          <LogoLeft />
          <LogoCenter />
          <LogoRight />
          <LogoEnd />
        </ToolbarLogoArea>
      </ToolbarStatic>

      <ChatangoWrapper ref={chatContainerRef} />
    </MSNContainer>
  );
}

const MSNContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #D7E4F5 url(${withBaseUrl('/apps/msn-messenger/ui/main-background.png')}) bottom right no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ToolbarStatic = styled.div`
  height: 60px;
  width: 100%;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 310px 1fr;
  position: relative;
`;

const ToolbarMainButtons = styled.div`
  display: grid;
  grid-template-columns: 40px 56px 44px 40px 54px 44px;
  justify-content: flex-end;
  align-items: center;
  background: url(${withBaseUrl('/apps/msn-messenger/ui/toolbar-background.png')}) repeat;
  background-size: contain;
`;

const StaticImageButton = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: default;

  img {
    max-width: 24px;
    max-height: 24px;
  }
`;

const ButtonText = styled.div`
  font-family: Verdana, sans-serif;
  font-size: 10.5px;
  letter-spacing: -0.25px;
  color: #434C4B;

  span {
    text-decoration: underline;
  }
`;

const ToolbarLogoArea = styled.div`
  display: grid;
  grid-template-columns: 50px 50px 37px 1fr;
  height: 100%;
`;

const LogoLeft = styled.div`
  background: url(${withBaseUrl('/apps/msn-messenger/ui/small-toolbar-left-background.png')}) no-repeat;
`;

const LogoCenter = styled.div`
  background: url(${withBaseUrl('/apps/msn-messenger/ui/msn-logo.png')}) top left 4px,
              url(${withBaseUrl('/apps/msn-messenger/ui/small-toolbar-center-background.png')});
  background-repeat: no-repeat, repeat-x;
`;

const LogoRight = styled.div`
  background: url(${withBaseUrl('/apps/msn-messenger/ui/small-toolbar-right-background.png')}) no-repeat;
`;

const LogoEnd = styled.div`
  background: url(${withBaseUrl('/apps/msn-messenger/ui/small-toolbar-end-background.png')}) repeat-x;
`;

const ChatangoWrapper = styled.div`
  flex-grow: 1;
  min-height: 0;
  padding: 0 12px 12px 12px;

  iframe {
    width: 100% !important;
    height: 100% !important;
    border: none;
  }
`;

export default MSNMessenger;
