import { Router } from 'express';
import { body, param } from 'express-validator';
import { listUsers, setUserBan, setUserRole, listReports, updateReport, listFlaggedMaterials, setUserVerification } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.use(protect, allowRoles('admin'));
router.get('/users', listUsers);
router.patch('/users/:id/ban', [param('id').isMongoId(), body('isBanned').isBoolean(), validate], setUserBan);
router.patch('/users/:id/role', [param('id').isMongoId(), body('role').isIn(['student', 'professor', 'admin']), validate], setUserRole);
router.patch('/users/:id/verify', [param('id').isMongoId(), body('isVerified').isBoolean(), validate], setUserVerification);
router.get('/reports', listReports);
router.patch('/reports/:id', [param('id').isMongoId(), body('status').isIn(['open', 'resolved', 'dismissed']), validate], updateReport);
router.get('/materials/flagged', listFlaggedMaterials);

export default router;
