import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/', routes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, ()=>console.log('auth-service :'+PORT));

