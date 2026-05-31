import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Kids-Check-in-react/',
  plugins: [react()],
});
