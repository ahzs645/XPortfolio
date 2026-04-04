import styled, { keyframes } from 'styled-components';
import { POWER_STATE } from '../constants';
import {
  getColorDepthFilter,
  getColorDitherOpacity,
} from '../../utils/colorDepthEffects';

const powerOffAnimation = keyframes`
  0% {
    filter: brightness(1) grayscale(0);
  }
  30% {
    filter: brightness(1) grayscale(0);
  }
  100% {
    filter: brightness(0.6) grayscale(1);
  }
`;

const animation = {
  [POWER_STATE.START]: 'none',
  [POWER_STATE.TURN_OFF]: powerOffAnimation,
  [POWER_STATE.LOG_OFF]: powerOffAnimation,
};

export const Container = styled.div`
  font-family: Tahoma, 'Noto Sans', sans-serif;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: url('${({ $wallpaper }) => $wallpaper || '/bliss.jpg'}') no-repeat center center fixed;
  background-size: cover;
  filter: ${({ $crtEnabled, $colorDepth }) => {
    const crt = $crtEnabled
      ? 'brightness(1.06) contrast(1.08) saturate(1.12)'
      : 'brightness(1.01) contrast(1.015) saturate(1.02)';
    const depthFilter = getColorDepthFilter($colorDepth);
    return depthFilter ? `${crt} ${depthFilter}` : crt;
  }};
  transition: filter 0.3s ease;

  *:not(input):not(textarea) {
    user-select: none;
  }
  -webkit-touch-callout: none;
`;

export const PowerScene = styled.div`
  position: relative;
  height: 100%;
  animation: ${({ $powerState }) => animation[$powerState]} 5s forwards;
`;

export const ColorDitherOverlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
  mix-blend-mode: overlay;
  opacity: ${({ $mode }) => getColorDitherOpacity($mode)};
  background-image:
    linear-gradient(45deg, rgba(0, 0, 0, 0.32) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 0.2)),
    linear-gradient(45deg, rgba(255, 255, 255, 0.18) 25%, transparent 25%, transparent 75%, rgba(0, 0, 0, 0.28) 75%, rgba(0, 0, 0, 0.28));
  background-position: 0 0, 1px 1px;
  background-size: 2px 2px;
`;

export const OffScreen = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  cursor: pointer;
  z-index: 99999;
`;
