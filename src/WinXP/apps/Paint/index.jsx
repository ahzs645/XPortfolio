import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useFileSystem } from '../../../contexts/FileSystemContext';

// Color palette - matches Windows XP Paint
const COLORS = [
  // Row 1 (top)
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000',
  // Row 2 (bottom)
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
  '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040'
];

// Tool definitions - using available icons, with CSS fallbacks for missing ones
const TOOLS = {
  freeSelect: { id: 'freeSelect', name: 'Free-Form Select', icon: null, fallback: '✂' },
  select: { id: 'select', name: 'Select', icon: null, fallback: '⬚' },
  eraser: { id: 'eraser', name: 'Eraser/Color Eraser', icon: '/icons/paint/eraser.webp' },
  fill: { id: 'fill', name: 'Fill With Color', icon: '/icons/paint/fill.webp' },
  picker: { id: 'picker', name: 'Pick Color', icon: '/icons/paint/pipette.webp' },
  magnifier: { id: 'magnifier', name: 'Magnifier', icon: null, fallback: '🔍' },
  pencil: { id: 'pencil', name: 'Pencil', icon: '/icons/paint/pencil.webp' },
  brush: { id: 'brush', name: 'Brush', icon: '/icons/paint/brush.webp' },
  spray: { id: 'spray', name: 'Airbrush', icon: '/icons/paint/spray.webp' },
  text: { id: 'text', name: 'Text', icon: '/icons/paint/text.webp' },
  line: { id: 'line', name: 'Line', icon: '/icons/paint/line.webp' },
  curve: { id: 'curve', name: 'Curve', icon: null, fallback: '⌒' },
  rect: { id: 'rect', name: 'Rectangle', icon: '/icons/paint/rectangle.webp' },
  polygon: { id: 'polygon', name: 'Polygon', icon: null, fallback: '⬡' },
  ellipse: { id: 'ellipse', name: 'Ellipse', icon: '/icons/paint/oval.webp' },
  roundRect: { id: 'roundRect', name: 'Rounded Rectangle', icon: null, fallback: '▢' },
};

// Tool layout for the toolbox (2 columns)
const TOOL_LAYOUT = [
  ['freeSelect', 'select'],
  ['eraser', 'fill'],
  ['picker', 'magnifier'],
  ['pencil', 'brush'],
  ['spray', 'text'],
  ['line', 'curve'],
  ['rect', 'polygon'],
  ['ellipse', 'roundRect'],
];

// Brush shapes
const BRUSH_SHAPES = [
  { shape: 'circle', size: 7 },
  { shape: 'circle', size: 4 },
  { shape: 'circle', size: 1 },
  { shape: 'square', size: 8 },
  { shape: 'square', size: 5 },
  { shape: 'square', size: 2 },
  { shape: 'forward_slash', size: 8 },
  { shape: 'forward_slash', size: 5 },
  { shape: 'forward_slash', size: 2 },
  { shape: 'back_slash', size: 8 },
  { shape: 'back_slash', size: 5 },
  { shape: 'back_slash', size: 2 },
];

// Eraser sizes
const ERASER_SIZES = [4, 6, 8, 10];

// Line widths for shapes
const LINE_WIDTHS = [1, 2, 3, 4, 5];

// Shape fill styles
const SHAPE_STYLES = [
  { stroke: true, fill: false },
  { stroke: true, fill: true },
  { stroke: false, fill: true },
];

// Airbrush sizes
const AIRBRUSH_SIZES = [
  { size: 9, density: 3 },
  { size: 16, density: 5 },
  { size: 24, density: 8 },
];

// Helper functions
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function pixelEquals(data, idx, r, g, b, a) {
  return data[idx] === r && data[idx + 1] === g && data[idx + 2] === b && data[idx + 3] === a;
}

// Flood fill using scanline algorithm
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

