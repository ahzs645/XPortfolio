import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FORMAT_LABELS = {
  ttf: 'TrueType',
  otf: 'OpenType',
  woff: 'WOFF',
  woff2: 'WOFF2',
  fon: 'Font Resource',
};

const FORMAT_HINTS = {
  ttf: 'truetype',
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
};

function FontViewer({ fontData, fontName, fontPath, onClose }) {
  const [fontFamily, setFontFamily] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  const fileName = fontName || (fontPath ? fontPath.split('/').pop() : '');
  const ext = (fileName || '').toLowerCase().split('.').pop();
  const formatLabel = FORMAT_LABELS[ext] || 'Font File';
  const displayName = fileName.replace(/\.[^.]+$/, '') || 'Font Preview';

  // Load the font
  /* eslint-disable react-hooks/set-state-in-effect -- async font loading */
  useEffect(() => {
    if (!fontData) {
      setError('No font data provided');
      setIsLoading(false);
      return;
    }

    const loadFont = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let fontUrl = fontData;

        if (fontData.startsWith('data:')) {
          const response = await fetch(fontData);
          const blob = await response.blob();
          setFileSize(blob.size);
          fontUrl = URL.createObjectURL(blob);
        }

        const format = FORMAT_HINTS[ext] || 'truetype';
        const uniqueFontName = `FontViewer_${Date.now()}`;

        const fontFace = new FontFace(uniqueFontName, `url(${fontUrl}) format('${format}')`);
        await fontFace.load();
        document.fonts.add(fontFace);

        setFontFamily(uniqueFontName);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load font:', err);
        setError('Failed to load font file');
        setIsLoading(false);
      }
    };

    loadFont();
  }, [fontData, ext]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const formatSize = (bytes) => {
    if (bytes == null) return null;
    return bytes >= 1048576
      ? `${(bytes / 1048576).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <Container>
      <Toolbar>
        <ToolbarButton onClick={onClose}>Done</ToolbarButton>
        <ToolbarButton disabled>Print</ToolbarButton>
      </Toolbar>

      <DisplayArea>
        {isLoading ? (
          <LoadingMessage>Loading font...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <FontContent $fontFamily={fontFamily}>
            <FontTitle $fontFamily={fontFamily}>
              {displayName} ({formatLabel})
            </FontTitle>

            <FontMeta>
              {formatLabel} Font{fileSize ? `, File size: ${formatSize(fileSize)}` : ''}
              <br />
              Typeface name: {displayName}
            </FontMeta>

            <Separator />

            <CharacterPreview $fontFamily={fontFamily}>
              abcdefghijklmnopqrstuvwxyz<br />
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              1234567890.:,;(:*!?')
            </CharacterPreview>

            <Separator />

            <SizePreviews>
              {[12, 18, 24, 36, 48, 60, 72].map((size) => (
                <React.Fragment key={size}>
                  <SizeLabel>{size}</SizeLabel>
                  <SizePreview $fontFamily={fontFamily} $fontSize={size}>
                    The quick brown fox jumps over the lazy dog. 1234567890
                  </SizePreview>
                </React.Fragment>
              ))}
            </SizePreviews>
          </FontContent>
        )}
      </DisplayArea>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fff;
  font-family: Tahoma, sans-serif;
`;

const Toolbar = styled.div`
  height: 35px;
  background-color: #ECE9D8;
  border-bottom: 2px solid #ACA899;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5px;
  gap: 5px;
  flex-shrink: 0;
`;

const ToolbarButton = styled.button`
  padding: 3px 12px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  background: #ECE9D8;
  border: 1px solid #ACA899;
  border-radius: 3px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #F6F3EC;
    border-color: #0055E5;
  }

  &:active:not(:disabled) {
    background: #E1DED4;
  }

  &:disabled {
    color: #ACA899;
    cursor: default;
  }
`;

const DisplayArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: 10px 15px;
  background: #fff;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #666;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
  color: #c00;
`;

const FontContent = styled.div`
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
`;

const FontTitle = styled.div`
  font-size: 32pt;
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
  margin-bottom: 5px;
  word-break: break-word;
`;

const FontMeta = styled.p`
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  margin: 0 0 5px;
  color: #000;
`;

const Separator = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin: 12px 0;
`;

const CharacterPreview = styled.p`
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
  font-size: 16pt;
  line-height: 1.4;
  margin: 0;
  word-break: break-all;
`;

const SizePreviews = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
`;

const SizeLabel = styled.span`
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  color: #000;
  grid-column: 1;
  align-self: end;
  text-align: right;
`;

const SizePreview = styled.span`
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
  font-size: ${({ $fontSize }) => $fontSize}pt;
  white-space: nowrap;
  overflow: hidden;
  grid-column: 2;
`;

export default FontViewer;
