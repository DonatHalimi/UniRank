import { Router } from 'express';
import { getUniversities, getFaculties } from '../controllers/subject.controller.js';
const router = Router();

router.get('/universities', getUniversities);
router.get('/faculties', getFaculties);

export default router;
