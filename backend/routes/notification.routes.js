import { Router } from 'express';
import { param } from 'express-validator';
import { listNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.use(protect);
router.get('/', listNotifications);
router.patch('/:id/read', [param('id').isMongoId(), validate], markNotificationRead);

export default router;
