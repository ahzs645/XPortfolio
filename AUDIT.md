# XPortfolio Codebase Audit

**Date:** 2026-04-04
**Scope:** Full codebase audit covering security, code quality, architecture, and configuration
**Codebase:** ~390K lines across ~312 source files (React/Vite Windows XP simulator)

---

## Executive Summary

XPortfolio is a well-structured React application simulating Windows XP. The codebase demonstrates strong fundamentals (good chunk splitting, ESLint integration, DOMPurify usage). However, the audit identified **3 critical/high security vulnerabilities**, several code quality concerns, and architectural improvements worth considering.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 5 |
| Medium   | 8 |
| Low      | 7 |

---

## 1. Security Findings

### CRITICAL

#### S1. XSS in MSNMessenger Chat via `dangerouslySetInnerHTML`
- **File:** `src/WinXP/apps/MSNMessenger/components/ChatHistory.jsx:11-32`
- **Issue:** Message content rendered with `dangerouslySetInnerHTML` without DOMPurify. The `wink` message type inserts `message.content` directly into an `<img src>` attribute without validation, enabling XSS via malformed URLs.
- **Fix:** Wrap all `contentHTML` with `DOMPurify.sanitize()` before rendering. Validate `wink` URLs against an allowlist of schemes (`https:` only).

#### S2. Unsanitized Content in `document.write` (Print Functions)
- **Files:**
  - `src/WinXP/apps/Wordpad/index.jsx:106-119`
  - `src/WinXP/apps/ImageViewer/index.jsx:251-265`
- **Issue:** User-editable rich text content is written directly to a new window via `document.write()` without sanitization. A crafted document could contain `<img src=x onerror="...">` or `<script>` tags.
- **Fix:** Sanitize content with `DOMPurify.sanitize(content)` before calling `document.write()`.

### HIGH

#### S3. Insecure `postMessage` Broadcasting in IframeApp
- **File:** `src/WinXP/apps/IframeApp/index.jsx:161-176, 355-362`
- **Issue:** Response messages (including file system data and file contents) are sent with `'*'` as `targetOrigin`. Any cross-origin iframe or injected script can intercept this data.
- **Fix:** Use the specific iframe origin: `new URL(appUrl).origin` instead of `'*'`.

#### S4. No URL Scheme Validation in Internet Explorer
- **File:** `src/WinXP/apps/InternetExplorer/index.jsx:11-30`
- **Issue:** `processUrlForIframe()` doesn't prevent `javascript:` or `data:` protocol URLs from being set as iframe `src`.
- **Fix:** Validate URL scheme is `http:` or `https:` before accepting.

#### S5. No Content-Security-Policy Header
- **File:** `vite.config.js:29-32`
- **Issue:** COOP/COEP headers are set but no CSP is defined. A strict CSP would mitigate many XSS vectors.
- **Fix:** Add a `Content-Security-Policy` header restricting `script-src`, `style-src`, etc.

### MEDIUM

#### S6. Unvalidated MIME Types in File Creation from Iframe
- **File:** `src/WinXP/apps/IframeApp/index.jsx:272-282`
- **Issue:** Base64 file data from untrusted iframes is decoded and stored without MIME type validation.
- **Fix:** Whitelist allowed MIME types.

#### S7. `postMessage` Broadcasts in Utility Modules
- **Files:** `src/utils/cursorManager.js:158-161`, `src/utils/audioManager.js:232-236`
- **Issue:** System state broadcasts use `'*'` as targetOrigin.
- **Fix:** Use specific origins.

#### S8. Inconsistent `JSON.parse` Error Handling
- **Files:** Multiple context files (RegistryContext, UserSettingsContext, etc.)
- **Issue:** Some `localStorage` reads use `JSON.parse` without try-catch, which will throw on corrupted data.
- **Fix:** Wrap all `JSON.parse` calls in try-catch with fallback values.

---

## 2. Code Quality Findings

### HIGH

#### Q1. Massive Component: `WinXP/index.jsx` (914 lines)
- **File:** `src/WinXP/index.jsx`
- **Issue:** Single component with 914 lines, 14 nested context providers, 8+ custom hooks, and complex state management. Hard to test, maintain, and reason about.
- **Recommendation:** Extract logical sections (provider tree, desktop logic, event handlers) into separate components/hooks.

#### Q2. Memory Leak in `useSystemSounds`
- **File:** `src/hooks/useSystemSounds.js`
- **Issue:** Audio elements are created and cached globally but never cleaned up on unmount. No cleanup function in useEffect.
- **Fix:** Return a cleanup function that destroys audio elements, or manage the cache lifecycle explicitly.

