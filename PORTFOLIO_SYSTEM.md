# XPortfolio Data-Driven System

This document explains how to use the new centralized, data-driven system for the XP Portfolio.

## Overview

The portfolio now uses:
- **`config.env`** - Environment variables for customization
- **`CV.yaml`** - Your resume/CV data (from terminal.ahmadjalil.com)
- **`content/`** - Markdown files for rich content
- **`public/profile.jpg`** - Your profile photo

## Configuration Files

### 1. `config.env` - Main Configuration

Controls how your portfolio displays information:

```bash
# Identity - how your name appears
NAME_DISPLAY_MODE=first          # "first", "last", "full", "custom"  
CUSTOM_NAME=MitchIvin            # Used when mode is "custom"
OS_SUFFIX=XP                     # "Ahmad XP", "MitchIvin XP", etc.

# Login screen
SHOW_PROFESSION=true             # Show profession on login screen
CUSTOM_PROFESSION=               # Override profession from CV

# Features
SHOW_SOCIAL_IN_START_MENU=true   # Social media in start menu
SHOW_SOCIAL_IN_ABOUT=true        # Social media in about page
ENABLE_PROJECT_MARKDOWN=true     # Load project details from markdown

# Paths
PROFILE_PHOTO=profile.jpg        # Your profile photo
CV_YAML_PATH=public/CV.yaml      # Your CV data
CV_PDF_PATH=public/CV.pdf        # Your CV PDF
```

### 2. `CV.yaml` - Your Data Source

Copy your CV.yaml from terminal.ahmadjalil.com to `public/CV.yaml`. This provides:
- Personal information (name, email, location)
- Social media links  
- Work experience
- Education
- Projects
- Awards, publications, etc.

## Content Management

### 3. `content/about.md` - About Page Content

Rich markdown content for your about page:

```markdown
# About Me

Hi! I'm a passionate developer...

## What I Do
- Point 1
- Point 2

## Get In Touch
Feel free to reach out!
```

### 4. `content/projects/` - Project Details

Create individual markdown files for each project:
- `content/projects/whisperdesk.md`
- `content/projects/aethalometer-analysis.md`
- etc.

Each project markdown provides rich details beyond the CV.yaml summary.

## How It Works

### Dynamic Name Display

The system will display your name based on `NAME_DISPLAY_MODE`:

- `first` → "Ahmad" (from "Ahmad Jalil")
- `last` → "Jalil" 
- `full` → "Ahmad Jalil"
- `custom` → Uses `CUSTOM_NAME` value

This name appears in:
- Window title: "Ahmad XP"
- Login screen: "Click Ahmad to login"
- Welcome messages
- Logoff dialog

### Social Media Integration

Social links from CV.yaml automatically appear in:
- Start menu (if `SHOW_SOCIAL_IN_START_MENU=true`)
- About page (if `SHOW_SOCIAL_IN_ABOUT=true`) 
- Contact information

Missing social networks won't appear (no empty icons).

### Project System

Projects come from two sources:
1. **CV.yaml** - Basic info (name, date, URL, summary)
2. **Markdown files** - Rich detailed content

If `ENABLE_PROJECT_MARKDOWN=true`:
- Projects with markdown files show detailed views
- Projects without markdown show CV.yaml summary
- Set `SHOW_PROJECTS_WITHOUT_MARKDOWN=false` to hide projects without markdown

### Resume/PDF Integration

Your CV.pdf can be:
- **Embedded** in the page (`PDF_DISPLAY_MODE=embed`)
- **Downloaded** directly (`PDF_DISPLAY_MODE=download`) 
- **Opened** in new tab (`PDF_DISPLAY_MODE=new_tab`)

## Using the Portfolio Manager

All apps can now use the centralized `PortfolioManager`:

```javascript
import { PortfolioManager } from './src/libs/portfolio/portfolioManager.js';

const portfolio = new PortfolioManager();
await portfolio.initialize();

// Get dynamic name
const displayName = portfolio.getDisplayName(); // "Ahmad"
const osName = portfolio.getOSName(); // "Ahmad XP"

// Get contact info  
const email = portfolio.getEmail();
const socials = portfolio.getSocialLinks();

// Get content
const aboutContent = await portfolio.getAboutContent();
const projects = await portfolio.getProjects();

// Check features
if (portfolio.shouldShowSocialInStartMenu()) {
    // Show social media in start menu
}
```

## File Structure

```
XPortfolio-1/
├── config.env                   # Main configuration
├── public/
│   ├── CV.yaml                  # Your resume data
│   ├── CV.pdf                   # Your resume PDF
│   └── profile.jpg              # Your profile photo
├── content/
│   ├── about.md                 # About page content
│   └── projects/                # Project details
│       ├── whisperdesk.md
│       ├── aethalometer-analysis.md
│       └── ...
└── src/libs/
    ├── config/
    │   └── configLoader.js      # Config management
    ├── content/
    │   └── markdownLoader.js    # Markdown processing
    └── portfolio/
        └── portfolioManager.js  # Main integration
```

## Customization Examples

### Different Name Displays

**Tech Professional Style:**
```bash
NAME_DISPLAY_MODE=last
OS_SUFFIX=OS
# Result: "Jalil OS"
```

**Personal Branding:**
```bash  
NAME_DISPLAY_MODE=custom
CUSTOM_NAME=AhmadTech
OS_SUFFIX=Desktop
# Result: "AhmadTech Desktop"
```

**Full Professional:**
```bash
NAME_DISPLAY_MODE=full
OS_SUFFIX=Workstation  
# Result: "Ahmad Jalil Workstation"
```

### Content Customization

**Minimal Social Media:**
```bash
SHOW_SOCIAL_IN_START_MENU=false
SHOW_SOCIAL_IN_ABOUT=true
# Only shows social links on about page
```

**Markdown-Only Projects:**
```bash
ENABLE_PROJECT_MARKDOWN=true
SHOW_PROJECTS_WITHOUT_MARKDOWN=false
# Only shows projects that have markdown files
```

## Benefits

✅ **Single Source of Truth** - Update CV.yaml and everything updates  
✅ **Easy Customization** - Change config.env without touching code  
✅ **Rich Content** - Markdown files for detailed content  
✅ **Automatic Updates** - Add projects to CV.yaml, they appear everywhere  
✅ **Flexible Branding** - Control how your name/brand appears  
✅ **No Hardcoding** - All text, images, links come from data files  

## Migration from Hardcoded System

1. Copy your CV.yaml to `public/CV.yaml`
2. Add your profile photo as `public/profile.jpg`  
3. Customize `config.env` with your preferences
4. Create `content/about.md` with your about content
5. Add project markdown files to `content/projects/`
6. Update your apps to use `PortfolioManager`

The system gracefully falls back to defaults if files are missing, so you can migrate gradually.

---

This system transforms your portfolio from a static, hardcoded site into a dynamic, data-driven platform that grows with your career!