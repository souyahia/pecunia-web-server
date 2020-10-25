import request from 'supertest';
import express, { Router, Request, Response } from 'express';
import { Validators, paramsValidatorMiddleware } from '../../../src/middleware';

const testRouter = Router();
const fields = ['field1', 'field2', 'field3'];

testRouter.get(
  '/test',
  [Validators.getSearch(fields)],
  paramsValidatorMiddleware,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Success' });
  },
);

const testApp = express();

testApp.use(testRouter);

describe('Search Parameter Validator', () => {
  it('should throw an error if search is not a valid JSON value', async (done) => {
    const res = await request(testApp).get('/test?search={test');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search is not an Array', async (done) => {
    const res = await request(testApp).get('/test?search={"test":9}');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search has less than 2 elements', async (done) => {
    const res = await request(testApp).get('/test?search=[]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search has an odd length', async (done) => {
    const res = await request(testApp).get('/test?search=["field1", "hello", "field2"]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search has unknown fields', async (done) => {
    const res = await request(testApp).get('/test?search=["unknown","test"]');
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search has non-string keywords', async (done) => {
    const res = await request(testApp).get(`/test?search=["${fields[0]}",1]`);
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if search has empty keywords', async (done) => {
    const res = await request(testApp).get(`/test?search=["${fields[0]}",""]`);
    expect(res.status).toEqual(400);
    done();
  });
});
