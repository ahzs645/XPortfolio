import { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Editor } from '@tinymce/tinymce-react';
import { MenuBar } from '../../../components';
import { useFileSystem } from '../../../contexts/FileSystemContext';
import { useApp } from '../../../contexts/AppContext';
import { docx2html, html2docx } from '../../../lib/docx';
import { withBaseUrl } from '../../../utils/baseUrl';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
`;

const EditorContainer = styled.div`
  flex: 1;
  position: relative;
  background: #6b7280;
  overflow: hidden;

  /* Windows XP Styling for TinyMCE */
  .tox.tox-tinymce {
    border: none !important;
    border-radius: 0 !important;
    height: 100% !important;
  }

  /* Toolbar - XP style */
  .tox .tox-toolbar-overlord,
  .tox .tox-toolbar__primary {
    background: linear-gradient(180deg, #fafbfd 0%, #ebf3fd 50%, #d9e8fb 100%) !important;
    border-bottom: 1px solid #a0b3d6 !important;
  }

  .tox .tox-toolbar__group {
    border-right: 1px solid #c5d4e9 !important;
    padding: 2px 4px !important;
  }

  .tox .tox-toolbar__group:last-child {
    border-right: none !important;
  }

  /* Toolbar buttons - XP 3D style */
  .tox .tox-tbtn {
    background: transparent !important;
    border: 1px solid transparent !important;
    border-radius: 2px !important;
    margin: 1px !important;
    width: 23px !important;
    height: 22px !important;
  }

  .tox .tox-tbtn:hover {
    background: linear-gradient(180deg, #fafbfd 0%, #e2ecfb 50%, #c1d3ec 100%) !important;
    border: 1px solid #316ac5 !important;
    box-shadow: inset 0 0 1px rgba(255,255,255,0.5) !important;
  }

  .tox .tox-tbtn:active,
  .tox .tox-tbtn--enabled,
  .tox .tox-tbtn--enabled:hover {
    background: linear-gradient(180deg, #c1d3ec 0%, #a8c0de 50%, #98b5da 100%) !important;
    border: 1px solid #316ac5 !important;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2) !important;
  }

  .tox .tox-tbtn svg {
    fill: #000 !important;
  }

  /* Split buttons */
  .tox .tox-split-button {
    border: 1px solid transparent !important;
    border-radius: 2px !important;
    margin: 1px !important;
  }

  .tox .tox-split-button:hover {
    border: 1px solid #316ac5 !important;
    box-shadow: none !important;
  }

  .tox .tox-split-button .tox-tbtn {
    border: none !important;
  }

  /* Font/size dropdowns */
  .tox .tox-tbtn--select {
    width: auto !important;
    padding: 0 4px !important;
  }

  /* Status bar - XP style */
  .tox .tox-statusbar {
    background: linear-gradient(180deg, #f5f8fc 0%, #dde8f6 100%) !important;
    border-top: 1px solid #a0b3d6 !important;
    padding: 2px 4px !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
  }

  .tox .tox-statusbar__text-container {
    color: #000 !important;
  }

  .tox .tox-statusbar__path-item {
    color: #000 !important;
  }

  .tox .tox-statusbar__wordcount {
    color: #000 !important;
  }

  /* Edit area */
  .tox .tox-edit-area {
    border: none !important;
  }

  .tox .tox-edit-area__iframe {
    background: #fff !important;
  }

  /* Dropdown menus - XP style */
  .tox .tox-menu {
    background: #fff !important;
    border: 1px solid #666 !important;
    border-radius: 0 !important;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
  }

  .tox .tox-collection__item {
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
    color: #000 !important;
    padding: 4px 20px 4px 24px !important;
  }

  .tox .tox-collection__item--active,
  .tox .tox-collection__item:hover {
    background: #316ac5 !important;
    color: #fff !important;
  }

  .tox .tox-collection__item--active .tox-collection__item-label,
  .tox .tox-collection__item:hover .tox-collection__item-label {
    color: #fff !important;
  }

  .tox .tox-collection__item-icon svg {
    fill: currentColor !important;
  }

  /* Dialog styling - XP style */
  .tox .tox-dialog {
    border: 2px solid #0054e3 !important;
    border-radius: 0 !important;
    box-shadow: 4px 4px 8px rgba(0,0,0,0.4) !important;
  }

  .tox .tox-dialog__header {
    background: linear-gradient(180deg, #0a246a 0%, #0d4bbd 10%, #0054e3 50%, #0054e3 90%, #0d4bbd 100%) !important;
    padding: 4px 6px !important;
    border-radius: 0 !important;
  }

  .tox .tox-dialog__title {
    color: #fff !important;
    font-family: 'Trebuchet MS', 'Tahoma', sans-serif !important;
    font-size: 13px !important;
    font-weight: bold !important;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
  }

  .tox .tox-dialog__header .tox-button {
    background: transparent !important;
    border: none !important;
    color: #fff !important;
  }

  .tox .tox-dialog__body {
    background: #ece9d8 !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
  }

  .tox .tox-dialog__body-content {
    padding: 8px !important;
  }

  .tox .tox-dialog__footer {
    background: #ece9d8 !important;
    border-top: 1px solid #aaa !important;
    padding: 8px !important;
  }

  /* Dialog buttons - XP style */
  .tox .tox-button {
    background: linear-gradient(180deg, #fff 0%, #ece9d8 50%, #d8d4c4 100%) !important;
    border: 1px solid #7a7a7a !important;
    border-radius: 3px !important;
    box-shadow: 0 0 0 1px #fff inset !important;
    color: #000 !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
    padding: 4px 12px !important;
    min-width: 75px !important;
  }

  .tox .tox-button:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff 0%, #f5f3ee 50%, #e8e5da 100%) !important;
    border-color: #316ac5 !important;
  }

  .tox .tox-button:active:not(:disabled) {
    background: linear-gradient(180deg, #d8d4c4 0%, #ece9d8 100%) !important;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2) !important;
  }

  .tox .tox-button--secondary {
    background: linear-gradient(180deg, #fff 0%, #ece9d8 50%, #d8d4c4 100%) !important;
    color: #000 !important;
  }

  .tox .tox-button--naked {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Input fields - XP style */
  .tox .tox-textfield,
  .tox .tox-textarea {
    background: #fff !important;
    border: 1px solid #7f9db9 !important;
    border-radius: 0 !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
    padding: 3px 4px !important;
  }

  .tox .tox-textfield:focus,
  .tox .tox-textarea:focus {
    border-color: #316ac5 !important;
    box-shadow: none !important;
  }

  /* Tabs - XP style */
  .tox .tox-dialog__body-nav-item {
    background: linear-gradient(180deg, #fff 0%, #ece9d8 100%) !important;
    border: 1px solid #aaa !important;
    border-bottom: none !important;
    border-radius: 3px 3px 0 0 !important;
    color: #000 !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
    padding: 4px 12px !important;
    margin-right: 2px !important;
  }

  .tox .tox-dialog__body-nav-item--active {
    background: #ece9d8 !important;
    border-bottom: 1px solid #ece9d8 !important;
    margin-bottom: -1px !important;
  }

  /* Labels */
  .tox .tox-label {
    color: #000 !important;
    font-family: 'Tahoma', sans-serif !important;
    font-size: 11px !important;
  }

  /* Color picker */
  .tox .tox-swatches__picker-btn svg {
    fill: #000 !important;
  }

  /* Slider (More button) arrow */
  .tox .tox-toolbar__group .tox-tbtn[aria-label="More..."] {
    width: 16px !important;
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
    background: linear-gradient(90deg, #0054e3 0%, #4a90d9 50%, #0054e3 100%);
    animation: loading 1.5s infinite ease-in-out;
  }

  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;

const WORD_MENUS = [
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
      { label: 'Print Preview', action: 'view:preview' },
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
      { label: 'Select All\tCtrl+A', action: 'edit:selectAll' },
      { separator: true },
      { label: 'Find and Replace...\tCtrl+H', action: 'edit:find' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Print Preview', action: 'view:preview' },
      { label: 'Full Screen', action: 'view:fullscreen' },
      { separator: true },
      { label: 'Show Blocks', action: 'view:visualBlocks' },
      { label: 'Show Invisible Characters', action: 'view:visualChars' },
      { separator: true },
      { label: 'Source Code', action: 'view:code' },
    ],
  },
  {
    id: 'insert',
    label: 'Insert',
    items: [
      { label: 'Picture...', action: 'insert:image' },
      { label: 'Hyperlink...\tCtrl+K', action: 'insert:link' },
      { label: 'Bookmark...', action: 'insert:anchor' },
      { separator: true },
      { label: 'Table...', action: 'insert:table' },
      { label: 'Horizontal Line', action: 'insert:hr' },
      { label: 'Page Break', action: 'insert:pageBreak' },
      { separator: true },
      { label: 'Special Character...', action: 'insert:charMap' },
      { label: 'Emoji...', action: 'insert:emoji' },
      { label: 'Date and Time...', action: 'insert:dateTime' },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    items: [
      { label: 'Bold\tCtrl+B', action: 'format:bold' },
      { label: 'Italic\tCtrl+I', action: 'format:italic' },
      { label: 'Underline\tCtrl+U', action: 'format:underline' },
      { label: 'Strikethrough', action: 'format:strikethrough' },
      { separator: true },
      { label: 'Superscript', action: 'format:superscript' },
      { label: 'Subscript', action: 'format:subscript' },
      { separator: true },
      { label: 'Align Left', action: 'format:alignLeft' },
      { label: 'Center', action: 'format:alignCenter' },
      { label: 'Align Right', action: 'format:alignRight' },
      { label: 'Justify', action: 'format:alignJustify' },
      { separator: true },
      { label: 'Increase Indent', action: 'format:indent' },
      { label: 'Decrease Indent', action: 'format:outdent' },
      { separator: true },
      { label: 'Bullets', action: 'format:bulletList' },
      { label: 'Numbering', action: 'format:numberList' },
      { separator: true },
      { label: 'Clear Formatting', action: 'format:removeFormat' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Word Count', action: 'tools:wordCount' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    items: [
      { label: 'Microsoft Word Help', disabled: true },
      { separator: true },
      { label: 'About Microsoft Word', disabled: true },
    ],
  },
];

function MicrosoftWord({
  onClose,
  onMinimize,
  // onMaximize - available but not currently used
  onUpdateTitle,
  // File props passed when opening an existing file
  fileData,
  fileName,
  fileId,
}) {
  const { createFile, updateFile, getFileContent } = useFileSystem();
  const { openApp } = useApp();
  const editorRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(fileId || null);
  const [currentFileName, setCurrentFileName] = useState(fileName || null);
  const [initialContent, setInitialContent] = useState('');

  // Update window title
  useEffect(() => {
    if (onUpdateTitle) {
      let title = currentFileName || 'Document';
      if (isDirty) {
        title += ' *';
      }
      title += ' - Microsoft Word';
      onUpdateTitle(title);
    }
  }, [currentFileName, isDirty, onUpdateTitle]);

  // Convert base64/data URL to ArrayBuffer
  const dataUrlToArrayBuffer = useCallback(async (dataUrl) => {
    try {
      let base64 = dataUrl;
      if (dataUrl.includes(',')) {
        base64 = dataUrl.split(',')[1];
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error('Error converting data URL to ArrayBuffer:', error);
      return null;
    }
  }, []);

  // Load initial document from fileData prop
  useEffect(() => {
    const loadDocument = async () => {
      if (fileData) {
        try {
          const arrayBuffer = await dataUrlToArrayBuffer(fileData);
          if (arrayBuffer) {
            const html = await docx2html(arrayBuffer);
            setInitialContent(html);
            // If editor is already loaded, set content directly
            if (editorRef.current) {
              editorRef.current.setContent(html);
            }
          }
        } catch (error) {
          console.error('Error loading DOCX:', error);
        }
      }
    };

    loadDocument();
  }, [fileData, dataUrlToArrayBuffer]);

  // Handle editor initialization
  const handleEditorInit = useCallback((evt, editor) => {
    editorRef.current = editor;
    setIsLoaded(true);

    // If we have initial content waiting, set it now
    if (initialContent) {
      editor.setContent(initialContent);
    }
  }, [initialContent]);

  // Handle editor change (dirty state)
  const handleEditorChange = useCallback(() => {
    if (editorRef.current && !isDirty) {
      setIsDirty(true);
    }
  }, [isDirty]);

  // Handle new document
  const handleNewDocument = useCallback(() => {
    openApp('Microsoft Word');
  }, [openApp]);

  // Handle open file
  const handleOpenFile = useCallback(() => {
    openApp('Open File Dialog', {
      filter: 'docx',
      allowedFilters: ['docx', 'all'],
      onSelect: async (selectedFile) => {
        if (selectedFile) {
          const blob = await getFileContent(selectedFile.id);
          if (blob) {
            const reader = new FileReader();
            reader.onload = async () => {
              const dataUrl = reader.result;
              const arrayBuffer = await dataUrlToArrayBuffer(dataUrl);
              if (arrayBuffer) {
                const html = await docx2html(arrayBuffer);
                if (editorRef.current) {
                  editorRef.current.setContent(html);
                  setCurrentFileId(selectedFile.id);
                  setCurrentFileName(selectedFile.name);
                  setIsDirty(false);
                }
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      },
    });
  }, [openApp, getFileContent, dataUrlToArrayBuffer]);

  // Handle save as
  const handleSaveAs = useCallback(async () => {
    if (!editorRef.current) return;

    try {
      const html = editorRef.current.getContent();
      const blob = await html2docx(html);

      const newFileName = prompt('Save as:', currentFileName || 'Document.docx');
      if (!newFileName) return;

      const finalName = newFileName.endsWith('.docx') ? newFileName : `${newFileName}.docx`;

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
  }, [currentFileName, createFile]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;

    if (!currentFileId) {
      await handleSaveAs();
      return;
    }

    try {
      const html = editorRef.current.getContent();
      const blob = await html2docx(html);

      await updateFile(currentFileId, blob);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }, [currentFileId, updateFile, handleSaveAs]);

  // Execute TinyMCE command
  const execCommand = useCallback((cmd, ui = false, value = undefined) => {
    if (editorRef.current) {
      editorRef.current.execCommand(cmd, ui, value);
    }
  }, []);

  // Handle menu actions
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      // File menu
      case 'file:new':
        handleNewDocument();
        break;
      case 'file:open':
        handleOpenFile();
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

      // Edit menu
      case 'edit:undo':
        execCommand('Undo');
        break;
      case 'edit:redo':
        execCommand('Redo');
        break;
      case 'edit:cut':
        execCommand('Cut');
        break;
      case 'edit:copy':
        execCommand('Copy');
        break;
      case 'edit:paste':
        execCommand('mceInsertClipboardContent');
        break;
      case 'edit:selectAll':
        execCommand('SelectAll');
        break;
      case 'edit:find':
        execCommand('SearchReplace');
        break;

      // View menu
      case 'view:preview':
        execCommand('mcePreview');
        break;
      case 'view:fullscreen':
        execCommand('mceFullScreen');
        break;
      case 'view:visualBlocks':
        execCommand('mceToggleVisualBlocks');
        break;
      case 'view:visualChars':
        execCommand('mceToggleVisualChars');
        break;
      case 'view:code':
        execCommand('mceCodeEditor');
        break;

      // Insert menu
      case 'insert:image':
        execCommand('mceImage');
        break;
      case 'insert:link':
        execCommand('mceLink');
        break;
      case 'insert:anchor':
        execCommand('mceAnchor');
        break;
      case 'insert:table':
        execCommand('mceInsertTable');
        break;
      case 'insert:hr':
        execCommand('InsertHorizontalRule');
        break;
      case 'insert:pageBreak':
        execCommand('mcePageBreak');
        break;
      case 'insert:charMap':
        execCommand('mceShowCharmap');
        break;
      case 'insert:emoji':
        execCommand('mceEmoticons');
        break;
      case 'insert:dateTime':
        execCommand('mceInsertDate');
        break;

      // Format menu
      case 'format:bold':
        execCommand('Bold');
        break;
      case 'format:italic':
        execCommand('Italic');
        break;
      case 'format:underline':
        execCommand('Underline');
        break;
      case 'format:strikethrough':
        execCommand('Strikethrough');
        break;
      case 'format:superscript':
        execCommand('Superscript');
        break;
      case 'format:subscript':
        execCommand('Subscript');
        break;
      case 'format:alignLeft':
        execCommand('JustifyLeft');
        break;
      case 'format:alignCenter':
        execCommand('JustifyCenter');
        break;
      case 'format:alignRight':
        execCommand('JustifyRight');
        break;
      case 'format:alignJustify':
        execCommand('JustifyFull');
        break;
      case 'format:indent':
        execCommand('Indent');
        break;
      case 'format:outdent':
        execCommand('Outdent');
        break;
      case 'format:bulletList':
        execCommand('InsertUnorderedList');
        break;
      case 'format:numberList':
        execCommand('InsertOrderedList');
        break;
      case 'format:removeFormat':
        execCommand('RemoveFormat');
        break;

      // Tools menu
      case 'tools:wordCount':
        execCommand('mceWordCount');
        break;

      default:
        break;
    }
  }, [handleNewDocument, handleOpenFile, handleSave, handleSaveAs, isDirty, onClose, execCommand]);

  // Add keyboard event listener
  useEffect(() => {
    const handleWindowKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'o') {
          e.preventDefault();
          handleOpenFile();
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleSave, handleOpenFile]);

  return (
    <Container>
      <MenuBar
        menus={WORD_MENUS}
        onAction={handleMenuAction}
        windowActions={{ onClose, onMinimize }}
      />
      <EditorContainer>
        {!isLoaded && (
          <LoadingOverlay>
            <LoadingBar />
          </LoadingOverlay>
        )}
        <Editor
          tinymceScriptSrc={withBaseUrl('/html/msword/tinymce/tinymce.min.js')}
          onInit={handleEditorInit}
          onEditorChange={handleEditorChange}
          init={{
            license_key: 'gpl',
            height: '100%',
            menubar: false,
            plugins: 'preview importcss searchreplace autolink autosave directionality code visualblocks visualchars fullscreen image link table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
            toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview | insertfile image link anchor | ltr rtl',
            toolbar_sticky: true,
            autosave_ask_before_unload: false,
            autosave_interval: '30s',
            autosave_prefix: '{path}{query}-{id}-',
            autosave_restore_when_empty: false,
            autosave_retention: '2m',
            image_advtab: false,
            importcss_append: true,
            quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quicktable',
            noneditable_class: 'mceNonEditable',
            toolbar_mode: 'sliding',
            contextmenu: 'link table',
            contextmenu_never_use_native: true,
            quickbars_insert_toolbar: '',
            branding: false,
            promotion: false,
            statusbar: true,
            elementpath: true,
            resize: false,
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px } table { border-spacing: 0; border-collapse: separate; border: 1px solid #000000;} th, td {border: 1px solid #000000;}',
          }}
        />
      </EditorContainer>
    </Container>
  );
}

export default MicrosoftWord;
