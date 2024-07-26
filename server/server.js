const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 3001;

let scoreboard = [];

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/photo' && req.method === 'GET') {
    const photoData = {
      photoUrl: 'https://i0.wp.com/www.srednja.hr/app/uploads/2020/07/gdje-je-jura.png'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(photoData));
  } else if (req.url === '/validate' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { x, y } = JSON.parse(body);
      // Waldo's position
      const waldoX = 100;
      const waldoY = 96;
      const isValid = Math.abs(x - waldoX) < 10 && Math.abs(y - waldoY) < 10;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: isValid }));
    });
  } else if (req.url === '/score' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name, time } = JSON.parse(body);
      scoreboard.push({ name, time });
      scoreboard.sort((a, b) => a.time - b.time);
      if (scoreboard.length > 10) {
        scoreboard = scoreboard.slice(0, 10); // Keep top 10 scores
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  } else if (req.url === '/scoreboard' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scoreboard));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
