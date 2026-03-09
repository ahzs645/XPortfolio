import React, { useState } from 'react';
import { ASSET_PATH } from '../data/constants';

function ToolbarButton({ image, text, bind }) {
  const parts = bind ? text.split(bind) : [text];
  const label = bind
    ? <>{parts[0]}<u>{bind}</u>{parts.slice(1).join(bind)}</>
    : text;

  return (
    <button className="toolbar-btn">
      <img src={`${ASSET_PATH}toolbar/${image}.png`} alt={text} />
      <div className="text">{label}</div>
    </button>
  );
}

export default function Toolbar({ onToggleMute }) {
  const [blocked, setBlocked] = useState(false);

  function handleBlock() {
    const newState = !blocked;
    setBlocked(newState);
    onToggleMute(newState);
  }

  return (
    <div className="toolbar-wrapper">
      <div className="toolbar-main">
        <button className="circle-btn up-down">
          <img src={`${ASSET_PATH}toolbar/small-up-down.png`} alt="up-down" />
        </button>
        <ToolbarButton image="invite" text="Invite" bind="I" />
        <ToolbarButton image="send" text="Send Files" bind="l" />
        <ToolbarButton image="video" text="Video" bind="o" />
        <ToolbarButton image="voice" text="Voice" bind="c" />
        <ToolbarButton image="activities" text="Activities" bind="v" />
        <ToolbarButton image="games" text="Games" bind="G" />
      </div>
      <div className="toolbar-small">
        <div className="left" />
        <div className="center">
          <div className="buttons">
            <button className="circle-btn" onClick={handleBlock}>
              <img src={`${ASSET_PATH}toolbar/small-${blocked ? 'block' : 'unblock'}.png`} alt="block" />
            </button>
            <button className="circle-btn">
              <img src={`${ASSET_PATH}toolbar/small-paint.png`} alt="paint" />
            </button>
          </div>
        </div>
        <div className="right" />
        <div className="end" />
      </div>
    </div>
  );
}