#### Q3. Stale Closure in `useMobileAppLauncher`
- **File:** `src/WinXP/hooks/useMobileAppLauncher.js:14`
- **Issue:** `isMobileDevice()` is memoized with `[]` dependency array but depends on `window.innerWidth`, which changes on resize/rotation.
- **Fix:** Add window dimensions to the dependency array or use a resize listener.

#### Q4. Silent Data Loss in FileSystem Persistence
- **File:** `src/contexts/fileSystem/FileSystemProvider.jsx:124`
- **Issue:** IndexedDB write failures are caught with `console.error` only. Users are not notified of sync failures.
- **Fix:** Surface errors through a toast/notification system.

### MEDIUM

#### Q5. Array Index Used as React Key
- **File:** `src/WinXP/apps/MSNMessenger/components/ChatHistory.jsx:52-54`
- **Issue:** `messages.map((msg, i) => <Message key={i} ...>)` causes identity issues if messages are reordered or deleted.
- **Fix:** Use a unique message ID as key.

#### Q6. Deep Context Provider Nesting (14 levels)
- **Files:** `src/WinXP/index.jsx`, `src/App.jsx`
- **Issue:** 14 nested context providers cause cascading re-renders when any single context value changes.
- **Recommendation:** Consider combining related contexts or using context splitting to separate frequently-changing values from stable ones.

#### Q7. Missing Error Boundaries Around Windows
- **Issue:** Only one `ErrorBoundary` wraps the entire desktop. A crash in any single window app takes down the whole UI.
- **Fix:** Wrap each window/app in its own `ErrorBoundary`.

#### Q8. Inefficient Tooltip Position Calculations
- **File:** `src/contexts/TooltipContext.jsx`
- **Issue:** `useLayoutEffect` triggers DOM measurements on every coordinate change during mouse movement.
- **Fix:** Throttle or debounce position updates.

### LOW

#### Q9. Empty `onClick` Handlers on Disabled Items
- **File:** `src/WinXP/Footer/index.jsx:241-243` (and others)
- **Issue:** `onClick={() => {}}` on disabled menu items creates unnecessary event handlers.
- **Fix:** Use `disabled` attribute or omit handler.

#### Q10. Missing Accessibility Attributes
- **Files:** Various (Windows/index.jsx, Footer, context menus)
- **Issue:** Missing alt text on images, missing ARIA labels on icon-only buttons, no keyboard navigation for context menus.
- **Recommendation:** Add ARIA labels and alt text progressively.

#### Q11. Unused/Dead onClick Handlers
- **File:** Multiple footer and menu components
- **Issue:** Multiple no-op click handlers for "coming soon" features add code noise.
- **Recommendation:** Use a consistent disabled pattern.

---

## 3. Architecture & Configuration Findings

### Build Configuration (`vite.config.js`)
- **Good:** Smart chunk splitting for large dependencies (webamp, react-pdf, styled-components)
- **Good:** Console/debugger stripping in production
- **Good:** GitHub Pages base path auto-detection
- **Good:** Cross-origin isolation headers for SharedArrayBuffer support
- **Issue (Low):** `execSync('git rev-parse')` in config runs on every dev server start; could cache result
- **Issue (Low):** No explicit `minify` or `cssMinify` settings — relying on Vite defaults

### Dependencies (`package.json`)
- **Good:** Modern versions of React 19, Vite 7, ESLint 9
- **Good:** DOMPurify included for sanitization
- **Note:** `xlsx@^0.18.5` is the community fork (SheetJS) — check license compliance for commercial use
- **Note:** Large dependency footprint (webamp, tinymce, react-pdf, fortune-sheet) — consider lazy loading for rarely-used apps
- **Note:** `@types/react` and `@types/react-dom` are installed but no TypeScript is used — either adopt TS or remove these
- **Note:** Potential redundancy: `docx` + `mammoth` both handle Word documents; `xlsx` + `@fortune-sheet/react` both handle spreadsheets

### ESLint Configuration
- **Good:** Well-reasoned rule decisions with documented rationale for disabled rules
- **Good:** React hooks plugin enabled
- **Good:** `no-unused-vars` with pattern exception for component names
- **Good:** `.eslint-report.json` shows 0 violations across 177 files — clean lint state
- **Note:** `react-refresh/only-export-components` is off — may miss HMR issues during development

### Project Structure
- **Good:** Clean separation: `components/`, `contexts/`, `hooks/`, `utils/`, `WinXP/`
- **Good:** Context files have clear responsibility boundaries
- **Good:** File system logic well-organized in `contexts/fileSystem/` subdirectory (12 files, ~4K lines)
- **Concern:** `WinXP/apps/` contains 30+ app directories — consider grouping by category (system, games, office, etc.)
- **Concern:** `WinXP/index.jsx` is 32KB / 914 lines — needs decomposition

