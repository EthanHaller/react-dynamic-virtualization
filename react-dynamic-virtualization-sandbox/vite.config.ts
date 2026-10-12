import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // The sandbox imports the sibling library's source; share its React runtime.
  resolve: { dedupe: ['react', 'react-dom'] },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
