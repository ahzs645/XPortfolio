# WindowBars Components Usage Guide

These components provide a consistent Windows XP-style toolbar system for all your "programs".

## Quick Start - Using ProgramLayout

The easiest way to use these components is with `ProgramLayout`, which handles everything for you:

```jsx
import { ProgramLayout } from '../components';

function MyApp({ onClose, onMinimize, onMaximize }) {
  return (
    <ProgramLayout
      // Window controls (for Exit, Minimize, Maximize menu actions)
      windowActions={{ onClose, onMinimize, onMaximize }}

      // Menu Bar Configuration
      menus={[
        {
          id: 'file',
          label: 'File',
          items: [
            { label: 'Print', disabled: true },
            { label: 'Print Setup', disabled: true },
            { separator: true },
            { label: 'Exit', action: 'exitProgram' }
          ]
        },
        {
          id: 'view',
          label: 'View',
          items: [
            { label: 'Maximize', action: 'maximizeWindow' },
            { label: 'Minimize', action: 'minimizeWindow' }
          ]
        },
        { id: 'help', label: 'Help', disabled: true }
      ]}
      menuLogo="/gui/toolbar/barlogo.webp"

      // Toolbar Configuration
      toolbarItems={[
        { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous', disabled: true, action: 'nav:prev' },
        { type: 'button', id: 'next', icon: '/gui/toolbar/forward.webp', label: 'Next', disabled: true, action: 'nav:next' },
        { type: 'separator' },
        { type: 'button', id: 'projects', icon: '/icons/projects.webp', label: 'My Projects', action: 'openProjects' },
        { type: 'button', id: 'resume', icon: '/icons/resume.webp', label: 'My Resume', action: 'openResume' },
        { type: 'separator' },
        { type: 'button', id: 'folder', icon: '/gui/toolbar/up.webp', disabled: true }
      ]}
      onToolbarAction={(action, id) => {
        console.log('Toolbar action:', action, id);
      }}

      // Address Bar Configuration
      addressTitle="About Me"
      addressIcon="/icons/about.webp"
      addressLoading={false}

      // Status Bar Configuration
      statusFields="Learn more about Ahmad"
    >
      {/* Your app content goes here */}
      <div style={{ padding: 20 }}>
        <h1>Hello World</h1>
        <p>Your content here...</p>
      </div>
    </ProgramLayout>
  );
}
```

## Using Individual Components

You can also use each component separately for more control:

### MenuBar

```jsx
import { MenuBar } from '../components';

<MenuBar
  menus={[
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New', action: 'new' },
        { label: 'Open', action: 'open' },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' }
      ]
    },
    { id: 'edit', label: 'Edit', disabled: true },
    { id: 'help', label: 'Help', disabled: true }
  ]}
  logo="/gui/toolbar/barlogo.webp"
  onAction={(action) => console.log('Menu action:', action)}
  windowActions={{ onClose, onMinimize, onMaximize }}
/>
```

### Toolbar

```jsx
import { Toolbar } from '../components';

// Standard explorer-style toolbar
<Toolbar
  items={[
    { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', action: 'navigate:back' },
    { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', disabled: true },
    { type: 'separator' },
    { type: 'button', id: 'home', icon: '/gui/toolbar/home.webp', label: 'Home', action: 'navigate:home' },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp' }, // No label, just icon
  ]}
  onAction={(action, id) => console.log('Button clicked:', action, id)}
/>

// Compact WordPad-style toolbar with selects, color picker, and toggle buttons
<Toolbar
  variant="compact"
  items={[
    { type: 'select', id: 'font', value: 'Arial', options: [
      { value: 'Arial', label: 'Arial' },
      { value: 'Times New Roman', label: 'Times New Roman' },
    ], width: 120 },
    { type: 'select', id: 'size', value: '12', options: [
      { value: '10', label: '10' },
      { value: '12', label: '12' },
      { value: '14', label: '14' },
    ], width: 50 },
    { type: 'separator' },
    { type: 'button', id: 'bold', icon: '/icons/bold.png', active: isBold, action: 'format:bold' },
    { type: 'button', id: 'italic', icon: '/icons/italic.png', active: isItalic, action: 'format:italic' },
    { type: 'color', id: 'textColor', value: '#000000', title: 'Text Color' },
    { type: 'spacer', width: 16 },
    { type: 'button', id: 'left', icon: '/icons/left.png', active: isLeft, action: 'align:left' },
  ]}
  onAction={(action) => handleFormat(action)}
  onChange={(id, value) => handleChange(id, value)}
/>
```

#### Toolbar Item Types

