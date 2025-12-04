# External Game Submodules

This folder contains git submodules for external games that are integrated into XPortfolio.

## Submodules

| Game | Path | Description |
|------|------|-------------|
| Spider Solitaire | `spider-solitaire/` | React-based spider solitaire game |
| JS Solitaire | `js-solitaire/` | Vanilla JS classic solitaire game |
| JSPaint | `jspaint/` | MS Paint clone (complex, uses os-gui) |

## Toolbar Integration

### Spider Solitaire (React)

**Updated files:**
- `src/game/components/WindowMenu/index.js` - New XP-style menu bar
- `src/game/components/WindowMenu/styles.js` - Menu bar styled-components
- `src/game/components/StatusBar/index.js` - Status bar component
- `src/game/components/StatusBar/styles.js` - Status bar styled-components
- `src/game/components/Window/index.js` - Updated to include StatusBar

### JS Solitaire (Vanilla JS)

**Updated files:**
- `src/index.html` - New HTML structure with XP menu bar and status bar
- `src/index.scss` - Added XP toolbar CSS classes
- `src/index.js` - Added menu toggle functionality

### JSPaint

JSPaint already has a sophisticated menu system built with the `os-gui` library. To integrate with the XPortfolio toolbar system, you have two options:

**Option 1: Wrapper approach (Recommended)**
Embed JSPaint in an iframe within the React app and overlay the XP toolbar on top. This preserves JSPaint's functionality while adding the consistent XPortfolio look.

**Option 2: Deep integration**
Modify JSPaint's os-gui theme CSS to match XPortfolio's XP styling. This requires:
1. Updating `lib/os-gui/build/windows-default.css`
2. Modifying the menu bar styles in `styles/layout.css`
3. Potentially updating `src/menus.js` for menu configuration

Due to JSPaint's complexity, Option 1 is recommended.

## Shared Toolbar CSS

A shared CSS file is available at `shared/windowBars.css` with all XP-style classes:

- `.xp-menu-bar-container` / `.xp-menu-bar` / `.xp-menu-item`
- `.xp-dropdown-menu` / `.xp-menu-option` / `.xp-menu-separator`
- `.xp-toolbar-container` / `.xp-toolbar-row` / `.xp-toolbar-button`
- `.xp-addressbar-container` / `.xp-addressbar-row` / `.xp-addressbar`
- `.xp-status-bar` / `.xp-status-bar-field` / `.xp-status-bar-grip`

## Building Games

### Spider Solitaire
```bash
cd external/spider-solitaire
npm install
npm run build
```

### JS Solitaire
```bash
cd external/js-solitaire
npm install
npm run build
```

### JSPaint
JSPaint runs directly from source files (no build needed).

## Required Assets

Games need access to toolbar assets at `/gui/toolbar/`:
- `barlogo.webp` - Menu bar logo
- `back.webp`, `forward.webp` - Navigation icons
- `tooldropdown.webp` - Dropdown arrow
- `go.webp` - Go button icon

Make sure these are in the main project's `public/gui/toolbar/` folder.
