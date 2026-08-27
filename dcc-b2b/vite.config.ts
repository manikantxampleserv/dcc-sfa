import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      context: path.resolve(__dirname, './src/context'),
      layout: path.resolve(__dirname, './src/layout'),
      mock: path.resolve(__dirname, './src/mock'),
      pages: path.resolve(__dirname, './src/pages'),
      shared: path.resolve(__dirname, './src/shared'),
      routes: path.resolve(__dirname, './src/routes'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
});
