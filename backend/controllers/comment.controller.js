import Comment from '../models/Comment.js';
import Material from '../models/Material.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listComments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = { materialId: req.params.id, isDeleted: false };
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate('authorId', 'username role avatarUrl reputation')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  sendSuccess(res, {
    comments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) throw new ApiError(404, 'Material not found.');

  if (req.body.parentCommentId) {
    const parent = await Comment.findOne({
      _id: req.body.parentCommentId,
      materialId: material._id,
      isDeleted: false,
    });
    if (!parent) throw new ApiError(400, 'Parent comment not found.');
  }

  const comment = await Comment.create({
    materialId: material._id,
    authorId: req.user._id,
    body: req.body.body,
    parentCommentId: req.body.parentCommentId || null,
  });

  const populated = await comment.populate('authorId', 'username role avatarUrl reputation');

  if (material.uploaderId.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipientId: material.uploaderId,
      type: 'comment',
      message: `${req.user.username} commented on your material.`,
      relatedMaterialId: material._id,
    });
  }

  sendSuccess(res, { comment: populated }, 'Comment added.', 201);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found.');

  if (req.user.role !== 'admin' && comment.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the author or an administrator can delete this comment.');
  }

  comment.isDeleted = true;
  comment.body = 'This comment was deleted.';
  await comment.save();

  sendSuccess(res, null, 'Comment deleted.');
});