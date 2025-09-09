# MitchIvin XP - Local Copy

This is a local copy of the MitchIvin XP portfolio site (https://mitchivin.com/).

## How to run

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open in browser:
   ```
   http://localhost:8000/
   ```

## Notes

- The site uses obfuscated JavaScript for code protection
- Some features may not work fully offline due to:
  - External dependencies (XP.css from unpkg.com)
  - Missing app components (projects, about apps not fully downloaded)
  - Potential CORS issues with local file access

## Structure

```
mitchivin-local/
├── index.html           # Main HTML file
├── projects.json        # Portfolio project data
├── src/
│   ├── scripts/        # JavaScript files (obfuscated)
│   ├── styles/         # CSS files
│   └── apps/           # App components (resume, contact, etc.)
└── assets/             # Images, fonts, and other assets
```

## Downloaded Components

✅ Main HTML and CSS
✅ Core JavaScript files
✅ Desktop and taskbar images
✅ Boot screen assets
✅ Resume and Contact apps
✅ Font files
✅ Project data (JSON)

## Limitations

- JavaScript is obfuscated with renamed variables
- Some app components may be incomplete
- External CDN dependencies still required (XP.css)