import express from 'express';
import cors from 'cors';
import "./jobs/product-cron.job"
import cookieParser from 'cookie-parser';
import * as path from 'path';
import router from './routes/product.routes';
import swaggerUi from 'swagger-ui-express';
import { prisma } from '@packages/prisma';

const app = express();

const swaggerDocument = require('./swagger-output.json')

const product_service_port: string | number = 6099

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://127.0.0.1:7777",
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

  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(express.json({ limit: '10mb' })); 
  app.use(cookieParser());
  const port = process.env.PORT || product_service_port;


  // ---------- B O O T S T R A P  -----------------In product-service main.ts
let isReady = false;
let server: ReturnType<typeof app.listen>;

async function bootstrap() {
  await prisma.$connect();
  isReady = true;
  console.log('✅ PRODUCT DB connected, service ready');

  server = app.listen(port, () => {
    console.log(`🎀 Product Service running http://localhost:${port}/product/health`);
  });

  return server;
}

// Readiness endpoint for the gateway to check
app.get('/product/ready', (req, res) => {
  if (isReady) {
    res.status(200).json({ status: 'Product Service is ready' });
  } else {
    res.status(503).json({ status: 'Product Service not ready' });
  }
});
// ------------ API DOCS  & SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.use('/product/api', router);  


// ─── Health Check (Product Service) ─────────────────────────────────────────────

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

bootstrap()
  .then((srv) => {
    srv.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  });


