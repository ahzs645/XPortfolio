export function getDisplayScale() {
  if (typeof document === 'undefined') {
    return 1;
  }

  const root = document.getElementById('root');
  if (!root) {
    return 1;
  }

  const rect = root.getBoundingClientRect();
  const width = root.clientWidth || root.offsetWidth || rect.width;
  const height = root.clientHeight || root.offsetHeight || rect.height;
  const scaleX = width ? rect.width / width : 1;
  const scaleY = height ? rect.height / height : 1;
  const scale = Number.isFinite(scaleX) && scaleX > 0
    ? scaleX
    : Number.isFinite(scaleY) && scaleY > 0
      ? scaleY
      : 1;

  return scale || 1;
}

export function toDisplayLayerValue(value, scale = getDisplayScale()) {
  if (!Number.isFinite(value)) {
    return value;
  }

  return value / scale;
}

export function toDisplayLayerPoint(point) {
  if (!point) {
    return point;
  }

  const scale = getDisplayScale();

  return {
    ...point,
    ...(Number.isFinite(point.x) ? { x: toDisplayLayerValue(point.x, scale) } : {}),
    ...(Number.isFinite(point.y) ? { y: toDisplayLayerValue(point.y, scale) } : {}),
    ...(Number.isFinite(point.left) ? { left: toDisplayLayerValue(point.left, scale) } : {}),
    ...(Number.isFinite(point.top) ? { top: toDisplayLayerValue(point.top, scale) } : {}),
    ...(Number.isFinite(point.right) ? { right: toDisplayLayerValue(point.right, scale) } : {}),
    ...(Number.isFinite(point.bottom) ? { bottom: toDisplayLayerValue(point.bottom, scale) } : {}),
    ...(Number.isFinite(point.width) ? { width: toDisplayLayerValue(point.width, scale) } : {}),
    ...(Number.isFinite(point.height) ? { height: toDisplayLayerValue(point.height, scale) } : {}),
  };
}

export function toDisplayLayerRect(rect) {
  if (!rect) {
    return rect;
  }

  const scale = getDisplayScale();

  return {
    x: toDisplayLayerValue(rect.x ?? rect.left ?? 0, scale),
    y: toDisplayLayerValue(rect.y ?? rect.top ?? 0, scale),
    left: toDisplayLayerValue(rect.left ?? rect.x ?? 0, scale),
    top: toDisplayLayerValue(rect.top ?? rect.y ?? 0, scale),
    right: toDisplayLayerValue(rect.right ?? 0, scale),
    bottom: toDisplayLayerValue(rect.bottom ?? 0, scale),
    width: toDisplayLayerValue(rect.width ?? 0, scale),
    height: toDisplayLayerValue(rect.height ?? 0, scale),
  };
}

export function getDisplayViewport() {
  const scale = getDisplayScale();

  return {
    scale,
    width: toDisplayLayerValue(window.innerWidth, scale),
    height: toDisplayLayerValue(window.innerHeight, scale),
  };
}
