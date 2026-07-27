import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:3001';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {target: backendOrigin, changeOrigin: true},
        '/uploads': {target: backendOrigin, changeOrigin: true},
      },
    },
    test: {environment: 'jsdom', setupFiles: './src/test/setup.js'},
  };
});
