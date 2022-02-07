import { Router } from 'express';
const router = Router();
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    exportLosses
} from '../controllers/product.controller.js';
import { checkAuthentication } from '../middlewares/check-authentication.js';

router.post('/', checkAuthentication, createProduct);

router.get('/', checkAuthentication, getProducts);

router.get('/export-losses/:year', checkAuthentication, exportLosses);

router.get('/:id', checkAuthentication, getProduct);

router.put('/:id', checkAuthentication, updateProduct);

router.delete('/:id', checkAuthentication, deleteProduct);

export default router;