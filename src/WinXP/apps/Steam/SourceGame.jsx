import React from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

const CONFIGURED_TF2_URL = import.meta.env.VITE_PLAYSRC_TF2_EMBED_URL?.trim();
const TF2_EMBED_URL = CONFIGURED_TF2_URL || withBaseUrl('/tf2/');

const GAME_DETAILS = {
  tf2: {
    eyebrow: 'TEAM FORTRESS 2 · PLAYSRC',
    title: 'Embedded runtime not connected',
    copy: 'The playsrc runtime and its required TF2 object set are hosted directly by XPortfolio from the pinned playsrc submodule cache.',
    status: 'Local playsrc runtime unavailable',
    link: 'https://github.com/ahzs645/playsrc',
    linkLabel: 'View your playsrc fork',
  },
  hl2: {
    eyebrow: 'HALF-LIFE 2 · SOURCE',
    title: 'Native Steam required',
    copy: 'Half-Life 2 is not a current playsrc browser target. It stays in the XP Steam library, but launching the actual game requires the official native Steam release.',
    status: 'No browser runtime is available',
    link: 'https://store.steampowered.com/app/220/HalfLife_2/',
    linkLabel: 'View the official Steam page',
  },
};

function SourceGame({ gameId = 'tf2' }) {
  const game = GAME_DETAILS[gameId] || GAME_DETAILS.tf2;

  if (gameId === 'tf2' && TF2_EMBED_URL) {
    return (
      <GameFrame
        src={TF2_EMBED_URL}
        title="Team Fortress 2 powered by playsrc"
        allowFullScreen
      />
    );
  }

  return (
    <StatusSurface>
      <StatusCard>
        <Eyebrow>{game.eyebrow}</Eyebrow>
        <h1>{game.title}</h1>
        <p>{game.copy}</p>
        <Status>
          <StatusDot />
          {game.status}
        </Status>
        <ExternalLink href={game.link} target="_blank" rel="noopener noreferrer">
          {game.linkLabel}
        </ExternalLink>
      </StatusCard>
    </StatusSurface>
  );
}

const GameFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #05080d;
`;

const StatusSurface = styled.div`
  box-sizing: border-box;
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  overflow: auto;
  padding: 36px;
  color: #d6d7d8;
  background:
    radial-gradient(circle at 72% 18%, rgba(102, 192, 244, 0.16), transparent 32%),
    linear-gradient(145deg, #121a25, #070b11 72%);
`;

const StatusCard = styled.section`
  box-sizing: border-box;
  width: min(620px, 100%);
  padding: 34px;
  border: 1px solid #26394d;
  background: rgba(17, 25, 36, 0.92);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);

  h1 {
    margin: 8px 0 14px;
    color: #fff;
    font-size: clamp(26px, 4vw, 42px);
    line-height: 1.02;
  }

  p {
    margin: 0;
    color: #aeb8c4;
    font-size: 15px;
    line-height: 1.65;
  }
`;

const Eyebrow = styled.div`
  color: #66c0f4;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 24px 0 20px;
  color: #d7e5ef;
  font-size: 13px;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #66c0f4;
  box-shadow: 0 0 14px rgba(102, 192, 244, 0.75);
`;

const ExternalLink = styled.a`
  display: inline-flex;
  color: #66c0f4;
  font-size: 13px;
  text-decoration: none;

  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export default SourceGame;
