import { defineConfig } from 'cypress'

export default defineConfig({
  screenshotsFolder: 'output/e2e/screenshots',
  videosFolder: 'output/e2es/videos',
  chromeWebSecurity: false,
  projectId: 'mge2jz',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
