import { useCallback, useEffect, useRef } from 'react';

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function defaultLabelForPercent(value) {
  return `${Math.round(clampPercent(value))}%`;
}

export default function UsageGauge({ ariaLabel, percent, label, height, width }) {
  const canvasRef = useRef(null);
  const percentRef = useRef(percent);
  const labelRef = useRef(label);

  useEffect(() => {
    percentRef.current = percent;
  }, [percent]);

  useEffect(() => {
    labelRef.current = label;
  }, [label]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const value = clampPercent(percentRef.current);

    const gridOffset = Math.max(6, Math.round(Math.min(width, height) * 0.14));
    const barReserved = Math.max(16, Math.round(height * 0.32));
    const rowStep = 3;
    const rowLineWidth = 2;

    const barTop = gridOffset;
    const barBottom = height - barReserved + gridOffset;
    if (barBottom <= barTop) return;

    let rowCount = 0;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = rowLineWidth;
    ctx.lineCap = 'butt';

    for (let y = barTop; y <= barBottom; y += rowStep) {
      const alignedY = Math.round(y);
      ctx.beginPath();
      ctx.moveTo(gridOffset, alignedY);
      ctx.lineTo(width - gridOffset, alignedY);
      ctx.stroke();
      rowCount += 1;
    }

    const unusedRows = Math.min(rowCount, Math.floor((rowCount * (100 - value)) / 100));
    ctx.strokeStyle = '#006400';

    let posY = barTop;
    for (let i = 0; i < unusedRows; i += 1) {
      const alignedY = Math.round(posY);
      ctx.beginPath();
      ctx.moveTo(gridOffset, alignedY);
      ctx.lineTo(width - gridOffset, alignedY);
      ctx.stroke();
      posY += rowStep;
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const centerX = Math.round(width / 2) + 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    const displayLabel = labelRef.current ?? defaultLabelForPercent(value);
    ctx.fillStyle = '#00ff00';
    ctx.font = '8px "MS Sans Serif", Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(displayLabel, width / 2, height - 4);
  }, [height, width]);

  useEffect(() => {
    redraw();
  }, [redraw, percent, label]);

  return (
    <div className="tm-gauge" role="img" aria-label={ariaLabel}>
      <canvas ref={canvasRef} />
    </div>
  );
}
