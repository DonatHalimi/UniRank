import { Router } from 'express';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Material from '../models/Material.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
const router = Router();

router.get('/stats', asyncHandler(async (req, res) => {
  const [materials, subjects, contributors, popularMaterials] = await Promise.all([
    Material.countDocuments({ status: { $ne: 'rejected' } }), Subject.countDocuments({ isActive: true }), User.countDocuments({ isBanned: false }),
    Material.find({ status: { $ne: 'rejected' } }).populate('uploaderId', 'username role').populate('subjectId', 'name code').sort({ upvotes: -1, createdAt: -1 }).limit(6),
  ]);
  sendSuccess(res, { stats: { materials, subjects, contributors }, popularMaterials });
}));

export default router;
