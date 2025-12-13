import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import usageGuide from '../../../components/WindowBars/USAGE.md?raw';

function Notepad({ onClose, onMinimize, initialContent }) {
  const usageGuideContent = useMemo(
    () => usageGuide.replace(/\r\n/g, '\n'),
    []
  );

  // Use initialContent if provided, otherwise start empty
  const initialDocument = initialContent !== undefined ? initialContent : '';

  const [text, setText] = useState(initialDocument);
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef(null);

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
    });
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleMenuAction = useCallback((action) => {
    if (!action) return;

    switch (action) {
      case 'file:new': {
        setText('');
        requestAnimationFrame(() => {
          if (!textareaRef.current) return;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
        });
        break;
      }
      case 'file:help': {
        setText(usageGuideContent);
        requestAnimationFrame(() => {
          if (!textareaRef.current) return;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(0, 0);
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
        break;
      }
      case 'help:about':
        window.open('https://github.com/1j01/98/tree/master/programs/notepad', '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  }, [usageGuideContent, insertTextAtCursor]);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new' },
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

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      showToolbar={false}
      showAddressBar={false}
      showStatusBar={false}
    >
      <DocumentSurface>
        <DocumentArea>
          <TextAreaWrapper>
            <StyledTextarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              spellCheck={false}
              $wordWrap={wordWrap}
            />
          </TextAreaWrapper>
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
  padding: 0;
  overflow: hidden;
  min-height: 0;
`;

const DocumentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: none;
  box-shadow: none;
  overflow: hidden;
  min-height: 0;
`;

const TextAreaWrapper = styled.div`
  flex: 1;
  overflow: hidden;
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
