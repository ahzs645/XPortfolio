import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import GsapTourPlayer from './GsapTourPlayer';

// The two tour formats, mirroring the original Windows XP Tour chooser dialog.
// The animated tour now uses the native GSAP player (a web-native rebuild of the
// original Flash tour); the non-animated tour is the static HTML walkthrough.
const FORMATS = {
  animated: {
    label: 'Play the animated tour that features text, animation, music, and voice narration.',
    caption: 'Windows XP Tour - Animated',
  },
  html: {
    label: 'Play the non-animated tour that features text and images only.',
    src: '/apps/xp-tour/html-tour/default.htm',
    caption: 'Windows XP Tour - HTML',
  },
};

const TOUR_ICON = '/icons/xp/tray/xptour.png';

function XPTour({ onClose, onMaximize, isMaximized, onUpdateHeader }) {
  // 'chooser' shows the welcome dialog, 'tour' plays the selected tour fullscreen.
  const [view, setView] = useState('chooser');
  const [format, setFormat] = useState('animated');

  // Drive the window to/from its maximized (fullscreen) state. onMaximize is a
  // toggle, so guard on the current isMaximized to avoid flipping the wrong way.
  const setFullscreen = useCallback((shouldMaximize) => {
    if (shouldMaximize && !isMaximized) onMaximize();
    if (!shouldMaximize && isMaximized) onMaximize();
  }, [isMaximized, onMaximize]);

  const startTour = useCallback(() => {
    setView('tour');
    // The animated tour renders as a fullscreen overlay (GsapTourPlayer) that covers
    // the whole interface, so the window itself doesn't maximize. The HTML tour plays
    // inside the (maximized) window.
    if (format === 'html') setFullscreen(true);
    onUpdateHeader?.({
      icon: TOUR_ICON,
      title: FORMATS[format].caption,
      buttons: ['minimize', 'maximize', 'close'],
    });
  }, [format, setFullscreen, onUpdateHeader]);

  const backToChooser = useCallback(() => {
    setView('chooser');
    setFullscreen(false);
    onUpdateHeader?.({
      icon: TOUR_ICON,
      title: 'Windows XP Tour',
      buttons: ['minimize', 'maximize', 'close'],
    });
  }, [setFullscreen, onUpdateHeader]);

  // While the tour plays fullscreen, Escape returns to the chooser.
  useEffect(() => {
    if (view !== 'tour') return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') backToChooser();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, backToChooser]);

  if (view === 'tour') {
    if (format === 'animated') {
      return <GsapTourPlayer scene="A-tour.swf" autoplay onExit={backToChooser} />;
    }
    return (
      <TourFrame
        src={withBaseUrl(FORMATS.html.src)}
        title="Windows XP Tour"
        allow="autoplay; fullscreen"
      />
    );
  }

  return (
    <Dialog>
      <ContentArea>
        <LeftPane>
          <img src={withBaseUrl('/apps/xp-tour/side.png')} alt="Windows XP" draggable={false} />
        </LeftPane>
        <RightPane>
          <Title>Welcome to the Windows XP Tour!</Title>
          <Paragraph>The tour is available in two formats. Which format do you prefer?</Paragraph>
          <Form>
            {Object.entries(FORMATS).map(([key, { label }]) => (
              <Option key={key}>
                <label>
                  <input
                    type="radio"
                    name="tourFormat"
                    value={key}
                    checked={format === key}
                    onChange={() => setFormat(key)}
                  />
                  <span>{label}</span>
                </label>
              </Option>
            ))}
          </Form>
        </RightPane>
      </ContentArea>
      <Footer>
        <Button type="button" disabled>&lt; Back</Button>
        <Button type="button" className="default" onClick={startTour}>Next &gt;</Button>
        <Button type="button" onClick={onClose}>Cancel</Button>
      </Footer>
    </Dialog>
  );
}

const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: 'Tahoma', sans-serif;
  font-size: 13px;
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPane = styled.div`
  width: 164px;
  flex-shrink: 0;
  background-color: #4a608a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RightPane = styled.div`
  flex: 1;
  padding: 20px 25px;
  background: #fff;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-family: 'Tahoma', sans-serif;
  font-size: 18px;
  font-weight: normal;
  margin: 0 0 15px 0;
  color: #000;
`;

const Paragraph = styled.p`
  margin: 0 0 20px 0;
  line-height: 1.4;
  color: #000;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Option = styled.div`
  list-style: none;

  label {
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
  }

  label:hover {
    background: rgba(49, 106, 197, 0.08);
  }

  /* Authentic XP-style radio button. opacity override: a global XP stylesheet
     hides native radios (behind <winradio> overlays) with opacity:0. */
  input[type='radio'] {
    appearance: none;
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    margin: 1px 0 0 0;
    flex-shrink: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 40%, #fff, #e6eef5);
    border: 1px solid #7f9db9;
    box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.15);
    position: relative;
    cursor: pointer;
    opacity: 1 !important;
  }

  input[type='radio']:hover {
    border-color: #316ac5;
  }

  input[type='radio']:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 35%, #4a8f3c, #1c5a2e);
  }

  input[type='radio']:focus-visible {
    outline: 1px dotted #333;
    outline-offset: 2px;
  }

  span {
    margin-left: 8px;
    line-height: 1.4;
  }
`;

const Footer = styled.div`
  padding: 10px;
  border-top: 1px solid #ccc;
  text-align: right;
  flex-shrink: 0;
  background: #ece9d8;
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 14px;
  margin-left: 5px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:disabled {
    color: #a0a0a0;
    cursor: default;
    border-color: #a0a0a0;
  }

  &.default {
    border: 2px solid #003c74;
  }
`;

const TourFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

export default XPTour;
