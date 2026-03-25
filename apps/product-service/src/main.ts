import express from 'express';
import cors from 'cors';
import "./jobs/product-cron.job"
import cookieParser from 'cookie-parser';
import * as path from 'path';
import router from './routes/product.routes';
import swaggerUi from 'swagger-ui-express';

const app = express();

const swaggerDocument = require('./swagger-output.json')

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:7777",
      "http://localhost:7777", 
      "http://127.0.0.1:3000",
      "http://localhost:3000",
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

  app.use(express.json({ limit: "50mb" }));
  app.use(cookieParser());
  const port = process.env.PORT || 6099;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.use('/product/api', router);  

// Health Check Route
app.get('/product/health', (req, res) => {  
  res.send({ message: `🎗🎗Product Service running at http://localhost:${port}/product`,
  });
});

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

  // product-service app.ts — add express body limit error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large. Max size is 10MB.' });
  }
  next(err);
});

const server = app.listen(port, () => {
  console.log(`.🎗 Product Service running http://localhost:${port}/product 🎀🎀🎁`);
  console.log(`Swagger Docs at http://localhost:${port}/api/docs`);
});


server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Kill the process or change PORT.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});