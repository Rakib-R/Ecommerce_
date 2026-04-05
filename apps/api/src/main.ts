
import express from 'express';
import * as path from 'path';

const app = express();

// Serve from src/frontend folder
const frontendDistPath = path.join(__dirname, 'frontend');

app.use(express.static(frontendDistPath));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Any route that isn't an asset serves index.html (SPA support)
app.get('*', (_req, res) => {
   res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Click here to open the app 💨 http://localhost:${port}`);
});

server.on('error', console.error);
