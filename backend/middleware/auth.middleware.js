import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Authentication is required.');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new ApiError(401, 'Your session is invalid or expired.'); }
  const user = await User.findById(payload.sub).select('-password -refreshToken');
  if (!user) throw new ApiError(401, 'The account for this session no longer exists.');
  if (user.isBanned) throw new ApiError(403, 'This account has been suspended.');
  req.user = user;
  next();
});

export async function optionalProtect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-password -refreshToken');
    if (user && !user.isBanned) req.user = user;
  } catch {
    // Public endpoints remain public when an optional access token is absent or expired.
  }
  next();
}
