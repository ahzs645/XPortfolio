import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';

const ASSET_BASE = '/apps/minesweeper/';

const Config = {
  Beginner: { rows: 9, cols: 9, mines: 10 },
  Intermediate: { rows: 16, cols: 16, mines: 40 },
  Expert: { rows: 16, cols: 30, mines: 99 },
};

const DIGIT_MAP = {
  '-': `${ASSET_BASE}digit-.png`,
  '0': `${ASSET_BASE}digit0.png`,
  '1': `${ASSET_BASE}digit1.png`,
  '2': `${ASSET_BASE}digit2.png`,
  '3': `${ASSET_BASE}digit3.png`,
  '4': `${ASSET_BASE}digit4.png`,
  '5': `${ASSET_BASE}digit5.png`,
  '6': `${ASSET_BASE}digit6.png`,
  '7': `${ASSET_BASE}digit7.png`,
  '8': `${ASSET_BASE}digit8.png`,
  '9': `${ASSET_BASE}digit9.png`,
};

const FACE = {
  SMILE: `${ASSET_BASE}smile.png`,
  OHH: `${ASSET_BASE}ohh.png`,
  DEAD: `${ASSET_BASE}dead.png`,
  WIN: `${ASSET_BASE}win.png`,
};

const OPEN_NUM = {
  1: `${ASSET_BASE}open1.png`,
  2: `${ASSET_BASE}open2.png`,
  3: `${ASSET_BASE}open3.png`,
  4: `${ASSET_BASE}open4.png`,
  5: `${ASSET_BASE}open5.png`,
  6: `${ASSET_BASE}open6.png`,
  7: `${ASSET_BASE}open7.png`,
  8: `${ASSET_BASE}open8.png`,
};

function pad3(n) {
  n = Math.min(999, n | 0);
  return String(n).padStart(3, '0');
}

function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows * cols }, () => ({
    state: 'cover',
    mines: 0,
  }));
}

function getNeighbors(i, rows, cols) {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const ns = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
        ns.push(rr * cols + cc);
      }
    }
  }
  return ns;
}

// Calculate window width for a given number of columns
function calcWindowWidth(cols) {
  // Board: cols * 16px + 6px borders
  // MineContent padding: 6px (3px each side)
  // window-body margin: 6px (3px each side)
  return cols * 16 + 6 + 6 + 6;
}

