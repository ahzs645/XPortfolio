import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useFileSystem } from '../../../contexts/FileSystemContext';

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000', '#FFFFFF', '#C0C0C0',
  '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFF80', '#00FF80',
  '#80FFFF', '#8080FF', '#FF0080', '#FF8040'
];

const TOOLS = [
  { id: 'pencil', icon: '/icons/paint/pencil.webp' },
  { id: 'brush', icon: '/icons/paint/brush.webp' },
  { id: 'spray', icon: '/icons/paint/spray.webp' },
  { id: 'eraser', icon: '/icons/paint/eraser.webp' },
  { id: 'fill', icon: '/icons/paint/fill.webp' },
  { id: 'text', icon: '/icons/paint/text.webp' },
  { id: 'picker', icon: '/icons/paint/pipette.webp' },
  { id: 'line', icon: '/icons/paint/line.webp' },
  { id: 'rect', icon: '/icons/paint/rectangle.webp' },
  { id: 'ellipse', icon: '/icons/paint/oval.webp' },
];

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function pixelEquals(data, idx, r, g, b, a) {
  return data[idx] === r && data[idx + 1] === g && data[idx + 2] === b && data[idx + 3] === a;
}

function floodFillScanline(imgData, startX, startY, fillRgb) {
  const width = imgData.width;
  const height = imgData.height;
  const data = imgData.data;

  if (startX < 0 || startY < 0 || startX >= width || startY >= height) return false;

  const startIdx = (startY * width + startX) * 4;
  const tr = data[startIdx];
  const tg = data[startIdx + 1];
  const tb = data[startIdx + 2];
  const ta = data[startIdx + 3];

  if (tr === fillRgb[0] && tg === fillRgb[1] && tb === fillRgb[2] && ta === 255) return false;

  const stack = [startY * width + startX];

  while (stack.length) {
    const pos = stack.pop();
    let x = pos % width;
    let y = (pos / width) | 0;
    let idx = (y * width + x) * 4;

    while (x >= 0 && pixelEquals(data, idx, tr, tg, tb, ta)) {
      x--;
      idx -= 4;
    }
    x++;
    idx += 4;

    let spanAbove = false;
    let spanBelow = false;

    while (x < width && pixelEquals(data, idx, tr, tg, tb, ta)) {
      data[idx] = fillRgb[0];
      data[idx + 1] = fillRgb[1];
      data[idx + 2] = fillRgb[2];
      data[idx + 3] = 255;

      if (y > 0) {
        const idxAbove = idx - width * 4;
        if (pixelEquals(data, idxAbove, tr, tg, tb, ta)) {
          if (!spanAbove) {
            stack.push((y - 1) * width + x);
            spanAbove = true;
          }
        } else {
          spanAbove = false;
        }
      }

      if (y < height - 1) {
        const idxBelow = idx + width * 4;
        if (pixelEquals(data, idxBelow, tr, tg, tb, ta)) {
          if (!spanBelow) {
            stack.push((y + 1) * width + x);
            spanBelow = true;
          }
        } else {
          spanBelow = false;
        }
      }

      x++;
      idx += 4;
    }
  }
  return true;
}

const MAX_HISTORY = 20;

