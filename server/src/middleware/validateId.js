import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const validateId = (param = 'id') => (req, _res, next) =>
  mongoose.isValidObjectId(req.params[param]) && String(new mongoose.Types.ObjectId(req.params[param])) === req.params[param]
    ? next()
    : next(new AppError(400, 'Invalid identifier.'));
