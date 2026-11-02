import { Router } from 'express';
import { body, param } from 'express-validator';
import { uploadMaterial, toggleUpvote, toggleDownvote, verifyMaterial, downloadMaterial, flagMaterial, deleteMaterial, updateMaterialStatus, getMaterial } from '../controllers/material.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { uploadMaterial as uploadMiddleware } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.post('/', protect, uploadMiddleware.single('file'), [
  body('title').trim().notEmpty().isLength({ max: 200 }), body('description').optional().isLength({ max: 500 }),
  body('subjectId').isMongoId(), body('fileType').isIn(['past_exam', 'summary', 'lecture_note', 'cheat_sheet']),
  body('targetTier').isIn(['bare_minimum', 'max_distinction']), validate,
], uploadMaterial);
router.get('/:id', optionalProtect, [param('id').isMongoId(), validate], getMaterial);
router.patch('/:id/upvote', protect, [param('id').isMongoId(), validate], toggleUpvote);
router.patch('/:id/downvote', protect, [param('id').isMongoId(), validate], toggleDownvote);
router.patch('/:id/verify', protect, allowRoles('professor', 'admin'), [param('id').isMongoId(), validate], verifyMaterial);
router.patch('/:id/download', [param('id').isMongoId(), validate], downloadMaterial);
router.patch('/:id/flag', protect, [
  param('id').isMongoId(), body('reason').isIn(['copyright', 'spam', 'inappropriate', 'wrong_subject', 'other']),
  body('details').optional().isLength({ max: 500 }), validate,
], flagMaterial);
router.patch('/:id/status', protect, allowRoles('admin'), [param('id').isMongoId(), body('status').isIn(['pending', 'approved', 'rejected', 'flagged']), validate], updateMaterialStatus);
router.delete('/:id', protect, [param('id').isMongoId(), validate], deleteMaterial);

export default router;