function Paint({ onClose, onMinimize, imagePath, fileId, fileName }) {
  const { saveFileContent } = useFileSystem();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const sprayIntervalRef = useRef(null);
  const sprayPosRef = useRef({ x: 0, y: 0 });
  const [currentFileName, setCurrentFileName] = useState(fileName || 'untitled.png');
  const [currentFileId, setCurrentFileId] = useState(fileId || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showToolbox, setShowToolbox] = useState(true);
  const [showColorBox, setShowColorBox] = useState(true);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        imageData,
        width: canvas.width,
        height: canvas.height
      });
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    setTimeout(() => saveToHistory(), 0);
  }, []);

  // Load image if imagePath is provided
  useEffect(() => {
    if (!imagePath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      setCanvasSize({ width: img.width, height: img.height });
      setTimeout(() => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      }, 0);
    };

    if (imagePath.startsWith('blob:') || imagePath.startsWith('http') || imagePath.startsWith('/')) {
      img.src = imagePath;
    } else {
      img.src = imagePath;
    }
  }, [imagePath, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    if (!state) return;

    canvas.width = state.width;
    canvas.height = state.height;
    setCanvasSize({ width: state.width, height: state.height });

    const ctx = canvas.getContext('2d');
    ctx.putImageData(state.imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    if (!state) return;

    canvas.width = state.width;
    canvas.height = state.height;
    setCanvasSize({ width: state.width, height: state.height });

    const ctx = canvas.getContext('2d');
    ctx.putImageData(state.imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  const newCanvas = useCallback(() => {
    setCanvasSize({ width: 400, height: 300 });
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      setHistoryIndex(-1);
      saveToHistory();
    }, 0);
  }, [saveToHistory]);

  const invertColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];       // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, [saveToHistory]);

  const flipHorizontal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(tempCanvas, -canvas.width, 0);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  const flipVertical = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(tempCanvas, 0, -canvas.height);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  // Export canvas as blob
  const getCanvasBlob = useCallback(() => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('No canvas'));
        return;
      }
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export canvas'));
      }, 'image/png');
    });
  }, []);

  // Save to file system (if fileId exists)
  const handleSave = useCallback(async () => {
    try {
      const blob = await getCanvasBlob();

      if (currentFileId) {
        // Save to existing file in file system
        const success = await saveFileContent(currentFileId, blob);
        if (success) {
          setHasUnsavedChanges(false);
          alert('Image saved successfully!');
        } else {
          alert('Failed to save image.');
        }
      } else {
        // No file ID - trigger Save As
        handleSaveAs();
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save image.');
    }
  }, [currentFileId, getCanvasBlob, saveFileContent]);

  // Save As - download image
  const handleSaveAs = useCallback(async () => {
    try {
      const blob = await getCanvasBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Prompt for filename
      const name = prompt('Save as:', currentFileName);
      if (!name) {
        URL.revokeObjectURL(url);
        return;
      }

      // Ensure .png extension
      const finalName = name.endsWith('.png') ? name : `${name}.png`;
      link.download = finalName;
      setCurrentFileName(finalName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save As failed:', err);
      alert('Failed to save image.');
    }
  }, [currentFileName, getCanvasBlob]);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'file:new':
        newCanvas();
        break;
      case 'file:save':
        handleSave();
        break;
      case 'file:save-as':
        handleSaveAs();
        break;
      case 'file:exit':
      case 'exitProgram':
        onClose?.();
        break;
      case 'edit:undo':
        undo();
        break;
      case 'edit:redo':
        redo();
        break;
      case 'edit:select-all':
        // TODO: Implement selection
        break;
      case 'view:toolbox':
        setShowToolbox(prev => !prev);
        break;
      case 'view:colorbox':
        setShowColorBox(prev => !prev);
        break;
      case 'image:flip-horizontal':
        flipHorizontal();
        break;
      case 'image:flip-vertical':
        flipVertical();
        break;
      case 'image:invert':
        invertColors();
        break;
      case 'image:clear':
        clearCanvas();
        break;
      case 'help:about':
        alert('XP Paint\nA simple paint application.');
        break;
      default:
        break;
    }
  }, [onClose, newCanvas, undo, redo, flipHorizontal, flipVertical, invertColors, clearCanvas, handleSave, handleSaveAs]);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new' },
        { label: 'Open...', disabled: true },
        { label: 'Save', action: 'file:save' },
        { label: 'Save As...', action: 'file:save-as' },
        { separator: true },
        { label: 'Print Preview', disabled: true },
        { label: 'Page Setup...', disabled: true },
        { label: 'Print...', disabled: true },
        { separator: true },
        { label: 'Send...', disabled: true },
        { separator: true },
        { label: 'Set As Wallpaper (Tiled)', disabled: true },
        { label: 'Set As Wallpaper (Centered)', disabled: true },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', action: 'edit:undo', disabled: historyIndex <= 0 },
        { label: 'Repeat', action: 'edit:redo', disabled: historyIndex >= history.length - 1 },
        { separator: true },
        { label: 'Cut', disabled: true },
        { label: 'Copy', disabled: true },
        { label: 'Paste', disabled: true },
        { label: 'Clear Selection', disabled: true },
        { label: 'Select All', action: 'edit:select-all', disabled: true },
        { separator: true },
        { label: 'Copy To...', disabled: true },
        { label: 'Paste From...', disabled: true },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: showToolbox ? 'Tool Box ✓' : 'Tool Box', action: 'view:toolbox' },
        { label: showColorBox ? 'Color Box ✓' : 'Color Box', action: 'view:colorbox' },
        { label: 'Status Bar', disabled: true },
        { separator: true },
        { label: 'Zoom', disabled: true },
        { label: 'View Bitmap', disabled: true },
        { label: 'Text Toolbar', disabled: true },
      ],
    },
    {
      id: 'image',
      label: 'Image',
      items: [
        { label: 'Flip/Rotate...', disabled: true },
        { label: 'Flip Horizontal', action: 'image:flip-horizontal' },
        { label: 'Flip Vertical', action: 'image:flip-vertical' },
        { separator: true },
        { label: 'Stretch/Skew...', disabled: true },
        { label: 'Invert Colors', action: 'image:invert' },
        { label: 'Attributes...', disabled: true },
        { label: 'Clear Image', action: 'image:clear' },
        { label: 'Draw Opaque', disabled: true },
      ],
    },
    {
      id: 'colors',
      label: 'Colors',
      items: [
        { label: 'Edit Colors...', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', disabled: true },
        { separator: true },
        { label: 'About Paint', action: 'help:about' },
      ],
    },
  ], [historyIndex, history.length, showToolbox, showColorBox]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  }, []);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    setStartPos(pos);
    setIsDrawing(true);

    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineCap = 'round';

    switch (currentTool) {
      case 'pencil':
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        break;
      case 'brush':
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        break;
      case 'spray':
        sprayPosRef.current = pos;
        sprayIntervalRef.current = setInterval(() => {
          for (let i = 0; i < 10; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            ctx.fillRect(sprayPosRef.current.x + offsetX, sprayPosRef.current.y + offsetY, 1, 1);
          }
        }, 50);
        break;
      case 'fill':
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const fillRgb = hexToRgb(currentColor);
          if (floodFillScanline(imgData, pos.x, pos.y, fillRgb)) {
            ctx.putImageData(imgData, 0, 0);
            saveToHistory();
          }
        } catch (err) {
          console.warn('Fill failed:', err);
        }
        setIsDrawing(false);
        break;
      case 'text': {
        const text = prompt('Enter text:');
        if (text) {
          ctx.font = '20px sans-serif';
          ctx.fillText(text, pos.x, pos.y);
          saveToHistory();
        }
        setIsDrawing(false);
        break;
      }
      case 'picker':
        try {
          const imgData = ctx.getImageData(pos.x, pos.y, 1, 1);
          const pixel = imgData.data;
          const newColor = pixel[3] === 0
            ? '#ffffff'
            : `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
          setCurrentColor(newColor);
        } catch (err) {
          console.warn('Picker failed:', err);
        }
        setIsDrawing(false);
        break;
      default:
        break;
    }
  }, [currentTool, currentColor, getMousePos, saveToHistory]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    switch (currentTool) {
      case 'pencil':
      case 'brush':
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        break;
      case 'eraser':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pos.x - 4, pos.y - 4, 8, 8);
        break;
      case 'spray':
        sprayPosRef.current = pos;
        break;
      default:
        break;
    }
  }, [isDrawing, currentTool, getMousePos]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing && currentTool !== 'spray') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    // Clear spray interval
    if (sprayIntervalRef.current) {
      clearInterval(sprayIntervalRef.current);
      sprayIntervalRef.current = null;
    }

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;

    switch (currentTool) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        saveToHistory();
        break;
      case 'rect':
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        saveToHistory();
        break;
      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(
          (startPos.x + pos.x) / 2,
          (startPos.y + pos.y) / 2,
          Math.abs(pos.x - startPos.x) / 2,
          Math.abs(pos.y - startPos.y) / 2,
          0, 0, 2 * Math.PI
        );
        ctx.stroke();
        saveToHistory();
        break;
      case 'pencil':
      case 'brush':
      case 'eraser':
      case 'spray':
        saveToHistory();
        break;
      default:
        break;
    }

    setIsDrawing(false);
  }, [isDrawing, currentTool, currentColor, startPos, getMousePos, saveToHistory]);

  // Handle resize
  const handleResize = useCallback((direction, e) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = canvasSize.width;
    const startH = canvasSize.height;

    // Save current canvas content
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const onMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const dy = moveE.clientY - startY;

      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) newW = Math.max(50, startW + dx);
      if (direction.includes('s')) newH = Math.max(50, startH + dy);

      setCanvasSize({ width: Math.round(newW), height: Math.round(newH) });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      // Restore canvas content after resize
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        saveToHistory();
      }, 0);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [canvasSize, saveToHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sprayIntervalRef.current) {
        clearInterval(sprayIntervalRef.current);
      }
    };
  }, []);

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      showToolbar={false}
      showAddressBar={false}
      showStatusBar={false}
    >
      <PaintContainer>
        {showToolbox && (
          <Toolbox>
            {TOOLS.map((tool) => (
              <Tool
                key={tool.id}
                $selected={currentTool === tool.id}
                onClick={() => setCurrentTool(tool.id)}
              >
                <img src={tool.icon} alt={tool.id} />
              </Tool>
            ))}
          </Toolbox>
        )}

        <CanvasContainer ref={containerRef}>
          <Canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: canvasSize.width, height: canvasSize.height }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <ResizeHandle
            className="e"
            style={{
              left: canvasSize.width - 4,
              top: canvasSize.height / 2 - 4
            }}
            onMouseDown={(e) => handleResize('e', e)}
          />
          <ResizeHandle
            className="s"
            style={{
              left: canvasSize.width / 2 - 4,
              top: canvasSize.height - 4
            }}
            onMouseDown={(e) => handleResize('s', e)}
          />
          <ResizeHandle
            className="se"
            style={{
              left: canvasSize.width - 4,
              top: canvasSize.height - 4
            }}
            onMouseDown={(e) => handleResize('se', e)}
          />
        </CanvasContainer>

        {showColorBox && (
          <Footer>
            <CurrentColor style={{ background: currentColor }} />
            <ColorPalette>
              {COLORS.map((color, idx) => (
                <ColorSwatch
                  key={idx}
                  style={{ background: color }}
                  $selected={currentColor === color}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </ColorPalette>
          </Footer>
        )}
      </PaintContainer>
    </ProgramLayout>
  );
}

const PaintContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: ${({ $showToolbox }) => $showToolbox !== false ? '56px' : '0'} 1fr;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ece9d8;
`;

const Toolbox = styled.div`
  grid-column: 1;
  grid-row: 1;
  background: #ece9d8;
  border-right: 1px solid #b7b3a4;
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Tool = styled.div`
  width: 36px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-bottom: 2px;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    border: 1px solid #d7d4cb;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
  }

  ${({ $selected }) => $selected && `
    border: 1px solid #839fb4;
    background: rgba(255, 255, 255, 1);
  `}
`;

const CanvasContainer = styled.div`
  grid-column: 2;
  grid-row: 1;
  background: #808080;
  overflow: auto;
  position: relative;
  border: 2px inset #cccccc;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  cursor: crosshair;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #ddd;
  border: 1px solid #999;
  z-index: 60;
  user-select: none;

  &.e { cursor: ew-resize; }
  &.s { cursor: ns-resize; }
  &.se { cursor: nwse-resize; }
`;

const Footer = styled.div`
  grid-column: 1 / -1;
  grid-row: 2;
  background: #ece9d8;
  padding: 8px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-top: 1px solid #b7b3a4;
`;

const CurrentColor = styled.div`
  width: 38px;
  height: 38px;
  border: 2px inset #ccc;
  margin-right: 10px;
  flex-shrink: 0;
`;

const ColorPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 310px;
`;

const ColorSwatch = styled.div`
  width: 16px;
  height: 16px;
  margin: 1px;
  border: 2px inset #ccc;
  cursor: pointer;

  ${({ $selected }) => $selected && `
    border: 2px inset #fff;
  `}
`;

export default Paint;