// Draw brush shape
function drawBrush(ctx, x, y, shape, size, color) {
  ctx.fillStyle = color;
  const half = size / 2;

  switch (shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, half, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'square':
      ctx.fillRect(x - half, y - half, size, size);
      break;
    case 'forward_slash':
      ctx.beginPath();
      ctx.moveTo(x - half, y + half);
      ctx.lineTo(x + half, y - half);
      ctx.lineWidth = Math.max(1, size / 4);
      ctx.strokeStyle = color;
      ctx.stroke();
      break;
    case 'back_slash':
      ctx.beginPath();
      ctx.moveTo(x - half, y - half);
      ctx.lineTo(x + half, y + half);
      ctx.lineWidth = Math.max(1, size / 4);
      ctx.strokeStyle = color;
      ctx.stroke();
      break;
    default:
      ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}

// Bresenham line algorithm for smooth drawing
function bresenhamLine(x0, y0, x1, y1, callback) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    callback(x0, y0);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

const MAX_HISTORY = 30;

function Paint({ onClose, onMinimize, imagePath, fileId, fileName }) {
  const { saveFileContent } = useFileSystem();

  // Canvas refs
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const didInitCanvasRef = useRef(false);

  // State
  const [currentTool, setCurrentTool] = useState('pencil');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Tool options
  const [brushShape, setBrushShape] = useState(BRUSH_SHAPES[0]);
  const [eraserSize, setEraserSize] = useState(ERASER_SIZES[1]);
  const [lineWidth, setLineWidth] = useState(LINE_WIDTHS[0]);
  const [shapeStyle, setShapeStyle] = useState(SHAPE_STYLES[0]);
  const [airbrushSize, setAirbrushSize] = useState(AIRBRUSH_SIZES[1]);
  const [zoom, setZoom] = useState(1);

  // Spray interval
  const sprayIntervalRef = useRef(null);
  const sprayPosRef = useRef({ x: 0, y: 0 });

  // Curve tool state
  const [curvePoints, setCurvePoints] = useState([]);
  const [curveStage, setCurveStage] = useState(0);

  // Polygon tool state
  const [polygonPoints, setPolygonPoints] = useState([]);

  // File state
  const [currentFileName, setCurrentFileName] = useState(fileName || 'untitled.png');
  const [currentFileId, setCurrentFileId] = useState(fileId || null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI state
  const [showToolbox, setShowToolbox] = useState(true);
  const [showColorBox, setShowColorBox] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // Clear preview canvas
  const clearPreview = useCallback(() => {
    const preview = previewCanvasRef.current;
    if (!preview) return;
    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);
  }, []);

  // Initialize canvas with white background
  useEffect(() => {
    if (didInitCanvasRef.current) return;
    didInitCanvasRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setTimeout(() => saveToHistory(), 0);
  }, [saveToHistory]);

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

    img.src = imagePath;
  }, [imagePath, saveToHistory]);

  // Sync preview canvas size
  useEffect(() => {
    const preview = previewCanvasRef.current;
    if (preview) {
      preview.width = canvasSize.width;
      preview.height = canvasSize.height;
    }
  }, [canvasSize]);

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
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [backgroundColor, saveToHistory]);

  const newCanvas = useCallback(() => {
    setCanvasSize({ width: 640, height: 480 });
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      setHistoryIndex(-1);
      saveToHistory();
      setCurrentFileName('untitled.png');
      setCurrentFileId(null);
    }, 0);
  }, [saveToHistory]);

  const invertColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
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

  const rotate90CW = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    const newWidth = canvas.height;
    const newHeight = canvas.width;

    canvas.width = newWidth;
    canvas.height = newHeight;
    setCanvasSize({ width: newWidth, height: newHeight });

    ctx.save();
    ctx.translate(newWidth, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  const rotate90CCW = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    const newWidth = canvas.height;
    const newHeight = canvas.width;

    canvas.width = newWidth;
    canvas.height = newHeight;
    setCanvasSize({ width: newWidth, height: newHeight });

    ctx.save();
    ctx.translate(0, newHeight);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    saveToHistory();
  }, [saveToHistory]);

  const rotate180 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    ctx.save();
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate(Math.PI);
    ctx.drawImage(tempCanvas, 0, 0);
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

  const handleSaveAs = useCallback(async () => {
    try {
      const blob = await getCanvasBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const name = prompt('Save as:', currentFileName);
      if (!name) {
        URL.revokeObjectURL(url);
        return;
      }

      const finalName = name.endsWith('.png') ? name : `${name}.png`;
      link.download = finalName;
      setCurrentFileName(finalName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('Save As failed:', err);
      alert('Failed to save image.');
    }
  }, [currentFileName, getCanvasBlob]);

  const handleSave = useCallback(async () => {
    try {
      const blob = await getCanvasBlob();

      if (currentFileId) {
        const success = await saveFileContent(currentFileId, blob);
        if (success) {
          alert('Image saved successfully!');
        } else {
          alert('Failed to save image.');
        }
      } else {
        await handleSaveAs();
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save image.');
    }
  }, [currentFileId, getCanvasBlob, saveFileContent, handleSaveAs]);

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
      case 'view:toolbox':
        setShowToolbox(prev => !prev);
        break;
      case 'view:colorbox':
        setShowColorBox(prev => !prev);
        break;
      case 'view:statusbar':
        setShowStatusBar(prev => !prev);
        break;
      case 'view:zoom-normal':
        setZoom(1);
        break;
      case 'view:zoom-large':
        setZoom(4);
        break;
      case 'view:zoom-custom': {
        const zoomVal = prompt('Enter zoom percentage:', String(zoom * 100));
        if (zoomVal) {
          const z = parseInt(zoomVal, 10) / 100;
          if (z >= 0.125 && z <= 8) setZoom(z);
        }
        break;
      }
      case 'image:flip-horizontal':
        flipHorizontal();
        break;
      case 'image:flip-vertical':
        flipVertical();
        break;
      case 'image:rotate-90-cw':
        rotate90CW();
        break;
      case 'image:rotate-90-ccw':
        rotate90CCW();
        break;
      case 'image:rotate-180':
        rotate180();
        break;
      case 'image:invert':
        invertColors();
        break;
      case 'image:clear':
        clearCanvas();
        break;
      case 'image:attributes': {
        const w = prompt('Width:', String(canvasSize.width));
        const h = prompt('Height:', String(canvasSize.height));
        if (w && h) {
          const newW = parseInt(w, 10);
          const newH = parseInt(h, 10);
          if (newW > 0 && newH > 0) {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              setCanvasSize({ width: newW, height: newH });
              setTimeout(() => {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, newW, newH);
                ctx.putImageData(imageData, 0, 0);
                saveToHistory();
              }, 0);
            }
          }
        }
        break;
      }
      case 'colors:edit':
        // Could implement a color picker dialog
        break;
      case 'help:about':
        alert('Windows XP Paint\nA classic paint application.');
        break;
      default:
        break;
    }
  }, [onClose, newCanvas, undo, redo, flipHorizontal, flipVertical, rotate90CW, rotate90CCW, rotate180, invertColors, clearCanvas, handleSave, handleSaveAs, zoom, canvasSize, backgroundColor, saveToHistory]);

  const menus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'file:new', shortcut: 'Ctrl+N' },
        { label: 'Open...', disabled: true, shortcut: 'Ctrl+O' },
        { label: 'Save', action: 'file:save', shortcut: 'Ctrl+S' },
        { label: 'Save As...', action: 'file:save-as' },
        { separator: true },
        { label: 'Print Preview', disabled: true },
        { label: 'Page Setup...', disabled: true },
        { label: 'Print...', disabled: true, shortcut: 'Ctrl+P' },
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
        { label: 'Undo', action: 'edit:undo', disabled: historyIndex <= 0, shortcut: 'Ctrl+Z' },
        { label: 'Repeat', action: 'edit:redo', disabled: historyIndex >= history.length - 1, shortcut: 'Ctrl+Y' },
        { separator: true },
        { label: 'Cut', disabled: true, shortcut: 'Ctrl+X' },
        { label: 'Copy', disabled: true, shortcut: 'Ctrl+C' },
        { label: 'Paste', disabled: true, shortcut: 'Ctrl+V' },
        { label: 'Clear Selection', disabled: true, shortcut: 'Del' },
        { label: 'Select All', disabled: true, shortcut: 'Ctrl+A' },
        { separator: true },
        { label: 'Copy To...', disabled: true },
        { label: 'Paste From...', disabled: true },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: showToolbox ? '✓ Tool Box' : 'Tool Box', action: 'view:toolbox' },
        { label: showColorBox ? '✓ Color Box' : 'Color Box', action: 'view:colorbox' },
        { label: showStatusBar ? '✓ Status Bar' : 'Status Bar', action: 'view:statusbar' },
        { separator: true },
        { label: 'Zoom', submenu: [
          { label: 'Normal Size', action: 'view:zoom-normal' },
          { label: 'Large Size', action: 'view:zoom-large' },
          { label: 'Custom...', action: 'view:zoom-custom' },
        ]},
        { label: 'View Bitmap', disabled: true, shortcut: 'Ctrl+F' },
        { separator: true },
        { label: 'Text Toolbar', disabled: true },
      ],
    },
    {
      id: 'image',
      label: 'Image',
      items: [
        { label: 'Flip/Rotate...', submenu: [
          { label: 'Flip Horizontal', action: 'image:flip-horizontal' },
          { label: 'Flip Vertical', action: 'image:flip-vertical' },
          { separator: true },
          { label: 'Rotate 90° CW', action: 'image:rotate-90-cw' },
          { label: 'Rotate 90° CCW', action: 'image:rotate-90-ccw' },
          { label: 'Rotate 180°', action: 'image:rotate-180' },
        ]},
        { label: 'Stretch/Skew...', disabled: true, shortcut: 'Ctrl+W' },
        { label: 'Invert Colors', action: 'image:invert', shortcut: 'Ctrl+I' },
        { label: 'Attributes...', action: 'image:attributes', shortcut: 'Ctrl+E' },
        { label: 'Clear Image', action: 'image:clear', shortcut: 'Ctrl+Shift+N' },
        { separator: true },
        { label: 'Draw Opaque', disabled: true },
      ],
    },
    {
      id: 'colors',
      label: 'Colors',
      items: [
        { label: 'Edit Colors...', action: 'colors:edit' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', disabled: true, shortcut: 'F1' },
        { separator: true },
        { label: 'About Paint', action: 'help:about' },
      ],
    },
  ], [historyIndex, history.length, showToolbox, showColorBox, showStatusBar]);

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

  // Draw shape preview on preview canvas
  const drawShapePreview = useCallback((pos) => {
    const preview = previewCanvasRef.current;
    if (!preview) return;

    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);

    ctx.strokeStyle = foregroundColor;
    ctx.fillStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);

    switch (currentTool) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;
      case 'rect':
        if (shapeStyle.fill) {
          ctx.fillRect(x, y, w, h);
        }
        if (shapeStyle.stroke) {
          ctx.strokeRect(x, y, w, h);
        }
        break;
      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        if (shapeStyle.fill) ctx.fill();
        if (shapeStyle.stroke) ctx.stroke();
        break;
      case 'roundRect': {
        const radius = Math.min(w, h) / 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (shapeStyle.fill) ctx.fill();
        if (shapeStyle.stroke) ctx.stroke();
        break;
      }
      default:
        break;
    }
  }, [startPos, foregroundColor, backgroundColor, lineWidth, currentTool, shapeStyle]);

  // Draw curve preview
  const drawCurvePreview = useCallback((pos) => {
    const preview = previewCanvasRef.current;
    if (!preview) return;

    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);

    ctx.strokeStyle = foregroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    if (curveStage === 0 && curvePoints.length >= 2) {
      // Draw initial line
      ctx.beginPath();
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      ctx.lineTo(curvePoints[1].x, curvePoints[1].y);
      ctx.stroke();
    } else if (curveStage === 1 && curvePoints.length >= 2) {
      // Draw quadratic curve
      ctx.beginPath();
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      ctx.quadraticCurveTo(pos.x, pos.y, curvePoints[1].x, curvePoints[1].y);
      ctx.stroke();
    } else if (curveStage === 2 && curvePoints.length >= 3) {
      // Draw bezier curve
      ctx.beginPath();
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      ctx.bezierCurveTo(curvePoints[2].x, curvePoints[2].y, pos.x, pos.y, curvePoints[1].x, curvePoints[1].y);
      ctx.stroke();
    }
  }, [curvePoints, curveStage, foregroundColor, lineWidth]);

  // Draw polygon preview
  const drawPolygonPreview = useCallback((pos) => {
    const preview = previewCanvasRef.current;
    if (!preview || polygonPoints.length === 0) return;

    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);

    ctx.strokeStyle = foregroundColor;
    ctx.fillStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
      ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.lineTo(pos.x, pos.y);

    if (shapeStyle.stroke) ctx.stroke();
  }, [polygonPoints, foregroundColor, backgroundColor, lineWidth, shapeStyle]);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    const isRightClick = e.button === 2;
    const color = isRightClick ? backgroundColor : foregroundColor;

    setStartPos(pos);
    setLastPos(pos);
    setIsDrawing(true);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (currentTool) {
      case 'pencil':
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;

      case 'brush':
        drawBrush(ctx, pos.x, pos.y, brushShape.shape, brushShape.size, color);
        break;

      case 'spray': {
        sprayPosRef.current = pos;
        const sprayCfg = airbrushSize;
        sprayIntervalRef.current = setInterval(() => {
          const cx = sprayPosRef.current.x;
          const cy = sprayPosRef.current.y;
          for (let i = 0; i < sprayCfg.density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * sprayCfg.size / 2;
            const px = cx + Math.cos(angle) * radius;
            const py = cy + Math.sin(angle) * radius;
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
          }
        }, 30);
        break;
      }

      case 'fill':
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const fillRgb = hexToRgb(color);
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
          ctx.font = '16px Arial';
          ctx.fillStyle = color;
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
            : rgbToHex(pixel[0], pixel[1], pixel[2]);
          if (isRightClick) {
            setBackgroundColor(newColor);
          } else {
            setForegroundColor(newColor);
          }
        } catch (err) {
          console.warn('Picker failed:', err);
        }
        setIsDrawing(false);
        break;

      case 'eraser':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(pos.x - eraserSize / 2, pos.y - eraserSize / 2, eraserSize, eraserSize);
        break;

      case 'curve':
        if (curveStage === 0) {
          // First click - start the line
          setCurvePoints([pos]);
        } else if (curveStage === 1) {
          // Set first control point
          setCurvePoints(prev => [...prev, pos]);
          setCurveStage(2);
        } else if (curveStage === 2) {
          // Finalize curve
          const pts = [...curvePoints, pos];
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          if (pts.length === 3) {
            ctx.quadraticCurveTo(pts[2].x, pts[2].y, pts[1].x, pts[1].y);
          } else {
            ctx.bezierCurveTo(pts[2].x, pts[2].y, pts[3].x, pts[3].y, pts[1].x, pts[1].y);
          }
          ctx.stroke();
          saveToHistory();
          setCurvePoints([]);
          setCurveStage(0);
          clearPreview();
        }
        setIsDrawing(false);
        break;

      case 'polygon':
        if (polygonPoints.length === 0) {
          setPolygonPoints([pos]);
        } else {
          // Check if clicking near start point to close
          const firstPt = polygonPoints[0];
          const dist = Math.hypot(pos.x - firstPt.x, pos.y - firstPt.y);
          if (dist < 10 && polygonPoints.length >= 3) {
            // Close polygon
            ctx.strokeStyle = color;
            ctx.fillStyle = backgroundColor;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            for (let i = 1; i < polygonPoints.length; i++) {
              ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
            }
            ctx.closePath();
            if (shapeStyle.fill) ctx.fill();
            if (shapeStyle.stroke) ctx.stroke();
            saveToHistory();
            setPolygonPoints([]);
            clearPreview();
          } else {
            setPolygonPoints(prev => [...prev, pos]);
          }
        }
        setIsDrawing(false);
        break;

      case 'magnifier':
        if (isRightClick) {
          setZoom(prev => Math.max(0.125, prev / 2));
        } else {
          setZoom(prev => Math.min(8, prev * 2));
        }
        setIsDrawing(false);
        break;

      case 'select':
      case 'freeSelect':
        // Selection tools would be implemented here
        break;

      default:
        break;
    }
  }, [currentTool, foregroundColor, backgroundColor, getMousePos, saveToHistory, brushShape, eraserSize, airbrushSize, curvePoints, curveStage, polygonPoints, lineWidth, shapeStyle, clearPreview]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(e);
    setMousePos(pos);

    // Update previews for polygon and curve tools
    if (currentTool === 'polygon' && polygonPoints.length > 0) {
      drawPolygonPreview(pos);
    }
    if (currentTool === 'curve' && curveStage > 0) {
      drawCurvePreview(pos);
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext('2d');
    const color = e.buttons === 2 ? backgroundColor : foregroundColor;

    switch (currentTool) {
      case 'pencil':
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setLastPos(pos);
        break;

      case 'brush':
        bresenhamLine(lastPos.x, lastPos.y, pos.x, pos.y, (x, y) => {
          drawBrush(ctx, x, y, brushShape.shape, brushShape.size, color);
        });
        setLastPos(pos);
        break;

      case 'eraser':
        bresenhamLine(lastPos.x, lastPos.y, pos.x, pos.y, (x, y) => {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
        });
        setLastPos(pos);
        break;

      case 'spray':
        sprayPosRef.current = pos;
        break;

      case 'line':
      case 'rect':
      case 'ellipse':
      case 'roundRect':
        drawShapePreview(pos);
        break;

      case 'curve':
        if (curveStage === 0 && curvePoints.length === 1) {
          const preview = previewCanvasRef.current;
          if (preview) {
            const pctx = preview.getContext('2d');
            pctx.clearRect(0, 0, preview.width, preview.height);
            pctx.strokeStyle = foregroundColor;
            pctx.lineWidth = lineWidth;
            pctx.beginPath();
            pctx.moveTo(curvePoints[0].x, curvePoints[0].y);
            pctx.lineTo(pos.x, pos.y);
            pctx.stroke();
          }
        }
        break;

      default:
        break;
    }
  }, [isDrawing, currentTool, foregroundColor, backgroundColor, lastPos, getMousePos, brushShape, eraserSize, drawShapePreview, polygonPoints, curvePoints, curveStage, drawPolygonPreview, drawCurvePreview, lineWidth]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing && !['curve', 'polygon'].includes(currentTool)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    const color = e.button === 2 ? backgroundColor : foregroundColor;

    // Clear spray interval
    if (sprayIntervalRef.current) {
      clearInterval(sprayIntervalRef.current);
      sprayIntervalRef.current = null;
    }

    ctx.strokeStyle = color;
    ctx.fillStyle = backgroundColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);

    switch (currentTool) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        saveToHistory();
        clearPreview();
        break;

      case 'rect':
        if (shapeStyle.fill) {
          ctx.fillRect(x, y, w, h);
        }
        if (shapeStyle.stroke) {
          ctx.strokeStyle = color;
          ctx.strokeRect(x, y, w, h);
        }
        saveToHistory();
        clearPreview();
        break;

      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        if (shapeStyle.fill) ctx.fill();
        if (shapeStyle.stroke) {
          ctx.strokeStyle = color;
          ctx.stroke();
        }
        saveToHistory();
        clearPreview();
        break;

      case 'roundRect': {
        const radius = Math.min(w, h) / 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (shapeStyle.fill) ctx.fill();
        if (shapeStyle.stroke) {
          ctx.strokeStyle = color;
          ctx.stroke();
        }
        saveToHistory();
        clearPreview();
        break;
      }

      case 'curve':
        if (curveStage === 0 && curvePoints.length === 1) {
          setCurvePoints(prev => [...prev, pos]);
          setCurveStage(1);
        }
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
  }, [isDrawing, currentTool, foregroundColor, backgroundColor, startPos, getMousePos, saveToHistory, lineWidth, shapeStyle, clearPreview, curvePoints, curveStage]);

  // Handle resize
  const handleResize = useCallback((direction, e) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = canvasSize.width;
    const startH = canvasSize.height;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const onMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const dy = moveE.clientY - startY;

      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) newW = Math.max(1, startW + dx / zoom);
      if (direction.includes('s')) newH = Math.max(1, startH + dy / zoom);

      setCanvasSize({ width: Math.round(newW), height: Math.round(newH) });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        saveToHistory();
      }, 0);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [canvasSize, zoom, backgroundColor, saveToHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sprayIntervalRef.current) {
        clearInterval(sprayIntervalRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        // Cancel current operation
        if (curvePoints.length > 0) {
          setCurvePoints([]);
          setCurveStage(0);
          clearPreview();
        }
        if (polygonPoints.length > 0) {
          setPolygonPoints([]);
          clearPreview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, curvePoints, polygonPoints, clearPreview]);

  // Render tool options based on current tool
  const renderToolOptions = () => {
    switch (currentTool) {
      case 'brush':
        return (
          <ToolOptionsGrid $cols={3}>
            {BRUSH_SHAPES.map((b, idx) => (
              <BrushOption
                key={idx}
                $selected={brushShape === b}
                onClick={() => setBrushShape(b)}
              >
                <BrushPreview $shape={b.shape} $size={b.size} />
              </BrushOption>
            ))}
          </ToolOptionsGrid>
        );

      case 'eraser':
        return (
          <ToolOptionsColumn>
            {ERASER_SIZES.map((size) => (
              <EraserOption
                key={size}
                $selected={eraserSize === size}
                onClick={() => setEraserSize(size)}
              >
                <EraserPreview $size={size} />
              </EraserOption>
            ))}
          </ToolOptionsColumn>
        );

      case 'line':
        return (
          <ToolOptionsColumn>
            {LINE_WIDTHS.map((w) => (
              <LineWidthOption
                key={w}
                $selected={lineWidth === w}
                onClick={() => setLineWidth(w)}
              >
                <LinePreview $width={w} />
              </LineWidthOption>
            ))}
          </ToolOptionsColumn>
        );

      case 'rect':
      case 'ellipse':
      case 'roundRect':
      case 'polygon':
        return (
          <ToolOptionsColumn>
            {SHAPE_STYLES.map((style, idx) => (
              <ShapeStyleOption
                key={idx}
                $selected={shapeStyle === style}
                onClick={() => setShapeStyle(style)}
              >
                <ShapeStylePreview $stroke={style.stroke} $fill={style.fill} />
              </ShapeStyleOption>
            ))}
          </ToolOptionsColumn>
        );

      case 'spray':
        return (
          <ToolOptionsColumn>
            {AIRBRUSH_SIZES.map((cfg, idx) => (
              <AirbrushOption
                key={idx}
                $selected={airbrushSize === cfg}
                onClick={() => setAirbrushSize(cfg)}
              >
                <AirbrushPreview $size={cfg.size} />
              </AirbrushOption>
            ))}
          </ToolOptionsColumn>
        );

      case 'magnifier':
        return (
          <ToolOptionsColumn>
            <ZoomLabel>{Math.round(zoom * 100)}%</ZoomLabel>
          </ToolOptionsColumn>
        );

      default:
        return null;
    }
  };

  // Handle color click (left = foreground, right = background)
  const handleColorClick = useCallback((color, e) => {
    e.preventDefault();
    if (e.button === 2 || e.type === 'contextmenu') {
      setBackgroundColor(color);
    } else {
      setForegroundColor(color);
    }
  }, []);

  // Swap colors
  const swapColors = useCallback(() => {
    setForegroundColor(backgroundColor);
    setBackgroundColor(foregroundColor);
  }, [foregroundColor, backgroundColor]);

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
            <ToolGrid>
              {TOOL_LAYOUT.map((row, rowIdx) => (
                <React.Fragment key={rowIdx}>
                  {row.map((toolId) => {
                    const tool = TOOLS[toolId];
                    return (
                      <Tool
                        key={tool.id}
                        $selected={currentTool === tool.id}
                        onClick={() => setCurrentTool(tool.id)}
                        title={tool.name}
                      >
                        {tool.icon ? (
                          <ToolIcon src={tool.icon} alt={tool.name} />
                        ) : (
                          <ToolFallback>{tool.fallback}</ToolFallback>
                        )}
                      </Tool>
                    );
                  })}
                </React.Fragment>
              ))}
            </ToolGrid>
            <ToolOptions>
              {renderToolOptions()}
            </ToolOptions>
          </Toolbox>
        )}

        <CanvasArea $showToolbox={showToolbox} $showColorBox={showColorBox} $showStatusBar={showStatusBar}>
          <CanvasContainer ref={containerRef}>
            <CanvasWrapper style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <Canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
              />
              <PreviewCanvas
                ref={previewCanvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            </CanvasWrapper>
            <ResizeHandle
              className="e"
              style={{
                left: canvasSize.width * zoom - 3,
                top: (canvasSize.height * zoom) / 2 - 3
              }}
              onMouseDown={(e) => handleResize('e', e)}
            />
            <ResizeHandle
              className="s"
              style={{
                left: (canvasSize.width * zoom) / 2 - 3,
                top: canvasSize.height * zoom - 3
              }}
              onMouseDown={(e) => handleResize('s', e)}
            />
            <ResizeHandle
              className="se"
              style={{
                left: canvasSize.width * zoom - 3,
                top: canvasSize.height * zoom - 3
              }}
              onMouseDown={(e) => handleResize('se', e)}
            />
          </CanvasContainer>
        </CanvasArea>

        {showColorBox && (
          <ColorBoxContainer $showToolbox={showToolbox} $showStatusBar={showStatusBar}>
            <CurrentColors onClick={swapColors} title="Click to swap colors">
              <BackgroundColorBox style={{ backgroundColor }} />
              <ForegroundColorBox style={{ backgroundColor: foregroundColor }} />
            </CurrentColors>
            <ColorPalette>
              {COLORS.map((color, idx) => (
                <ColorSwatch
                  key={idx}
                  style={{ backgroundColor: color }}
                  $selected={foregroundColor === color || backgroundColor === color}
                  onClick={(e) => handleColorClick(color, e)}
                  onContextMenu={(e) => handleColorClick(color, e)}
                  title={`Left click: foreground\nRight click: background`}
                />
              ))}
            </ColorPalette>
          </ColorBoxContainer>
        )}

        {showStatusBar && (
          <StatusBar>
            <StatusSection>
              {TOOLS[currentTool]?.name || 'Ready'}
            </StatusSection>
            <StatusSection>
              {mousePos.x}, {mousePos.y}px
            </StatusSection>
            <StatusSection>
              {canvasSize.width} x {canvasSize.height}
            </StatusSection>
          </StatusBar>
        )}
      </PaintContainer>
    </ProgramLayout>
  );
}

