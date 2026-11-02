import User from '../models/User.js';
import Report from '../models/Report.js';
import Material from '../models/Material.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20)); const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) { const term = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ username: new RegExp(term, 'i') }, { email: new RegExp(term, 'i') }]; }
  const [users, total] = await Promise.all([User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
  sendSuccess(res, { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const setUserBan = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'You cannot suspend your own account.');
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: Boolean(req.body.isBanned) }, { new: true }).select('-password -refreshToken');
  if (!user) throw new ApiError(404, 'User not found.'); if (user.isBanned) await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });
  sendSuccess(res, { user }, user.isBanned ? 'User suspended.' : 'User reinstated.');
});
export const setUserRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'You cannot change your own role.');
  const update = { role: req.body.role }; if (req.body.role !== 'professor') update.isVerified = false;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password -refreshToken');
  if (!user) throw new ApiError(404, 'User not found.'); sendSuccess(res, { user }, 'User role updated.');
});
export const listReports = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : { status: 'open' };
  const reports = await Report.find(filter).populate('materialId', 'title fileName status subjectId').populate('reportedBy', 'username email').sort({ createdAt: -1 });
  sendSuccess(res, { reports });
});
export const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, 'Report not found.'); sendSuccess(res, { report }, 'Report updated.');
});
export const listFlaggedMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find({ status: 'flagged' }).populate('uploaderId', 'username role email').populate('subjectId', 'name code university faculty').sort({ updatedAt: -1 });
  sendSuccess(res, { materials });
});

export const setUserVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role !== 'professor') throw new ApiError(400, 'Only professor accounts can be verified.');
  user.isVerified = Boolean(req.body.isVerified);
  await user.save();
  sendSuccess(res, { user: user.toJSON() }, user.isVerified ? 'Professor account verified.' : 'Professor verification removed.');
});
