import { Router } from 'express';
const router = Router();
import { createCare, getCares, getCare, updateCare, deleteCare } from '../controllers/care.controller.js';
import { checkAuthentication } from '../middlewares/check-authentication.js';

router.post('/', checkAuthentication, createCare);

router.get('/', checkAuthentication, getCares);

router.get('/:id', checkAuthentication, getCare);

router.put('/:id', checkAuthentication, updateCare);

router.delete('/:id', checkAuthentication, deleteCare);

export default router;