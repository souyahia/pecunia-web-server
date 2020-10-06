import { Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../auth';

export default function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const { payload } = req;
  if (payload.role === UserRole.Admin) {
    next();
  } else {
    res.status(403).json({
      message: 'You must be an administrator to use this endpoint.',
    });
  }
}
