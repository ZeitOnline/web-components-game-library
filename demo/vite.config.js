import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { parse } from 'yaml';

const content = fileURLToPath(new URL('./content/', import.meta.url));
const plan = fileURLToPath(new URL('../docs/PLAN.md', import.meta.url));

/**
 * Dev only: the Markdown content is read on the server, so the browser would not notice a
 * change (e.g. a save in Sveltia CMS). Reload the page instead.
 */
function reloadOnContentChange() {
  return {
    name: 'reload-on-content-change',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.watcher.add([content, plan]);
      server.watcher.on('all', (_event, file) => {
        if (file.startsWith(content) || file === plan) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

/**
 * `import data from './x.yml'` → plain data, parsed at build time (so the browser
 * bundle needs no YAML parser). Used for the game entries in content/games.
 */
function yamlData() {
  return {
    name: 'yaml-data',
    /** @param {string} code @param {string} id */
    transform(code, id) {
      if (!/\.ya?ml$/.test(id)) return null;
      return { code: `export default ${JSON.stringify(parse(code))};`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), reloadOnContentChange(), yamlData()],
  // The package is linked from one level up (file:..), so Vite may read it,
  // and edits to ../src reload the page like any source file.
  server: { port: 5173, fs: { allow: ['..'] } },
});
