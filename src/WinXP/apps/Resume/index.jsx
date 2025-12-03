import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../../contexts/ConfigContext';
import { ProgramLayout } from '../../../components';

const PDFJS_VERSION = '3.11.174';
const PDFJS_BASE = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build`;

// Menu configuration for Resume window
const RESUME_MENUS = [
  {
    id: 'file',
    label: 'File',
    items: [
      { label: 'Print', action: 'print' },
      { label: 'Download', action: 'download' },
      { separator: true },
      { label: 'Exit', action: 'exitProgram' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { label: 'Zoom In', action: 'zoomIn' },
      { label: 'Zoom Out', action: 'zoomOut' },
      { label: 'Fit to Window', action: 'fitToWindow' },
      { separator: true },
      { label: 'Maximize', action: 'maximizeWindow' },
      { label: 'Minimize', action: 'minimizeWindow' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    disabled: true,
  },
];

function Resume({ onClose, onMinimize, onMaximize, isFocus }) {
  const { getCVPDFUrl, getPDFDisplayMode, shouldUsePDFJS } = useConfig();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scaleMode, setScaleMode] = useState('fit'); // 'fit' or 'zoomed'
  const [pdfDoc, setPdfDoc] = useState(null);
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const displayMode = getPDFDisplayMode();
  const usePdfJs = shouldUsePDFJS();

  // Handle non-embed display modes
  useEffect(() => {
    const pdfUrl = getCVPDFUrl();

    if (displayMode === 'download') {
      // Trigger download and close
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose?.();
    } else if (displayMode === 'new_tab') {
      // Open in new tab and close
      window.open(pdfUrl, '_blank');
      onClose?.();
    }
  }, [displayMode, getCVPDFUrl, onClose]);

  // Load PDF.js library (only if using embed mode with PDF.js)
  useEffect(() => {
    // Skip if not embed mode or not using PDF.js
    if (displayMode !== 'embed') return;

    let cancelled = false;

    async function loadPdfJs() {
      if (window.pdfjsLib) return window.pdfjsLib;

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${PDFJS_BASE}/pdf.min.js`;
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
            resolve(window.pdfjsLib);
          } else {
            reject(new Error('PDF.js failed to load'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load PDF.js script'));
        document.head.appendChild(script);
      });
    }

    async function loadPdf() {
      // If not using PDF.js, use native iframe embed
      if (!usePdfJs) {
        setIsLoading(false);
        return;
      }

      try {
        const pdfjs = await loadPdfJs();
        const pdfUrl = getCVPDFUrl();

        // First check if the PDF exists
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`PDF not found at ${pdfUrl}. Please add your CV.pdf to the public folder.`);
        }

        const doc = await pdfjs.getDocument(pdfUrl).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (!cancelled) {
          // Provide helpful error message
          let errorMsg = err.message || 'Failed to load PDF';
          if (err.name === 'InvalidPDFException') {
            errorMsg = 'The PDF file is invalid or corrupted. Please check your CV.pdf file.';
          } else if (errorMsg.includes('not found')) {
            errorMsg = 'Resume PDF not found. Please add CV.pdf to your public folder.';
          }
          setError(errorMsg);
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [getCVPDFUrl, displayMode, usePdfJs]);

  // Render PDF pages
  const renderPages = useCallback(async () => {
    if (!pdfDoc || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    container.innerHTML = '';

    try {
      // Get first page to calculate scale
      const firstPage = await pdfDoc.getPage(1);
      const probeViewport = firstPage.getViewport({ scale: 1.0 });

      // Calculate fit scale based on container width
      const containerStyle = getComputedStyle(container);
      const paddingX = (parseFloat(containerStyle.paddingLeft) || 0) +
                       (parseFloat(containerStyle.paddingRight) || 0);
      const availableWidth = container.clientWidth - paddingX;
      const fitScale = Math.min(availableWidth / probeViewport.width, 3);
      const baseScale = fitScale > 0 ? fitScale : 1.0;
      const currentScale = scaleMode === 'fit' ? baseScale : baseScale * 1.5;

      // Render all pages
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: currentScale });

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        const ctx = canvas.getContext('2d');

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        container.appendChild(canvas);

        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;
      }
    } catch (err) {
      console.error('Failed to render PDF pages:', err);
    }
  }, [pdfDoc, scaleMode]);

  // Re-render on pdf load or scale change
  useEffect(() => {
    renderPages();
  }, [renderPages]);

  // Re-render on window resize (only in fit mode)
  useEffect(() => {
    if (scaleMode !== 'fit') return;

    const handleResize = () => {
      renderPages();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scaleMode, renderPages]);

  const toggleZoom = useCallback(() => {
    setScaleMode((prev) => (prev === 'fit' ? 'zoomed' : 'fit'));
  }, []);

  const handlePrint = useCallback(() => {
    const pdfUrl = getCVPDFUrl();
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  }, [getCVPDFUrl]);

  const handleDownload = useCallback(() => {
    const pdfUrl = getCVPDFUrl();
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getCVPDFUrl]);

  const handleToolbarAction = useCallback((action) => {
    switch (action) {
      case 'print':
        handlePrint();
        break;
      case 'download':
        handleDownload();
        break;
      case 'zoomIn':
        setScaleMode('zoomed');
        break;
      case 'zoomOut':
      case 'fitToWindow':
        setScaleMode('fit');
        break;
      default:
        break;
    }
  }, [handlePrint, handleDownload]);

  // Toolbar configuration for Resume window
  const toolbarItems = [
    { type: 'button', id: 'print', icon: '/gui/toolbar/print.webp', label: 'Print', action: 'print' },
    { type: 'button', id: 'download', icon: '/gui/toolbar/save.webp', label: 'Download', action: 'download' },
    { type: 'separator' },
    { type: 'button', id: 'zoomIn', icon: '/gui/toolbar/search.webp', label: 'Zoom In', action: 'zoomIn' },
    { type: 'button', id: 'zoomOut', icon: '/gui/toolbar/views.webp', label: 'Zoom Out', action: 'zoomOut' },
  ];

  if (isLoading) {
    return (
      <ProgramLayout
        windowActions={{ onClose, onMinimize, onMaximize }}
        menus={RESUME_MENUS}
        menuLogo="/gui/toolbar/barlogo.webp"
        toolbarItems={toolbarItems}
        onToolbarAction={handleToolbarAction}
        addressTitle="Resume"
        addressIcon="/icons/resume.webp"
        statusFields="Loading..."
      >
        <Container ref={containerRef}>
          <LoadingMessage>Loading PDF...</LoadingMessage>
        </Container>
      </ProgramLayout>
    );
  }

  if (error) {
    return (
      <ProgramLayout
        windowActions={{ onClose, onMinimize, onMaximize }}
        menus={RESUME_MENUS}
        menuLogo="/gui/toolbar/barlogo.webp"
        toolbarItems={toolbarItems}
        onToolbarAction={handleToolbarAction}
        addressTitle="Resume"
        addressIcon="/icons/resume.webp"
        statusFields="Error"
      >
        <Container ref={containerRef}>
          <ErrorMessage>
            <p>Failed to load resume PDF</p>
            <p>{error}</p>
          </ErrorMessage>
        </Container>
      </ProgramLayout>
    );
  }

  // Native iframe embed when PDF.js is disabled
  if (!usePdfJs && displayMode === 'embed') {
    return (
      <ProgramLayout
        windowActions={{ onClose, onMinimize, onMaximize }}
        menus={RESUME_MENUS}
        menuLogo="/gui/toolbar/barlogo.webp"
        toolbarItems={toolbarItems}
        onToolbarAction={handleToolbarAction}
        addressTitle="Resume"
        addressIcon="/icons/resume.webp"
        statusFields="Ready"
      >
        <Container ref={containerRef}>
          <NativeEmbed src={getCVPDFUrl()} title="Resume PDF" />
        </Container>
      </ProgramLayout>
    );
  }

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={RESUME_MENUS}
      menuLogo="/gui/toolbar/barlogo.webp"
      toolbarItems={toolbarItems}
      onToolbarAction={handleToolbarAction}
      addressTitle="Resume"
      addressIcon="/icons/resume.webp"
      statusFields={pdfDoc ? `${pdfDoc.numPages} page(s)` : 'Ready'}
    >
      <Container ref={containerRef}>
        <PDFViewer ref={canvasContainerRef} $zoomed={scaleMode === 'zoomed'} />
      </Container>
    </ProgramLayout>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #97958f;
  overflow: hidden;
`;

const PDFViewer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: ${({ $zoomed }) => ($zoomed ? 'auto' : 'hidden')};
  background: #c0c0c0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px;

  .pdf-page-canvas {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    display: block;
  }
`;

const LoadingMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-family: Tahoma, sans-serif;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #800000;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  text-align: center;
  padding: 20px;

  p {
    margin: 5px 0;
  }
`;

const NativeEmbed = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
  background: #fff;
`;

export default Resume;
