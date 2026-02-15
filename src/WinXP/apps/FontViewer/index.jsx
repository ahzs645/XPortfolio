import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

function FontViewer({ fontData, fontName, fontPath }) {
  const [fontFamily, setFontFamily] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract display name from font name or path
  const displayName = fontName || (fontPath ? fontPath.split('/').pop().replace(/\.[^.]+$/, '') : 'Font Preview');

  // Determine font format from extension
  const getFormatFromName = useCallback((name) => {
    const ext = (name || '').toLowerCase().split('.').pop();
    switch (ext) {
      case 'ttf': return 'truetype';
      case 'otf': return 'opentype';
      case 'woff': return 'woff';
      case 'woff2': return 'woff2';
      default: return 'truetype';
    }
  }, []);

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

        // Create blob URL from font data
        let fontUrl = fontData;

        // If it's a data URL, convert to blob URL
        if (fontData.startsWith('data:')) {
          const response = await fetch(fontData);
          const blob = await response.blob();
          fontUrl = URL.createObjectURL(blob);
        }

        const format = getFormatFromName(fontName || fontPath);
        const uniqueFontName = `FontViewer_${Date.now()}`;

        // Create and load the font face
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
  }, [fontData, fontName, fontPath, getFormatFromName]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <Container>
      <Toolbar>
        <ToolbarButton disabled>Done</ToolbarButton>
        <ToolbarButton disabled>Print</ToolbarButton>
      </Toolbar>

      <DisplayArea>
        {isLoading ? (
          <LoadingMessage>Loading font...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <FontContent $fontFamily={fontFamily}>
            <FontTitle $fontFamily={fontFamily}>{displayName}</FontTitle>
            <Separator />

            <CharacterPreview $fontFamily={fontFamily}>
              abcdefghijklmnopqrstuvwxyz<br />
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              1234567890.:,;(:*!?')
            </CharacterPreview>

            <Separator />

            <SizePreviews>
              {[12, 18, 24, 36, 48, 60, 72].map((size) => (
                <SizeRow key={size}>
                  <SizeLabel>{size}</SizeLabel>
                  <SizePreview $fontFamily={fontFamily} $fontSize={size}>
                    The quick brown fox jumps over the lazy dog. 1234567890
                  </SizePreview>
                </SizeRow>
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
  margin-bottom: 10px;
  word-break: break-word;
`;

const Separator = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin: 15px 0;
`;

const CharacterPreview = styled.p`
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
  font-size: 18pt;
  line-height: 1.4;
  margin: 0;
  word-break: break-all;
`;

const SizePreviews = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SizeRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 15px;
`;

const SizeLabel = styled.span`
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  color: #000;
  min-width: 24px;
  text-align: right;
  flex-shrink: 0;
`;

const SizePreview = styled.span`
  font-family: ${({ $fontFamily }) => $fontFamily ? `'${$fontFamily}', sans-serif` : 'sans-serif'};
  font-size: ${({ $fontSize }) => $fontSize}pt;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default FontViewer;
