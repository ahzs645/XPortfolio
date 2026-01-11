# XPortfolio-1

YAML-driven portfolio builder (React + Vite) with multiple selectable portfolio themes.

## Quickstart

```sh
pnpm dev
```

## Resume data (YAML)

- Resume/CV: `public/CV.yaml`
- App config: `public/config.env`

`CV.yaml` is parsed at runtime via `js-yaml` in `src/contexts/ConfigContext.jsx`.

## Theme selection

Themes are selected via URL params:

- Theme catalog: `/?catalog=1`
- Windows XP portfolio: `/?theme=xp` (default)
- Minimal theme example: `/?theme=ansub-minimal`

## Add a new theme

1. Create a React component under `src/portfolioThemes/themes/<YourTheme>/`.
2. Register it in `src/portfolioThemes/portfolioThemes.js`.

## Note on reuse

If you’re adapting a design you didn’t create, make sure you have permission and replace branding/content with your own.
