import express from 'express';
import morgan from "morgan";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeSiteConfig } from './libs/initializeSiteConfig.js';

const app = express();

  app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://192.168.0.100:3001',
        'http://192.168.0.100:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:4000',
        'http://localhost:4000',

      ],
      credentials: true,
    }));
    
    app.use(morgan("dev"));
    app.use(express.json({ limit: "100mb" }));
    app.use(cookieParser());
    app.set("trust proxy", 1);

    // 2. Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: "Too many requests!" },
      standardHeaders: true,
      legacyHeaders: false,
      validate: { xForwardedForHeader: false },
    });
    app.use(limiter);

  app.get('/gateway-health', (req, res) => {
    res.send({ message: 'Gateway is healthy' });
  });

  app.use('/api', proxy('http://127.0.0.1:6001', {
    proxyReqBodyDecorator: (bodyContent) =>  bodyContent, // re-stream body
    proxyReqPathResolver: (req) => req.originalUrl.replace('/api', '/auth'),

      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {   // ← ADD
    proxyReqOpts.headers['cookie'] = srcReq.headers['cookie'];
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, req, res) => {  // ← ADD
    if (proxyRes.headers['set-cookie']) {
      res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
    }
    return proxyResData;
  },

  
    proxyErrorHandler: (err, res, next) => {
    res.status(503).send({ error: "Auth Service is down" });
    }
  }));

  app.use('/product/api', proxy('http://127.0.0.1:6099', {
  proxyReqPathResolver: (req) => {
      return req.originalUrl; // Maintains the /auth prefix the service expects
    },
    proxyErrorHandler: (err, res, next) => {
      res.status(503).send({ error: "Product Service is down" });
    },

     proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Forward cookies from client → product service
    proxyReqOpts.headers['cookie'] = srcReq.headers['cookie'];
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, req, res) => {
    // Forward Set-Cookie from product service → client
    if (proxyRes.headers['set-cookie']) {
      res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
    }
    return proxyResData;
  },
}));


const port = process.env.PORT || 7777;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  
  try {
    initializeSiteConfig();
    console.log('Site config Initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize site config:', error);
  }
});

server.on('error', console.error)