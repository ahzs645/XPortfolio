# XPortfolio Web App SDK

Create and install web applications that run inside the XPortfolio Windows XP environment.

## Quick Start

### 1. Create Your Web App

Your web app can be any HTML/JavaScript application. To integrate with XPortfolio, include our SDK:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Awesome App</title>
  <script src="https://YOUR_XPORTFOLIO_SITE/sdk/xportfolio-sdk.js"></script>
</head>
<body>
  <h1>Hello, XPortfolio!</h1>

  <script>
    // Check if running inside XPortfolio
    if (XPortfolio.isInXPortfolio()) {
      XPortfolio.init().then(() => {
        console.log('Connected to XPortfolio!');

        // Update window title
        XPortfolio.window.setTitle('My App - Running!');
      });
    }
  </script>
</body>
</html>
```

### 2. Add a Manifest (Optional but Recommended)

Create an `xportfolio-manifest.json` in your app's root directory:

```json
{
  "name": "My Awesome App",
  "short_name": "AwesomeApp",
  "description": "A sample web application for XPortfolio",
  "version": "1.0.0",
  "author": "Your Name",
  "icons": [
    {
      "src": "/icon-32.png",
      "sizes": "32x32",
      "type": "image/png"
    }
  ],
  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "resizable": true
  },
  "permissions": [
    "fileSystem.read",
    "fileSystem.write"
  ]
}
```

### 3. Host Your App

You can host your app anywhere:

- **GitHub Pages**: Simply push to a GitHub repo with Pages enabled
- **Any web server**: Netlify, Vercel, your own server, etc.
- **jsDelivr CDN**: Use `cdn.jsdelivr.net/gh/user/repo@branch/`

### 4. Install in XPortfolio

Open the **App Installer** from Start Menu > Accessories > App Installer

Enter your app URL:
- Direct URL: `https://mysite.com/myapp/`
- GitHub repo: `github.com/username/my-app`
- GitHub Pages: `username.github.io/my-app`

---

## SDK Reference

### Initialization

```javascript
// Check if running inside XPortfolio
if (XPortfolio.isInXPortfolio()) {
  // Initialize and connect
  XPortfolio.init().then((info) => {
    console.log('Version:', info.version);
    console.log('Capabilities:', info.capabilities);
  });
}
```

### Window Control

```javascript
// Update window title
await XPortfolio.window.setTitle('New Title');

// Update window icon
await XPortfolio.window.setIcon('/path/to/icon.png');

// Minimize window
await XPortfolio.window.minimize();

// Maximize window
await XPortfolio.window.maximize();

// Close window
await XPortfolio.window.close();
```

### File System

```javascript
// Get system folder IDs
const folders = await XPortfolio.fs.getSystemFolders();
// Returns: { myDocuments, myPictures, myMusic, desktop }

// List files in a folder
const files = await XPortfolio.fs.listFiles(folders.myDocuments);
// Returns: [{ id, name, type, icon, size, dateModified }, ...]

// Read a file
const content = await XPortfolio.fs.readFile(fileId);
// Returns: { content: 'data:mime/type;base64,...', type: 'mime/type' }

// Write/create a file
const result = await XPortfolio.fs.writeFile('document.txt', textContent, {
  folderId: folders.myDocuments,
  type: 'text/plain'
});
```

### Events

```javascript
// Listen for XPortfolio ready event
XPortfolio.events.onReady((info) => {
  console.log('XPortfolio is ready!', info.capabilities);
});
```

---

## Manifest Reference

The `xportfolio-manifest.json` file describes your app:

```json
{
  "name": "Full App Name",
  "short_name": "ShortName",
  "description": "Brief description of your app",
  "version": "1.0.0",
  "author": "Developer Name",

  "icons": [
    { "src": "/icon-16.png", "sizes": "16x16" },
    { "src": "/icon-32.png", "sizes": "32x32" },
    { "src": "/icon-64.png", "sizes": "64x64" }
  ],

  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "resizable": true
  },

  "permissions": [
    "fileSystem.read",
    "fileSystem.write"
  ],

  "start_url": "/",
  "display": "standalone"
}
```

### Manifest Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full app name displayed in installer |
| `short_name` | string | Short name for limited space |
| `description` | string | Brief description of the app |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `author` | string | Developer/company name |
| `icons` | array | Array of icon objects with `src` and `sizes` |
| `window.width` | number | Default window width in pixels |
| `window.height` | number | Default window height in pixels |
| `window.minWidth` | number | Minimum window width |
| `window.minHeight` | number | Minimum window height |
| `window.resizable` | boolean | Whether window can be resized |
| `permissions` | array | Requested permissions |
| `start_url` | string | Starting page URL |

---

## GitHub Integration

XPortfolio can install apps directly from GitHub repositories.

