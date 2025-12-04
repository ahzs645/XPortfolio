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
```

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
