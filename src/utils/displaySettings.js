export const DISPLAY_RESOLUTIONS = [
  '640 x 480',
  '800 x 600',
  '1024 x 768',
  '1152 x 864',
  '1280 x 1024',
  '1600 x 1200',
];

export const DISPLAY_ZOOM_LEVELS = [135, 120, 110, 100, 85, 70];

export function getRecommendedResolutionIndex(viewportWidth = typeof window !== 'undefined'
  ? window.innerWidth
  : 1024) {
  if (viewportWidth < 750) {
    return 5;
  }

  if (viewportWidth < 950) {
    return 4;
  }

  return 3;
}

export function getDefaultDisplayZoom(viewportWidth) {
  return DISPLAY_ZOOM_LEVELS[getRecommendedResolutionIndex(viewportWidth)];
}

export function getResolutionIndexForZoom(zoom, viewportWidth) {
  const numericZoom = Number.parseInt(zoom, 10);
  const matchedIndex = DISPLAY_ZOOM_LEVELS.indexOf(numericZoom);

  if (matchedIndex !== -1) {
    return matchedIndex;
  }

  return getRecommendedResolutionIndex(viewportWidth);
}

export function getDisplayResolutionLabels(viewportWidth) {
  const labels = [...DISPLAY_RESOLUTIONS];
  const recommendedIndex = getRecommendedResolutionIndex(viewportWidth);

  labels[recommendedIndex] = `${labels[recommendedIndex]} (Recommended)`;

  return labels;
}
