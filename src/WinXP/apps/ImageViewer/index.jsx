import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useApp } from '../../../contexts/AppContext';

/**
 * Windows Picture and Fax Viewer (React implementation).
 *
 * Supports:
 * - Zoom in/out, fit/actual size toggle
 * - Rotate left/right, flip horizontal
 * - Slideshow (with optional fullscreen)
 * - Print and Save (export current transform via canvas)
 * - Uses initialImages/initialImage if provided, otherwise pulls from projects.json
 */
function ImageViewer({ initialImages, initialImage }) {
  const { openApp } = useApp();
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [naturalSize, setNaturalSize] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [mode, setMode] = useState('fit'); // 'fit' | 'actual'
  const [slideshowActive, setSlideshowActive] = useState(false);
  const slideshowRef = useRef(null);

  const ICON_BASE = '/apps/openlair-viewer/static/images/interface/viewer';

  const normalizeSrc = (src) => {
    if (!src) return null;
    if (/^(https?:)?\/\//i.test(src)) return src;
    return '/' + src.replace(/^\//, '');
  };

  const fetchProjectImages = useCallback(async () => {
    try {
      const res = await fetch('/projects.json');
      if (!res.ok) throw new Error('projects.json fetch failed');
      const projects = await res.json();
      const collected = [];
      projects.forEach((project) => {
        if (Array.isArray(project.images)) {
          project.images.forEach((img) => {
            const src = normalizeSrc(img?.src);
            if (!src) return;
            const alt = (img?.alt || project.title || '').trim() || 'Image';
            collected.push({ src, alt });
          });
        }
      });
      return collected;
    } catch (err) {
      console.error('Failed to load project images', err);
      return [];
    }
  }, []);

  // Build the image list from props or projects.json
  useEffect(() => {
    let isMounted = true;
    (async () => {
      let imgs = [];
      if (Array.isArray(initialImages) && initialImages.length) {
        imgs = initialImages
          .filter(Boolean)
          .map((img) => ({
            src: normalizeSrc(img.src || img),
            alt: img.alt || img.title || 'Image',
          }))
          .filter((img) => img.src);
      } else if (initialImage?.src) {
        imgs = [{ src: normalizeSrc(initialImage.src), alt: initialImage.title || 'Image' }];
      } else {
        imgs = await fetchProjectImages();
      }

      if (!imgs.length) {
        imgs = [
          {
            src: normalizeSrc('apps/openlair-viewer/static/images/wallpaper/Bliss.jpg'),
            alt: 'Bliss',
          },
        ];
      }

      if (isMounted) {
        setImages(imgs);
        setIndex(0);
        setLoading(false);
        setNaturalSize(null);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [initialImage, initialImages, fetchProjectImages]);

  // Resize observer for fit calculations
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setContainerSize({
        width: containerRef.current.clientWidth || 1,
        height: containerRef.current.clientHeight || 1,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Reset transforms when image changes
  useEffect(() => {
    setScale(1);
    setRotation(0);
    setFlipH(1);
    setMode('fit');
    setNaturalSize(null);
    setLoading(true);
  }, [index]);

  // Slideshow handler
  useEffect(() => {
    if (!slideshowActive || images.length < 2) return undefined;
    const step = async () => {
      setIndex((prev) => (prev + 1) % images.length);
    };
    slideshowRef.current = setInterval(step, 5000);

    // Request fullscreen on the image area if available
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    }

    return () => {
      if (slideshowRef.current) {
        clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [slideshowActive, images.length]);

  const currentImage = images[index] || null;

  // Compute transform numbers for the current image
  const transform = useMemo(() => {
    if (!naturalSize) return null;
    const iw = naturalSize.width || 1;
    const ih = naturalSize.height || 1;
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotatedWidth = iw * cos + ih * sin;
    const rotatedHeight = iw * sin + ih * cos;
    let fitScale = 1;
    if (mode === 'fit') {
      fitScale = Math.min(
        containerSize.width / rotatedWidth,
        containerSize.height / rotatedHeight
      );
    }
    const finalScale = scale * fitScale;
    return {
      width: iw,
      height: ih,
      scaleX: finalScale * flipH,
      scaleY: finalScale,
    };
  }, [containerSize.height, containerSize.width, flipH, mode, naturalSize, rotation, scale]);

  const handleLoad = (e) => {
    const img = e.target;
    setNaturalSize({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    setLoading(false);
  };

  const getFinalScaleForExport = useCallback(() => {
    if (!naturalSize) return 1;
    const iw = naturalSize.width || 1;
    const ih = naturalSize.height || 1;
    const rad = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const rotatedWidth = iw * cos + ih * sin;
    const rotatedHeight = iw * sin + ih * cos;
    if (mode === 'fit') {
      const fitScale = Math.min(
        containerSize.width / rotatedWidth,
        containerSize.height / rotatedHeight
      );
      return scale * fitScale;
    }
    return scale;
  }, [containerSize.height, containerSize.width, mode, naturalSize, rotation, scale]);

  const getTransformedBlob = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!naturalSize || !currentImage?.src) {
        reject(new Error('No image loaded'));
        return;
      }

      const iw = naturalSize.width || 1;
      const ih = naturalSize.height || 1;
      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const rotatedWidth = iw * cos + ih * sin;
      const rotatedHeight = iw * sin + ih * cos;
      const finalScale = getFinalScaleForExport();
      const canvasW = Math.max(1, Math.round(rotatedWidth * finalScale));
      const canvasH = Math.max(1, Math.round(rotatedHeight * finalScale));
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH * finalScale, finalScale);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, -iw / 2, -ih / 2);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to export'));
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image for export'));
      img.src = currentImage.src;
    });
  }, [currentImage?.src, flipH, getFinalScaleForExport, naturalSize, rotation]);

  const handlePrint = useCallback(async () => {
    try {
      const blob = await getTransformedBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print.');
        URL.revokeObjectURL(url);
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              @media print { html,body{width:100%;height:100%;margin:0} img{display:block;margin:auto;max-width:100%;max-height:100%;object-fit:contain} }
              body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}
              img{max-width:100vw;max-height:100vh;object-fit:contain;display:block;margin:auto}
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error(err);
      alert('No image to print');
    }
  }, [getTransformedBlob]);

  const handleSave = useCallback(async () => {
    try {
      const originalScale = scale;
      const originalMode = mode;
      setScale(1);
      setMode('actual');
      const blob = await getTransformedBlob();
      setScale(originalScale);
      setMode(originalMode);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const alt = currentImage?.alt || 'image';
      const safeName = `${alt}`.replace(/\s+/g, '_').replace(/[^\w.-]/g, '') || 'image';
      link.download = `${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error(err);
      alert('No image to save');
    }
  }, [currentImage?.alt, getTransformedBlob, mode, scale]);

  const toggleSlideshow = () => {
    setSlideshowActive((prev) => !prev);
  };

  const handleEditInPaint = useCallback(() => {
    if (!currentImage?.src) {
      alert('No image to edit');
      return;
    }
    openApp('Paint', {
      imagePath: currentImage.src,
    });
  }, [currentImage?.src, openApp]);

  const toggleZoomMode = () => {
    setMode((prev) => {
      if (prev === 'actual') {
        return 'fit';
      }
      setScale(1);
      return 'actual';
    });
  };

  const handleZoomIn = () => {
    setMode('actual');
    setScale((prev) => Math.min(prev * 1.25, 16));
  };

  const handleZoomOut = () => {
    setMode('actual');
    setScale((prev) => Math.max(prev / 1.25, 0.0625));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipH = () => {
    setFlipH((prev) => prev * -1);
  };

  const nextImage = () => {
    if (images.length < 2) return;
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length < 2) return;
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Container>
      <Viewer ref={containerRef}>
        <ImageArea>
          {loading && <Loading>Generating preview...</Loading>}
          {currentImage ? (
            <StyledImg
              key={currentImage.src + index}
              src={currentImage.src}
              alt={currentImage.alt || 'Image'}
              onLoad={handleLoad}
              style={
                transform
                  ? {
                      width: transform.width,
                      height: transform.height,
                      transform: `scale(${transform.scaleX}, ${transform.scaleY}) rotate(${rotation}deg)`,
                    }
                  : { display: 'none' }
              }
            />
          ) : (
            <Loading>No images available</Loading>
          )}
        </ImageArea>
        <Toolbar>
          <Button onClick={prevImage} title="Previous">
            <img src={`${ICON_BASE}/prev.png`} alt="Previous" />
          </Button>
          <Button onClick={nextImage} title="Next">
            <img src={`${ICON_BASE}/next.png`} alt="Next" />
          </Button>
          <Separator />
          <Button
            className={mode === 'actual' ? 'active' : ''}
            onClick={toggleZoomMode}
            title="Actual Size"
          >
            <img src={`${ICON_BASE}/maximise.png`} alt="Actual Size" />
          </Button>
          <Button
            className={mode === 'fit' ? 'active' : ''}
            onClick={() => {
              setMode('fit');
              setScale(1);
              setRotation(0);
              setFlipH(1);
            }}
            title="Fit to Window"
          >
            <img src={`${ICON_BASE}/minimise.png`} alt="Fit to Window" />
          </Button>
          <Button
            className={slideshowActive ? 'active' : ''}
            onClick={toggleSlideshow}
            title={slideshowActive ? 'Stop Slideshow' : 'Start Slideshow'}
          >
            <img src={`${ICON_BASE}/slideshow.png`} alt="Slideshow" />
          </Button>
          <Separator />
          <Button onClick={handleZoomIn} title="Zoom In">
            <img src={`${ICON_BASE}/zoomin.png`} alt="Zoom In" />
          </Button>
          <Button onClick={handleZoomOut} title="Zoom Out">
            <img src={`${ICON_BASE}/zoomout.png`} alt="Zoom Out" />
          </Button>
          <Separator />
          <Button onClick={handleRotateLeft} title="Rotate Left">
            <img src={`${ICON_BASE}/flipleft.png`} alt="Rotate Left" />
          </Button>
          <Button onClick={handleRotateRight} title="Rotate Right">
            <img src={`${ICON_BASE}/flipright.png`} alt="Rotate Right" />
          </Button>
          <Separator />
          <Button className="disabled" title="Delete (disabled)">
            <img src={`${ICON_BASE}/delete.png`} alt="Delete" />
          </Button>
          <Button onClick={handlePrint} title="Print">
            <img src={`${ICON_BASE}/print.png`} alt="Print" />
          </Button>
          <Button onClick={handleSave} title="Save">
            <img src={`${ICON_BASE}/save.png`} alt="Save" />
          </Button>
          <Button onClick={handleEditInPaint} title="Edit in Paint">
            <img src={`${ICON_BASE}/edit.png`} alt="Edit" />
          </Button>
          <Separator />
          <Button
            onClick={() =>
              alert('Use the toolbar to navigate, zoom, rotate, and print images from your projects.')
            }
            title="Help"
          >
            <img src={`${ICON_BASE}/help.png`} alt="Help" />
          </Button>
        </Toolbar>
      </Viewer>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background: #eef2fb;
  overflow: hidden;
  position: relative;
`;

const Viewer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  background: #eef2fb;
  box-sizing: border-box;
  overflow: hidden;
`;

const ImageArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 600px) {
    bottom: 120px;
  }
`;

const StyledImg = styled.img`
  display: block;
  object-fit: contain;
  transform-origin: center center;
  max-width: none;
  max-height: none;
`;

const Toolbar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eef2fb;
  z-index: 1;

  @media (max-width: 600px) {
    height: auto;
    min-height: 120px;
    flex-wrap: wrap;
    padding: 8px 4px;
    gap: 6px;
    align-content: center;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  max-width: 28px;
  min-height: 28px;
  max-height: 28px;
  flex: 0 0 28px;
  padding: 6px;
  margin: 0 2px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  box-sizing: border-box;
  appearance: none;
  font-size: 0;

  &:hover:not(.disabled) {
    border: 1px solid #d7d4cb;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
  }

  &.active {
    border: 1px solid #839fb4;
    background: rgba(255, 255, 255, 1);
  }

  &.disabled {
    opacity: 0.45;
    cursor: default;
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    min-width: 44px;
    max-width: 44px;
    min-height: 44px;
    max-height: 44px;
    flex: 0 0 44px;
    padding: 8px;
    margin: 0;
    border: 1px solid #c0c0c0;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background-color: silver;
  margin: 0 5px;

  @media (max-width: 600px) {
    display: none;
  }
`;

const Loading = styled.div`
  pointer-events: none;
  user-select: none;
  color: #003399;
  font-weight: 600;
  text-shadow: 1px 1px 0 #fff;
`;

export default ImageViewer;
