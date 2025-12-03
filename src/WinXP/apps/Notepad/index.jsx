import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import usageGuide from '../../../components/WindowBars/USAGE.md?raw';

function Notepad({ onClose, onMinimize }) {
  const initialDocument = useMemo(
    () => usageGuide.replace(/\r\n/g, '\n'),
    []
  );

  const [text, setText] = useState(initialDocument);
  const [wordWrap, setWordWrap] = useState(true);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const textareaRef = useRef(null);

  const updateCursorPosition = useCallback((target, valueOverride) => {
    const node = target || textareaRef.current;
    if (!node) return;

    const value = valueOverride ?? node.value;
    const selectionStart = node.selectionStart ?? 0;
    const beforeCursor = value.slice(0, selectionStart);
    const lines = beforeCursor.split('\n');

    setCursor({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    });
  }, []);

  useEffect(() => {
    updateCursorPosition(textareaRef.current, text);
  }, [text, updateCursorPosition]);

  const insertTextAtCursor = useCallback((insertValue) => {
    const node = textareaRef.current;
    if (!node) return;

    const { selectionStart = 0, selectionEnd = 0 } = node;
    const before = text.slice(0, selectionStart);
    const after = text.slice(selectionEnd);
    const nextText = `${before}${insertValue}${after}`;

    setText(nextText);
    requestAnimationFrame(() => {
      const nextCursor = selectionStart + insertValue.length;
      node.focus();
      node.setSelectionRange(nextCursor, nextCursor);
      updateCursorPosition(node, nextText);
    });
  }, [text, updateCursorPosition]);

  const handleChange = (e) => {
    setText(e.target.value);
    updateCursorPosition(e.target, e.target.value);
  };

  const handleCursorEvent = (e) => updateCursorPosition(e.target);

  const handleMenuAction = useCallback((action) => {
    if (!action) return;

    switch (action) {
      case 'file:new': {
        setText('');
        requestAnimationFrame(() => {
          if (!textareaRef.current) return;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
          updateCursorPosition(textareaRef.current, '');
        });
        break;
      }
      case 'file:reset': {
        setText(initialDocument);
        requestAnimationFrame(() => {
          if (!textareaRef.current) return;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
          updateCursorPosition(textareaRef.current, initialDocument);
        });
        break;
      }
      case 'edit:word-wrap':
        setWordWrap((wrap) => !wrap);
        break;
      case 'edit:time-date': {
        const timestamp = new Date().toLocaleString();
        insertTextAtCursor(timestamp);
        break;
      }
      case 'edit:select-all': {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.select();
        updateCursorPosition(textareaRef.current);
        break;
      }
      case 'help:about':
        window.open('https://github.com/1j01/98/tree/master/programs/notepad', '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  }, [initialDocument, insertTextAtCursor, updateCursorPosition]);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new' },
        { label: 'Reload Usage Guide', action: 'file:reset' },
        { separator: true },
        { label: 'Page Setup...', disabled: true },
        { label: 'Print...', disabled: true },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', disabled: true },
        { separator: true },
        { label: 'Cut', disabled: true },
        { label: 'Copy', disabled: true },
        { label: 'Paste', disabled: true },
        { label: 'Delete', disabled: true },
        { separator: true },
        { label: 'Find...', disabled: true },
        { label: 'Find Next', disabled: true },
        { separator: true },
        { label: wordWrap ? 'Word Wrap (On)' : 'Word Wrap (Off)', action: 'edit:word-wrap' },
        { label: 'Time/Date', action: 'edit:time-date' },
        { label: 'Select All', action: 'edit:select-all' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'About Notepad', action: 'help:about' },
      ],
    },
  ], [wordWrap]);

  const statusFields = [
    { text: `Ln ${cursor.line}, Col ${cursor.column}`, width: '140px' },
    { text: wordWrap ? 'Word Wrap: On' : 'Word Wrap: Off', width: '130px' },
    { text: 'WindowBars usage guide snapshot', flex: 1 },
  ];

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      statusFields={statusFields}
      showToolbar={false}
      showAddressBar={false}
      showStatusGrip={false}
    >
      <DocumentSurface>
        <DocumentArea>
          <StyledTextarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onClick={handleCursorEvent}
            onKeyUp={handleCursorEvent}
            onSelect={handleCursorEvent}
            spellCheck={false}
            $wordWrap={wordWrap}
          />
        </DocumentArea>
      </DocumentSurface>
    </ProgramLayout>
  );
}

const DocumentSurface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 6px;
  overflow: hidden;
  min-height: 0;
`;

const DocumentArea = styled.div`
  flex: 1;
  background: #ffffff;
  border: 2px inset #ffffff;
  box-shadow:
    inset 1px 1px 0 #dfdfdf,
    inset -1px -1px 0 #8c8c8c;
  overflow: hidden;
  min-height: 0;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 10px;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  color: #000;
  box-sizing: border-box;
  white-space: ${({ $wordWrap }) => ($wordWrap ? 'pre-wrap' : 'pre')};
  overflow: ${({ $wordWrap }) => ($wordWrap ? 'auto' : 'scroll')};
`;

export default Notepad;
