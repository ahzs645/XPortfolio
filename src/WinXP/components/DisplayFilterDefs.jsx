import React from 'react';
import styled from 'styled-components';
import {
  FOUR_LEVEL_TABLE,
  EIGHT_LEVEL_TABLE,
  THIRTY_TWO_LEVEL_TABLE,
  SIXTY_FOUR_LEVEL_TABLE,
} from '../../utils/colorDepthEffects';

export default function DisplayFilterDefs() {
  return (
    <HiddenFilterSvg aria-hidden="true" focusable="false">
      <defs>
        <filter id="xp-color-2" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              0.299 0.587 0.114 0 0
              0.299 0.587 0.114 0 0
              0.299 0.587 0.114 0 0
              0 0 0 1 0
            "
          />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
        </filter>

        <filter id="xp-color-8" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
          </feComponentTransfer>
        </filter>

        <filter id="xp-color-16" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={FOUR_LEVEL_TABLE} />
            <feFuncG type="discrete" tableValues={FOUR_LEVEL_TABLE} />
            <feFuncB type="discrete" tableValues={FOUR_LEVEL_TABLE} />
          </feComponentTransfer>
        </filter>

        <filter id="xp-color-256" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={EIGHT_LEVEL_TABLE} />
            <feFuncG type="discrete" tableValues={EIGHT_LEVEL_TABLE} />
            <feFuncB type="discrete" tableValues={EIGHT_LEVEL_TABLE} />
          </feComponentTransfer>
        </filter>

        <filter id="xp-color-16bit" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={THIRTY_TWO_LEVEL_TABLE} />
            <feFuncG type="discrete" tableValues={SIXTY_FOUR_LEVEL_TABLE} />
            <feFuncB type="discrete" tableValues={THIRTY_TWO_LEVEL_TABLE} />
          </feComponentTransfer>
        </filter>
      </defs>
    </HiddenFilterSvg>
  );
}

const HiddenFilterSvg = styled.svg`
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
`;
