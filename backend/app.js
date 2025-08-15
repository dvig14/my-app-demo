const express = require('express');
const app = express();

app.get('/api/status', (req, res) => {
  res.json({ status: '✅ App running fine!' });
});

module.exports = app;