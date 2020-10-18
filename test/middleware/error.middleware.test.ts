/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorHandlerMiddleware } from '../../src/middleware';
import { mockRequestResponse } from '../testHelpers';
import logger from '../../src/logger';
import { EntityValidationError } from '../../src/errors';

describe('Error Handling Middleware', () => {
  it('should log the error in the console for generic errors', () => {
    const spy = jest.spyOn(logger, 'error');
    const next = jest.fn();
    const err = new Error('Test error');
    const { req, res } = mockRequestResponse();
    errorHandlerMiddleware(err, req, res, next);
    expect(spy).toHaveBeenCalled();
  });

  it('should log EntityValidationErrors with their toString method', () => {
    const err = new EntityValidationError('Test error', []);
    const loggerSpy = jest.spyOn(logger, 'error');
    const errorSpy = jest.spyOn(err, 'toString');
    const next = jest.fn();
    const { req, res } = mockRequestResponse();
    errorHandlerMiddleware(err, req, res, next);
    expect(loggerSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should return 500 Internal Server Error', () => {
    let status: number = null;
    const next = jest.fn();
    const { req, res } = mockRequestResponse((code: number) => {
      status = code;
    });
    const err = new Error('Test error');
    errorHandlerMiddleware(err, req, res, next);
    expect(status).toEqual(500);
  });

  it('should return an error message in a JSON format', () => {
    let receivedBody: any = null;
    const next = jest.fn();
    const { req, res } = mockRequestResponse(null, (body: any) => {
      receivedBody = body;
    });
    const err = new Error('Test error');
    errorHandlerMiddleware(err, req, res, next);
    expect(typeof receivedBody.message).toBe('string');
  });
});
