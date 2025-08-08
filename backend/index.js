const express = require('express')
const app = express()

const port = process.env.PORT || 3001;

app.get('/api/status', (req, res) => {
  res.json({ status: '✅ App running fine!' });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});