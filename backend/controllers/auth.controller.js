import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createAccessToken, createRefreshToken, hashToken } from '../utils/tokens.js';

const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', maxAge: 7 * 86400000 });
async function issueSession(res, user) {
  const refreshToken = createRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie('refreshToken', refreshToken, cookieOptions());
  return { accessToken: createAccessToken(user), user: user.toJSON() };
}
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role = 'student', university, faculty } = req.body;
  if (role === 'admin') throw new ApiError(403, 'Administrator accounts cannot be self-registered.');
  const user = await User.create({ username, email, password, role, university, faculty, isVerified: false });
  sendSuccess(res, await issueSession(res, user), 'Account created successfully.', 201);
});
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, 'Email or password is incorrect.');
  if (user.isBanned) throw new ApiError(403, 'This account has been suspended.');
  sendSuccess(res, await issueSession(res, user), 'Signed in successfully.');
});
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh session is missing.');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { throw new ApiError(401, 'Refresh session is invalid or expired.'); }
  const user = await User.findById(payload.sub).select('+refreshToken');
  if (!user || user.isBanned || !user.refreshToken || user.refreshToken !== hashToken(token)) throw new ApiError(401, 'Refresh session is no longer valid.');
  const session = await issueSession(res, user);
  sendSuccess(res, { accessToken: session.accessToken }, 'Session refreshed.');
});
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try { const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); await User.findByIdAndUpdate(payload.sub, { $unset: { refreshToken: 1 } }); }
    catch { /* Clear an expired cookie even if it cannot be verified. */ }
  }
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth' });
  sendSuccess(res, null, 'Signed out successfully.');
});
export const getMe = asyncHandler(async (req, res) => sendSuccess(res, { user: req.user }));
export const updateMe = asyncHandler(async (req, res) => {
  for (const key of ['username', 'bio', 'avatarUrl', 'faculty']) if (req.body[key] !== undefined) req.user[key] = req.body[key];
  await req.user.save();
  sendSuccess(res, { user: req.user }, 'Profile updated.');
});
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password +refreshToken');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect.');
  user.password = req.body.newPassword; user.refreshToken = undefined; await user.save();
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth' });
  sendSuccess(res, null, 'Password changed. Please sign in again.');
});
