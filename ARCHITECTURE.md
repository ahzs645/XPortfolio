# XPortfolio Architecture

## Overview

The XPortfolio system is now built with a clean, modular architecture that separates concerns and eliminates dependencies between components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications Layer                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Terminal CMD  │  About Page     │   Other XP Apps        │
│                 │                 │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
           │               │                     │
           ▼               ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Manager                        │
│              (High-level business logic)                    │
└─────────────────────────────────────────────────────────────┘
           │               │                     │
           ▼               ▼                     ▼
┌─────────────────┬─────────────────┬─────────────────────────┐
│ Terminal Core   │  Config Loader  │   Markdown Loader       │
│                 │                 │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
           │               │                     │
           ▼               ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared Data Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ CV Parser   │  │  CV Data    │  │   YAML Parser       │  │
│  │             │  │  Loader     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │               │                     │
           ▼               ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Sources                           │
│     config.env    │    CV.yaml     │   content/*.md         │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/libs/
├── data/                    # ✨ NEW: Shared data processing
│   └── cvParser.js          # CV parsing logic (shared)
├── config/
│   └── configLoader.js      # Environment config management
├── content/
│   └── markdownLoader.js    # Markdown processing
├── portfolio/
│   └── portfolioManager.js  # High-level business logic
└── terminal-core/           # Terminal-specific functionality
    ├── cvLoader.js          # 🔄 UPDATED: Uses shared parser
    ├── commandRegistry.js   # Terminal commands
    └── terminalCore.js      # Terminal engine
```

## Component Responsibilities

### 1. Shared Data Layer (`src/libs/data/`)

**`cvParser.js`** - The foundation of the system
- **Purpose**: Parse YAML CV data into structured objects
- **Used by**: Terminal Core, Portfolio System, Config Loader
- **Responsibilities**:
  - YAML parsing with proper error handling
  - Data validation and sanitization  
  - Default data fallbacks
  - Caching for performance

```javascript
// Example usage
import { CVParser, CVDataLoader } from '../data/cvParser.js';

const parser = new CVParser();
const loader = new CVDataLoader();
const cvData = await loader.loadFromURL('/public/CV.yaml');
```

### 2. Configuration Layer (`src/libs/config/`)

**`configLoader.js`** - System configuration
- **Purpose**: Manage environment variables and system settings
- **Dependencies**: `data/cvParser.js`
- **Responsibilities**:
  - Load and parse config.env
  - Integrate CV data with configuration
  - Provide computed values (display names, OS names)

### 3. Content Layer (`src/libs/content/`)

**`markdownLoader.js`** - Rich content management
- **Purpose**: Load and process markdown content
- **Dependencies**: None (pure utility)
- **Responsibilities**:
  - Markdown to HTML conversion
  - Content caching
  - Project content discovery

### 4. Business Logic Layer (`src/libs/portfolio/`)

**`portfolioManager.js`** - Main integration hub
- **Purpose**: High-level API for all portfolio operations
- **Dependencies**: `config/`, `content/`, indirectly `data/`
- **Responsibilities**:
  - Unified interface for all data access
  - Business logic (name display, social filtering, etc.)
  - Feature flag management

### 5. Terminal Layer (`src/libs/terminal-core/`)

**`cvLoader.js`** - Terminal-specific CV operations
- **Purpose**: Terminal-focused CV data access
- **Dependencies**: `data/cvParser.js`
- **Responsibilities**:
  - Provide terminal-friendly CV data interface
  - Maintain backward compatibility with existing terminal code

## Data Flow

### 1. Application Startup
```
App → PortfolioManager.initialize()
  ↓
  ConfigLoader.load()
    ↓
    CVDataLoader.loadFromURL() → CVParser.parseCV()
    ↓
  MarkdownLoader (as needed)
```

### 2. Terminal Command Execution
```
User Input → CommandRegistry.execute()
  ↓
  CVLoader.getSection() → CVParser (via shared data)
  ↓
  Formatted Output
```

### 3. UI Component Rendering
```
Component → PortfolioManager.getDisplayName()
  ↓
  ConfigLoader.getDisplayName() → CV Data
  ↓
  Computed Display Value
```

## Benefits of This Architecture

### ✅ **Separation of Concerns**
- CV parsing logic is isolated and reusable
- Configuration is separate from data processing
- Content management is independent

### ✅ **No Circular Dependencies**
- Clean dependency flow: Apps → Business Logic → Data Layer
- Terminal core doesn't depend on portfolio system
- Portfolio system doesn't depend on terminal core

### ✅ **Testability**
- Each layer can be tested independently
- Mock data sources easily
- Isolated unit tests possible

### ✅ **Maintainability**
- Changes to CV parsing affect all consumers automatically
- Easy to add new data sources or formats
- Clear responsibility boundaries

### ✅ **Performance**
- Built-in caching at data layer
- Shared parsing logic prevents duplication
- Lazy loading where appropriate

## Migration Strategy

### Phase 1: ✅ Core Infrastructure (Complete)
- Created shared `cvParser.js`
- Updated `configLoader.js` to use shared parser
- Updated `terminal-core/cvLoader.js` to use shared parser

### Phase 2: Integration Testing
- Test terminal commands still work
- Test portfolio manager with new architecture
- Verify example pages function correctly

### Phase 3: Application Updates
- Update existing XP applications to use `PortfolioManager`
- Replace hardcoded values with dynamic data
- Implement new features using the centralized system

## Usage Examples

### For Terminal Applications
```javascript
import { CVLoader } from '../terminal-core/cvLoader.js';

const cvLoader = new CVLoader();
await cvLoader.load('/public/CV.yaml');
const name = cvLoader.getName(); // Uses shared parser internally
```

### For UI Applications
```javascript
import { PortfolioManager } from '../portfolio/portfolioManager.js';

const portfolio = new PortfolioManager();
await portfolio.initialize();
const displayName = portfolio.getDisplayName(); // Configured display
const projects = await portfolio.getProjects(); // With markdown content
```

### For Direct Data Access
```javascript
import { CVDataLoader } from '../data/cvParser.js';

const loader = new CVDataLoader();
const cvData = await loader.loadFromURL('/public/CV.yaml');
// Direct access to parsed, validated data
```

This architecture ensures that your XPortfolio can grow and evolve while maintaining clean separation between different concerns and eliminating architectural debt.