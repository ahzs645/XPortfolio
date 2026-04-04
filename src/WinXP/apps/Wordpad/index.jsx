import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';
import { ProgramLayout } from '../../../components';

const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(s => ({
  value: String(s),
  label: String(s),
}));

function Wordpad({ onClose, onMinimize, onMaximize }) {
  const editorRef = useRef(null);
  const [fontName, setFontName] = useState('Arial');
  const [fontSize, setFontSize] = useState('12');
  const [textColor, setTextColor] = useState('#000000');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    left: true,
    center: false,
    right: false,
    ulist: false,
    olist: false,
  });

  const updateToolbar = useCallback(() => {
    if (!editorRef.current) return;

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      left: document.queryCommandValue('justifyLeft') === 'true' ||
            (!document.queryCommandState('justifyCenter') && !document.queryCommandState('justifyRight')),
      center: document.queryCommandState('justifyCenter'),
      right: document.queryCommandState('justifyRight'),
      ulist: document.queryCommandState('insertUnorderedList'),
      olist: document.queryCommandState('insertOrderedList'),
    });

    const font = document.queryCommandValue('fontName');
    if (font) setFontName(font.replace(/["']/g, ''));

    const size = document.queryCommandValue('fontSize');
    if (size) {
      const sizeMap = { 1: '8', 2: '10', 3: '12', 4: '14', 5: '18', 6: '24', 7: '36' };
      setFontSize(sizeMap[size] || '12');
    }
  }, []);

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbar();
  }, [updateToolbar]);

  const handleNew = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<div style="font-family: Arial; font-size: 12px;"><br></div>';
    }
  }, []);

  const handleFind = useCallback(() => {
    const term = prompt('Enter text to find:');
    if (!term) return;

    const selection = window.getSelection();
    selection.removeAllRanges();

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let found = false;
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const index = node.textContent.toLowerCase().indexOf(term.toLowerCase());
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + term.length);
        selection.addRange(range);
        found = true;
        break;
      }
    }

    if (!found) alert('Text not found.');
  }, []);

  const handlePrint = useCallback(() => {
    const content = DOMPurify.sanitize(editorRef.current?.innerHTML || '');
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    const doc = printWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><title>Print</title></head><body></body></html>');
    doc.close();
    doc.body.innerHTML = content;
    printWindow.print();
  }, []);

  const handlePreview = useCallback(() => {
    const content = DOMPurify.sanitize(editorRef.current?.innerHTML || '');
    const previewWindow = window.open('', '', 'width=800,height=600');
    if (!previewWindow) return;
    const doc = previewWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();
    doc.body.innerHTML = content;
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Handle toolbar button actions
  const handleToolbarAction = useCallback((action) => {
    switch (action) {
      case 'file:new': handleNew(); break;
      case 'file:print': handlePrint(); break;
      case 'file:preview': handlePreview(); break;
      case 'edit:find': handleFind(); break;
      case 'edit:cut': execCommand('cut'); break;
      case 'edit:copy': execCommand('copy'); break;
      case 'edit:paste': execCommand('paste'); break;
      case 'edit:undo': execCommand('undo'); break;
      case 'edit:redo': execCommand('redo'); break;
      case 'format:bold': execCommand('bold'); break;
      case 'format:italic': execCommand('italic'); break;
      case 'format:underline': execCommand('underline'); break;
      case 'align:left': execCommand('justifyLeft'); break;
      case 'align:center': execCommand('justifyCenter'); break;
      case 'align:right': execCommand('justifyRight'); break;
      case 'list:unordered': execCommand('insertUnorderedList'); break;
      case 'list:ordered': execCommand('insertOrderedList'); break;
      default: break;
    }
  }, [execCommand, handleFind, handleNew, handlePreview, handlePrint]);

  // Handle select/color changes
  const handleToolbarChange = useCallback((toolbarId, itemId, value) => {
    switch (itemId) {
      case 'font':
        setFontName(value);
        execCommand('fontName', value);
        break;
      case 'size':
        setFontSize(value);
        {
          const sizeMap = { '8': 1, '9': 1, '10': 2, '11': 2, '12': 3, '14': 4, '16': 4, '18': 5, '20': 5, '22': 5, '24': 6, '26': 6, '28': 6, '36': 7, '48': 7, '72': 7 };
          execCommand('fontSize', sizeMap[value] || 3);
        }
        break;
      case 'textColor':
        setTextColor(value);
        execCommand('foreColor', value);
        break;
      default: break;
    }
  }, [execCommand]);

  // Menu configuration
  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new' },
        { label: 'Open...', disabled: true },
        { label: 'Save', disabled: true },
        { label: 'Save As...', disabled: true },
        { separator: true },
        { label: 'Print', action: 'file:print' },
        { label: 'Print Preview', action: 'file:preview' },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', action: 'edit:undo' },
        { label: 'Redo', action: 'edit:redo' },
        { separator: true },
        { label: 'Cut', action: 'edit:cut' },
        { label: 'Copy', action: 'edit:copy' },
        { label: 'Paste', action: 'edit:paste' },
        { separator: true },
        { label: 'Find...', action: 'edit:find' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Toolbar', disabled: true },
        { label: 'Format Bar', disabled: true },
        { label: 'Status Bar', disabled: true },
      ],
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { label: 'Date and Time...', disabled: true },
        { label: 'Object...', disabled: true },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      items: [
        { label: 'Font...', disabled: true },
        { label: 'Bullet Style', disabled: true },
        { label: 'Paragraph...', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', disabled: true },
        { separator: true },
        { label: 'About WordPad', disabled: true },
      ],
    },
  ];

  // Toolbar configurations
  const toolbars = [
    {
      id: 'file-tools',
      variant: 'compact',
      items: [
        { type: 'button', id: 'new', icon: '/icons/xp/wordpad/new.png', action: 'file:new', title: 'New' },
        { type: 'button', id: 'open', icon: '/icons/xp/wordpad/open.png', disabled: true, title: 'Open' },
        { type: 'button', id: 'save', icon: '/icons/xp/wordpad/save.png', disabled: true, title: 'Save' },
        { type: 'button', id: 'print', icon: '/icons/xp/wordpad/print.png', action: 'file:print', title: 'Print' },
        { type: 'button', id: 'preview', icon: '/icons/xp/wordpad/preview.png', action: 'file:preview', title: 'Print Preview' },
        { type: 'button', id: 'find', icon: '/icons/xp/wordpad/find.png', action: 'edit:find', title: 'Find' },
        { type: 'spacer', width: 8 },
        { type: 'button', id: 'cut', icon: '/icons/xp/wordpad/cut.png', action: 'edit:cut', title: 'Cut' },
        { type: 'button', id: 'copy', icon: '/icons/xp/wordpad/copy.png', action: 'edit:copy', title: 'Copy' },
        { type: 'button', id: 'paste', icon: '/icons/xp/wordpad/paste.png', action: 'edit:paste', title: 'Paste' },
        { type: 'button', id: 'undo', icon: '/icons/xp/wordpad/undo.png', action: 'edit:undo', title: 'Undo' },
        { type: 'button', id: 'redo', icon: '/icons/xp/wordpad/redo.png', action: 'edit:redo', title: 'Redo' },
      ],
    },
    {
      id: 'format-tools',
      variant: 'compact',
      items: [
        { type: 'select', id: 'font', value: fontName, options: FONTS, width: 120, title: 'Font' },
        { type: 'select', id: 'size', value: fontSize, options: FONT_SIZES, width: 50, title: 'Size' },
        { type: 'separator' },
        { type: 'button', id: 'bold', icon: '/icons/xp/wordpad/bold.png', active: activeFormats.bold, action: 'format:bold', title: 'Bold' },
        { type: 'button', id: 'italic', icon: '/icons/xp/wordpad/italic.png', active: activeFormats.italic, action: 'format:italic', title: 'Italic' },
        { type: 'button', id: 'underline', icon: '/icons/xp/wordpad/underline.png', active: activeFormats.underline, action: 'format:underline', title: 'Underline' },
        { type: 'color', id: 'textColor', value: textColor, title: 'Text Color' },
        { type: 'separator' },
        { type: 'button', id: 'left', icon: '/icons/xp/wordpad/left.png', active: activeFormats.left, action: 'align:left', title: 'Align Left' },
        { type: 'button', id: 'center', icon: '/icons/xp/wordpad/center.png', active: activeFormats.center, action: 'align:center', title: 'Align Center' },
        { type: 'button', id: 'right', icon: '/icons/xp/wordpad/right.png', active: activeFormats.right, action: 'align:right', title: 'Align Right' },
        { type: 'button', id: 'ulist', icon: '/icons/xp/wordpad/list.png', active: activeFormats.ulist, action: 'list:unordered', title: 'Bulleted List' },
        { type: 'button', id: 'olist', icon: '/icons/xp/wordpad/list.png', active: activeFormats.olist, action: 'list:ordered', title: 'Numbered List' },
      ],
    },
  ];

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    handleToolbarAction(action, null);
  }, [handleToolbarAction]);

  return (
    <ProgramLayout
      menus={menus}
      toolbars={toolbars}
      onMenuAction={handleMenuAction}
      onToolbarAction={handleToolbarAction}
      onToolbarChange={handleToolbarChange}
      windowActions={{ onClose, onMinimize, onMaximize }}
      showAddressBar={false}
      showStatusBar={false}
    >
      <EditorContainer>
        <Editor
          ref={editorRef}
          contentEditable
          onKeyUp={updateToolbar}
          onMouseUp={updateToolbar}
          suppressContentEditableWarning
        >
          <div style={{ fontFamily: 'Arial', fontSize: '12px' }}>
            <br />
          </div>
        </Editor>
      </EditorContainer>
    </ProgramLayout>
  );
}

const EditorContainer = styled.div`
  flex: 1;
  padding: 4px;
  background: #ece9d8;
  overflow: hidden;
`;

const Editor = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  overflow: auto;
  outline: none;
  border: 2px inset #ccc;
  background: #fff;
  font-family: Arial;
  font-size: 12px;

  &:focus {
    outline: none;
  }
`;

export default Wordpad;
