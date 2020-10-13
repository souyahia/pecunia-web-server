import { v4 } from 'uuid';
import { AuthRequest, JWTPayload } from '../../src/auth';
import { adminMiddleware } from '../../src/middleware';
import { mockRequestResponse } from '../testHelpers';

const payload: JWTPayload = {
  email: 'test@mail.com',
  id: v4(),
  role: 'ADMIN',
};

const invalidPayload: JWTPayload = {
  email: 'test@mail.com',
  id: v4(),
  role: 'USER',
};

describe('Auth Middleware', () => {
  it('should call the next route handler when given a valid JWT', () => {
    const next = jest.fn();
    const { req, res } = mockRequestResponse();
    const authReq = req as AuthRequest;
    authReq.payload = payload;
    adminMiddleware(authReq, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('shoud return 403 Forbidden when provided an invalid JWT', () => {
    const next = jest.fn();
    let status: number = null;
    const { req, res } = mockRequestResponse((code: number) => {
      status = code;
    });
    const authReq = req as AuthRequest;
    authReq.payload = invalidPayload;
    adminMiddleware(authReq, res, next);
    expect(status).toEqual(403);
  });
});
