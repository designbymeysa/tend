import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' lets the build work on GitHub Pages project URLs (user.github.io/tend/) and on any other static host
export default defineConfig({ base: './', plugins: [react()] })
