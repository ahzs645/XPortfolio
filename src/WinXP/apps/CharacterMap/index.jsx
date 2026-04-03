import { useState, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';

const FONTS = [
  'Times New Roman',
  'Arial',
  'Courier New',
  'Verdana',
  'Georgia',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Tahoma',
  'Lucida Console',
  'Palatino Linotype',
  'Garamond',
  'Symbol',
  'Wingdings',
  'Webdings',
];

// Generate character ranges - Basic Latin + Latin Extended
function generateCharacters() {
  const chars = [];
  // U+0021 to U+00FF (Basic Latin + Latin-1 Supplement)
  for (let i = 0x0021; i <= 0x00FF; i++) {
    chars.push(i);
  }
  // U+0100 to U+017F (Latin Extended-A)
  for (let i = 0x0100; i <= 0x017F; i++) {
    chars.push(i);
  }
  return chars;
}

const ALL_CHARACTERS = generateCharacters();
const COLS = 20;

function getUnicodeName(code) {
  // Common character names for status bar
  const names = {
    0x0021: 'Exclamation Mark', 0x0022: 'Quotation Mark', 0x0023: 'Number Sign',
    0x0024: 'Dollar Sign', 0x0025: 'Percent Sign', 0x0026: 'Ampersand',
    0x0027: 'Apostrophe', 0x0028: 'Left Parenthesis', 0x0029: 'Right Parenthesis',
    0x002A: 'Asterisk', 0x002B: 'Plus Sign', 0x002C: 'Comma',
    0x002D: 'Hyphen-Minus', 0x002E: 'Full Stop', 0x002F: 'Solidus',
    0x003A: 'Colon', 0x003B: 'Semicolon', 0x003C: 'Less-Than Sign',
    0x003D: 'Equals Sign', 0x003E: 'Greater-Than Sign', 0x003F: 'Question Mark',
    0x0040: 'Commercial At', 0x005B: 'Left Square Bracket',
    0x005C: 'Reverse Solidus', 0x005D: 'Right Square Bracket',
    0x005E: 'Circumflex Accent', 0x005F: 'Low Line', 0x0060: 'Grave Accent',
    0x007B: 'Left Curly Bracket', 0x007C: 'Vertical Line',
    0x007D: 'Right Curly Bracket', 0x007E: 'Tilde',
    0x00A0: 'No-Break Space', 0x00A1: 'Inverted Exclamation Mark',
    0x00A2: 'Cent Sign', 0x00A3: 'Pound Sign', 0x00A4: 'Currency Sign',
    0x00A5: 'Yen Sign', 0x00A9: 'Copyright Sign', 0x00AE: 'Registered Sign',
    0x00B0: 'Degree Sign', 0x00B1: 'Plus-Minus Sign',
    0x00B2: 'Superscript Two', 0x00B3: 'Superscript Three',
    0x00B5: 'Micro Sign', 0x00B6: 'Pilcrow Sign', 0x00B7: 'Middle Dot',
    0x00BC: 'Vulgar Fraction One Quarter', 0x00BD: 'Vulgar Fraction One Half',
    0x00BE: 'Vulgar Fraction Three Quarters',
    0x00BF: 'Inverted Question Mark', 0x00D7: 'Multiplication Sign',
    0x00F7: 'Division Sign',
  };
  if (names[code]) return names[code];
  if (code >= 0x0030 && code <= 0x0039) return `Digit ${String.fromCodePoint(code)}`;
  if (code >= 0x0041 && code <= 0x005A) return `Latin Capital Letter ${String.fromCodePoint(code)}`;
  if (code >= 0x0061 && code <= 0x007A) return `Latin Small Letter ${String.fromCodePoint(code)}`;
  if (code >= 0x00C0 && code <= 0x00FF) return `Latin Letter ${String.fromCodePoint(code)}`;
  if (code >= 0x0100 && code <= 0x017F) return `Latin Extended Letter ${String.fromCodePoint(code)}`;
  return `Unicode Character`;
}

function CharacterMap() {
  const [selectedFont, setSelectedFont] = useState('Times New Roman');
  const [selectedChar, setSelectedChar] = useState(null);
  const [hoveredChar, setHoveredChar] = useState(null);
  const [copyText, setCopyText] = useState('');
  const [enlargedChar, setEnlargedChar] = useState(null);
  const [enlargedPos, setEnlargedPos] = useState(null);
  const gridRef = useRef(null);
  const copyInputRef = useRef(null);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < ALL_CHARACTERS.length; i += COLS) {
      result.push(ALL_CHARACTERS.slice(i, i + COLS));
    }
    return result;
  }, []);

  const displayChar = hoveredChar ?? selectedChar;
  const statusText = displayChar != null
    ? `U+${displayChar.toString(16).toUpperCase().padStart(4, '0')}: ${getUnicodeName(displayChar)}`
    : '';

  const handleCharClick = useCallback((code) => {
    setSelectedChar(code);
  }, []);

  const handleCharDoubleClick = useCallback((code) => {
    setCopyText(prev => prev + String.fromCodePoint(code));
    setSelectedChar(code);
  }, []);

  const handleCharMouseDown = useCallback((code, e) => {
    const cell = e.currentTarget;
    const rect = cell.getBoundingClientRect();
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (gridRect) {
      setEnlargedChar(code);
      setEnlargedPos({
        left: rect.left - gridRect.left + rect.width / 2,
        top: rect.top - gridRect.top,
      });
    }
  }, []);

  const handleCharMouseUp = useCallback(() => {
    setEnlargedChar(null);
    setEnlargedPos(null);
  }, []);

  const handleSelect = useCallback(() => {
    if (selectedChar != null) {
      setCopyText(prev => prev + String.fromCodePoint(selectedChar));
    }
  }, [selectedChar]);

  const handleCopy = useCallback(() => {
    if (copyText) {
      navigator.clipboard?.writeText(copyText).catch(() => {});
      copyInputRef.current?.select();
    }
  }, [copyText]);

  const handleHelp = useCallback(() => {
    // No-op, just for UI completeness
  }, []);

  return (
    <Container>
      <TopRow>
        <label>Font :</label>
        <FontSelect
          value={selectedFont}
          onChange={e => setSelectedFont(e.target.value)}
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f, fontStyle: f === 'Times New Roman' ? 'italic' : 'normal' }}>
              {f}
            </option>
          ))}
        </FontSelect>
        <HelpButton onClick={handleHelp}>Help</HelpButton>
      </TopRow>

      <GridWrapper ref={gridRef}>
        {enlargedChar != null && enlargedPos && (
          <EnlargedPreview style={{ left: enlargedPos.left, top: enlargedPos.top }}>
            <span style={{ fontFamily: selectedFont }}>
              {String.fromCodePoint(enlargedChar)}
            </span>
          </EnlargedPreview>
        )}
        <CharGrid onMouseUp={handleCharMouseUp} onMouseLeave={handleCharMouseUp}>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map(code => (
                <CharCell
                  key={code}
                  className={selectedChar === code ? 'selected' : ''}
                  onMouseEnter={() => setHoveredChar(code)}
                  onMouseLeave={() => setHoveredChar(null)}
                  onClick={() => handleCharClick(code)}
                  onDoubleClick={() => handleCharDoubleClick(code)}
                  onMouseDown={(e) => handleCharMouseDown(code, e)}
                >
                  <span style={{ fontFamily: selectedFont }}>
                    {String.fromCodePoint(code)}
                  </span>
                </CharCell>
              ))}
              {/* Fill remaining cells if row is incomplete */}
              {row.length < COLS && Array.from({ length: COLS - row.length }, (_, i) => (
                <CharCell key={`empty-${i}`} className="empty" />
              ))}
            </tr>
          ))}
        </CharGrid>
      </GridWrapper>

      <BottomRow>
        <label>Characters to copy :</label>
        <CopyInput
          ref={copyInputRef}
          value={copyText}
          onChange={e => setCopyText(e.target.value)}
          style={{ fontFamily: selectedFont }}
        />
        <ActionButton onClick={handleSelect}>Select</ActionButton>
        <ActionButton onClick={handleCopy}>Copy</ActionButton>
      </BottomRow>

      <AdvancedRow>
        <label>
          <input type="checkbox" disabled />
          Advanced view
        </label>
      </AdvancedRow>

      <StatusBar>{statusText}</StatusBar>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  background: #ece9d8;
  display: flex;
  flex-direction: column;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  padding: 6px 8px 0;
  user-select: none;
  overflow: hidden;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-shrink: 0;

  label {
    white-space: nowrap;
  }
