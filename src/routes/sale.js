import { Router } from 'express';
const router = Router();
import { createSale, getSales, getSale, updateSale, deleteSale } from '../controllers/sale.controller.js';
import { checkAuthentication } from '../middlewares/check-authentication.js';

router.post('/', checkAuthentication, createSale);

router.get('/', checkAuthentication, getSales);

router.get('/:id', checkAuthentication, getSale);

router.put('/:id', checkAuthentication, updateSale);

router.delete('/:id', checkAuthentication, deleteSale);

export default router;