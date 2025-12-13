import { useCallback, useEffect, useRef } from 'react';

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function HistoryGraph({
  ariaLabel,
  series,
  height,
  gridSpacing = 10,
  valueSpacing = 2,
  gridScrollOffset = 0,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const seriesRef = useRef(series);
  const heightRef = useRef(height);
  const gridSpacingRef = useRef(gridSpacing);
  const valueSpacingRef = useRef(valueSpacing);
  const gridScrollOffsetRef = useRef(gridScrollOffset);

  useEffect(() => {
    seriesRef.current = series;
  }, [series]);

  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  useEffect(() => {
    gridSpacingRef.current = Math.max(2, Math.round(gridSpacing));
  }, [gridSpacing]);

  useEffect(() => {
    valueSpacingRef.current = Math.max(1, Math.round(valueSpacing));
  }, [valueSpacing]);

  useEffect(() => {
    gridScrollOffsetRef.current = gridScrollOffset;
  }, [gridScrollOffset]);

  const redraw = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const canvasHeight = heightRef.current;
    if (width <= 0 || canvasHeight <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, canvasHeight);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, canvasHeight);

    const spacing = Math.max(2, Math.round(gridSpacingRef.current));
    const pointSpacing = Math.max(1, Math.round(valueSpacingRef.current));
    const offset =
      ((Math.round(gridScrollOffsetRef.current) % spacing) + spacing) % spacing;

    ctx.strokeStyle = '#006600';
    ctx.lineWidth = 1;

    for (let x = width - 1 - offset; x >= 0; x -= spacing) {
      const alignedX = Math.round(x) + 0.5;
      ctx.beginPath();
      ctx.moveTo(alignedX, 0);
      ctx.lineTo(alignedX, canvasHeight);
      ctx.stroke();
    }

    for (let y = 0; y < canvasHeight; y += spacing) {
      const alignedY = Math.round(y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, alignedY);
      ctx.lineTo(width, alignedY);
      ctx.stroke();
    }

    const seriesList = seriesRef.current.filter((s) => s.data.length > 0);
    if (seriesList.length === 0) return;

    const minSeriesLength = Math.min(...seriesList.map((s) => s.data.length));
    if (!Number.isFinite(minSeriesLength) || minSeriesLength < 2) return;

    const visiblePoints = Math.min(
      minSeriesLength,
      Math.floor((width - 1) / pointSpacing) + 1,
    );
    if (visiblePoints < 2) return;

    for (const seriesItem of seriesList) {
      const startIndex = seriesItem.data.length - visiblePoints;
      ctx.strokeStyle = seriesItem.color;
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < visiblePoints; i += 1) {
        const value = clampPercent(seriesItem.data[startIndex + i]);
        const x = width - 1 - (visiblePoints - 1 - i) * pointSpacing;
        const y = canvasHeight - 1 - (value / 100) * (canvasHeight - 1);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw, series, height, gridSpacing, valueSpacing, gridScrollOffset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => redraw());
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  return (
    <div
      ref={containerRef}
      className="tm-graph"
      role="img"
      aria-label={ariaLabel}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
