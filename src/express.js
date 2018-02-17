const express = require('express');
const path = require('path');
const net = require('net');
const fs = require('fs');
const os = require('os');
const runMode = process.env.NODE_ENV === "production" ? "prod" : "dev";
const App = require(`../dist/${runMode}/${runMode}.server.app`);

if (App === undefined) {
  console.error("can't load server code");
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

app.use('/js/dist', express.static('dist/prod'));
if (runMode === "dev") {
  app.use('/js/dist/dev', express.static('dist/dev'));
}
app.use('/', express.static('src/public'));

require('console-stamp')(console, '[HH:MM:ss.l]');

app.set('view engine', 'ejs');

const badgeSvg = fs.readFileSync("src/assets/images/badge_a_plus_flat.svg");

app.get(/^\/badges\/github\.com\/[^\/]+\/[^\/]+\.svg$/, function (req, res) {
  res.set('Content-Type', 'image/svg+xml');
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Expires", new Date(Date.now() + 3600*1000).toUTCString());
  res.send(badgeSvg);
});

app.get('*', App.default);

const socketOrPort = process.env.PORT || 5000;

process.on('SIGTERM', () => {
  app.close(() => {
    console.log('Graceful shutdown ...');
    process.exit(0);
  });
});

app.listen(socketOrPort, () => {
  console.log(`running server on port ${socketOrPort}`);
});
