// server.js - Next.js wrapper for Plesk deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

console.log(`Starting Next.js application...`);
console.log(`Environment: ${dev ? 'development' : 'production'}`);
console.log(`Hostname: ${hostname}`);
console.log(`Port: ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`✅ Next.js server ready on http://${hostname}:${port}`);
      console.log(`🚀 CivicSpace application started successfully`);
    });
}).catch((ex) => {
  console.error('Failed to start Next.js application:', ex);
  process.exit(1);
});