import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from "@packages/error-handler";
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express";
import * as path from 'path';
import swaggerDocument from "./swagger-output.json";

const app = express();

 app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://127.0.0.1:7777",// Your Gateway
      'http://localhost:7777', 
      'http://localhost:3000',
      'http://127.0.0.1:3000', 
      'http://localhost:4000',
      'http://127.0.0.1:4000',

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

  // Static assets
  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  // ROUTES
  // Root API ping
  app.get('/api', (req, res) => {  
    res.send({
    message: '🔑🔑Hello Api from Auth Service 🔑🔑🔑🔑',
    status: 'Active'
  })}
);

  // All API routes
  app.use('/api', router);

  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs-json', (req, res) => {
    
    console.log('At auth service', req.headers.origin)
    res.json(swaggerDocument)
});
  // Error middleware last
  app.use(errorMiddleware);

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log(`🔑 Auth Service running at http://127.0.0.1:${port}/api`);
  console.log(`Swagger Docs at http://127.0.1:${port}/api/docs`);

});
