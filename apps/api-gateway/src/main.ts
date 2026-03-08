import express from 'express';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { initializeSiteConfig } from './libs/initializeSiteConfig.js';

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", "'unsafe-inline'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", 'data:', 'blob:'],
        fontSrc:    ["'self'"],
        objectSrc:  ["'none'"],
        connectSrc: [
          "'self'",
          'http://127.0.0.1:7777',
          'http://127.0.0.1:6001',
          'http://127.0.0.1:6099',
          'ws://localhost:*', // Next.js HMR
        ],
      },
    },
    crossOriginEmbedderPolicy: false, // required for Swagger UI
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:4000',
      'http://192.168.0.100:3000',
      'http://192.168.0.100:3001',
    ],
    credentials: true,
  })
);

// ─── General Middleware ──────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(cookieParser());
app.set('trust proxy', 1);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  skip: () => process.env.NODE_ENV === 'development',
  message: { error: "Too many requests! Gateway blocked ❌🔴" },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
app.use(limiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/gateway-health', (req, res) => {
  res.json({ message: 'Gateway is healthy ✅' });
});

// ─── Auth Service Proxy → http://127.0.0.1:6001 ─────────────────────────────
// Gateway: /api/*  →  Auth Service: /auth/*
app.use(
  '/api',
  proxy('http://127.0.0.1:6001', {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/api/, '/auth'),

    proxyReqBodyDecorator: (bodyContent) => bodyContent,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.headers['cookie']) {
        proxyReqOpts.headers['cookie'] = srcReq.headers['cookie'];
      }
      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, req, res) => {
      if (proxyRes.headers['set-cookie']) {
        res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
      }
      return proxyResData;
    },

    proxyErrorHandler: (err, res, next) => {
      console.error('❌ Auth Service proxy error:', err.message);
      res.status(503).json({ error: 'Auth Service is down' });
    },
  })
);

// ─── Product Service Proxy → http://127.0.0.1:6099 ──────────────────────────
// Gateway: /product/api/*  →  Product Service: /product/api/*  (no rewrite needed)
app.use(
  '/product/api',
  proxy('http://127.0.0.1:6099', {

    proxyReqPathResolver: (req) => req.originalUrl,

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.headers['cookie']) {
        proxyReqOpts.headers['cookie'] = srcReq.headers['cookie'];
      }
      return proxyReqOpts;
    },

    userResDecorator: (proxyRes, proxyResData, req, res) => {
      if (proxyRes.headers['set-cookie']) {
        res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
      }
      return proxyResData;
    },

    proxyErrorHandler: (err, res, next) => {
      console.error('❌ Product Service proxy error:', err.message);
      res.status(503).json({ error: 'Product Service is down or misconfigured' });
    },
  })
);

// ─── Start Server ────────────────────────────────────────────────────────────
const port = process.env.PORT || 7777;

const server = app.listen(port, () => {
  console.log(`🚪 API Gateway running at http://localhost:${port}`);
  console.log(`   Auth proxy:    /api/*         → http://127.0.0.1:6001/auth/*`);
  console.log(`   Product proxy: /product/api/* → http://127.0.0.1:6099/product/api/*`);

  try {
    initializeSiteConfig();
    console.log('✅ Site config initialized');
  } catch (error) {
    console.error('❌ Failed to initialize site config:', error);
  }
});

server.on('error', console.error);