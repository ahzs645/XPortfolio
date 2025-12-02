import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';

const MENUS = [
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Copy', action: 'copy', disabled: true },
      { label: 'Paste', action: 'paste', disabled: true },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Standard', action: 'standard', disabled: true },
      { label: 'Scientific', action: 'scientific', disabled: true },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

function Calculator({ onClose, isFocus }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [history, setHistory] = useState([]);
  const [memoryList, setMemoryList] = useState([]);
  const [activePanel, setActivePanel] = useState('history');
  const [showSidebar, setShowSidebar] = useState(false);
  const containerRef = useRef(null);

  // Check window width for sidebar visibility
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setShowSidebar(width >= 380);
      }
    };

    checkWidth();
    const observer = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clearEntry = useCallback(() => {
    setDisplay('0');
    setWaitingForOperand(false);
  }, []);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display[0] === '-')) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const performOperation = useCallback((nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;
      const expression = `${currentValue} ${operation} ${inputValue}`;

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
          result = inputValue !== 0 ? currentValue / inputValue : 'Error';
          break;
        default:
          result = inputValue;
      }

      if (result === 'Error') {
        setDisplay('Error');
        setPreviousValue(null);
      } else {
        setDisplay(String(result));
        setPreviousValue(result);
        // Add to history
        if (nextOperation === null) {
          setHistory(prev => [...prev, { expression, result: String(result) }]);
        }
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, operation, previousValue]);

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;
    performOperation(null);
    setOperation(null);
    setPreviousValue(null);
  }, [operation, previousValue, performOperation]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  const sqrt = useCallback(() => {
    const value = parseFloat(display);
    if (value < 0) {
      setDisplay('Invalid');
    } else {
      const result = Math.sqrt(value);
      setDisplay(String(result));
      setHistory(prev => [...prev, { expression: `√${value}`, result: String(result) }]);
    }
    setWaitingForOperand(true);
  }, [display]);

  const percent = useCallback(() => {
    if (previousValue !== null) {
      setDisplay(String(previousValue * (parseFloat(display) / 100)));
    } else {
      setDisplay(String(parseFloat(display) / 100));
    }
    setWaitingForOperand(true);
  }, [display, previousValue]);

  const reciprocal = useCallback(() => {
    const value = parseFloat(display);
    if (value === 0) {
      setDisplay('Error');
    } else {
      const result = 1 / value;
      setDisplay(String(result));
      setHistory(prev => [...prev, { expression: `1/${value}`, result: String(result) }]);
    }
    setWaitingForOperand(true);
  }, [display]);

  // Memory functions
  const memoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
    setMemoryList([]);
  }, []);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const memoryStore = useCallback(() => {
    const value = parseFloat(display);
    setMemory(value);
    setHasMemory(true);
    setMemoryList(prev => [...prev, value]);
  }, [display]);

  const memoryAdd = useCallback(() => {
    const newMemory = memory + parseFloat(display);
    setMemory(newMemory);
    setHasMemory(true);
    setMemoryList(prev => {
      if (prev.length > 0) {
        const updated = [...prev];
        updated[updated.length - 1] = newMemory;
        return updated;
      }
      return [newMemory];
    });
  }, [display, memory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const clearAllMemory = useCallback(() => {
    setMemoryList([]);
    setMemory(0);
    setHasMemory(false);
  }, []);

  const useHistoryItem = useCallback((result) => {
    setDisplay(result);
    setWaitingForOperand(true);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocus) return;

      if (e.key >= '0' && e.key <= '9') {
        inputDigit(parseInt(e.key));
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('*');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocus, inputDigit, inputDecimal, performOperation, calculate, clearAll, backspace]);

  return (
    <Container ref={containerRef}>
      <MenuBar menus={MENUS} windowActions={{ onClose }} />

      <CalcWrapper>
        <CalcContainer>
          <Display>
            <input className="calc-display" value={display} readOnly />
          </Display>

          <ButtonGrid>
            <Row className="top-row">
              <MemoryIndicator>
                {hasMemory ? 'M' : ''}
              </MemoryIndicator>
              <button onClick={backspace} className="red-text top-btn">Backspace</button>
              <button onClick={clearEntry} className="red-text top-btn">CE</button>
              <button onClick={clearAll} className="red-text top-btn">C</button>
            </Row>

            <Row>
              <button onClick={memoryClear} className="red-text mem-btn" disabled={!hasMemory}>MC</button>
              <button onClick={() => inputDigit(7)} className="blue-text">7</button>
              <button onClick={() => inputDigit(8)} className="blue-text">8</button>
              <button onClick={() => inputDigit(9)} className="blue-text">9</button>
              <button onClick={() => performOperation('/')} className="red-text">÷</button>
              <button onClick={sqrt} className="blue-text">√</button>
            </Row>

            <Row>
              <button onClick={memoryRecall} className="red-text mem-btn" disabled={!hasMemory}>MR</button>
              <button onClick={() => inputDigit(4)} className="blue-text">4</button>
              <button onClick={() => inputDigit(5)} className="blue-text">5</button>
              <button onClick={() => inputDigit(6)} className="blue-text">6</button>
              <button onClick={() => performOperation('*')} className="red-text">*</button>
              <button onClick={percent} className="blue-text">%</button>
            </Row>

            <Row>
              <button onClick={memoryStore} className="red-text mem-btn">MS</button>
              <button onClick={() => inputDigit(1)} className="blue-text">1</button>
              <button onClick={() => inputDigit(2)} className="blue-text">2</button>
              <button onClick={() => inputDigit(3)} className="blue-text">3</button>
              <button onClick={() => performOperation('-')} className="red-text">-</button>
              <button onClick={reciprocal} className="blue-text">1/x</button>
            </Row>

            <Row>
              <button onClick={memoryAdd} className="red-text mem-btn">M+</button>
              <button onClick={() => inputDigit(0)} className="blue-text">0</button>
              <button onClick={toggleSign} className="blue-text">+/-</button>
              <button onClick={inputDecimal} className="blue-text">.</button>
              <button onClick={() => performOperation('+')} className="red-text">+</button>
              <button onClick={calculate} className="red-text">=</button>
            </Row>
          </ButtonGrid>
        </CalcContainer>

        {showSidebar && (
          <Sidebar>
            <SidebarNav>
              <NavItem
                className={activePanel === 'history' ? 'active' : ''}
                onClick={() => setActivePanel('history')}
              >
                History
              </NavItem>
              <NavItem
                className={activePanel === 'memory' ? 'active' : ''}
                onClick={() => setActivePanel('memory')}
              >
                Memory
              </NavItem>
            </SidebarNav>
            <SidebarPanel>
              {activePanel === 'history' ? (
                <PanelContent>
                  {history.length === 0 ? (
                    <EmptyMessage>There is no history yet</EmptyMessage>
                  ) : (
                    <>
                      {history.map((item, index) => (
                        <HistoryItem key={index} onClick={() => useHistoryItem(item.result)}>
                          <div className="expression">{item.expression}</div>
                          <div className="result">= {item.result}</div>
                        </HistoryItem>
                      ))}
                      <DeleteButton onClick={clearHistory}>🗑</DeleteButton>
                    </>
                  )}
                </PanelContent>
              ) : (
                <PanelContent>
                  {memoryList.length === 0 ? (
                    <EmptyMessage>There's nothing saved in memory</EmptyMessage>
                  ) : (
                    <>
                      {memoryList.map((value, index) => (
                        <MemoryItem key={index} onClick={() => useHistoryItem(String(value))}>
                          <div className="value">{value}</div>
                        </MemoryItem>
                      ))}
                      <DeleteButton onClick={clearAllMemory}>🗑</DeleteButton>
                    </>
                  )}
                </PanelContent>
              )}
            </SidebarPanel>
          </Sidebar>
        )}
      </CalcWrapper>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  min-width: 240px;
  min-height: 280px;
  background: #ece9d8;
  display: flex;
  flex-direction: column;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  overflow: hidden;
`;

const CalcWrapper = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 3px;
`;

const CalcContainer = styled.div`
  flex: 1;
  min-width: 200px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const Display = styled.div`
  margin-bottom: 8px;
  margin-top: 4px;

  .calc-display {
    width: 100%;
    padding: 4px 6px;
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    font-family: inherit;
    height: 32px;
    box-sizing: border-box;
  }
`;

const ButtonGrid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  button {
    flex: 1;
    min-width: 32px;
    min-height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    font-family: Tahoma, sans-serif;
    padding: 2px;
  }

  button:enabled.red-text {
    color: #c00;
  }

  button:enabled.blue-text {
    color: #00c;
  }

  button.mem-btn {
    min-width: 40px;
    max-width: 40px;
    flex: 0 0 40px;
  }

  button.top-btn {
    min-width: 50px;
    font-size: 10px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 3px;
  flex: 1;

  &.top-row {
    margin-bottom: 4px;
  }
`;

const MemoryIndicator = styled.div`
  width: 40px;
  min-width: 40px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ece9d8;
  border: 2px inset;
  border-color: #808080 #fff #fff #808080;
  font-size: 10px;
  font-weight: bold;
  color: #000;
`;

const Sidebar = styled.div`
  width: 35%;
  min-width: 120px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  border-left: 1px solid #808080;
`;

const SidebarNav = styled.div`
  display: flex;
  border-bottom: 1px solid #ccc;
  background: #ece9d8;
  user-select: none;
`;

const NavItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 11px;
  flex: 1;
  text-align: center;
  border-bottom: 2px solid transparent;

  &:hover {
    background: #e0e0e0;
  }

  &.active {
    border-bottom-color: #316ac5;
    background: #fff;
  }
`;

const SidebarPanel = styled.div`
  flex: 1;
  overflow: hidden;
  background: #fff;
`;

const PanelContent = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding: 8px;
  position: relative;
`;

const EmptyMessage = styled.p`
  color: #666;
  font-size: 11px;
  text-align: center;
  margin-top: 20px;
`;

const HistoryItem = styled.button`
  display: block;
  width: 100%;
  padding: 6px 8px;
  margin: 4px 0;
  background: #f9f9f9;
  border: 1px solid #ddd;
  cursor: pointer;
  text-align: right;

  &:hover {
    background: #e8f4ff;
  }

  .expression {
    font-size: 10px;
    color: #666;
    margin-bottom: 2px;
  }

  .result {
    font-weight: 600;
    font-size: 14px;
  }
`;

const MemoryItem = styled.button`
  display: block;
  width: 100%;
  padding: 6px 8px;
  margin: 4px 0;
  background: #f9f9f9;
  border: 1px solid #ddd;
  cursor: pointer;
  text-align: right;

  &:hover {
    background: #e8f4ff;
  }

  .value {
    font-size: 14px;
    font-weight: 600;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 16px;
  padding: 6px 10px;
`;

export default Calculator;
