import styled, { css, keyframes } from 'styled-components';
import { withBaseUrl } from '../utils/baseUrl';
import { getColorDepthFilter } from '../utils/colorDepthEffects';
import { getDisplayViewport, toDisplayLayerPoint } from '../utils/displayCoordinates';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
`;

const BalloonFrame = styled.div`
  position: relative;
  width: ${({ $width = 240 }) => `${$width}px`};
  background: #fffee8;
  border: 1px solid #000;
  border-radius: ${({ $radius = 6 }) => `${$radius}px`};
  padding: 10px;
  box-shadow: none;
  filter: drop-shadow(3px 3px 2px #00000099);
  ${({ $displayColorDepth }) => {
    const depthFilter = getColorDepthFilter($displayColorDepth);
    if (!depthFilter) {
      return '';
    }

    return css`
      filter: ${depthFilter} drop-shadow(3px 3px 2px #00000099);
    `;
  }}
  font-size: 11px;
  animation: ${({ $animate, $isClosing }) =>
    $animate
      ? css`${$isClosing ? fadeOut : fadeIn} 0.2s ease-out forwards`
      : 'none'};

  &::after {
    content: '';
    position: absolute;
    bottom: -17px;
    right: ${({ $arrowOffset = 15 }) => `${$arrowOffset}px`};
    border-width: 0 17px 18px 0;
    border-style: solid;
    border-color: transparent #fffee8 transparent transparent;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -18px;
    right: ${({ $arrowOffset = 15 }) => `${$arrowOffset - 1}px`};
    border-width: 0 17px 18px 0;
    border-style: solid;
    border-color: transparent #000 transparent transparent;
    transform: translateX(1px);
  }

  .balloon__close {
    all: unset;
    position: absolute;
    top: 5px;
    right: 5px;
    width: 16px;
    height: 16px;
    background: #fffff7;
    border: 1px solid #d0c9b6;
    border-radius: 3px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    img {
      width: 16px;
      height: 16px;
      filter: invert(70%) sepia(100%);
      user-drag: none;
      -webkit-user-drag: none;
    }

    &:hover {
      border: 1px solid #fff;
      box-shadow:
        1px 1px 1px #b8b8a2,
        -1px -1px 0px #b8b8a266,
        inset -1px -1px 1px #b6700788,
        inset 1px 1px 0 #ffad31;
      background: radial-gradient(at 10% 10%, #ffffff66 0%, #ffffff00 33%),
        radial-gradient(at 80% 80%, #ffdc18 0%, #ffdc1800 40%),
        linear-gradient(#ffad31, #ffad31);

      img {
        filter: invert(0%) sepia(0%);
      }
    }

    &:active {
      border: 1px solid #fff;
      box-shadow:
        1px 1px 1px #b8b8a2,
        -1px -1px 0px #b8b8a266,
        inset -1px -1px 1px #653c00;
      background: radial-gradient(at 0% 0%, #8c5200 0%, #8c520000 33%),
        radial-gradient(at 80% 80%, #eea600 0%, #eea60000 50%),
        linear-gradient(#cc7900, #cc7900);

      img {
        filter: invert(25%) sepia(50%) saturate(1000%) hue-rotate(10deg);
      }
    }
  }

  .balloon__header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-right: 20px;

    img {
      width: ${({ $iconSize = 16 }) => `${$iconSize}px`};
      height: ${({ $iconSize = 16 }) => `${$iconSize}px`};
      margin-right: 8px;
      flex-shrink: 0;
    }

    span {
      font-weight: 900;
      color: #000;
    }
  }

  .balloon__text {
    margin: 0 0 8px 0;
    color: #000;
    line-height: 1.4;
  }

  .balloon__version {
    margin: 0 0 10px 0;
    color: #666;
    font-family: 'Lucida Console', Monaco, monospace;
    font-size: 10px;
  }

  .balloon__links {
    margin: 0;
    color: #000;

    a {
      color: blue;
      text-decoration: underline;
      cursor: pointer;

      &:hover {
        color: red;
      }
    }
  }

  .balloon__actions {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .balloon__btn {
    min-width: 70px;
    height: 23px;
    padding: 0 10px;
    font-family: Tahoma, 'Noto Sans', sans-serif;
    font-size: 11px;
    border: 1px solid #7f9db9;
    border-radius: 3px;
    background: linear-gradient(to bottom, #ffffff 0%, #d6dff7 100%);
    box-shadow:
      inset 1px 1px 0 #fff,
      inset -1px -1px 0 #c3cad9;
    cursor: pointer;

    &:hover {
      background: linear-gradient(to bottom, #f5f7ff 0%, #cdd8f5 100%);
    }

    &:active {
      background: linear-gradient(to bottom, #c0cdf0 0%, #dbe3f9 100%);
      box-shadow:
        inset 1px 1px 0 #9aa9c2,
        inset -1px -1px 0 #f5f7ff;
    }
  }
`;

export default function Balloon({
  title,
  icon,
  iconAlt,
  children,
  onClose,
  width,
  iconSize,
  arrowOffset,
  radius,
  anchor,
  offset,
  placement = 'top',
  style,
  isClosing = false,
  animate = false,
  className,
  displayColorDepth,
  ...rest
}) {
  let computedArrowOffset = arrowOffset;
  let anchorStyle = null;

  if (anchor) {
    const normalizedAnchor = toDisplayLayerPoint(anchor);
    const bubbleWidth = width || 240;
    const padding = 8;
    const centerX = (normalizedAnchor.x ?? 0) + (normalizedAnchor.width ? normalizedAnchor.width / 2 : 0) + (offset?.x || 0);
    const arrowHeight = 18; // visual height of the tail
    const top = (normalizedAnchor.y ?? 0) + (offset?.y || 0) - arrowHeight;
    const viewportWidth = typeof window !== 'undefined' ? getDisplayViewport().width : bubbleWidth;
    const unclampedLeft = centerX - bubbleWidth / 2;
    const clampedLeft = Math.max(padding, Math.min(unclampedLeft, viewportWidth - bubbleWidth - padding));
    const arrowFromLeft = Math.max(12, Math.min(bubbleWidth - 12, centerX - clampedLeft));
    computedArrowOffset = bubbleWidth - arrowFromLeft;

    anchorStyle = {
      position: 'fixed',
      left: clampedLeft,
      top,
      transform: placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
      pointerEvents: 'auto',
      maxWidth: `calc(100vw - ${padding * 2}px)`,
    };
  }

  const frame = (
    <BalloonFrame
      className={className}
      $displayColorDepth={displayColorDepth}
      $width={width}
      $iconSize={iconSize}
      $arrowOffset={computedArrowOffset}
      $radius={radius}
      $isClosing={isClosing}
      $animate={animate}
      {...rest}
      style={style}
    >
      {onClose && (
        <button
          className="balloon__close"
          aria-label="Close"
          onClick={onClose}
        >
          <img src={withBaseUrl('/apps/openlair-viewer/static/images/interface/balloon/close.png')} alt="" />
        </button>
      )}
      {(icon || title) && (
        <div className="balloon__header">
          {icon && <img src={withBaseUrl(icon)} alt={iconAlt || title || 'balloon icon'} />}
          {title && <span>{title}</span>}
        </div>
      )}
      {children}
    </BalloonFrame>
  );

  return anchorStyle ? <div style={anchorStyle}>{frame}</div> : frame;
}