// Styled Components
const PaintContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ece9d8;
`;

const Toolbox = styled.div`
  position: absolute;
  left: 2px;
  top: 2px;
  width: 52px;
  background: #ece9d8;
  border: 1px solid #aca899;
  box-shadow: inset 1px 1px 0 #fff;
  z-index: 10;
  display: flex;
  flex-direction: column;
`;

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 2px;
  border-bottom: 1px solid #aca899;
`;

const Tool = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #aca899;
    background: linear-gradient(180deg, #fff 0%, #ece9d8 100%);
  }

  ${({ $selected }) => $selected && `
    border: 1px solid #aca899;
    background: #c1d2ee;
    box-shadow: inset 1px 1px 0 #708db7;
  `}
`;

const ToolIcon = styled.img`
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
`;

const ToolFallback = styled.span`
  font-size: 12px;
  line-height: 1;
  color: #000;
`;

const ToolOptions = styled.div`
  padding: 4px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ToolOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols || 3}, 1fr);
  gap: 1px;
`;

const ToolOptionsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

const BrushOption = styled.div`
  width: 14px;
  height: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  background: ${({ $selected }) => $selected ? '#c1d2ee' : 'transparent'};

  &:hover {
    border: 1px solid #aca899;
  }
`;

const BrushPreview = styled.div`
  width: ${({ $size }) => Math.min($size, 8)}px;
  height: ${({ $size }) => Math.min($size, 8)}px;
  background: #000;
  border-radius: ${({ $shape }) => $shape === 'circle' ? '50%' : '0'};
  transform: ${({ $shape }) =>
    $shape === 'forward_slash' ? 'rotate(45deg) scaleX(0.3)' :
    $shape === 'back_slash' ? 'rotate(-45deg) scaleX(0.3)' : 'none'
  };
