import { Router } from 'express';
import { body, param } from 'express-validator';
import { getUniversities, getFaculties, listSubjects, getSubject, createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller.js';
import { listMaterials } from '../controllers/material.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.get('/universities', getUniversities);
router.get('/faculties', getFaculties);
router.get('/', listSubjects);
router.post('/', protect, allowRoles('admin', 'professor'), [
  body('name').trim().notEmpty().isLength({ max: 160 }), body('code').trim().notEmpty().isLength({ max: 30 }),
  body('faculty').trim().notEmpty(), body('university').trim().notEmpty(), body('description').optional().isLength({ max: 1000 }),
  body('credits').optional().isFloat({ min: 0 }), validate,
], createSubject);
router.get('/:id/materials', optionalProtect, [param('id').isMongoId(), validate], listMaterials);
router.get('/:id', [param('id').isMongoId(), validate], getSubject);
router.patch('/:id', protect, allowRoles('admin', 'professor'), [
  param('id').isMongoId(), body('name').optional().trim().notEmpty(), body('code').optional().trim().notEmpty(),
  body('description').optional().isLength({ max: 1000 }), validate,
], updateSubject);
router.delete('/:id', protect, allowRoles('admin'), [param('id').isMongoId(), validate], deleteSubject);

export default router;
