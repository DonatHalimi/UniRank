import User from '../models/User.js';
import Material from '../models/Material.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select('username role university faculty avatarUrl bio reputation isVerified createdAt');
  if (!user || user.isBanned) throw new ApiError(404, 'Profile not found.');
  const materials = await Material.find({ uploaderId: user._id, status: { $ne: 'rejected' } }).populate('subjectId', 'name code university faculty').sort({ createdAt: -1 }).limit(30);
  sendSuccess(res, { user, materials });
});
