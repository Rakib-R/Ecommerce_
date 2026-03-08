import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '@packages/error-handler';
import router from './routes/auth.router';
import swaggerDocument from './swagger-output.json';

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl (no origin header)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://127.0.0.1:7777', // API Gateway
        'http://localhost:7777',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'http://192.168.0.105:3000',
        'http://192.168.0.105:4000',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// ─── General Middleware ──────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ─── Health Check (always first) ─────────────────────────────────────────────
app.get('/auth/health', (req, res) => {
  res.json({ message: '🔑 Auth Service is healthy', status: 'Active' });
});

// ─── Swagger UI ──────────────────────────────────────────────────────────────
// CSP override needed — Swagger loads inline scripts/styles
app.use(
  '/auth/docs',
  ({req, res, next} : any) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.get('/auth/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.use('/auth', router);

// ─── Global Error Handler (always last) ──────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ────────────────────────────────────────────────────────────
const port = process.env.PORT || 6001;

app.listen(port, () => {
  console.log(`🔑 Auth Service running at http://127.0.0.1:${port}/auth`);
  console.log(`📖 Swagger Docs at   http://127.0.0.1:${port}/auth/docs`);
});