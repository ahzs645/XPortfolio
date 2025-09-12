# Terminal Core Integration

## Overview

The XP Portfolio CMD app has been enhanced with a modular terminal core system that:
- Loads data dynamically from `CV.yaml`
- Shares logic with terminal.ahmadjalil.com
- Preserves the Windows XP cmd styling
- Can be easily updated when terminal.ahmadjalil.com changes

## Architecture

```
src/
├── libs/
│   └── terminal-core/       # Shared terminal logic
│       ├── terminalCore.js  # Main terminal engine
│       ├── cvLoader.js      # CV data loader
│       ├── commandRegistry.js # Command management
│       └── yamlParser.js    # Simple YAML parser
└── apps/
    └── cmd/
        ├── cmd.html          # XP-styled terminal UI
        ├── cmd.css           # XP terminal styling (preserved)
        ├── cmd.js            # Original hardcoded version
        ├── cmd-enhanced.js   # CV-driven version
        └── cmd-wrapper.js    # Smart loader

public/
├── CV.yaml                  # Your CV data
└── CV.pdf                   # Your CV PDF (optional)
```

## Features

### Dynamic Commands Based on CV Data

The terminal now generates commands based on your CV.yaml:
- `about` - Shows your personal information
- `experience` - Lists your work experience
- `education` - Shows your education background
- `projects` - Displays your projects
- `contact` - Shows contact information and social links
- `cv` / `download` - Download CV in PDF or YAML format

### Preserved XP Styling

- Maintains the classic Windows XP command prompt appearance
- Uses the same font, colors, and terminal behavior
- Keeps the C:\> prompt style

### Modular Design

The terminal core is framework-agnostic and can be:
1. Used in the XP portfolio (vanilla JS)
2. Imported into terminal.ahmadjalil.com (React)
3. Extended with custom commands

## Usage

### Switching Between Versions

Edit `src/apps/cmd/cmd-wrapper.js`:
```javascript
const useEnhanced = true;  // Set to false for original version
```

### Adding Custom Commands

In `cmd-enhanced.js`:
```javascript
terminalCore.registerCustomCommand('mycommand', {
    description: 'My custom command',
    execute: (args) => {
        return 'Command output';
    }
});
```

### Updating CV Data

1. Edit `public/CV.yaml` with your information
2. The terminal will automatically load the new data
3. Commands will reflect your updated CV

## Synchronization with terminal.ahmadjalil.com

To update the terminal core from terminal.ahmadjalil.com:

1. Copy updated logic from terminal.ahmadjalil.com/src/utils/
2. Update the corresponding files in src/libs/terminal-core/
3. Maintain the separation between:
   - Core logic (terminal-core/)
   - React-specific code (terminal.ahmadjalil.com)
   - XP-specific styling (cmd app)

## Testing

1. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000/src/apps/cmd/cmd.html

3. Test commands:
   - `help` - See all available commands
   - `about` - View your information
   - `experience` - Check work history display
   - `clear` - Clear the terminal
   - Tab completion for commands
   - Arrow keys for command history

## Future Enhancements

- [ ] Add more YAML sections support (publications, awards, etc.)
- [ ] Implement theme switching
- [ ] Add ASCII art for welcome message
- [ ] Support for multiple CV formats
- [ ] Better error handling for missing CV data