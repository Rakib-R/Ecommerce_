import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express";
import * as path from 'path';
import swaggerDocument from "./swagger-output.json";

const app = express();

  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:6001'],
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser());

  // Static assets
  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  // ROUTES
  // Root API ping
  app.get('/api', (req, res) => res.send({
    message: '🔑🔑Hello Api from Auth Service 🔑🔑🔑🔑',
    status: 'Active'
  }));

  // All API routes
  app.use('/api', router);

  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs-json', (req, res) => res.json(swaggerDocument));

  // Error middleware last
  app.use(errorMiddleware);

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log(`🔑 Auth Service running at http://127.0.0.1:${port}/api`);
  console.log(`Swagger Docs at http://127.0.1:${port}/api/docs`);

});
