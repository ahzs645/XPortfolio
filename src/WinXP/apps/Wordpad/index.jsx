import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';

const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

function Wordpad({ onClose }) {
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

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbar();
  }, []);

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

  const handleFontChange = (e) => {
    setFontName(e.target.value);
    execCommand('fontName', e.target.value);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    const sizeMap = { '8': 1, '9': 1, '10': 2, '11': 2, '12': 3, '14': 4, '16': 4, '18': 5, '20': 5, '22': 5, '24': 6, '26': 6, '28': 6, '36': 7, '48': 7, '72': 7 };
    execCommand('fontSize', sizeMap[e.target.value] || 3);
  };

  const handleColorChange = (e) => {
    setTextColor(e.target.value);
    execCommand('foreColor', e.target.value);
  };

  const handleNew = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<div style="font-family: Arial; font-size: 12px;"><br></div>';
    }
  };

  const handleFind = () => {
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
  };

  const handlePrint = () => {
    const content = editorRef.current?.innerHTML || '';
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head><title>Print</title></head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePreview = () => {
    const content = editorRef.current?.innerHTML || '';
    const previewWindow = window.open('', '', 'width=800,height=600');
    previewWindow.document.write(`<html><body>${content}</body></html>`);
    previewWindow.document.close();
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <Container>
      <Toolbar>
        <ToolButton onClick={handleNew} title="New">
          <img src="/icons/xp/wordpad/new.png" alt="New" />
        </ToolButton>
        <ToolButton title="Open">
          <img src="/icons/xp/wordpad/open.png" alt="Open" />
        </ToolButton>
        <ToolButton title="Save">
          <img src="/icons/xp/wordpad/save.png" alt="Save" />
        </ToolButton>
        <ToolButton onClick={handlePrint} title="Print">
          <img src="/icons/xp/wordpad/print.png" alt="Print" />
        </ToolButton>
        <ToolButton onClick={handlePreview} title="Preview">
          <img src="/icons/xp/wordpad/preview.png" alt="Preview" />
        </ToolButton>
        <ToolButton onClick={handleFind} title="Find">
          <img src="/icons/xp/wordpad/find.png" alt="Find" />
        </ToolButton>
        <Spacer />
        <ToolButton onClick={() => execCommand('cut')} title="Cut">
          <img src="/icons/xp/wordpad/cut.png" alt="Cut" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('copy')} title="Copy">
          <img src="/icons/xp/wordpad/copy.png" alt="Copy" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('paste')} title="Paste">
          <img src="/icons/xp/wordpad/paste.png" alt="Paste" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('undo')} title="Undo">
          <img src="/icons/xp/wordpad/undo.png" alt="Undo" />
        </ToolButton>
        <ToolButton onClick={() => execCommand('redo')} title="Redo">
          <img src="/icons/xp/wordpad/redo.png" alt="Redo" />
        </ToolButton>
      </Toolbar>

      <Toolbar>
        <FontSelect value={fontName} onChange={handleFontChange} title="Font">
          {FONTS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </FontSelect>

        <SizeSelect value={fontSize} onChange={handleFontSizeChange} title="Size">
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </SizeSelect>

        <ToolButton
          $active={activeFormats.bold}
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          <img src="/icons/xp/wordpad/bold.png" alt="Bold" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.italic}
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          <img src="/icons/xp/wordpad/italic.png" alt="Italic" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.underline}
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          <img src="/icons/xp/wordpad/underline.png" alt="Underline" />
        </ToolButton>

        <ColorInput
          type="color"
          value={textColor}
          onChange={handleColorChange}
          title="Text color"
        />

        <ToolButton
          $active={activeFormats.left}
          onClick={() => execCommand('justifyLeft')}
          title="Align left"
        >
          <img src="/icons/xp/wordpad/left.png" alt="Left" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.center}
          onClick={() => execCommand('justifyCenter')}
          title="Align center"
        >
          <img src="/icons/xp/wordpad/center.png" alt="Center" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.right}
          onClick={() => execCommand('justifyRight')}
          title="Align right"
        >
          <img src="/icons/xp/wordpad/right.png" alt="Right" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.ulist}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bulleted list"
        >
          <img src="/icons/xp/wordpad/list.png" alt="Bulleted" />
        </ToolButton>
        <ToolButton
          $active={activeFormats.olist}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered list"
        >
          <img src="/icons/xp/wordpad/list.png" alt="Numbered" />
        </ToolButton>
      </Toolbar>

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
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ecead5;
  padding: 2px;
  border-bottom: 1px solid #b1aea0;
`;

const ToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,1)' : 'transparent')};
  border-color: ${({ $active }) => ($active ? '#839fb4' : 'transparent')};
  cursor: pointer;

  &:hover {
    border-color: #d7d4cb;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`;

const Spacer = styled.div`
  width: 8px;
`;

const FontSelect = styled.select`
  font-size: 11px;
  padding: 2px;
  min-width: 100px;
`;

const SizeSelect = styled.select`
  font-size: 11px;
  padding: 2px;
  width: 50px;
`;

const ColorInput = styled.input`
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #919b9c;
  cursor: pointer;
`;

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
