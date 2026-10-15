import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // The package is linked from one level up (file:..), so Vite may read it,
  // and edits to ../src reload the page like any source file.
  server: { port: 5173, fs: { allow: ['..'] } },
});
