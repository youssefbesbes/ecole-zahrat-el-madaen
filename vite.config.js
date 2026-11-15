import { defineConfig } from 'vite';
import { site } from './build/site.js';

export default defineConfig({
  plugins: [site()],
});
