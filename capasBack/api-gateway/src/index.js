import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// CORS para el front PHP (http://localhost)
app.use(
  cors({
    origin: 'http://localhost',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);
app.options('*', cors());

// Rutas
app.use(routes);

app.listen(PORT, () => {
  console.log(`API Gateway en :${PORT}`);
});
