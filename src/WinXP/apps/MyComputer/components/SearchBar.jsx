import React from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../../utils/baseUrl';

function SearchBar({ searchQuery, onSearchChange, onClear }) {
  return (
    <Container>
      <Icon src={withBaseUrl('/gui/toolbar/search.webp')} alt="" />
      <Input
        type="text"
        placeholder="Search in folder..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        autoFocus
      />
      {searchQuery && (
        <ClearButton onClick={onClear}>×</ClearButton>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #ece9d8;
  border-bottom: 1px solid #808080;
  gap: 6px;
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
  opacity: 0.7;
`;

const Input = styled.input`
  flex: 1;
  padding: 3px 6px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  &:focus {
    outline: none;
    border-color: #316ac5;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  padding: 0 4px;
  &:hover {
    color: #000;
  }
`;

export default SearchBar;
