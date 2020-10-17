import request from 'supertest';
import { v4 } from 'uuid';
import { getManager, Connection } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entities';
import { connectDB, disconnectDB } from '../../src/database';
import { UserRole, USER_ROLES, Auth } from '../../src/auth';
import { clearDB } from '../testHelpers';

let connection: Connection = null;

describe('Authentication controller', () => {
  beforeAll(async (done) => {
    connection = await connectDB();
    done();
  });

  afterAll(async (done) => {
    await disconnectDB();
    done();
  });

  beforeEach(async (done) => {
    await clearDB(connection);
    done();
  });

  it('POST /signin should create a new User', async (done) => {
    const newCredentials = {
      email: 'my.new.user@mail.com',
      password: 'test-password',
    };

    await request(app).post('/auth/signin').send({
      email: newCredentials.email,
      password: newCredentials.email,
    });

    const entityManager = getManager();
    const lookupUser = await entityManager.findOne(User, {
      where: {
        email: newCredentials.email,
      },
    });

    expect(lookupUser).toBeDefined();
    done();
  });

  it('POST /signin should return 201 Created, the authorization details and the user informations', async (done) => {
    const newCredentials = {
      email: 'my.new.user@mail.com',
      password: 'test-password',
    };

    const res = await request(app).post('/auth/signin').send({
      email: newCredentials.email,
      password: newCredentials.email,
    });

    expect(res.status).toEqual(201);
    expect(typeof res.body.authorization.token).toBe('string');
    expect(typeof res.body.authorization.expiresIn).toBe('string');
    expect(res.body.user.email).toEqual(newCredentials.email);
    expect(typeof res.body.user.id).toBe('string');
    expect(typeof res.body.user.password).toBe('string');
    expect(USER_ROLES).toContain(res.body.user.role);
    done();
  });

  it('POST /signin should return 209 Conflict when given an email already taken', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(user);

    const res = await request(app).post('/auth/signin').send({
      email: user.email,
      password: 'test-password-test',
    });

    expect(res.status).toEqual(409);
    done();
  });

  it('POST /login should return 200 OK with the authorization details when given valid credentials', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    const password = 'test-password';
    user.password = await Auth.encryptPassword(password);
    user.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(user);

    const res = await request(app).post('/auth/login').send({
      email: user.email,
      password,
    });

    expect(res.status).toEqual(200);
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.expiresIn).toBe('string');
    done();
  });

  it('POST /login should return 400 Bad Request when given invalid credentials', async (done) => {
    const res = await request(app).post('/auth/login').send({
      email: 'random.test@mail.com',
      password: 'test-random-pass',
    });

    expect(res.status).toEqual(400);
    done();
  });
});