### Asset Management
- **Concern:** `public/` directory is ~200MB+ total
- **Critical:** `public/ruffle/*.wasm` is 13MB uncompressed — should be gzipped (~3-4MB)
- **Critical:** Profile pictures are oversized (`astronaut.jpg` 9.4MB, `chess.jpg` 5.6MB) — should be resized/converted to WebP
- **Note:** Duplicate SVG: `public/xp.svg` and `src/assets/xp.svg` (32KB each)
- **Note:** Multiple favicon formats (ico, png, webp) — consolidate
- **Recommendation:** Implement lazy loading for games and screensavers; consider CDN for large assets

### Context Architecture (14 Providers)
The app uses 14 nested context providers across `App.jsx` and `WinXP/index.jsx`:

| Context | Lines | Import Count | Notes |
|---------|-------|-------------|-------|
| ConfigContext | 699 | 23 | High usage — appropriate |
| FileSystemContext | 3,986* | 32 | High usage, well-modularized |
| RegistryContext | 660 | 3 | Very low usage for its size |
| InstalledAppsContext | 517 | — | Moderate |
| UserAccountsContext | 506 | — | Moderate |
| AppContext | 420 | 16 | Moderate |
| UserSettingsContext | 408 | 14 | Moderate |
| ShellSettingsContext | 305 | — | Moderate |
| StartMenuContext | 289 | — | Moderate |
| ScreensaverContext | 178 | 3 | Very low — combine candidate |
| TooltipContext | 171 | 7 | Low — combine candidate |
| MessageBoxContext | 171 | 3 | Very low — combine candidate |
| ThemeContext | 157 | — | WinXP-specific, should move |
| RunningAppsContext | 29 | 3 | Lightweight |

*\*FileSystem includes submodule files*

**Recommendation:** Consolidate into 3-4 composite providers:
- `<SystemProvider>` — Config, UserAccounts, ShellSettings, Registry
- `<UIProvider>` — Tooltip, Theme, Screensaver, MessageBox
- `<DataProvider>` — FileSystem, InstalledApps, StartMenu, UserSettings

### Git Configuration
- **Good:** `.gitignore` covers standard patterns
- **Note:** `.gitmodules` references 5 submodules (spider-solitaire, js-solitaire, jspaint, command-and-conquer, isle-portable) — **all are empty/uninitialized**
- **Note:** Both `package-lock.json` and `pnpm-lock.yaml` exist — should standardize on one package manager

### Documentation
- **Weak:** `README.md` is only 797 bytes — lacks architecture overview, setup guide, screenshots
- **Good:** `docs/PROJECTS_FOLDER.md` is detailed (3.2KB) with YAML schema docs
- **Good:** Component USAGE.md files exist for WindowBars and TaskPanel
- **Missing:** No ARCHITECTURE.md, SETUP.md, CONTRIBUTING.md, or context API docs
- **Missing:** Large files (32KB WinXP/index.jsx, 920-line migrations.js) lack inline comments

---

## 4. Summary of Recommendations

### Immediate (Critical Security)
1. Sanitize all `dangerouslySetInnerHTML` content with DOMPurify (S1)
2. Sanitize `document.write()` content in print functions (S2)
3. Replace `postMessage(..., '*')` with specific origins (S3)
4. Validate URL schemes in Internet Explorer app (S4)

### Short-term (High Priority)
5. Add Content-Security-Policy header (S5)
6. Add error boundaries around individual window components (Q7)
7. Fix memory leak in useSystemSounds (Q2)
8. Fix stale closure in useMobileAppLauncher (Q3)
9. Add try-catch around all JSON.parse on localStorage data (S8)
10. Optimize oversized assets (compress WASM, resize profile images to WebP)

### Medium-term (Quality Improvements)
11. Break up the 914-line WinXP component (Q1)
12. Use unique IDs instead of array indices as React keys (Q5)
13. Consolidate 14 context providers into 3-4 composite providers (Q6)
14. Standardize on one package manager (npm or pnpm)
15. Add user-facing error notifications for file system failures (Q4)
16. Initialize or remove empty git submodules
17. Remove unused `@types/*` devDependencies (or adopt TypeScript)

### Long-term (Polish)
18. Progressive accessibility improvements (Q10)
19. Lazy-load heavy dependencies (tinymce, webamp, fortune-sheet)
20. Add CSP header and Subresource Integrity for CDN resources
21. Group apps by category in the file structure
22. Add architecture documentation (ARCHITECTURE.md, SETUP.md, CONTRIBUTING.md)
