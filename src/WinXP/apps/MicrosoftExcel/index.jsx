import { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import * as XLSX from 'xlsx';
import { MenuBar } from '../../../components';
import { useFileSystem } from '../../../contexts/FileSystemContext';
import { useApp } from '../../../contexts/AppContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
`;

const SpreadsheetContainer = styled.div`
  flex: 1;
  position: relative;
  background: #fff;
  overflow: hidden;

  /* Fortune Sheet XP styling overrides */
  .fortune-container {
    font-family: Tahoma, Arial, sans-serif !important;
  }

  .fortune-sheet-container {
    background: #d4d0c8 !important;
  }

  /* Toolbar styling */
  .fortune-toolbar {
    background: linear-gradient(180deg, #fafbfd 0%, #ebf3fd 50%, #d9e8fb 100%) !important;
    border-bottom: 1px solid #a0b3d6 !important;
  }

  .fortune-toolbar-button {
    border-radius: 2px !important;
  }

  .fortune-toolbar-button:hover {
    background: linear-gradient(180deg, #fafbfd 0%, #e2ecfb 50%, #c1d3ec 100%) !important;
    border: 1px solid #316ac5 !important;
  }

  /* Cell area */
  .fortune-sheet-area {
    background: #fff !important;
  }

  /* Sheet tabs */
  .fortune-sheet-tab {
    background: linear-gradient(180deg, #fff 0%, #ece9d8 100%) !important;
    border: 1px solid #aaa !important;
  }

  .fortune-sheet-tab.active {
    background: #fff !important;
  }

  /* Context menu */
  .fortune-context-menu {
    background: #fff !important;
    border: 1px solid #666 !important;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
  }

  .fortune-context-menu-item:hover {
    background: #316ac5 !important;
    color: #fff !important;
  }

  /* Input box */
  .fortune-cell-input {
    font-family: Tahoma, Arial, sans-serif !important;
  }

  /* Formula bar */
  .fortune-formula-bar {
    background: #fff !important;
    border-bottom: 1px solid #a0b3d6 !important;
  }

  /* Dialog styling */
  .fortune-modal {
    border: 2px solid #0054e3 !important;
    border-radius: 0 !important;
  }

  .fortune-modal-header {
    background: linear-gradient(180deg, #0a246a 0%, #0d4bbd 10%, #0054e3 50%, #0054e3 90%, #0d4bbd 100%) !important;
    color: #fff !important;
  }

  .fortune-modal-body {
    background: #ece9d8 !important;
  }

  .fortune-modal-footer {
    background: #ece9d8 !important;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6b7280;
  z-index: 10;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 20px;
  border: 2px solid #003c74;
  border-radius: 3px;
  overflow: hidden;
  background: #fff;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, #217346 0%, #33a867 50%, #217346 100%);
    animation: loading 1.5s infinite ease-in-out;
  }

  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;

const EXCEL_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'New', action: 'file:new' },
      { label: 'Open...', action: 'file:open' },
      { separator: true },
      { label: 'Save', action: 'file:save' },
      { label: 'Save As...', action: 'file:saveAs' },
      { separator: true },
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { label: 'Undo\tCtrl+Z', action: 'edit:undo' },
      { label: 'Redo\tCtrl+Y', action: 'edit:redo' },
      { separator: true },
      { label: 'Cut\tCtrl+X', action: 'edit:cut' },
      { label: 'Copy\tCtrl+C', action: 'edit:copy' },
      { label: 'Paste\tCtrl+V', action: 'edit:paste' },
      { separator: true },
      { label: 'Select All\tCtrl+A', disabled: true },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Freeze Panes', action: 'view:freezePanes' },
      { separator: true },
      { label: 'Zoom In', action: 'view:zoomIn' },
      { label: 'Zoom Out', action: 'view:zoomOut' },
      { label: 'Reset Zoom', action: 'view:zoomReset' },
    ],
  },
  {
    id: 'insert',
    label: 'Insert',
    items: [
      { label: 'Rows', action: 'insert:row' },
      { label: 'Columns', action: 'insert:column' },
      { separator: true },
      { label: 'Sheet', action: 'insert:sheet' },
      { separator: true },
      { label: 'Chart...', disabled: true },
      { label: 'Image...', disabled: true },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    items: [
      { label: 'Bold\tCtrl+B', action: 'format:bold' },
      { label: 'Italic\tCtrl+I', action: 'format:italic' },
      { label: 'Underline\tCtrl+U', action: 'format:underline' },
      { separator: true },
      { label: 'Align Left', action: 'format:alignLeft' },
      { label: 'Center', action: 'format:alignCenter' },
      { label: 'Align Right', action: 'format:alignRight' },
      { separator: true },
      { label: 'Number Format...', disabled: true },
      { label: 'Cell Style...', disabled: true },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Sort...', action: 'tools:sort' },
      { label: 'Filter', action: 'tools:filter' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Microsoft Excel Help', disabled: true },
      { separator: true },
      { label: 'About Microsoft Excel', disabled: true },
    ],
  },
];

// Convert XLSX workbook to Fortune Sheet format
function xlsxToFortuneSheet(workbook) {
  const sheets = [];

  workbook.SheetNames.forEach((sheetName, index) => {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    const celldata = [];

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];

        if (cell) {
          const cellData = {
            r,
            c,
            v: {
              v: cell.v,
              m: cell.w || String(cell.v || ''),
            }
          };

          // Handle formulas
          if (cell.f) {
            cellData.v.f = '=' + cell.f;
          }

          // Handle cell type
          if (cell.t === 'n') {
            cellData.v.ct = { fa: 'General', t: 'n' };
          } else if (cell.t === 's') {
            cellData.v.ct = { fa: 'General', t: 's' };
          }

          celldata.push(cellData);
        }
      }
    }

    sheets.push({
      name: sheetName,
      index,
      status: index === 0 ? 1 : 0,
      order: index,
      celldata,
      row: Math.max(range.e.r + 1, 100),
      column: Math.max(range.e.c + 1, 26),
    });
  });

  return sheets.length > 0 ? sheets : [createEmptySheet()];
}

