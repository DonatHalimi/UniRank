import Material from '../models/Material.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { deleteFile } from '../config/storage.js';
const uploaderFields = 'username role university faculty avatarUrl reputation isVerified';

export const listMaterials = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const filter = { subjectId: req.params.id };
  if (req.user?.role !== 'admin') filter.status = { $ne: 'rejected' };
  else if (req.query.status) filter.status = req.query.status;
  if (req.query.targetTier) filter.targetTier = req.query.targetTier;
  if (req.query.fileType) filter.fileType = req.query.fileType;
  const sort = req.query.sort === 'upvotes' ? { upvotes: -1, createdAt: -1 } : req.query.sort === 'downloads' ? { downloadCount: -1, createdAt: -1 } : { createdAt: -1 };
  const [materials, total] = await Promise.all([
    Material.find(filter).populate('uploaderId', uploaderFields).populate('subjectId', 'name code').sort(sort).skip((page - 1) * limit).limit(limit),
    Material.countDocuments(filter),
  ]);
  sendSuccess(res, { materials, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const getMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id).populate('uploaderId', uploaderFields).populate('subjectId', 'name code university faculty').populate('verifiedBy', 'username role isVerified');
  if (!material || (material.status === 'rejected' && req.user?.role !== 'admin')) throw new ApiError(404, 'Material not found.');
  const commentCount = await Comment.countDocuments({ materialId: material._id, isDeleted: false });
  sendSuccess(res, { material, commentCount });
});
export const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Select a file to upload.');
  const subject = await Subject.findOne({ _id: req.body.subjectId, isActive: true });
  if (!subject) { await deleteFile(`/uploads/${req.file.filename}`); throw new ApiError(400, 'Select a valid subject.'); }
  const tags = typeof req.body.tags === 'string' ? req.body.tags.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 12) : [];
  const material = await Material.create({
    title: req.body.title, description: req.body.description || '', subjectId: subject._id, uploaderId: req.user._id,
    fileUrl: `/uploads/${req.file.filename}`, fileName: req.file.originalname, fileSize: req.file.size,
    mimeType: req.file.mimetype, fileType: req.body.fileType, targetTier: req.body.targetTier, tags, status: 'approved',
  });
  await Subject.findByIdAndUpdate(subject._id, { $inc: { materialCount: 1 } });
  sendSuccess(res, { material }, 'Material uploaded successfully.', 201);
});
export const toggleUpvote = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id); if (!material || material.status === 'rejected') throw new ApiError(404, 'Material not found.');
  const userId = req.user._id; const had = material.upvotedBy.some((id) => id.equals(userId)); const down = material.downvotedBy.some((id) => id.equals(userId));
  if (had) {
    material.upvotedBy.pull(userId); material.upvotes = Math.max(0, material.upvotes - 1);
    if (material.uploaderId.toString() !== userId.toString()) await User.findByIdAndUpdate(material.uploaderId, { $inc: { reputation: -1 } });
  } else {
    if (down) { material.downvotedBy.pull(userId); material.downvotes = Math.max(0, material.downvotes - 1); }
    material.upvotedBy.addToSet(userId); material.upvotes += 1;
    if (material.uploaderId.toString() !== userId.toString()) {
      await User.findByIdAndUpdate(material.uploaderId, { $inc: { reputation: 1 } });
      await Notification.create({ recipientId: material.uploaderId, type: 'upvote', message: `${req.user.username} upvoted your material.`, relatedMaterialId: material._id });
    }
  }
  await material.save(); sendSuccess(res, { upvotes: material.upvotes, downvotes: material.downvotes, upvoted: !had }, 'Vote updated.');
});
export const toggleDownvote = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id); if (!material || material.status === 'rejected') throw new ApiError(404, 'Material not found.');
  const userId = req.user._id; const had = material.downvotedBy.some((id) => id.equals(userId)); const up = material.upvotedBy.some((id) => id.equals(userId));
  if (had) { material.downvotedBy.pull(userId); material.downvotes = Math.max(0, material.downvotes - 1); }
  else {
    if (up) {
      material.upvotedBy.pull(userId); material.upvotes = Math.max(0, material.upvotes - 1);
      if (material.uploaderId.toString() !== userId.toString()) await User.findByIdAndUpdate(material.uploaderId, { $inc: { reputation: -1 } });
    }
    material.downvotedBy.addToSet(userId); material.downvotes += 1;
  }
  await material.save(); sendSuccess(res, { upvotes: material.upvotes, downvotes: material.downvotes, downvoted: !had }, 'Vote updated.');
});
export const verifyMaterial = asyncHandler(async (req, res) => {
  if (req.user.role === 'professor' && !req.user.isVerified) throw new ApiError(403, 'Your professor account must be verified by an administrator before verifying materials.');
  const material = await Material.findById(req.params.id); if (!material) throw new ApiError(404, 'Material not found.');
  if (material.uploaderId.toString() === req.user._id.toString()) throw new ApiError(400, 'You cannot verify your own upload.');
  material.verifiedByAuthority = true; material.verifiedBy = req.user._id; material.verifiedAt = new Date(); await material.save();
  await Notification.create({ recipientId: material.uploaderId, type: 'verify', message: `Your material "${material.title}" was verified by ${req.user.username}.`, relatedMaterialId: material._id });
  sendSuccess(res, { material }, 'Material verified.');
});
export const downloadMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
  if (!material || material.status === 'rejected') throw new ApiError(404, 'Material not found.');
  sendSuccess(res, { fileUrl: material.fileUrl, fileName: material.fileName, downloadCount: material.downloadCount });
});
export const flagMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id); if (!material) throw new ApiError(404, 'Material not found.');
  if (material.uploaderId.toString() === req.user._id.toString()) throw new ApiError(400, 'You cannot report your own material.');
  if (material.flaggedBy.some((id) => id.equals(req.user._id))) throw new ApiError(409, 'You have already reported this material.');
  material.flaggedBy.addToSet(req.user._id); material.flagCount += 1; if (material.flagCount >= 3) material.status = 'flagged'; await material.save();
  await Report.create({ materialId: material._id, reportedBy: req.user._id, reason: req.body.reason, details: req.body.details || '' });
  await Notification.create({ recipientId: material.uploaderId, type: 'flag', message: `Your material "${material.title}" was reported for review.`, relatedMaterialId: material._id });
  sendSuccess(res, { flagCount: material.flagCount, status: material.status }, 'Report submitted.');
});
export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id); if (!material) throw new ApiError(404, 'Material not found.');
  if (req.user.role !== 'admin' && material.uploaderId.toString() !== req.user._id.toString()) throw new ApiError(403, 'Only the uploader or an administrator can delete this material.');
  await deleteFile(material.fileUrl); await material.deleteOne(); await Subject.findByIdAndUpdate(material.subjectId, { $inc: { materialCount: -1 } }); await Comment.deleteMany({ materialId: material._id });
  sendSuccess(res, null, 'Material deleted.');
});
export const updateMaterialStatus = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!material) throw new ApiError(404, 'Material not found.'); sendSuccess(res, { material }, 'Material status updated.');
});
