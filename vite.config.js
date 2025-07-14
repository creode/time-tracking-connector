import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
    build: {
        // generate .vite/manifest.json in outDir
        manifest: false,
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'Code',
            fileName: 'Code',
            // the proper extensions will be added
        },
        rollupOptions: {
            output: {
                dir: './',
            }
        }
    },

    esbuild: {
        pure: ['console.log'],    // example: have esbuild remove any console.log
        minifyIdentifiers: false, // but keep variable names
    },
    minify: 'esbuild',
})