`;

const EraserOption = styled.div`
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#c1d2ee' : 'transparent'};
  border: 1px solid ${({ $selected }) => $selected ? '#aca899' : 'transparent'};
`;

const EraserPreview = styled.div`
  width: ${({ $size }) => Math.min($size, 12)}px;
  height: ${({ $size }) => Math.min($size, 12)}px;
  background: #000;
`;

const LineWidthOption = styled.div`
  height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#c1d2ee' : 'transparent'};
  border: 1px solid ${({ $selected }) => $selected ? '#aca899' : 'transparent'};
`;

const LinePreview = styled.div`
  width: 30px;
  height: ${({ $width }) => $width}px;
  background: #000;
`;

const ShapeStyleOption = styled.div`
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#c1d2ee' : 'transparent'};
  border: 1px solid ${({ $selected }) => $selected ? '#aca899' : 'transparent'};
`;

const ShapeStylePreview = styled.div`
  width: 28px;
  height: 14px;
  border: ${({ $stroke }) => $stroke ? '2px solid #000' : 'none'};
  background: ${({ $fill }) => $fill ? '#808080' : 'transparent'};
`;

const AirbrushOption = styled.div`
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#c1d2ee' : 'transparent'};
  border: 1px solid ${({ $selected }) => $selected ? '#aca899' : 'transparent'};
