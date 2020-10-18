import request from 'supertest';
import express, { Router, Request, Response } from 'express';
import { Validators, paramsValidatorMiddleware } from '../../../src/middleware';

const testRouter = Router();
const fields = ['field1', 'field2', 'field3'];

testRouter.get(
  '/test',
  [Validators.getSort(fields)],
  paramsValidatorMiddleware,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Success' });
  },
);

const testApp = express();

testApp.use(testRouter);

describe('Sort Parameter Validator', () => {
  it('should throw an error if sort is not a valid JSON value', async (done) => {
    const res = await request(testApp).get('/test?sort={test');
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort is not an Array', async (done) => {
    const res = await request(testApp).get('/test?sort={"test":9}');
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort has less than 2 elements', async (done) => {
    const res = await request(testApp).get('/test?sort=[]');
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort has an odd length', async (done) => {
    const res = await request(testApp).get('/test?sort=["field1", "hello", "field2"]');
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort has unknown fields', async (done) => {
    const res = await request(testApp).get('/test?sort=["unknown","test"]');
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort has non-string keywords', async (done) => {
    const res = await request(testApp).get(`/test?sort=["${fields[0]}",1]`);
    expect(res.status).toEqual(400);
    done();
  });
  it('should throw an error if sort has unknown sorting order', async (done) => {
    const res = await request(testApp).get(`/test?sort=["${fields[0]}","DESCC"]`);
    expect(res.status).toEqual(400);
    done();
  });
});
