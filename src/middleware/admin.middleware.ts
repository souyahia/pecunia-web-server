import { Request, Response, NextFunction } from 'express';
import { Auth, UserRole } from '../auth';

export default function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const payload = Auth.verifyToken(token);
    if (payload.role === UserRole.Admin) {
      Object.assign(req, { payload });
      next();
    } else {
      res.status(403).json({
        message: 'You must be an administrator to use this endpoint.',
      });
    }
  } catch (err) {
    res.status(401).json({
      message: 'Invalid token.',
    });
  }
}
