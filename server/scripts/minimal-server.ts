// Minimal Express server to test environment
import express from 'express';

const app = express();

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

const port = 3002;
app.listen(port, () => {
  console.log(`Minimal test server running on port ${port}`);
  console.log(`Test with: curl http://localhost:${port}/healthz`);
});