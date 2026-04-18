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
          'http://localhost:7777',
          'http://localhost:6001',
          'http://localhost:6099',
          'ws://localhost:*',
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
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://localhost:3001',
      'http://127.0.0.1:4000',
      'http://localhost:4000',
      'http://192.168.0.105:3000',
      'http://192.168.0.105:3001',
    ],
    credentials: true,
  })
);

// COOKIE FORWARDING LOGIC────────────────────────────────────────────────────

const forwardCookies = (proxyReqOpts: any, srcReq: any) => {
  if (srcReq.headers['cookie']) {
    proxyReqOpts.headers['cookie'] = srcReq.headers['cookie'];
  }
  return proxyReqOpts;
};

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

// ─── Auth Service Proxy → http://localhost:6001 ─────────────────────────────
// app.use(globalMiddleware);

app.use(
  '/api', proxy('http://localhost:6001', {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/api/, '/auth'),
    
    proxyReqBodyDecorator: (bodyContent) => bodyContent,

    proxyReqOptDecorator: forwardCookies,

   userResDecorator: (proxyRes, proxyResData, _req, res) => {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      const rewritten = cookies.map((cookie: string) => {
        let c = cookie
          .replace(/SameSite=None/gi, 'SameSite=Lax')
          .replace(/SameSite=Strict/gi, 'SameSite=Lax')
          .replace(/;\s*Secure/gi, '')
          .replace(/;\s*Domain=[^;]*/gi, '')

      // If no Domain attribute at all, inject it
      if (!/domain=/i.test(c)) {
        c += '; Domain=localhost';
      }

      return c;
    });
    res.setHeader('set-cookie', rewritten);
  }
  return proxyResData;
},

  proxyErrorHandler: (err, res) => {
    console.error('❌ Auth Service proxy error:', err.message);
    res.status(503).json({ error: 'Auth Service is down' });
    },
  })
);

// ─── Product Service Proxy → http://localhost:6099 ──────────────────────────
// Gateway: /product/api/*  →  Product Service: /product/api/*  (no rewrite needed)
app.use('/product/api', 
  (req, res, next) => {
  // Reject oversized requests before they hit the proxy
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const limitBytes = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > limitBytes) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
    next();

    },proxy('http://localhost:6099', {

    proxyReqPathResolver: (req) => req.originalUrl,
    
     // ✅ Forward cookies — required for isAuthenticated middleware
    proxyReqOptDecorator: forwardCookies,

    proxyErrorHandler: (err, res, next) => {
      console.error('❌ Product Service proxy error:', err.message);
      res.status(503).json({ error: 'Product Service is down or misconfigured' });
    },
  })
);

// ─── Start Server ────────────────────────────────────────────────────────────
const port = process.env.PORT || 7777;

const server = app.listen(port, () => {
  console.log(`🚪 API Gateway running at http://localhost:${port}/gateway-health`);
  console.log(`   Auth proxy:    /api/*         → http://localhost:6001/auth/*`);
  console.log(`   Product proxy: /product/api/* → http://localhost:6099/product/api/*`);

  try {
    initializeSiteConfig();
    console.log('✅ Site config initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Site config:', error);
  }
});

server.on('error', console.error);