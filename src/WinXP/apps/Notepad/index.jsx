import React, { useState } from 'react';
import styled from 'styled-components';

function Notepad({ onClose, isFocus }) {
  const [text, setText] = useState('');
  const [wordWrap, setWordWrap] = useState(true);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  return (
    <Container>
      <MenuBar>
        <Menu>
          <MenuItem>File</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem onClick={() => setWordWrap(!wordWrap)}>
            Format {wordWrap ? '✓' : ''}
          </MenuItem>
          <MenuItem>View</MenuItem>
          <MenuItem>Help</MenuItem>
        </Menu>
      </MenuBar>
      <TextArea
        value={text}
        onChange={handleChange}
        placeholder="Start typing..."
        $wordWrap={wordWrap}
      />
      <StatusBar>
        Ln 1, Col {text.length + 1}
      </StatusBar>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
`;

const MenuBar = styled.div`
  background: #ece9d8;
  border-bottom: 1px solid #aaa;
`;

const Menu = styled.div`
  display: flex;
  padding: 2px 5px;
`;

const MenuItem = styled.button`
  padding: 3px 8px;
  background: transparent;
  border: none;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #0b61ff;
    color: white;
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 5px;
  border: none;
  resize: none;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  outline: none;
  white-space: ${({ $wordWrap }) => ($wordWrap ? 'pre-wrap' : 'pre')};
  overflow: ${({ $wordWrap }) => ($wordWrap ? 'auto' : 'scroll')};
`;

const StatusBar = styled.div`
  padding: 2px 10px;
  background: #ece9d8;
  border-top: 1px solid #aaa;
  font-size: 11px;
  color: #333;
`;

export default Notepad;
