import { useEffect } from 'react';

/**
 * Hook for handling keyboard shortcuts in the file explorer
 */
export function useKeyboardShortcuts({
  containerRef,
  selectedItems,
  contents,
  onDelete,
  onRename,
  onCopy,
  onCut,
  onPaste,
  onSelectAll,
  onGoUp,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'Delete' && selectedItems.length > 0) {
        onDelete();
      } else if (e.key === 'F2' && selectedItems.length === 1) {
        onRename();
      } else if (e.key === 'Backspace') {
        onGoUp();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          onCopy();
        } else if (e.key === 'x') {
          e.preventDefault();
          onCut();
        } else if (e.key === 'v') {
          e.preventDefault();
          onPaste();
        } else if (e.key === 'a') {
          e.preventDefault();
          onSelectAll();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    containerRef,
    selectedItems,
    contents,
    onDelete,
    onRename,
    onCopy,
    onCut,
    onPaste,
    onSelectAll,
    onGoUp,
  ]);
}
