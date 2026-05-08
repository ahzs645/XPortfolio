export function getTargetOriginFromUrl(url) {
  if (!url) {
    return null;
  }

  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : undefined;
    const { origin } = new URL(url, baseUrl);
    return origin === 'null' ? null : origin;
  } catch {
    return null;
  }
}

export function getIframeTargetOrigin(iframe) {
  const src = iframe?.getAttribute?.('src') || iframe?.src;
  return getTargetOriginFromUrl(src);
}
