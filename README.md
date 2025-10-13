# XPortfolio - Windows XP Style Portfolio

A YAML-based Windows XP themed portfolio website with a nostalgic desktop experience. Built with vanilla JavaScript, HTML, and CSS.

## Overview

This project provides an interactive Windows XP desktop environment for showcasing your portfolio, complete with:
- Working applications (Minesweeper, Paint, Media Player, etc.)
- Customizable content via YAML configuration
- Authentic Windows XP UI/UX
- Fully responsive design

**Note**: This project is inspired by and based on the [mitchvinm portfolio](https://mitchivin.com/).

## Features

- 🎮 **Interactive Apps**: Minesweeper, Paint (via jspaint.app), Media Player, Music Player (Winamp)
- 📄 **Portfolio Apps**: Resume, Projects, About Me, Contact
- 🎨 **Authentic XP Styling**: Using [XP.css](https://botoxparty.github.io/XP.css/)
- ⚙️ **YAML Configuration**: Easy content management via `public/CV.yaml`
- 🔄 **Template System**: Automatic placeholder replacement from YAML data
- 🪟 **Window Management**: Draggable, resizable windows with proper z-index handling
- 📱 **Mobile Support**: Responsive design with touch support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Portfolio

Edit `public/CV.yaml` with your information:

```yaml
name: "Your Name"
firstName: "Your"
location: "City, State"
email: "you@example.com"
title: "Your Title"
website: "https://yoursite.com"
linkedin: "https://linkedin.com/in/yourprofile"
github: "https://github.com/yourusername"
instagram: "https://instagram.com/yourusername"
previewImage: "./assets/gui/boot/preview.png"
```

### 3. Build

```bash
npm run build
```

This runs the template replacement script to populate placeholders in `index.html` with your YAML data.

### 4. Run Locally

Start a local server:

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000/`

## Project Structure

```
XPortfolio/
├── index.html              # Main entry point (with template placeholders)
├── public/
│   └── CV.yaml            # Your portfolio configuration
├── src/
│   ├── apps/              # Application components
│   │   ├── minesweeper/   # Minesweeper game
│   │   ├── paint/         # Paint app (iframe to jspaint.app)
│   │   ├── resume/        # Resume viewer
│   │   ├── projects/      # Projects showcase
│   │   ├── about/         # About me
│   │   ├── contact/       # Contact form
│   │   ├── mediaPlayer/   # Video player
│   │   └── musicPlayer/   # Winamp-style music player
│   ├── scripts/
│   │   ├── gui/           # Window management, taskbar, start menu
│   │   └── utils/         # Program registry, helpers
│   └── styles/
│       └── gui/           # Window, taskbar, desktop styling
├── assets/                # Images, fonts, icons
└── scripts/
    └── replace-templates.sh  # YAML → HTML template script
```

## Applications

### Built-in Apps

- **Minesweeper**: Fully functional classic Minesweeper with three difficulty levels
- **Paint**: Integration with jspaint.app for pixel-perfect MS Paint experience
- **Media Player**: Video player with playlist support
- **Music Player**: Winamp-style audio player
- **Command Prompt**: Terminal emulator
- **Image Viewer**: Photo viewer application

### Portfolio Apps

- **Resume**: Display your CV/resume
- **Projects**: Showcase your work with detailed project cards
- **About Me**: Tell your story with skills, software, and social links
- **Contact**: Contact information and social media links

## Customization

### Adding New Apps

1. Create app folder in `src/apps/yourapp/`
2. Add app files (HTML, CSS, JS)
3. Register in `src/scripts/utils/programRegistry.js`:

```javascript
yourapp: createProgram('yourapp', 'Your App', 'icon.svg', {
    appPath: 'src/apps/yourapp/yourapp.html',
    icon: './assets/apps/yourapp/icon.png',
    dimensions: { width: 400, height: 300 },
    resizable: true,
    canMaximize: true,
}),
```

4. Add to the start menu by updating `src/config/startMenuItems.js`

### Desktop Icons

Desktop icons are configured in `src/scripts/gui/desktop.js`. Add new icons by defining them in the `DESKTOP_ICONS` array.

### Start Menu

Start menu items are centralized in `src/config/startMenuItems.js`. Update the catalog to add, remove, or reorder entries and they will stay in sync across the pinned menu and the "All Programs" list.

### Styling

- Window styles: `src/styles/gui/window.css`
- Taskbar styles: `src/styles/gui/taskbar.css`
- Desktop styles: `src/styles/gui/desktop.css`
- Global styles: `src/styles/main.css`

## Development Tips

### For Small/Compact Apps (like Minesweeper)

When creating compact applications, you need to override default window constraints:

```css
/* Override minimum width */
.app-window[data-program="yourapp"] {
  min-width: auto !important;
}

/* Control title bar width */
.app-window[data-program="yourapp"] .title-bar-text {
  max-width: 70px;
  text-overflow: ellipsis;
  margin-right: 0 !important;
}

/* Remove window body padding */
.app-window[data-program="yourapp"] .window-body {
  padding: 0 !important;
}
```

### Window Sizing

Apps can send resize messages to the parent window:

```javascript
window.parent?.postMessage({
  type: 'fit-content-size',
  width: calculatedWidth,
  height: calculatedHeight
}, '*');
```

### App Communication

Apps run in iframes and can communicate with the parent via `postMessage`:

```javascript
// From app (iframe)
window.parent?.postMessage({ type: 'close-window' }, '*');

// From parent (window manager)
window.addEventListener('message', (e) => {
  if (e.data.type === 'app-preload-ready') {
    // App is ready
  }
});
```

## Build Scripts

- `npm run build` - Run template replacement (updates `index.html` with YAML data)
- `npm run replace-templates` - Same as build

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (with touch support)

## Credits

- **Original Inspiration**: [MitchIvin](https://mitchivin.com/) - This project is based on the mitchvinm Windows XP portfolio
- **XP.css**: [Botoxparty's XP.css](https://botoxparty.github.io/XP.css/) for authentic Windows XP styling
- **jspaint**: [jspaint.app](https://jspaint.app/) for the Paint application
- **Fonts**: Tahoma and other Windows XP system fonts

## License

MIT

## Contributing

Feel free to fork, modify, and create your own Windows XP portfolio! If you make improvements, consider submitting a PR.

---

**Made with nostalgia** 🪟✨
