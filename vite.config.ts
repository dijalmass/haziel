import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

export default defineConfig(() => {
  return {
    plugins: [
      mkcert(),
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // Aceitar conexões da rede local (0.0.0.0)
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:3001',
          ws: true,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
              console.log('Proxying WS:', req.url);
            });
          }
        },
      },
    },
    preview: {
      host: true,
      proxy: {
        '/ws': {
          target: 'ws://127.0.0.1:3001',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