`;

const FontSelect = styled.select`
  flex: 1;
  height: 21px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  border: 1px solid #7f9db9;
  padding: 1px 2px;
`;

const HelpButton = styled.button`
  min-width: 56px;
  height: 21px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  padding: 0 8px;
`;

const GridWrapper = styled.div`
  flex: 1;
  position: relative;
  border: 1px solid #808080;
  background: #fff;
  overflow: auto;
  min-height: 0;
`;

const CharGrid = styled.table`
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
`;

const CharCell = styled.td`
  border: 1px solid #c0c0c0;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  padding: 0;
  height: 22px;
  font-size: 14px;
  line-height: 22px;

  span {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:hover {
    background: #e8f0fe;
  }

  &.selected {
    background: #316ac5;
    color: #fff;

    span {
      color: #fff;
    }
  }

  &.empty {
    cursor: default;
    &:hover {
      background: none;
    }
  }
`;

const EnlargedPreview = styled.div`
  position: absolute;
  transform: translate(-50%, -100%);
  width: 48px;
  height: 48px;
  background: #fff;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;

  span {
    font-size: 32px;
    line-height: 1;
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-shrink: 0;

  label {
    white-space: nowrap;
  }
`;

const CopyInput = styled.input`
  flex: 1;
  height: 21px;
  font-size: 14px;
  border: 1px solid #7f9db9;
  padding: 1px 4px;
  min-width: 0;
`;

const ActionButton = styled.button`
  min-width: 64px;
  height: 21px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  padding: 0 8px;
`;

const AdvancedRow = styled.div`
  margin-top: 4px;
  flex-shrink: 0;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: default;
  }

  input[type='checkbox'] {
    margin: 0;
  }
`;

const StatusBar = styled.div`
  margin-top: 4px;
  padding: 2px 4px;
  border: 1px inset;
  border-color: #808080 #fff #fff #808080;
  background: #ece9d8;
  height: 18px;
  line-height: 14px;
  font-size: 11px;
  color: #000;
  flex-shrink: 0;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default CharacterMap;