function Minesweeper({ onClose, onResize }) {
  const [difficulty, setDifficulty] = useState('Beginner');
  const [grid, setGrid] = useState(() => createEmptyGrid(9, 9));
  const [status, setStatus] = useState('new'); // 'new', 'started', 'won', 'dead'
  const [seconds, setSeconds] = useState(0);
  const [flags, setFlags] = useState(0);
  const [face, setFace] = useState(FACE.SMILE);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef(null);
  const boardRef = useRef(null);

  const { rows, cols, mines } = Config[difficulty];

  // Resize window when difficulty changes
  useEffect(() => {
    if (onResize) {
      onResize(calcWindowWidth(cols), 0);
    }
  }, [cols, onResize]);

  // Menu configuration
  const menus = useMemo(() => [
    {
      id: 'game',
      label: 'Game',
      items: [
        { label: 'New', action: 'new' },
        { separator: true },
        { label: `${difficulty === 'Beginner' ? '✓ ' : '   '}Beginner`, action: 'difficulty:Beginner' },
        { label: `${difficulty === 'Intermediate' ? '✓ ' : '   '}Intermediate`, action: 'difficulty:Intermediate' },
        { label: `${difficulty === 'Expert' ? '✓ ' : '   '}Expert`, action: 'difficulty:Expert' },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    { id: 'help', label: 'Help', disabled: true },
  ], [difficulty]);

  const resetGame = useCallback((diff = difficulty) => {
    const { rows, cols } = Config[diff];
    setGrid(createEmptyGrid(rows, cols));
    setStatus('new');
    setSeconds(0);
    setFlags(0);
    setFace(FACE.SMILE);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [difficulty]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const placeMines = (firstIndex, currentGrid) => {
    const idxs = Array.from({ length: rows * cols }, (_, i) => i).filter(
      (i) => i !== firstIndex
    );
    const newGrid = [...currentGrid];

    for (let m = 0; m < mines; m++) {
      const r = Math.floor(Math.random() * idxs.length);
      const idx = idxs.splice(r, 1)[0];
      newGrid[idx] = { ...newGrid[idx], mines: -1 };
      for (const n of getNeighbors(idx, rows, cols)) {
        if (newGrid[n].mines >= 0) {
          newGrid[n] = { ...newGrid[n], mines: newGrid[n].mines + 1 };
        }
      }
    }
    return newGrid;
  };

  const startTimer = () => {
    setStatus('started');
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const reveal = (i, currentGrid) => {
    const newGrid = [...currentGrid];
    const toReveal = [i];

    while (toReveal.length > 0) {
      const idx = toReveal.pop();
      const cell = newGrid[idx];

      if (cell.state !== 'cover') continue;

      newGrid[idx] = { ...cell, state: 'open' };

      if (cell.mines === 0) {
        for (const n of getNeighbors(idx, rows, cols)) {
          if (newGrid[n].state === 'cover') {
            toReveal.push(n);
          }
        }
      }
    }

    return newGrid;
  };

  const checkWin = (currentGrid) => {
    const unopened = currentGrid.filter((c) => c.state !== 'open').length;
    return unopened === mines;
  };

  const gameOver = (blowIndex, currentGrid) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('dead');
    setFace(FACE.DEAD);

    const newGrid = currentGrid.map((c, i) => {
      if (c.mines < 0 && c.state !== 'flag') {
        return { ...c, state: i === blowIndex ? 'die' : 'mine' };
      }
      if (c.mines >= 0 && c.state === 'flag') {
        return { ...c, state: 'misflagged' };
      }
      return c;
    });
    setGrid(newGrid);
  };

  const handleCellClick = (i) => {
    if (status === 'dead' || status === 'won') return;

    let currentGrid = [...grid];
    const cell = currentGrid[i];

    if (cell.state === 'flag' || cell.state === 'open') return;

    if (status === 'new') {
      currentGrid = placeMines(i, currentGrid);
      startTimer();
    }

    if (currentGrid[i].mines < 0) {
      gameOver(i, currentGrid);
      return;
    }

    const newGrid = reveal(i, currentGrid);
    setGrid(newGrid);

    if (checkWin(newGrid)) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStatus('won');
      setFace(FACE.WIN);
      // Auto-flag remaining cells
      setGrid(
        newGrid.map((c) => {
          if (c.state === 'cover' || c.state === 'unknown') {
            return { ...c, state: 'flag' };
          }
          return c;
        })
      );
    }
  };

  const cycleFlag = (i) => {
    if (status === 'dead' || status === 'won') return;

    const cell = grid[i];
    if (cell.state === 'open') return;

    const newGrid = [...grid];

    if (cell.state === 'cover') {
      newGrid[i] = { ...cell, state: 'flag' };
      setFlags((f) => f + 1);
    } else if (cell.state === 'flag') {
      newGrid[i] = { ...cell, state: 'unknown' };
      setFlags((f) => f - 1);
    } else if (cell.state === 'unknown') {
      newGrid[i] = { ...cell, state: 'cover' };
    }

    setGrid(newGrid);
  };

  const handleContextMenu = (e, i) => {
    e.preventDefault();
    cycleFlag(i);
  };

  const handleMouseDown = () => {
    if (status === 'new' || status === 'started') {
      setFace(FACE.OHH);
    }
  };

  const handleMouseUp = () => {
    if (status === 'new' || status === 'started') {
      setFace(FACE.SMILE);
    }
  };

  const handleFaceClick = () => {
    resetGame();
  };

  const changeDifficulty = (diff) => {
    setDifficulty(diff);
    const { rows, cols } = Config[diff];
    setGrid(createEmptyGrid(rows, cols));
    setStatus('new');
    setSeconds(0);
    setFlags(0);
    setFace(FACE.SMILE);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMenuAction = useCallback((action) => {
    if (action === 'new') {
      resetGame();
    } else if (action.startsWith('difficulty:')) {
      const diff = action.split(':')[1];
      changeDifficulty(diff);
    }
  }, [resetGame]);

  const handleTouchStart = (i) => {
    if (flagMode) {
      cycleFlag(i);
    } else {
      handleCellClick(i);
    }
  };

  const renderDigits = (n) => {
    const s = pad3(n);
    return s.split('').map((ch, idx) => (
      <img key={idx} src={DIGIT_MAP[ch]} alt={ch} />
    ));
  };

  const getCellClassName = (cell) => {
    const classes = ['cell'];
    if (cell.state === 'cover') classes.push('cover');
    else if (cell.state === 'open') classes.push('open');
    else if (cell.state === 'flag') classes.push('cover', 'flag');
    else if (cell.state === 'unknown') classes.push('cover', 'unknown');
    else if (cell.state === 'mine') classes.push('open', 'mine');
    else if (cell.state === 'misflagged') classes.push('open', 'misflagged');
    else if (cell.state === 'die') classes.push('open', 'die');
    return classes.join(' ');
  };

  return (
    <Container>
      <MenuBarWrapper>
        <MenuBar
          menus={menus}
          onAction={handleMenuAction}
          windowActions={{ onClose }}
        />
        <MobileOnly>
          <label>
            <input
              type="checkbox"
              checked={flagMode}
              onChange={(e) => setFlagMode(e.target.checked)}
            />
            Flag
          </label>
        </MobileOnly>
      </MenuBarWrapper>
      <MineContent>
        <Scorebar>
          <Digits>{renderDigits(Math.max(0, mines - flags))}</Digits>
          <FaceButton
            onMouseDown={() => setFace(FACE.OHH)}
            onMouseUp={() => {
              if (status === 'new' || status === 'started') setFace(FACE.SMILE);
            }}
            onClick={handleFaceClick}
          >
            <img src={face} alt="face" />
          </FaceButton>
          <Digits>{renderDigits(seconds)}</Digits>
        </Scorebar>
        <Board
          ref={boardRef}
          $cols={cols}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((cell, i) => (
            <Cell
              key={i}
              className={getCellClassName(cell)}
              onClick={() => handleCellClick(i)}
              onContextMenu={(e) => handleContextMenu(e, i)}
              onTouchStart={() => handleTouchStart(i)}
            >
              {cell.state === 'open' && cell.mines > 0 && (
                <img src={OPEN_NUM[cell.mines]} alt={String(cell.mines)} />
              )}
            </Cell>
          ))}
        </Board>
      </MineContent>
    </Container>
  );
}

const Container = styled.div`
  width: fit-content;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
  font-family: Tahoma, 'Segoe UI', Arial, sans-serif;
  overflow: hidden;
`;

const MenuBarWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: #ece9d8;
`;

const MobileOnly = styled.div`
  margin-left: auto;
  display: none;
  align-items: center;
  gap: 6px;
  padding-right: 8px;
  font-size: 11px;

  @media (pointer: coarse) {
    display: flex;
  }
`;

const MineContent = styled.div`
  background: #c0c0c0;
  padding: 3px 3px 0;
  width: max-content;
`;

const Scorebar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  padding: 3px 2px;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-right: 2px solid #f5f5f5;
  border-bottom: 2px solid #f5f5f5;
  margin-bottom: 5px;
  box-sizing: border-box;
  background: #c0c0c0;
`;

const Digits = styled.div`
  display: flex;
  gap: 0;
  width: 40px;
  height: 24px;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  align-items: flex-end;
  justify-content: flex-end;
  background: #000;

  img {
    image-rendering: pixelated;
    height: 23px;
    pointer-events: none;
  }
`;

const FaceButton = styled.button`
  width: 24px;
  min-width: 24px;
  max-width: 24px;
  height: 24px;
  flex-shrink: 0;
  flex-grow: 0;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #f5f5f5 #808080 #808080 #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border-radius: 2px;
  outline: none;

  &:active {
    border-width: 1px;
    border-color: #808080;
  }

  img {
    width: 20px;
    height: 20px;
    image-rendering: pixelated;
    pointer-events: none;
  }
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 16px);
  width: max-content;
  border-top: 3px solid #808080;
  border-left: 3px solid #808080;
  border-right: 3px solid #f5f5f5;
  border-bottom: 3px solid #f5f5f5;
  background: #c0c0c0;
`;

const Cell = styled.div`
  width: 16px;
  height: 16px;
  display: inline-grid;
  place-items: center;
  font: bold 12px/1 'Lucida Console', monospace;
  user-select: none;
  cursor: pointer;
  position: relative;
  background: #c0c0c0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &.cover::before {
    border-left: 2px solid #f5f5f5;
    border-top: 2px solid #f5f5f5;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
  }

  &.open {
    background: #bdbdbd;
  }

  &.open::before {
    border-left: 1px solid #808080;
    border-top: 1px solid #808080;
  }

  img {
    position: absolute;
    width: 16px;
    height: 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }

  &.flag::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('${ASSET_BASE}flag.png') no-repeat center/16px 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }

  &.unknown::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('${ASSET_BASE}question.png') no-repeat center/16px 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }

  &.mine::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('${ASSET_BASE}mine-ceil.png') no-repeat center/16px 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }

  &.misflagged::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('${ASSET_BASE}misflagged.png') no-repeat center/16px 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }

  &.die {
    background: #ffbaba;
  }

  &.die::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: url('${ASSET_BASE}mine-death.png') no-repeat center/16px 16px;
    image-rendering: pixelated;
    pointer-events: none;
  }
`;

export default Minesweeper;
