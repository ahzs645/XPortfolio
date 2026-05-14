import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'php', label: 'PHP' },
  { value: 'text', label: 'Plain Text' },
];

const EXTENSION_LANGUAGE = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'javascript',
  tsx: 'javascript',
  json: 'json',
  xml: 'xml',
  php: 'php',
  rtf: 'text',
};

function getExtension(fileName = '') {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index + 1).toLowerCase();
}

function detectLanguage(fileName, selectedLanguage) {
  if (selectedLanguage && selectedLanguage !== 'auto') return selectedLanguage;
  return EXTENSION_LANGUAGE[getExtension(fileName)] || 'text';
}

function getIndent(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1;
  const match = text.slice(start, index).match(/^\s*/);
  return match ? match[0] : '';
}

function Coder({ onClose, onMinimize, onMaximize, initialContent = '', fileName = 'Untitled', fileId }) {
  const [code, setCode] = useState(initialContent);
  const [wordWrap, setWordWrap] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [language, setLanguage] = useState('auto');
  const textareaRef = useRef(null);

  const effectiveLanguage = detectLanguage(fileName, language);
  const lineCount = Math.max(1, code.split('\n').length);
  const statusText = `${effectiveLanguage.toUpperCase()} | ${lineCount} line${lineCount === 1 ? '' : 's'}${fileId ? ' | Virtual file' : ''}`;

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1).join('\n'),
    [lineCount]
  );

  const handleTextareaKeyDown = useCallback((event) => {
    const node = textareaRef.current;
    if (!node) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      const { selectionStart, selectionEnd } = node;
      const next = `${code.slice(0, selectionStart)}  ${code.slice(selectionEnd)}`;
      setCode(next);
      requestAnimationFrame(() => {
        node.selectionStart = selectionStart + 2;
        node.selectionEnd = selectionStart + 2;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const { selectionStart, selectionEnd } = node;
      const indent = getIndent(code, selectionStart);
      const before = code.slice(0, selectionStart);
      const after = code.slice(selectionEnd);
      const extra = /[{[(]\s*$/.test(before) ? '  ' : '';
      const inserted = `\n${indent}${extra}`;
      setCode(`${before}${inserted}${after}`);
      requestAnimationFrame(() => {
        const nextCursor = selectionStart + inserted.length;
        node.selectionStart = nextCursor;
        node.selectionEnd = nextCursor;
      });
    }
  }, [code]);

  const handleSelectAll = useCallback(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    printWindow.document.write(`<!doctype html><html><head><title>${fileName}</title></head><body><pre style="font:12px Consolas,monospace;white-space:pre-wrap;">${escaped}</pre></body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [code, fileName]);

  const handlePreview = useCallback(() => {
    if (effectiveLanguage === 'html') {
      setShowPreview((value) => !value);
    }
  }, [effectiveLanguage]);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'file:new':
        setCode('');
        textareaRef.current?.focus();
        break;
      case 'file:print':
        handlePrint();
        break;
      case 'edit:select-all':
        handleSelectAll();
        break;
      case 'view:word-wrap':
        setWordWrap((value) => !value);
        break;
      case 'view:preview':
        handlePreview();
        break;
      default:
        break;
    }
  }, [handlePreview, handlePrint, handleSelectAll]);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new' },
        { label: 'Open...', disabled: true },
        { label: 'Save', disabled: true },
        { label: 'Save As...', disabled: true },
        { separator: true },
        { label: 'Print...', action: 'file:print' },
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
        { separator: true },
        { label: 'Find...', disabled: true },
        { label: 'Replace...', disabled: true },
        { separator: true },
        { label: 'Select All', action: 'edit:select-all' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: wordWrap ? 'Word Wrap (On)' : 'Word Wrap (Off)', action: 'view:word-wrap' },
        { label: showPreview ? 'HTML Preview Pane (On)' : 'HTML Preview Pane (Off)', action: 'view:preview', disabled: effectiveLanguage !== 'html' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'About Code Editor', disabled: true },
      ],
    },
  ], [effectiveLanguage, showPreview, wordWrap]);

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize, onMaximize }}
      showToolbar={false}
      showAddressBar={false}
      statusFields={statusText}
    >
      <Shell>
        <ToolbarStrip>
          <label htmlFor="coder-language">Language:</label>
          <select
            id="coder-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Separator />
          <button type="button" onClick={() => setWordWrap((value) => !value)}>
            Word Wrap
          </button>
          <button type="button" onClick={handlePreview} disabled={effectiveLanguage !== 'html'}>
            Preview
          </button>
        </ToolbarStrip>
        <Workspace $showPreview={showPreview && effectiveLanguage === 'html'}>
          <EditorPane>
            <LineNumbers aria-hidden="true">{lineNumbers}</LineNumbers>
            <CodeArea
              ref={textareaRef}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              spellCheck={false}
              wrap={wordWrap ? 'soft' : 'off'}
              $wordWrap={wordWrap}
            />
          </EditorPane>
          {showPreview && effectiveLanguage === 'html' ? (
            <PreviewPane title="HTML preview" srcDoc={code} sandbox="allow-forms allow-popups allow-scripts" />
          ) : null}
        </Workspace>
      </Shell>
    </ProgramLayout>
  );
}

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: #ece9d8;
`;

const ToolbarStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 3px 6px;
  border-bottom: 1px solid #aca899;
  box-sizing: border-box;
  font-family: Tahoma, sans-serif;
  font-size: 11px;

  select {
    height: 21px;
    min-width: 120px;
    font-family: Tahoma, sans-serif;
    font-size: 11px;
  }

  button {
    min-height: 21px;
    min-width: 72px;
    font-family: Tahoma, sans-serif;
    font-size: 11px;
  }
`;

const Separator = styled.span`
  width: 1px;
  height: 20px;
  background: #aca899;
  box-shadow: 1px 0 #fff;
`;

const Workspace = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${({ $showPreview }) => ($showPreview ? 'minmax(260px, 1fr) minmax(240px, 45%)' : '1fr')};
  background: #ffffff;
`;

const EditorPane = styled.div`
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-columns: 46px 1fr;
  border: 1px solid #7f9db9;
  border-left: 0;
  border-right: 0;
  background: #ffffff;
`;

const LineNumbers = styled.pre`
  margin: 0;
  padding: 8px 6px;
  overflow: hidden;
  border-right: 1px solid #d4d0c8;
  background: #f4f4f4;
  color: #666;
  text-align: right;
  user-select: none;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.45;
`;

const CodeArea = styled.textarea`
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 0;
  outline: 0;
  resize: none;
  padding: 8px;
  background: #ffffff;
  color: #111;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.45;
  white-space: ${({ $wordWrap }) => ($wordWrap ? 'pre-wrap' : 'pre')};
  overflow: auto;
`;

const PreviewPane = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
  border-left: 1px solid #7f9db9;
  background: #fff;
`;

export default Coder;
