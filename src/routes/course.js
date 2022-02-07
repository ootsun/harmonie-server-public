import { Router } from 'express';
const router = Router();
import { createCourse, getCourses, getCourse, updateCourse, deleteCourse } from '../controllers/course.controller.js';
import { checkAuthentication } from '../middlewares/check-authentication.js';

router.post('/', checkAuthentication, createCourse);

router.get('/', checkAuthentication, getCourses);

router.get('/:id', checkAuthentication, getCourse);

router.put('/:id', checkAuthentication, updateCourse);

router.delete('/:id', checkAuthentication, deleteCourse);

export default router;