import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                virtual: resolve(__dirname, 'virtual.html'),
                inperson: resolve(__dirname, 'inperson.html'),
            },
        },
    },
});
