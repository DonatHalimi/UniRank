import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, getMe, updateMe, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
const router = Router();

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 40 }).withMessage('Username must be 3–40 characters.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 6 }).withMessage('Password must contain at least 6 characters.'),
  body('role').optional().isIn(['student', 'professor']),
  body('university').trim().notEmpty(), body('faculty').trim().notEmpty(), validate,
], register);
router.post('/login', [body('email').isEmail(), body('password').notEmpty(), validate], login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, [
  body('username').optional().trim().isLength({ min: 3, max: 40 }), body('bio').optional().isLength({ max: 280 }),
  body('avatarUrl').optional({ values: 'falsy' }).isURL({ require_protocol: true }), body('faculty').optional().trim().notEmpty(), validate,
], updateMe);
router.patch('/me/password', protect, [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 }), validate], changePassword);

export default router;
