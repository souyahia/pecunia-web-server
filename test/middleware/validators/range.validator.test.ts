import request from 'supertest';
import express, { Router, Request, Response } from 'express';
import { Validators, paramsValidatorMiddleware } from '../../../src/middleware';

const testRouter = Router();

testRouter.get(
  '/test',
  [Validators.range],
  paramsValidatorMiddleware,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Success' });
  },
);

const testApp = express();

testApp.use(testRouter);

describe('Range Parameter Validator', () => {
  it('should throw an error if range is not a valid JSON value', async (done) => {
    const res = await request(testApp).get('/test?range={test');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if range is not an Array', async (done) => {
    const res = await request(testApp).get('/test?range={"test":9}');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if range has more than 2 elements', async (done) => {
    const res = await request(testApp).get('/test?range=[0,1,2]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if range has less than 2 elements', async (done) => {
    const res = await request(testApp).get('/test?range=[0]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if range has non-integer values', async (done) => {
    const res = await request(testApp).get('/test?range=[0,"test"]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if range has negative values', async (done) => {
    const res = await request(testApp).get('/test?range=[-1,1]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if the first element of range is bigger than the second element', async (done) => {
    const res = await request(testApp).get('/test?range=[2,1]');
    expect(res.status).toEqual(400);
    done();
  });
});
