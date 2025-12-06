import React from 'react';
import styled from 'styled-components';

/**
 * Divider - A reusable gradient divider component
 *
 * @param {string} direction - 'left' | 'right' - Direction the gradient fades to (default: 'right')
 * @param {string} color - The solid color of the gradient (default: '#215DC6')
 * @param {number} solidPercent - Percentage of the line that stays solid (default: 40)
 * @param {string} margin - CSS margin value (default: '16px 0 12px 0')
 * @param {string} height - Height of the divider (default: '1px')
 */
function Divider({
  direction = 'right',
  color = '#215DC6',
  solidPercent = 40,
  margin,
  height = '1px',
  className,
  style,
}) {
  return (
    <StyledDivider
      $direction={direction}
      $color={color}
      $solidPercent={solidPercent}
      $margin={margin}
      $height={height}
      className={className}
      style={style}
    />
  );
}

const StyledDivider = styled.div`
  height: ${({ $height }) => $height};
  margin: ${({ $margin }) => $margin || '16px 0 12px 0'};
  background: ${({ $direction, $color, $solidPercent }) =>
    $direction === 'left'
      ? `linear-gradient(to left, ${$color} 0%, ${$color} ${$solidPercent}%, transparent 100%)`
      : `linear-gradient(to right, ${$color} 0%, ${$color} ${$solidPercent}%, transparent 100%)`
  };
`;

export default Divider;
