import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

function EditValueDialog({ onClose, name, type, data, selectedPath, onSave }) {
  const [currentData, setCurrentData] = useState(
    type === 'REG_DWORD' ? String(data || 0) : (data || '')
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = useCallback(() => {
    let saveData = currentData;
    if (type === 'REG_DWORD') {
      saveData = parseInt(currentData, 10) || 0;
    }
    onSave?.(selectedPath, name, type, saveData);
    onClose?.();
  }, [currentData, type, name, selectedPath, onSave, onClose]);

  const dialogTitle = type === 'REG_DWORD'
    ? 'Edit DWORD Value'
    : type === 'REG_BINARY'
      ? 'Edit Binary Value'
      : 'Edit String';

  return (
    <Container>
      <Field>
        <Label>Value name:</Label>
        <Input value={name} disabled />
      </Field>
      <Field>
        <Label>
          {type === 'REG_DWORD' ? 'Value data:' : 'Value data:'}
        </Label>
        <Input
          ref={inputRef}
          value={currentData}
          onChange={(e) => setCurrentData(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onClose?.();
          }}
        />
      </Field>
      {type === 'REG_DWORD' && (
        <Field>
          <HexLabel>
            Base: Decimal &nbsp;&middot;&nbsp; Hex: 0x{(parseInt(currentData, 10) || 0).toString(16).padStart(8, '0')}
          </HexLabel>
        </Field>
      )}
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

const HexLabel = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: -4px;
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

  &:disabled {
    background: #f0f0f0;
    color: #888;
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

export default EditValueDialog;
