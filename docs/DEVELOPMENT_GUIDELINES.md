# Development Guidelines

Use these conventions when adding or changing app behavior.

## Loading States

### Do

- Use the shared XP progress cursor for short app initialization work.
- Prefer `useLoadingCursor(isLoading)` from `src/WinXP/hooks/useLoadingCursor.js` in React components.
- Keep the current screen visible while initialization finishes when the user cannot act on the new UI yet.
- Show an error UI only when loading actually fails.

### Don't

- Do not add fullscreen loading pages for brief startup waits.
- Do not block the desktop with an opaque overlay while an app is only initializing.
- Do not implement one-off loading cursors in component CSS; use the shared cursor manager hook.

### Example

```jsx
import useLoadingCursor from '../../hooks/useLoadingCursor';

function AppSurface() {
  const [status, setStatus] = useState('loading');

  useLoadingCursor(status === 'loading');

  return (
    <Surface $isVisible={status === 'ready'}>
      {/* app UI */}
    </Surface>
  );
}
```

The Windows XP Tour follows this pattern: it uses the existing XP progress cursor while the tour player initializes, then shows the fullscreen tour only when the player is ready.
