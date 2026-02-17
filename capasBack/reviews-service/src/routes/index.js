import { Router } from 'express';
import {
  getReviewsByRestaurant,
  getSummaryByRestaurant,
  createReview,
} from '../controllers/reviews.controller.js';

const r = Router();

r.get('/by-restaurant/:id', getReviewsByRestaurant);
r.get('/summary/:id', getSummaryByRestaurant);
r.post('/', createReview);

export default r;
