import { v4 } from 'uuid';
import { Auth, JWTPayload, AuthRequest } from '../../src/auth';
import { authMiddleware } from '../../src/middleware';
import { mockRequestResponse } from '../testHelpers';

const payload: JWTPayload = {
  email: 'test@mail.com',
  id: v4(),
  role: 'USER',
};

const validToken = Auth.signPayload(payload).token;

describe('Auth Middleware', () => {
  it('should call the next route handler when given a valid JWT', () => {
    const next = jest.fn();
    const { req, res } = mockRequestResponse();
    req.headers = { authorization: `Bearer ${validToken}` };
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should add the payload to the request object when given a valid JWT', () => {
    const next = jest.fn();
    const { req, res } = mockRequestResponse();
    req.headers = { authorization: `Bearer ${validToken}` };
    authMiddleware(req, res, next);
    const authReq = req as AuthRequest;
    expect(authReq.payload.id).toEqual(payload.id);
    expect(authReq.payload.email).toEqual(payload.email);
    expect(authReq.payload.role).toEqual(payload.role);
  });

  it('shoud return 401 Unauthorized when provided an invalid JWT', () => {
    const next = jest.fn();
    let status: number = null;
    const { req, res } = mockRequestResponse((code: number) => {
      status = code;
    });
    req.headers = { authorization: 'Bearer invalid-token-test' };
    authMiddleware(req, res, next);
    expect(status).toEqual(401);
  });
});
