import request from 'supertest';
import { v4 } from 'uuid';
import { getManager } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entities';
import { encryptPassword } from '../../src/auth/auth';
import { connectDB, disconnectDB } from '../../src/database';
import { UserRole } from '../../src/auth';

const validEmail = 'test@mail.com';
const validPassword = 'test-password';

describe('Authentication controller', () => {
  beforeAll(async (done) => {
    await connectDB();
    const validUser = new User();
    validUser.id = v4();
    validUser.email = validEmail;
    validUser.password = await encryptPassword(validPassword);
    validUser.role = UserRole.User;
    validUser.categories = [];
    validUser.transactions = [];
    await validUser.validate();

    const entityManager = getManager();
    await entityManager.save(validUser);
    done();
  });

  afterAll(async (done) => {
    await disconnectDB();
    done();
  });

  it('POST /login should return 200 OK when given valid credentials', async (done) => {
    const res = await request(app).post('/auth/login').send({
      email: validEmail,
      password: validPassword,
    });
    expect(res.status).toEqual(200);
    done();
  });

  it('POST /login should return the JWT token, the expire time and a message when given valid credentials', async (done) => {
    const res = await request(app).post('/auth/login').send({
      email: validEmail,
      password: validPassword,
    });
    expect(typeof res.body.message).toBe('string');
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.expiresIn).toBe('string');
    done();
  });

  it('POST /login should return 400 Bad Request with an error message when given invalid credentials', async (done) => {
    const res = await request(app).post('/auth/login').send({
      email: 'invalid-email-test',
      password: 'invalid-password-test',
    });
    expect(res.status).toEqual(400);
    expect(typeof res.body.message).toBe('string');
    done();
  });
});