| Type | Properties | Description |
|------|------------|-------------|
| `button` | `id`, `icon`, `label?`, `disabled?`, `active?`, `action` | Clickable button with icon |
| `separator` | - | Vertical divider line |
| `spacer` | `width?` | Empty space (default 8px) |
| `select` | `id`, `value`, `options`, `width?`, `disabled?`, `title?` | Dropdown selector |
| `color` | `id`, `value`, `title?`, `disabled?` | Color picker input |

#### Toolbar Variants

- `default` - Standard explorer toolbar (48px height, 25x25 icons)
- `compact` - WordPad-style toolbar (28px height, 16x16 icons)

### AddressBar

```jsx
import { AddressBar } from '../components';

<AddressBar
  title="C:\My Documents"
  icon="/icons/folder-icon.png"
  loading={false}  // Set to true to show loading animation
  showGoButton={true}
  onGoClick={() => console.log('Go clicked')}
/>
```

### StatusBar

```jsx
import { StatusBar } from '../components';

// Simple single field
<StatusBar fields="Ready" />

// Multiple fields with custom widths
<StatusBar
  fields={[
    { text: "Ready", flex: 1 },
    { text: "Ln 1, Col 1", width: "100px" },
    { text: "INS", width: "40px" }
  ]}
  showGrip={true}
/>
```

## PDF Viewer / Adobe Reader Style Toolbar

For applications like PDF viewers that need icon-only compact toolbars with zoom controls:

```jsx
import { ProgramLayout } from '../components';

function PDFViewerApp({ onClose, onMinimize, onMaximize }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(10);
  const [scale, setScale] = useState(100);

  // SVG icons for zoom (magnifying glass with +/-)
  const zoomOutIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='6' cy='6' r='5' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Cline x1='10' y1='10' x2='14' y2='14' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='3' y1='6' x2='9' y2='6' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E";
  const zoomInIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='6' cy='6' r='5' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Cline x1='10' y1='10' x2='14' y2='14' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='3' y1='6' x2='9' y2='6' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='6' y1='3' x2='6' y2='9' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E";

  const toolbarItems = [
    { type: 'button', id: 'open', icon: '/icons/pdf/AcroRd32_grp18534_lang1033.ico', action: 'open', title: 'Open' },
    { type: 'button', id: 'print', icon: '/gui/toolbar/print.webp', action: 'print', title: 'Print' },
    { type: 'separator' },
    { type: 'button', id: 'prevPage', icon: '/gui/toolbar/back.webp', action: 'prevPage', disabled: pageNumber <= 1, title: 'Previous Page' },
    { type: 'button', id: 'nextPage', icon: '/gui/toolbar/forward.webp', action: 'nextPage', disabled: pageNumber >= numPages, title: 'Next Page' },
    { type: 'separator' },
    { type: 'button', id: 'zoomOut', icon: zoomOutIcon, action: 'zoomOut', title: 'Zoom Out' },
    { type: 'select', id: 'zoom', value: String(scale), options: [
      { value: '50', label: '50%' },
      { value: '75', label: '75%' },
      { value: '100', label: '100%' },
      { value: '125', label: '125%' },
      { value: '150', label: '150%' },
      { value: '200', label: '200%' },
    ], width: 65 },
    { type: 'button', id: 'zoomIn', icon: zoomInIcon, action: 'zoomIn', title: 'Zoom In' },
  ];

  const handleToolbarAction = (action) => {
    switch (action) {
      case 'open': handleFileOpen(); break;
      case 'print': window.print(); break;
      case 'prevPage': setPageNumber(p => Math.max(p - 1, 1)); break;
      case 'nextPage': setPageNumber(p => Math.min(p + 1, numPages)); break;
      case 'zoomOut': setScale(s => Math.max(s - 10, 50)); break;
      case 'zoomIn': setScale(s => Math.min(s + 10, 200)); break;
    }
  };

  const handleZoomChange = (id, value) => {
    if (id === 'zoom') setScale(Number(value));
  };

  return (
    <ProgramLayout
      menus={[
        { id: 'file', label: 'File', items: [
          { label: 'Open...', action: 'open' },
          { label: 'Print...', action: 'print' },
          { separator: true },
          { label: 'Exit', action: 'exitProgram' },
        ]},
        { id: 'view', label: 'View', items: [
          { label: 'Zoom In', action: 'zoomIn' },
          { label: 'Zoom Out', action: 'zoomOut' },
        ]},
      ]}
      toolbarItems={toolbarItems}
      onToolbarAction={handleToolbarAction}
      onToolbarChange={handleZoomChange}
      windowActions={{ onClose, onMinimize, onMaximize }}
      showAddressBar={false}
      showStatusBar={false}
    >
      <PDFContent />
    </ProgramLayout>
  );
}
```

### Using SVG Data URIs for Custom Icons

You can use inline SVG data URIs for custom icons like zoom magnifying glasses:

