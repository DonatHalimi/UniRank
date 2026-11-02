import { Router } from 'express';
import { body, param } from 'express-validator';
import { listComments, createComment, deleteComment } from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.get('/materials/:id/comments', [param('id').isMongoId(), validate], listComments);
router.post('/materials/:id/comments', protect, [
  param('id').isMongoId(), body('body').trim().notEmpty().isLength({ max: 500 }), body('parentCommentId').optional().isMongoId(), validate,
], createComment);
router.delete('/comments/:id', protect, [param('id').isMongoId(), validate], deleteComment);

export default router;
