const { defineConfig } = require('cypress')

// BASE_URL get from env set in pipeline
module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    specPattern: 'integration/**/*.spec.js',
    supportFile: false,
  },
})
