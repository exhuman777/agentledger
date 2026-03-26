import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://agentledger.sh',
  output: 'static',
  build: {
    format: 'directory'
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables'
    }
  }
});
