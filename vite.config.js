import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
    build: {
        // generate .vite/manifest.json in outDir
        manifest: false,
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'ProductiveConnector',
            fileName: () => 'Code.gs',
            formats: ['es'],
            // the proper extensions will be added
        },
        formats: ['es'],
        rollupOptions: {
            output: {
                dir: 'dist',
                format: 'es',
            }
        }
    },

    esbuild: {
        pure: ['console.log'],    // example: have esbuild remove any console.log
        minifyIdentifiers: false, // but keep variable names
    },
    minify: 'esbuild',
})