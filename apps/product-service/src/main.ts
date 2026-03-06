import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import router from './routes/product.routes';

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://127.0.0.1:7777",
      "http://localhost:7777", 
      "http://localhost:3000",
      "http://127.0.0.1:3000", 
      "http://localhost:4000",
      "http://127.0.0.1:4000",
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 6099;

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health Check Route
app.get('/product', (req, res) => {  
  res.send({
    message: `🎗🎗🎁🎀🎀🎀 Product Service running at http://127.0.0.1:${port}/product`,
    status: 'Active'
  });
});

// All API routes
app.use('/product/api', router);

const server = app.listen(port, () => {
  console.log(`.🎗🎗🎁🎀🎀🎀 Product Service running at http://127.0.0.1:${port}/product`);
  console.log(`Swagger Docs at http://127.0.0.1:${port}/api/docs`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Kill the process or change PORT.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});