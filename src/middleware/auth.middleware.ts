import { Request, Response, NextFunction } from 'express';
import { Auth } from '../auth';

export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const payload = Auth.verifyToken(token);
    Object.assign(req, { payload });
    next();
  } catch (err) {
    res.status(401).json({
      message: 'Invalid token.',
    });
  }
}
