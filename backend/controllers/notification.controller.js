import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id }).populate('relatedMaterialId', 'title').sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, { notifications, unreadCount: notifications.filter((item) => !item.isRead).length });
});
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { isRead: true }, { new: true });
  if (!notification) throw new ApiError(404, 'Notification not found.'); sendSuccess(res, { notification });
});
