import React, { useState } from 'react';
import styled from 'styled-components';

function Calculator({ onClose, isFocus }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '*':
          result = currentValue * inputValue;
          break;
        case '/':
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    performOperation(null);
    setOperation(null);
    setPreviousValue(null);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const percentage = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  return (
    <Container>
      <Display>{display}</Display>
      <ButtonGrid>
        <Button onClick={clear} $type="function">C</Button>
        <Button onClick={toggleSign} $type="function">+/-</Button>
        <Button onClick={percentage} $type="function">%</Button>
        <Button onClick={() => performOperation('/')} $type="operator">/</Button>

        <Button onClick={() => inputDigit(7)}>7</Button>
        <Button onClick={() => inputDigit(8)}>8</Button>
        <Button onClick={() => inputDigit(9)}>9</Button>
        <Button onClick={() => performOperation('*')} $type="operator">*</Button>

        <Button onClick={() => inputDigit(4)}>4</Button>
        <Button onClick={() => inputDigit(5)}>5</Button>
        <Button onClick={() => inputDigit(6)}>6</Button>
        <Button onClick={() => performOperation('-')} $type="operator">-</Button>

        <Button onClick={() => inputDigit(1)}>1</Button>
        <Button onClick={() => inputDigit(2)}>2</Button>
        <Button onClick={() => inputDigit(3)}>3</Button>
        <Button onClick={() => performOperation('+')} $type="operator">+</Button>

        <Button onClick={() => inputDigit(0)} $wide>0</Button>
        <Button onClick={inputDecimal}>.</Button>
        <Button onClick={calculate} $type="operator">=</Button>
      </ButtonGrid>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  padding: 10px;
  background: #ece9d8;
  display: flex;
  flex-direction: column;
`;

const Display = styled.div`
  background: #fff;
  border: 1px inset #888;
  padding: 10px;
  text-align: right;
  font-size: 24px;
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  flex: 1;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #888;
  border-radius: 3px;
  cursor: pointer;
  grid-column: ${({ $wide }) => ($wide ? 'span 2' : 'span 1')};

  background: ${({ $type }) => {
    switch ($type) {
      case 'function':
        return 'linear-gradient(to bottom, #f0f0f0 0%, #d0d0d0 100%)';
      case 'operator':
        return 'linear-gradient(to bottom, #fff0d0 0%, #ffc080 100%)';
      default:
        return 'linear-gradient(to bottom, #fff 0%, #e0e0e0 100%)';
    }
  }};

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    filter: brightness(0.95);
    border-style: inset;
  }
`;

export default Calculator;
