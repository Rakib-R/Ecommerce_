import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/auth.router';

import * as path from 'path';
import * as dotenv from 'dotenv';


const result = dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log("--- ENV DEBUG ---");
console.log("CWD:", process.cwd());
console.log("Dotenv Result:", result.error ? "FAILED" : "SUCCESS");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "FOUND" : "MISSING");
console.log("-----------------");



const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080' , 'http://localhost:6001'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ROUTES
// This matches the proxy from the gateway
app.get("/api", (req, res) => {
  res.send({ 
    message: 'Hello Api from Auth Service',
    status: 'Active'
  });
});

app.use("/api", router);

// Important: Error middleware must be LAST
app.use(errorMiddleware);

const port = process.env.PORT || 6002;
app.listen(port, () => {
  console.log(`🔑 Auth Service running at http://127.0.0.1:${port}/api`);
});

console.log("DATABASE_URL check:", process.env.DATABASE_URL ? "FOUND" : "MISSING");