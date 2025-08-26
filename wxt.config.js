import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'WPlaceTools',
    permissions: ['activeTab', 'tabs', 'cookies', 'browsingData'],
    host_permissions: ['*://wplace.live/*', '*://*.wplace.live/*']
  }
});