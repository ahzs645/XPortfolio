import React from 'react';
import { ASSET_PATH, WINKS } from '../data/constants';
import { emoticonMap } from '../data/emoticons';

export default function PopupPicker({ type, position, fontStyle, onToggleFont, onInsertEmoticon, onSendWink, onClose }) {
  if (!type) return null;

  return (
    <div
      className="popup-overlay"
      style={{ left: position.x, top: position.y }}
      onClick={e => e.stopPropagation()}
    >
      {type === 'font' && (
        <>
          <button
            className={`font-style-btn ${fontStyle.bold ? 'active' : ''}`}
            style={{ fontWeight: 'bold' }}
            onClick={() => onToggleFont('bold')}
          >B</button>
          <button
            className={`font-style-btn ${fontStyle.italic ? 'active' : ''}`}
            style={{ fontStyle: 'italic' }}
            onClick={() => onToggleFont('italic')}
          >I</button>
          <button
            className={`font-style-btn ${fontStyle.underline ? 'active' : ''}`}
            style={{ textDecoration: 'underline' }}
            onClick={() => onToggleFont('underline')}
          >U</button>
        </>
      )}

      {type === 'emoticon' && (
        <div className="emoticon-picker">
          {Object.entries(emoticonMap).map(([shortcut, data]) => (
            <img
              key={shortcut}
              src={`${ASSET_PATH}emoticons/${data.file}`}
              title={shortcut}
              alt={shortcut}
              onClick={() => { onInsertEmoticon(shortcut); onClose(); }}
            />
          ))}
        </div>
      )}

      {type === 'wink' && (
        <div className="emoticon-picker">
          {Object.entries(WINKS).map(([name, file]) => (
            <img
              key={name}
              src={`${ASSET_PATH}winks/${file}`}
              alt={name}
              onClick={() => { onSendWink(`${ASSET_PATH}winks/${file}`); onClose(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
