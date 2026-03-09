import React from 'react';
import { ASSET_PATH } from '../data/constants';

export default function ChatInput({ fontStyle, onSend, onNudge, onOpenPopup, inputRef }) {
  const textStyle = {
    fontWeight: fontStyle.bold ? 'bold' : 'normal',
    fontStyle: fontStyle.italic ? 'italic' : 'normal',
    textDecoration: fontStyle.underline ? 'underline' : 'none'
  };

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="chat-input-container">
      <div className="chat-actionbar">
        <button className="action-btn" onClick={(e) => onOpenPopup('font', e)}>
          <img src={`${ASSET_PATH}simple/letter.png`} alt="Font" />
        </button>
        <button className="action-btn" onClick={(e) => onOpenPopup('emoticon', e)}>
          <img src={`${ASSET_PATH}simple/happy.png`} alt="Emoticon" />
          <span className="arrow">&#9660;</span>
        </button>
        <button className="action-btn" onClick={(e) => onOpenPopup('wink', e)}>
          <img src={`${ASSET_PATH}simple/wink.png`} alt="Wink" />
          <span className="arrow">&#9660;</span>
        </button>
        <button className="action-btn" onClick={onNudge}>
          <img src={`${ASSET_PATH}simple/nudge.png`} alt="Nudge" />
        </button>
      </div>
      <div className="chat-area">
        <textarea
          ref={inputRef}
          placeholder="Type your message here..."
          style={textStyle}
          onKeyDown={handleKeyDown}
        />
        <div className="buttons">
          <button className="send-button" onClick={onSend}><u>S</u>end</button>
        </div>
      </div>
      <div className="chat-tabs">
        <button className="tab-btn">
          <img src={`${ASSET_PATH}tabs/paint.png`} alt="Paint" />
        </button>
        <button className="tab-btn active">
          <img src={`${ASSET_PATH}tabs/letter.png`} alt="Letter" />
        </button>
      </div>
    </div>
  );
}
