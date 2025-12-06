# Projects Folder

The **Projects** folder appears on the Windows XP desktop with a briefcase icon. It automatically displays projects defined in your `CV.yaml` file.

## How It Works

Projects listed under `cv.sections.projects` in `public/CV.yaml` will automatically appear as subfolders inside the Projects briefcase on the desktop.

Each project folder contains:
- **Project Info.txt** - A formatted text file with project details (opens in Notepad)
- **Website.url** - An internet shortcut that opens the project URL in a new browser tab (only created if `url` is provided)

## CV.yaml Structure

```yaml
cv:
  sections:
    projects:
      - name: My Project Name
        date: 2024
        url: https://github.com/user/repo
        summary: A brief description of what this project does.
        highlights:
          - Technologies - React, Node.js, TypeScript
          - Some other highlight about the project
```

## Field Reference

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Project title (used as the folder name) |
| `summary` | Description of the project (appears in Project Info.txt) |

### Optional Fields

| Field | Description |
|-------|-------------|
| `date` | Year or date of the project |
| `url` | Link to project website/repo (creates Website.url shortcut) |
| `highlights` | List of bullet points about the project |

## Special Formatting

- If a highlight starts with `Technologies - `, it will be extracted and displayed separately as the tech stack
- All other highlights appear in a "Highlights" section in the text file

## Example Project Info.txt Output

```
Whisperdesk
═══════════

──────────────────────────────────────────────────
  PROJECT INFO
──────────────────────────────────────────────────

  Date:         2024
  Technologies: C++, Whisper.cpp, Desktop Development
  Website:      https://github.com/ahzs645/WhisperDesk

──────────────────────────────────────────────────
  SUMMARY
──────────────────────────────────────────────────

  A powerful desktop transcription application powered
  by native whisper.cpp with persistent state management
  and real-time progress feedback.

──────────────────────────────────────────────────
  Double-click Website.url to visit the project
──────────────────────────────────────────────────
```

## Notes

- The Projects folder is created when the file system initializes
- Existing users will get the Projects folder on their next visit via automatic migration
- To see changes after modifying CV.yaml, you may need to clear IndexedDB storage or reset the file system
