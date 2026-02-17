import { Router } from 'express';
import {
  register,
  registerRestaurant,
  login,
} from '../controllers/auth.controller.js';

const r = Router();

r.post('/register', register);
r.post('/register-restaurant', registerRestaurant);
r.post('/login', login);

export default r;
