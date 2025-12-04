# TaskPanel Component Usage Guide

A Windows XP-style sidebar panel with collapsible sections, commonly seen in Explorer windows.

## Quick Start

```jsx
import { TaskPanel } from '../components';

function MyApp() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <TaskPanel>
        <TaskPanel.Section title="File Tasks" variant="primary">
          <TaskPanel.Item icon="/icons/folder.png" onClick={() => console.log('clicked')}>
            Make a new folder
          </TaskPanel.Item>
        </TaskPanel.Section>
      </TaskPanel>

      <div style={{ flex: 1 }}>
        {/* Main content */}
      </div>
    </div>
  );
}
```

## Components

### TaskPanel

The main container component that provides the blue gradient background.

```jsx
<TaskPanel width={190}>
  {/* Sections go here */}
</TaskPanel>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 190 | Width of the panel in pixels |
| `children` | node | - | TaskPanel.Section components |

---

### TaskPanel.Section

A collapsible section with a header and content area.

```jsx
<TaskPanel.Section
  title="Section Title"
  variant="primary"
  defaultExpanded={true}
  icon="/icons/section-icon.png"
>
  {/* Items go here */}
</TaskPanel.Section>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Section header text |
| `variant` | `'default'` \| `'primary'` | `'default'` | `'primary'` = blue header, `'default'` = white/gray header |
| `defaultExpanded` | boolean | `true` | Whether section starts expanded |
| `icon` | string | null | Optional icon URL for the header |

---

### TaskPanel.Item

A clickable item row with an icon and text.

```jsx
<TaskPanel.Item
  icon="/icons/action.png"
  onClick={() => handleAction()}
  disabled={false}
>
  Click me
</TaskPanel.Item>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | - | Icon URL |
| `onClick` | function | - | Click handler |
| `disabled` | boolean | `false` | Disable the item |
| `children` | node | - | Item text |

---

### TaskPanel.Link

An external link that opens in a new tab.

```jsx
<TaskPanel.Link
  icon="/icons/link.png"
  href="https://example.com"
  target="_blank"
>
  Visit website
</TaskPanel.Link>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | - | Icon URL |
| `href` | string | - | Link URL |
| `target` | string | `'_blank'` | Link target |
| `children` | node | - | Link text |

---

### TaskPanel.Text

A non-clickable text row, useful for displaying information.

```jsx
<TaskPanel.Text icon="/icons/info.png">
  Some information
</TaskPanel.Text>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | - | Icon URL |
| `children` | node | - | Text content |

---

### TaskPanel.Separator

A horizontal line to separate groups of items.

```jsx
<TaskPanel.Section title="Tasks">
  <TaskPanel.Item>Item 1</TaskPanel.Item>
  <TaskPanel.Item>Item 2</TaskPanel.Item>
  <TaskPanel.Separator />
  <TaskPanel.Item>Item 3</TaskPanel.Item>
</TaskPanel.Section>
```

---

## Complete Example

Here's a full example mimicking the Windows XP "My Computer" task panel:

```jsx
import { TaskPanel } from '../components';

function MyComputer({ onNewFolder, onSearch }) {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <TaskPanel>
        {/* Primary section with blue header */}
        <TaskPanel.Section title="System Tasks" variant="primary">
          <TaskPanel.Item
            icon="/icons/xp/FolderClosed.png"
            onClick={onNewFolder}
          >
            Make a new folder
          </TaskPanel.Item>
          <TaskPanel.Item
            icon="/icons/xp/Search.png"
            onClick={onSearch}
          >
            Search for files
          </TaskPanel.Item>
        </TaskPanel.Section>

        {/* Default section with white/gray header */}
        <TaskPanel.Section title="Other Places">
          <TaskPanel.Item
            icon="/icons/xp/MyDocuments.png"
            onClick={() => navigateTo('my-documents')}
          >
            My Documents
          </TaskPanel.Item>
          <TaskPanel.Item
            icon="/icons/xp/MyPictures.png"
            onClick={() => navigateTo('my-pictures')}
          >
            My Pictures
          </TaskPanel.Item>
          <TaskPanel.Item
            icon="/icons/xp/MyMusic.png"
            onClick={() => navigateTo('my-music')}
          >
            My Music
          </TaskPanel.Item>
        </TaskPanel.Section>

        {/* Section with external links */}
        <TaskPanel.Section title="Details" defaultExpanded={false}>
          <TaskPanel.Text icon="/icons/xp/LocalDisk.png">
            Local Disk (C:)
          </TaskPanel.Text>
          <TaskPanel.Text>
            Total Size: 40 GB
          </TaskPanel.Text>
          <TaskPanel.Text>
            Free Space: 12 GB
          </TaskPanel.Text>
        </TaskPanel.Section>
      </TaskPanel>

      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* File browser content */}
      </main>
    </div>
  );
}
```

## Styling Notes

- The panel has a blue gradient background matching Windows XP
- Primary sections have a blue header (like "System Tasks")
- Default sections have a white/gray header (like "Other Places")
- Icons should be 13x13px for best appearance
- The collapse/expand arrows are automatically handled
- Hover states add underlines to clickable items

## Icon Paths

Common XP icons available in the project:

```
/icons/xp/FolderClosed.png
/icons/xp/FolderOpened.png
/icons/xp/MyDocuments.png
/icons/xp/MyPictures.png
/icons/xp/MyMusic.png
/icons/xp/MyComputer.png
/icons/xp/LocalDisk.png
/icons/xp/Search.png
/icons/xp/HelpandSupport.png
```