`;

const AirbrushPreview = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%);
`;

const ZoomLabel = styled.div`
  font-size: 10px;
  text-align: center;
  color: #000;
`;

const CanvasArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  margin-left: ${({ $showToolbox }) => $showToolbox ? '56px' : '0'};
  margin-bottom: ${({ $showColorBox, $showStatusBar }) =>
    ($showColorBox ? 38 : 0) + ($showStatusBar ? 22 : 0)}px;
`;

const CanvasContainer = styled.div`
  flex: 1;
  background: #808080;
  overflow: auto;
  position: relative;
  padding: 4px;
`;

const CanvasWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Canvas = styled.canvas`
  background: #fff;
  cursor: crosshair;
  display: block;
`;

const PreviewCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const ResizeHandle = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #000080;
  z-index: 60;
  user-select: none;

  &.e { cursor: ew-resize; }
  &.s { cursor: ns-resize; }
  &.se { cursor: nwse-resize; }
`;

const ColorBoxContainer = styled.div`
  position: absolute;
  left: ${({ $showToolbox }) => $showToolbox ? '56px' : '2px'};
  bottom: ${({ $showStatusBar }) => $showStatusBar ? '22px' : '2px'};
  right: 2px;
  height: 36px;
  background: #ece9d8;
  border-top: 1px solid #aca899;
  display: flex;
  align-items: center;
  padding: 0 4px;
`;

const CurrentColors = styled.div`
  position: relative;
  width: 28px;
  height: 28px;
  margin-right: 4px;
  cursor: pointer;
`;

const ForegroundColorBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  border: 1px solid #000;
  box-shadow: 1px 1px 0 #fff;
  z-index: 2;
`;

const BackgroundColorBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border: 1px solid #000;
  box-shadow: 1px 1px 0 #fff;
  z-index: 1;
`;

const ColorPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 32px;
  align-content: flex-start;
`;

const ColorSwatch = styled.div`
  width: 16px;
  height: 16px;
  border: 1px solid #808080;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    border-color: #000;
  }

  ${({ $selected }) => $selected && `
    border: 1px solid #fff;
    outline: 1px solid #000;
  `}
`;

const StatusBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20px;
  background: #ece9d8;
  border-top: 1px solid #aca899;
  display: flex;
  align-items: center;
  padding: 0 4px;
  font-size: 11px;
`;

const StatusSection = styled.div`
  padding: 0 8px;
  border-right: 1px solid #aca899;

  &:last-child {
    border-right: none;
  }
`;

export default Paint;
