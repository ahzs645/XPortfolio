export function truncateFilename(
  name,
  {
    maxLength = 24,
    preserveExtension = true,
    extensionParts = 1,
  } = {}
) {
  if (typeof name !== 'string' || name.length <= maxLength) {
    return name || '';
  }

  if (!preserveExtension) {
    return `${name.slice(0, Math.max(1, maxLength - 1))}…`;
  }

  const extension = getPreservedExtension(name, extensionParts);
  const base = extension ? name.slice(0, -extension.length) : name;

  if (!extension || base.length < 3) {
    return `${name.slice(0, Math.max(1, maxLength - 1))}…`;
  }

  const availableBaseLength = Math.max(3, maxLength - extension.length - 1);
  if (availableBaseLength >= base.length) {
    return name;
  }

  const frontLength = Math.max(1, Math.ceil(availableBaseLength * 0.72));
  const backLength = Math.max(1, availableBaseLength - frontLength);
  return `${base.slice(0, frontLength)}…${base.slice(-backLength)}${extension}`;
}

export function getPreservedExtension(name, extensionParts = 1) {
  if (!name || name.startsWith('.') && name.indexOf('.', 1) === -1) {
    return '';
  }

  const parts = name.split('.');
  if (parts.length < 2 || parts[0] === '') {
    return '';
  }

  const count = Math.max(1, Math.min(extensionParts, parts.length - 1));
  return `.${parts.slice(-count).join('.')}`;
}
