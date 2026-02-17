                import { Router } from 'express';
                import * as ctl from '../controllers/products.controller.js';
                const r = Router();
                r.get('/by-restaurant/:id', ctl.byRestaurant);
r.post('/', ctl.create);

                export default r;
