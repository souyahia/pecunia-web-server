import request from 'supertest';
import express, { Router, Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { Validators, paramsValidatorMiddleware } from '../../../src/middleware';

const testRouter = Router();

testRouter.post(
  '/test',
  [Validators.keywords],
  paramsValidatorMiddleware,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Success' });
  },
);

const testApp = express();

testApp.use(json());
testApp.use(urlencoded({ extended: true }));
testApp.use(testRouter);

describe('Keywords Parameter Validator', () => {
  it('should throw an error if keywords is not an Array', async (done) => {
    const res = await request(testApp).post('/test').send({
      keywords: 'test',
    });

    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keywords parameter contain null or undefined values', async (done) => {
    let res = await request(testApp)
      .post('/test')
      .send({
        keywords: [null],
      });
    expect(res.status).toEqual(400);

    res = await request(testApp)
      .post('/test')
      .send({
        keywords: [undefined],
      });
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keyword values are not strings', async (done) => {
    const res = await request(testApp)
      .post('/test')
      .send({
        keywords: [
          {
            value: 12,
          },
        ],
      });
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keyword values are empty', async (done) => {
    const res = await request(testApp)
      .post('/test')
      .send({
        keywords: [
          {
            value: '',
          },
        ],
      });
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keyword values exceed 255 characters', async (done) => {
    const res = await request(testApp)
      .post('/test')
      .send({
        keywords: [
          {
            value:
              'this-string-is-more-than-255-characters-QiWbyujhLRgMrjFLTZLJzyaWxKfTyVLLMfnhLxxDSddSeuWNbZKAhCuThShLfXgAQHMyacfdCBEqrFdaiCCiiTZgUbMeeFJkZvwAHhQEqwANYbyGxyURVyxYAkqpMAAvgDSufRyaBkFequzWgTbGnzQqDGWEyYheqCMGywbQfpjTyUkrzndgDPiHNqfbkdYawuyareuTBRupKnaabSXnKBTa',
          },
        ],
      });
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keyword IDs are not strings', async (done) => {
    const res = await request(testApp)
      .post('/test')
      .send({
        keywords: [
          {
            value: 'test',
            id: 2,
          },
        ],
      });
    expect(res.status).toEqual(400);
    done();
  });

  it('should throw an error if keyword IDs are not UUIDs v4', async (done) => {
    const res = await request(testApp)
      .post('/test')
      .send({
        keywords: [
          {
            value: 'test',
            id: 'test',
          },
        ],
      });
    expect(res.status).toEqual(400);
    done();
  });
});
