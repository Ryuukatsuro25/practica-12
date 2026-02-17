                import { Router } from 'express';
                import * as ctl from '../controllers/orders.controller.js';
                const r = Router();
                r.post('/', ctl.createOrder);
r.get('/my', ctl.myOrders);

                export default r;








