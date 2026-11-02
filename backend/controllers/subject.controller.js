import Subject from '../models/Subject.js';
import Material from '../models/Material.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getUniversities = asyncHandler(async (req, res) => sendSuccess(res, (await Subject.distinct('university', { isActive: true })).sort()));
export const getFaculties = asyncHandler(async (req, res) => {
  const filter = { isActive: true }; if (req.query.university) filter.university = req.query.university;
  sendSuccess(res, (await Subject.distinct('faculty', filter)).sort());
});
export const listSubjects = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const filter = { isActive: true };
  if (req.query.university) filter.university = req.query.university;
  if (req.query.faculty) filter.faculty = req.query.faculty;
  if (req.query.search) { const q = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ name: new RegExp(q, 'i') }, { code: new RegExp(q, 'i') }]; }
  const [subjects, total] = await Promise.all([Subject.find(filter).sort({ code: 1 }).skip((page - 1) * limit).limit(limit), Subject.countDocuments(filter)]);
  sendSuccess(res, { subjects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
export const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, isActive: true }); if (!subject) throw new ApiError(404, 'Subject not found.');
  const counts = await Material.aggregate([{ $match: { subjectId: subject._id, status: { $ne: 'rejected' } } }, { $group: { _id: '$targetTier', count: { $sum: 1 } } }]);
  const materialCounts = { bare_minimum: 0, max_distinction: 0 }; counts.forEach((item) => { materialCounts[item._id] = item.count; });
  sendSuccess(res, { subject, materialCounts });
});
export const createSubject = asyncHandler(async (req, res) => sendSuccess(res, { subject: await Subject.create({ ...req.body, createdBy: req.user._id }) }, 'Subject created.', 201));
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, isActive: true }); if (!subject) throw new ApiError(404, 'Subject not found.');
  if (req.user.role !== 'admin' && subject.createdBy?.toString() !== req.user._id.toString()) throw new ApiError(403, 'Only the subject creator or an administrator can update this subject.');
  for (const key of ['name', 'code', 'faculty', 'university', 'description', 'professors', 'semester', 'credits']) if (req.body[key] !== undefined) subject[key] = req.body[key];
  await subject.save(); sendSuccess(res, { subject }, 'Subject updated.');
});
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!subject) throw new ApiError(404, 'Subject not found.'); sendSuccess(res, { subject }, 'Subject archived.');
});
