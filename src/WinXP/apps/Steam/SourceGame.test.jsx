// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SourceGame from './SourceGame';

afterEach(cleanup);

describe('SourceGame', () => {
  it('embeds the explicit playsrc index document', () => {
    render(<SourceGame gameId="tf2" />);

    expect(screen.getByTitle('Team Fortress 2 powered by playsrc').getAttribute('src'))
      .toBe('/tf2/index.html');
  });

  it('keeps unsupported Source games on the explanatory surface', () => {
    render(<SourceGame gameId="hl2" />);

    expect(screen.getByRole('heading', { name: 'Native Steam required' })).toBeTruthy();
    expect(screen.queryByTitle('Team Fortress 2 powered by playsrc')).toBeNull();
  });
});
