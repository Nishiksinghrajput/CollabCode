#!/usr/bin/env node

/**
 * Simple HTTP server for local development
 * This helps view the app with proper CSS and assets loading
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 OpenCollab Development Server                 ║
║                                                    ║
║   Server running at:                              ║
║   http://localhost:${PORT}                            ║
║                                                    ║
║   Pages:                                          ║
║   • Landing Page: http://localhost:${PORT}/           ║
║   • Application:  http://localhost:${PORT}/app.html   ║
║                                                    ║
║   Press Ctrl+C to stop                            ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});