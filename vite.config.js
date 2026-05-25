import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'BlackIce',
      formats: ['es', 'umd'],
      fileName: (fmt) => `black-ice.${fmt}.js`,
    },
    outDir: 'dist/lib',
  },
});
