import express from 'express';
import morgan from "morgan";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// 1. Middlewares
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

  // 3. Health Check
  app.get('/gateway-health', (req, res) => {
    res.send({ message: 'Gateway is healthy' });
  });

// 4. Proxy Configuration 
// We point everything to 127.0.0.1 to avoid ECONNREFUSED issues
app.use('/api', proxy('http://localhost:6001', {

  // proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  //   proxyReqOpts.headers['origin'] = 'http://localhost:7777'; 
  //   return proxyReqOpts;
  // },                 //todo DOESNT WORK AS INTENDED
  
  proxyReqBodyDecorator: (bodyContent) =>  bodyContent, // re-stream body
  proxyReqPathResolver: (req) => req.originalUrl,
  proxyErrorHandler: (err, res, next) => {
    res.status(503).send({ error: "Auth Service is down" });
  }
}));

const port = process.env.PORT || 7777;
app.listen(port, () => {
  console.log(`🚀 Gateway: http://localhost:${port}/gatewaygateway`);
  console.log(`🚀 Gateway: http://localhost:${port}/gateway-health`);
  console.log(`🔗 Proxying http://localhost:${port}/gatewaygateway -> http://127.0.0.1:6001/api`);
});