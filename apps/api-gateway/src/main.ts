import express from 'express';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { initializeSiteConfig } from './libs/initializeSiteConfig';
const app = express();

// ---------- VARIABLES  -----------------

  const IS_PROD = process.env.NODE_ENV === 'production';
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';
  const PRODUCT_SERVICE_URL = 'http://localhost:6099';
  const AUTH_SERVICE_URL    = 'http://localhost:6001';
  const API_GATEWAY_URL     =  'http://localhost:7777';

  const api_gateway_port : string | number = 7777;

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
          API_GATEWAY_URL,
          AUTH_SERVICE_URL,
          PRODUCT_SERVICE_URL,
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

// ~~ ~ WAIT FOR PRODUCT SERVICE────────────────────────────────────────────────────────
async function waitForService(url: string, maxWait = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`${url}/product/ready`);
      if (res.ok) {
        console.log(`✅ Product service is ready`);
        return;
      }
    } catch {
      // Service not up yet — keep waiting
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.warn(`⚠️ Product service did not become ready in time — proxying anyway`);
}

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
  res.json({ message: 'API-Gateway is healthy ✅' });
});

// ─── Auth Service Proxy → http://localhost:6001 ─────────────────────────────
// app.use(globalMiddleware);

// Dynamically read environment variables
app.use(
  '/api', 
  proxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/api/, '/auth'),
    proxyReqBodyDecorator: (bodyContent) => bodyContent,
    proxyReqOptDecorator: forwardCookies,

    // Use HEADER decorator instead of RES decorator
    userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
      const cookies = headers['set-cookie'];
      
      if (cookies) {
        headers['set-cookie'] = cookies.map((cookie) => {
          let c = cookie;

          if (IS_PROD) {
            // Production Cookie Rules: Ensure security
            c = c.replace(/SameSite=None/gi, 'SameSite=Lax');
            // Ensure Secure flag stays active in production
            if (!/;?\s*Secure/i.test(c)) c += '; Secure';
          } else {
            // Local Development Rules: Strip security blocks
            c = c
              .replace(/SameSite=None/gi, 'SameSite=Lax')
              .replace(/SameSite=Strict/gi, 'SameSite=Lax')
              .replace(/;\s*Secure/gi, '');
          }
          // Strip any upstream domains
          c = c.replace(/;\s*Domain=[^;]*/gi, '');
          // Inject the correct domain dynamically (localhost or production domain)
          if (!/domain=/i.test(c)) {
            c += `; Domain=${COOKIE_DOMAIN}`;
          }

          return c;
        });
      }
      // Crucial: You must return the modified headers object
      return headers;
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
  const limitBytes = 10 * 1024 * 1024;
  
  if (contentLength > limitBytes) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
    next();

    },proxy(PRODUCT_SERVICE_URL, {

    proxyReqPathResolver: (req) => req.originalUrl,
     //  Forward cookies — required for isAuthenticated middleware
     proxyReqOptDecorator: (opts, srcReq) => {
      forwardCookies(opts, srcReq);
      opts.timeout = 10000; 
      return opts;
    },

    proxyErrorHandler: (err, res, next) => {
      console.error('❌ Product Service proxy error:', err.message);
      res.status(503).json({ error: 'Product Service is down or misconfigured' });
    },
  })
);



// ─── Start Server ────────────────────────────────────────────────────────────
const port = process.env.PORT || api_gateway_port;

const server = app.listen(port, async() => {

  console.log(`🚪 API Gateway running at http://localhost:${port}/gateway-health`);
  console.log(`   Product proxy: /product/api/* → http://localhost:6099/product/api/*`);

  try {
    initializeSiteConfig();
    console.log('✅ Site config initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Site config:', error);
  }

  await waitForService(PRODUCT_SERVICE_URL);

});


server.on('error', console.error);