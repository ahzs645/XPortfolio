import React, { useRef, useEffect } from 'react';
import { parseEmoticons } from '../data/emoticons';

function Message({ message }) {
  if (message.type === 'system') {
    return <div className="system-message">{message.content}</div>;
  }

  const senderClass = message.sender === 'local' ? 'local' : 'remote';

  let contentHTML = '';
  if (message.type === 'text') {
    let text = message.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    text = parseEmoticons(text);

    const styles = [];
    if (message.style?.bold) styles.push('font-weight:bold');
    if (message.style?.italic) styles.push('font-style:italic');
    if (message.style?.underline) styles.push('text-decoration:underline');
    const styleAttr = styles.length ? ` style="${styles.join(';')}"` : '';
    contentHTML = `<span${styleAttr}>${text}</span>`;
  } else if (message.type === 'wink') {
    contentHTML = `<img src="${message.content}" width="128px" style="border-radius: 8px" alt="Wink">`;
  }

  return (
    <div className={`message ${senderClass}`}>
      <div className="message-header">{message.senderName} says:</div>
      <div className="message-content" dangerouslySetInnerHTML={{ __html: contentHTML }} />
    </div>
  );
}

export default function ChatHistory({ contactName, messages }) {
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="history-container">
      <div className="history-subject">
        To: <strong>{contactName}</strong>
      </div>
      <div className="history-messages" ref={historyRef}>
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
      </div>
    </div>
  );
}
