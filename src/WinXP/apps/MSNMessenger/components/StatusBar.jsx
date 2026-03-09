import React from 'react';

export default function StatusBar({ lastMessageTime }) {
  return (
    <div className="statusbar">
      <div className="text">
        Last message sent at: <span>{lastMessageTime || 'Never'}</span>
      </div>
    </div>
  );
}
