import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// `defineConfig` comes from vitest/config so the `test` block below is typed.
// Vitest reuses this same file, so tests are built exactly like the app.
export default defineConfig({
  // Relative paths, so the built game works from any folder, such as /robo-needs-help/ on GitHub Pages.
  base: './',
  plugins: [react()],
  test: {
    // jsdom is a fake browser DOM, so component tests run in Node without a browser.
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
