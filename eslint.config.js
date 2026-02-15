import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'external/**',
    'public/**',
    'node_modules/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        __BUILD_VERSION__: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],

      // Re-enabled: these catch real issues and new violations will be flagged.
      // Existing intentional patterns have targeted eslint-disable comments.
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',

      // Intentionally off — React Compiler strictness rules with high
      // false-positive rates for non-compiler codebases. Re-evaluate
      // when/if adopting the React Compiler.
      //
      // immutability: migrations.js intentionally mutates working copies of
      //   FS objects loaded from IndexedDB before calling setFileSystem().
      //   500+ lines of mutation-based migration code; immutable rewrite
      //   would add complexity with no functional benefit.
      //
      // purity: Flags Date.now()/Math.random() in effects and callbacks
      //   (~32 files). Nearly all occur inside useEffect/useCallback, not
      //   during render. False positives for non-compiler usage.
      //
      // refs: Flags ref.current = value inside useEffect (~45 files). This
      //   is the standard React pattern for syncing refs with values.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',

      'react-refresh/only-export-components': 'off',
    },
  },
])
