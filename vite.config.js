import { defineConfig } from 'vite'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import process from 'node:process'
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

function serveLocalPlaysrcConfig(middlewares) {
  middlewares.use('/tf2/playsrc-config.json', (request, response) => {
    try {
      const configPath = resolve(process.cwd(), 'public/tf2/playsrc-config.json')
      const config = JSON.parse(readFileSync(configPath, 'utf8'))
      const forwardedProtocol = request.headers['x-forwarded-proto']?.split(',')[0]
      const protocol = forwardedProtocol || (request.socket.encrypted ? 'https' : 'http')
      const host = request.headers.host

      if (!host) {
        response.statusCode = 400
        response.end('Missing Host header')
        return
      }

      config.assetOrigin = `${protocol}://${host}`
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Cache-Control', 'no-store')
      response.end(JSON.stringify(config))
    } catch (error) {
      response.statusCode = 503
      response.setHeader('Content-Type', 'text/plain; charset=utf-8')
      response.end(`playsrc runtime is unavailable: ${error.message}`)
    }
  })
}

function playsrcLocalBridge() {
  return {
    name: 'xportfolio-playsrc-local-bridge',
    configureServer(server) {
      serveLocalPlaysrcConfig(server.middlewares)
    },
    configurePreviewServer(server) {
      serveLocalPlaysrcConfig(server.middlewares)
    },
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
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' https: blob:; frame-src 'self' https: blob:; worker-src 'self' blob:;",
  }

  return {
    base,
    plugins: [playsrcLocalBridge(), react(), svgr()],
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion),
    },
    server: {
      headers: crossOriginIsolationHeaders,
      proxy: {
        '/objects': {
          target: 'https://assets.playsrc.online',
          changeOrigin: true,
        },
      },
    },
    preview: {
      headers: crossOriginIsolationHeaders,
      proxy: {
        '/objects': {
          target: 'https://assets.playsrc.online',
          changeOrigin: true,
        },
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    test: {
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      exclude: ['node_modules/**', 'dist/**', 'external/**', 'public/apps/**'],
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
