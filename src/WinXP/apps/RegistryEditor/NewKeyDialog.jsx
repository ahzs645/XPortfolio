import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

function NewKeyDialog({ onClose, selectedPath, onSave }) {
  const [name, setName] = useState('New Key #1');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    onSave?.(selectedPath, name.trim());
    onClose?.();
  }, [name, selectedPath, onSave, onClose]);

  return (
    <Container>
      <Field>
        <Label>Key name:</Label>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onClose?.();
          }}
        />
      </Field>
      <Buttons>
        <Btn onClick={handleSave}>OK</Btn>
        <Btn onClick={onClose}>Cancel</Btn>
      </Buttons>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 16px 20px;
  height: 100%;
  box-sizing: border-box;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  font-size: 11px;
`;

const Field = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.div`
  margin-bottom: 4px;
  font-size: 11px;
`;

const Input = styled.input`
  width: 100%;
  padding: 3px 4px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  border: 1px solid #7f9db9;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
`;

const Btn = styled.button`
  min-width: 75px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }
`;

export default NewKeyDialog;
