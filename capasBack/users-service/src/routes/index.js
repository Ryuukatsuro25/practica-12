import { Router } from 'express';
import * as ctl from '../controllers/users.controller.js';
const r = Router();
r.get('/me', ctl.me);

export default r;