// Convert Fortune Sheet format to XLSX workbook
function fortuneSheetToXlsx(sheets) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const data = [];
    const maxRow = sheet.row || 100;
    const maxCol = sheet.column || 26;

    // Initialize empty rows
    for (let r = 0; r < maxRow; r++) {
      data[r] = [];
      for (let c = 0; c < maxCol; c++) {
        data[r][c] = null;
      }
    }

    // Fill in cell data
    if (sheet.celldata) {
      sheet.celldata.forEach((cell) => {
        if (cell && cell.v !== undefined && cell.v !== null) {
          const value = cell.v.v !== undefined ? cell.v.v : cell.v;
          if (data[cell.r]) {
            data[cell.r][cell.c] = value;
          }
        }
      });
    }

    // Also check data array format (used by Fortune Sheet internally)
    if (sheet.data) {
      sheet.data.forEach((row, r) => {
        if (row) {
          row.forEach((cell, c) => {
            if (cell && cell.v !== undefined && cell.v !== null) {
              if (!data[r]) data[r] = [];
              data[r][c] = cell.v;
            }
          });
        }
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Sheet1');
  });

  return workbook;
}

// Create empty sheet
function createEmptySheet(name = 'Sheet1', index = 0) {
  return {
    name,
    index,
    status: 1,
    order: index,
    celldata: [],
    row: 100,
    column: 26,
  };
}