### Supported URL Formats

```
# GitHub repository URL
github.com/username/repo

# GitHub with subfolder
github.com/username/repo/tree/main/apps/myapp

# GitHub Pages URL
username.github.io/repo

# Raw GitHub content
raw.githubusercontent.com/username/repo/main/

# jsDelivr CDN
cdn.jsdelivr.net/gh/username/repo@main/
```

### Requirements for GitHub Apps

1. **Enable GitHub Pages** in your repository settings
2. Place `index.html` in the root or specified subfolder
3. (Optional) Add `xportfolio-manifest.json` for better integration

### Example: Minimal GitHub App

Repository structure:
```
my-app/
├── index.html
├── xportfolio-manifest.json
├── icon.png
├── styles.css
└── app.js
```

---

## Using XPortfolio Components

Installed apps can use the same UI components as built-in XPortfolio apps through the SDK:

```javascript
// Coming soon: Component API
// This will allow apps to use MenuBar, Toolbar, etc.
```

---

## Example Apps

### Simple Text Editor

```html
<!DOCTYPE html>
<html>
<head>
  <title>Simple Editor</title>
  <script src="/sdk/xportfolio-sdk.js"></script>
  <style>
    body { margin: 0; font-family: 'Courier New', monospace; }
    #editor { width: 100%; height: 100vh; border: none; padding: 10px; box-sizing: border-box; }
  </style>
</head>
<body>
  <textarea id="editor" placeholder="Start typing..."></textarea>

  <script>
    const editor = document.getElementById('editor');

    if (XPortfolio.isInXPortfolio()) {
      XPortfolio.init().then(async () => {
        XPortfolio.window.setTitle('Simple Editor - Untitled');

        // Save with Ctrl+S
        document.addEventListener('keydown', async (e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();

            const content = editor.value;
            const blob = new Blob([content], { type: 'text/plain' });

            await XPortfolio.fs.writeFile('document.txt', blob);
            XPortfolio.window.setTitle('Simple Editor - Saved!');

            setTimeout(() => {
              XPortfolio.window.setTitle('Simple Editor - document.txt');
            }, 2000);
          }
        });
      });
    }
  </script>
</body>
</html>
```

### Image Viewer

```html
<!DOCTYPE html>
<html>
<head>
  <title>Image Viewer</title>
  <script src="/sdk/xportfolio-sdk.js"></script>
  <style>
    body {
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f0f0f0;
    }
    #toolbar {
      padding: 5px;
      background: #ece9d8;
      border-bottom: 1px solid #aaa;
    }
    #viewer {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }
    #image { max-width: 100%; max-height: 100%; }
    button {
      padding: 4px 12px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <button onclick="loadImage()">Open Image...</button>
  </div>
  <div id="viewer">
    <img id="image" src="" style="display: none;">
    <span id="placeholder">Click "Open Image" to browse</span>
  </div>

  <script>
    async function loadImage() {
      if (!XPortfolio.isInXPortfolio()) return;

      const folders = await XPortfolio.fs.getSystemFolders();
      const files = await XPortfolio.fs.listFiles(folders.myPictures);

      // Find first image
      const imageFile = files.find(f =>
        f.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)
      );

      if (imageFile) {
        const content = await XPortfolio.fs.readFile(imageFile.id);
        document.getElementById('image').src = content.content;
        document.getElementById('image').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
        XPortfolio.window.setTitle('Image Viewer - ' + imageFile.name);
      } else {
        alert('No images found in My Pictures');
      }
    }

    if (XPortfolio.isInXPortfolio()) {
      XPortfolio.init();
    }
  </script>
</body>
</html>
```

---

## Fallback for Non-XPortfolio

Your app should work standalone too:

```javascript
if (XPortfolio.isInXPortfolio()) {
  // Running inside XPortfolio
  XPortfolio.init().then(() => {
    // XPortfolio-specific features
  });
} else {
  // Running standalone - use normal browser APIs
  console.log('Running in standalone mode');
}
```

---

## Security

- Apps run in a sandboxed iframe with limited permissions
- Cross-origin restrictions apply (CORS)
- File system access is limited to XPortfolio's virtual file system
- Apps cannot access the host page or other apps

---

## Troubleshooting

### App won't load
- Check browser console for CORS errors
- Ensure your server sends correct `Content-Type` headers
- Try accessing the URL directly in a browser tab

### GitHub app not found
- Verify GitHub Pages is enabled in repository settings
- Check the Pages URL in Settings > Pages
- Ensure index.html exists in the root or specified folder

### Manifest not detected
- File must be named exactly `xportfolio-manifest.json`
- Must be valid JSON (use a JSON validator)
- Must be in the same directory as index.html

---

## License

XPortfolio SDK is open source. Apps you create are yours.
