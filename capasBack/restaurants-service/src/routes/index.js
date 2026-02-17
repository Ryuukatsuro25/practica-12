                import { Router } from 'express';
                import * as ctl from '../controllers/restaurants.controller.js';
                const r = Router();
                r.get('/', ctl.list);
r.get('/:id', ctl.getOne);
r.post('/', ctl.create);

                export default r;