function MicrosoftExcel({
  onClose,
  onMinimize,
  onMaximize,
  onUpdateTitle,
  fileData,
  fileName,
  fileId,
}) {
  const { createFile, updateFile, getFileContent } = useFileSystem();
  const { openApp } = useApp();
  const workbookRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(fileId || null);
  const [currentFileName, setCurrentFileName] = useState(fileName || null);
  const [sheets, setSheets] = useState([createEmptySheet()]);
  const [zoom, setZoom] = useState(100);

  // Update window title
  useEffect(() => {
    if (onUpdateTitle) {
      let title = currentFileName || 'Book1';
      if (isDirty) {
        title += ' *';
      }
      title += ' - Microsoft Excel';
      onUpdateTitle(title);
    }
  }, [currentFileName, isDirty, onUpdateTitle]);

  // Load initial file
  useEffect(() => {
    const loadFile = async () => {
      if (fileData) {
        try {
          let base64 = fileData;
          if (fileData.includes(',')) {
            base64 = fileData.split(',')[1];
          }

          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const workbook = XLSX.read(bytes, { type: 'array' });
          const fortuneSheets = xlsxToFortuneSheet(workbook);
          setSheets(fortuneSheets);
        } catch (error) {
          console.error('Error loading Excel file:', error);
        }
      }
      setIsLoaded(true);
    };

    loadFile();
  }, [fileData]);

  // Handle sheet change
  const handleSheetChange = useCallback((data) => {
    if (!isDirty) {
      setIsDirty(true);
    }
  }, [isDirty]);

  // Handle new workbook
  const handleNew = useCallback(() => {
    openApp('Microsoft Excel');
  }, [openApp]);

  // Handle open file
  const handleOpen = useCallback(() => {
    openApp('Open File Dialog', {
      filter: 'xlsx',
      allowedFilters: ['xlsx', 'all'],
      onSelect: async (selectedFile) => {
        if (selectedFile) {
          const blob = await getFileContent(selectedFile.id);
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const arrayBuffer = reader.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const fortuneSheets = xlsxToFortuneSheet(workbook);
                setSheets(fortuneSheets);
                setCurrentFileId(selectedFile.id);
                setCurrentFileName(selectedFile.name);
                setIsDirty(false);
              } catch (error) {
                console.error('Error reading Excel file:', error);
              }
            };
            reader.readAsArrayBuffer(blob);
          }
        }
      },
    });
  }, [openApp, getFileContent]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!currentFileId) {
      await handleSaveAs();
      return;
    }

    try {
      const currentSheets = workbookRef.current?.getAllSheets() || sheets;
      const workbook = fortuneSheetToXlsx(currentSheets);
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      await updateFile(currentFileId, blob);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [currentFileId, sheets, updateFile]);

  // Handle save as
  const handleSaveAs = useCallback(async () => {
    try {
      const currentSheets = workbookRef.current?.getAllSheets() || sheets;
      const workbook = fortuneSheetToXlsx(currentSheets);
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const newFileName = prompt('Save as:', currentFileName || 'Book1.xlsx');
      if (!newFileName) return;

      const finalName = newFileName.endsWith('.xlsx') ? newFileName : `${newFileName}.xlsx`;

      const newFileId = await createFile({
        name: finalName,
        content: blob,
        parentId: 'my-documents',
        type: 'file',
      });

      if (newFileId) {
        setCurrentFileId(newFileId);
        setCurrentFileName(finalName);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [currentFileName, sheets, createFile]);

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    const api = workbookRef.current;

    switch (action) {
      case 'file:new':
        handleNew();
        break;
      case 'file:open':
        handleOpen();
        break;
      case 'file:save':
        handleSave();
        break;
      case 'file:saveAs':
        handleSaveAs();
        break;
      case 'exitProgram':
        if (isDirty) {
          const shouldSave = window.confirm('Do you want to save changes before closing?');
          if (shouldSave) {
            handleSave().then(() => onClose?.());
          } else {
            onClose?.();
          }
        } else {
          onClose?.();
        }
        break;

      // Edit actions
      case 'edit:undo':
        api?.undo();
        break;
      case 'edit:redo':
        api?.redo();
        break;
      case 'edit:cut':
        // Use browser clipboard API
        document.execCommand('cut');
        break;
      case 'edit:copy':
        document.execCommand('copy');
        break;
      case 'edit:paste':
        document.execCommand('paste');
        break;

      // View actions
      case 'view:freezePanes':
        api?.setFrozen(true);
        break;
      case 'view:zoomIn':
        setZoom(prev => Math.min(prev + 10, 200));
        break;
      case 'view:zoomOut':
        setZoom(prev => Math.max(prev - 10, 50));
        break;
      case 'view:zoomReset':
        setZoom(100);
        break;

      // Insert actions
      case 'insert:row':
        api?.insertRow();
        break;
      case 'insert:column':
        api?.insertColumn();
        break;
      case 'insert:sheet':
        api?.addSheet();
        break;

      // Format actions
      case 'format:bold':
        api?.setCellStyle({ bl: 1 });
        break;
      case 'format:italic':
        api?.setCellStyle({ it: 1 });
        break;
      case 'format:underline':
        api?.setCellStyle({ un: 1 });
        break;
      case 'format:alignLeft':
        api?.setCellStyle({ ht: 1 });
        break;
      case 'format:alignCenter':
        api?.setCellStyle({ ht: 0 });
        break;
      case 'format:alignRight':
        api?.setCellStyle({ ht: 2 });
        break;

      // Tools actions
      case 'tools:sort':
        api?.sort();
        break;
      case 'tools:filter':
        api?.setAutoFilter();
        break;

      default:
        break;
    }
  }, [handleNew, handleOpen, handleSave, handleSaveAs, isDirty, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'o') {
          e.preventDefault();
          handleOpen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleOpen]);

  return (
    <Container>
      <MenuBar
        menus={EXCEL_MENUS}
        onAction={handleMenuAction}
        windowActions={{ onClose, onMinimize }}
      />
      <SpreadsheetContainer style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
        {!isLoaded ? (
          <LoadingOverlay>
            <LoadingBar />
          </LoadingOverlay>
        ) : (
          <Workbook
            ref={workbookRef}
            data={sheets}
            onChange={handleSheetChange}
            lang="en"
            showToolbar={true}
            showFormulaBar={true}
            showSheetTabs={true}
            allowEdit={true}
          />
        )}
      </SpreadsheetContainer>
    </Container>
  );
}

export default MicrosoftExcel;
