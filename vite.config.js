import { defineConfig } from 'vite'
import { execSync } from 'child_process'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// Get build version for cache busting
function getBuildVersion() {
  try {
    const commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
    return commitSha
  } catch {
    return Date.now().toString(36)
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const repository = process.env.GITHUB_REPOSITORY || ''
  const repoName = repository.includes('/') ? repository.split('/')[1] : ''

  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
  const isUserOrOrgPagesRepo = repoName.endsWith('.github.io')

  const base =
    process.env.VITE_BASE ||
    (isGitHubActions && repoName && !isUserOrOrgPagesRepo ? `/${repoName}/` : '/')

  const buildVersion = getBuildVersion()
  const crossOriginIsolationHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https: blob:; worker-src 'self' blob:;",
  }

  return {
    base,
    plugins: [react(), svgr()],
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion),
    },
    server: {
      headers: crossOriginIsolationHeaders,
    },
    preview: {
      headers: crossOriginIsolationHeaders,
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/')

            if (normalizedId.includes('/src/lib/libarchive/')) {
              return 'libarchive'
            }

            if (!normalizedId.includes('node_modules')) return

            const [, pathInNodeModules] = normalizedId.split('/node_modules/')
            if (!pathInNodeModules) return

            const segments = pathInNodeModules.split('/')

            let packageName
            if (segments[0] === '.pnpm') {
              const nodeModulesIndex = segments.indexOf('node_modules')
              const pnpmName = nodeModulesIndex >= 0 ? segments[nodeModulesIndex + 1] : null
              const pnpmScope = nodeModulesIndex >= 0 ? segments[nodeModulesIndex + 2] : null
              packageName = pnpmName?.startsWith('@') ? `${pnpmName}/${pnpmScope}` : pnpmName
            } else {
              const topLevelName = segments[0]
              const topLevelScope = segments[1]
              packageName = topLevelName?.startsWith('@') ? `${topLevelName}/${topLevelScope}` : topLevelName
            }

            if (!packageName) return

            if (packageName === 'react' || packageName === 'react-dom' || packageName === 'scheduler') return 'react'
            if (packageName === 'styled-components') return 'styled-components'
            if (packageName === 'webamp') return 'webamp'
            if (packageName === 'react-pdf') return 'react-pdf'
            if (packageName === 'pdfjs-dist') return 'pdfjs'

            if (packageName === '@emotion/is-prop-valid') return
            if (packageName === '@emotion/memoize') return
            if (packageName === 'shallowequal') return

            const safeName = packageName.replace('@', '').replace(/\//g, '-')
            return `vendor-${safeName}`
          },
        },
      },
    },
  }
})
