import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Three.js and react-three are shared by the Architecture and Predict 3D views. Give that
        // lazily loaded chunk a clear name instead of one borrowed from whichever module came first.
        advancedChunks: {
          // Only the matched packages go in the group; their shared deps (React) stay with the main bundle.
          includeDependenciesRecursively: false,
          groups: [{ name: 'three-vendor', test: /node_modules[\\/](three|three-stdlib|@react-three)[\\/]/ }],
        },
      },
    },
  },
})
