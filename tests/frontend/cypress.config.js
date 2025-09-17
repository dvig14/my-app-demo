const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    specPattern: 'integration/**/*.spec.js',
    supportFile: false,
  },
})
