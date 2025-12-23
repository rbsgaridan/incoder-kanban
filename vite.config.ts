import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IncoderKanban',
      formats: ['es', 'cjs'],
      fileName: (format) => `incoder-kanban.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['vue', 'primevue', '@vueuse/core'],
      output: {
        exports: 'named',
        // Provide global variables for UMD build
        globals: {
          vue: 'Vue',
          primevue: 'PrimeVue'
        }
      }
    }
  }
});
