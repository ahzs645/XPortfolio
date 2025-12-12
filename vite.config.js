import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY || ''
  const repoName = repository.includes('/') ? repository.split('/')[1] : ''

  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
  const isUserOrOrgPagesRepo = repoName.endsWith('.github.io')

  const base =
    process.env.VITE_BASE ||
    (isGitHubActions && repoName && !isUserOrOrgPagesRepo ? `/${repoName}/` : '/')

  return {
    base,
    plugins: [react(), svgr()],
  }
})
