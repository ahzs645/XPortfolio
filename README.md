# XPortfolio-1

YAML-driven portfolio builder (React + Vite) with multiple selectable portfolio themes.

## Quickstart

```sh
git submodule update --init --recursive
pnpm install
pnpm dev
```

## Resume data (YAML)

- Resume/CV: `public/CV.yaml`
- App config: `public/config.env`

`CV.yaml` is parsed at runtime via `js-yaml` in `src/contexts/ConfigContext.jsx`.

## Theme selection

Themes are selected via URL params:

- Theme catalog: `/?catalog=1`
- Windows XP portfolio: `/?theme=luna` (default)
- Minimal theme example: `/?theme=ansub-minimal`

## Add a new theme

1. Create a theme definition under `src/WinXP/styles/themes/`.
2. Register it in `src/WinXP/styles/themes/index.js`.

## Project conventions

- Use `pnpm` for dependency installation and script execution.
- Prefer `styled-components` for new ordinary app UI.
- First-party CSS imports are allowed for complex or ported app surfaces where preserving existing styles is lower risk.
- Vendor CSS imports are allowed for third-party UI packages such as `react-pdf` and `@fortune-sheet/react`.
- See `docs/DEVELOPMENT_GUIDELINES.md` for UI behavior conventions, including loading-state do's and don'ts.

## Note on reuse

If you’re adapting a design you didn’t create, make sure you have permission and replace branding/content with your own.
