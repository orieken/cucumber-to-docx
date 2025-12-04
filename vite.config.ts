import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      // Keep external Node built-ins and docx so the library stays Node-targeted ESM
      external: ['docx', /^node:.*/]
    },
    sourcemap: true,
    target: 'es2022',
    outDir: 'dist'
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node'
  },
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/cli/**/*'],
      outDir: 'dist'
    })
  ]
});
