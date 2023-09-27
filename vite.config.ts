import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default ({ mode }: { mode: 'production' | 'development' }) => {
  return defineConfig({
    plugins: [
      react(),
      AutoImport({
        dts: './src/web/auto-imports.d.ts',
        imports: ['react', 'react-router', 'react-router-dom'],
      }),
    ],
    build: {
      outDir: './public/vite',
      rollupOptions: {
        input: './src/web/main.tsx',
      },
      manifest: true,
      chunkSizeWarningLimit: 500,
      emptyOutDir: true,
    },
    publicDir: mode === 'production' ? false : './public',
    optimizeDeps: {
      entries: './index.html',
    },
  })
}
