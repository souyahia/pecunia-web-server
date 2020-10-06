import { Request } from 'express';
import JWTPayload from './jwtPayload.model';

export default interface AuthRequest extends Request {
  payload: JWTPayload;
}