```jsx
// Magnifying glass with minus sign (zoom out)
const zoomOutIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='6' cy='6' r='5' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Cline x1='10' y1='10' x2='14' y2='14' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='3' y1='6' x2='9' y2='6' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E";

// Magnifying glass with plus sign (zoom in)
const zoomInIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='6' cy='6' r='5' fill='none' stroke='%23333' stroke-width='1.5'/%3E%3Cline x1='10' y1='10' x2='14' y2='14' stroke='%23333' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='3' y1='6' x2='9' y2='6' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='6' y1='3' x2='6' y2='9' stroke='%23333' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E";

// Use in toolbar items
{ type: 'button', id: 'zoomOut', icon: zoomOutIcon, action: 'zoomOut', title: 'Zoom Out' }
```

## Available Toolbar Icons

Located in `/public/gui/toolbar/`:
- `back.webp` - Back/Previous navigation
- `forward.webp` - Forward/Next navigation
- `up.webp` - Up/Parent folder
- `home.webp` - Home
- `search.webp` - Search
- `favorites.webp` - Favorites
- `copy.webp` - Copy
- `cut.webp` - Cut
- `paste.webp` - Paste
- `delete.webp` - Delete
- `new.webp` - New
- `save.webp` - Save
- `print.webp` - Print
- `send.webp` - Send
- `views.webp` - Views
- `go.webp` - Go button
- `tooldropdown.webp` - Dropdown arrow
- `barlogo.webp` - Menu bar logo

## Built-in Actions

These actions are automatically handled when `windowActions` is provided:

- `exitProgram` - Calls `onClose()`
- `maximizeWindow` - Calls `onMaximize()`
- `minimizeWindow` - Calls `onMinimize()`

All other actions are passed to your `onAction` or `onToolbarAction` callbacks.

## Multiple Toolbars (WordPad Style)

For applications like WordPad that need multiple compact toolbars with selects and color pickers:

```jsx
import { ProgramLayout } from '../components';

function WordpadApp({ onClose }) {
  const [fontName, setFontName] = useState('Arial');
  const [fontSize, setFontSize] = useState('12');
  const [textColor, setTextColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleToolbarAction = (action, toolbarId) => {
    switch (action) {
      case 'format:bold': setIsBold(!isBold); break;
      case 'format:italic': setIsItalic(!isItalic); break;
      case 'file:new': handleNew(); break;
      // ... handle other actions
    }
  };

  const handleToolbarChange = (toolbarId, itemId, value) => {
    switch (itemId) {
      case 'font': setFontName(value); break;
      case 'size': setFontSize(value); break;
      case 'textColor': setTextColor(value); break;
    }
  };

  return (
    <ProgramLayout
      menus={[
        { id: 'file', label: 'File', items: [...] },
        { id: 'edit', label: 'Edit', items: [...] },
      ]}
      toolbars={[
        {
          id: 'file-tools',
          variant: 'compact',
          items: [
            { type: 'button', id: 'new', icon: '/icons/new.png', action: 'file:new', title: 'New' },
            { type: 'button', id: 'open', icon: '/icons/open.png', action: 'file:open', title: 'Open' },
            { type: 'button', id: 'save', icon: '/icons/save.png', action: 'file:save', title: 'Save' },
            { type: 'separator' },
            { type: 'button', id: 'cut', icon: '/icons/cut.png', action: 'edit:cut', title: 'Cut' },
            { type: 'button', id: 'copy', icon: '/icons/copy.png', action: 'edit:copy', title: 'Copy' },
            { type: 'button', id: 'paste', icon: '/icons/paste.png', action: 'edit:paste', title: 'Paste' },
          ]
        },
        {
          id: 'format-tools',
          variant: 'compact',
          items: [
            { type: 'select', id: 'font', value: fontName, options: [
              { value: 'Arial', label: 'Arial' },
              { value: 'Times New Roman', label: 'Times New Roman' },
              { value: 'Courier New', label: 'Courier New' },
            ], width: 120, title: 'Font' },
            { type: 'select', id: 'size', value: fontSize, options: [
              { value: '10', label: '10' },
              { value: '12', label: '12' },
              { value: '14', label: '14' },
              { value: '18', label: '18' },
            ], width: 50, title: 'Size' },
            { type: 'separator' },
            { type: 'button', id: 'bold', icon: '/icons/bold.png', active: isBold, action: 'format:bold', title: 'Bold' },
            { type: 'button', id: 'italic', icon: '/icons/italic.png', active: isItalic, action: 'format:italic', title: 'Italic' },
            { type: 'color', id: 'textColor', value: textColor, title: 'Text Color' },
          ]
        }
      ]}
      onToolbarAction={handleToolbarAction}
      onToolbarChange={handleToolbarChange}
      windowActions={{ onClose }}
    >
      <EditorContent />
    </ProgramLayout>
  );
}
```
