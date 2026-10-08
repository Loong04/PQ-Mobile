import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'native-business-entry',
      generateBundle(_options, bundle) {
        const styles = Object.keys(bundle)
          .filter((file) => file.endsWith('.css'))
          .map((file) => '/' + file);
        const source = `const styles = ${JSON.stringify(styles)};\nawait Promise.all(styles.map(href => new Promise(resolve => {const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; link.onload = resolve; link.onerror = resolve; document.head.append(link);})));\nawait import('/assets/business.js');\n`;
        this.emitFile({ type: 'asset', fileName: 'web-entry.js', source });
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: { main: 'index.html', business: 'src/business.tsx' },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'business' ? 'assets/business.js' : 'assets/[name]-[hash].js',
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith('.css'))
            ? 'assets/[name][extname]'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
