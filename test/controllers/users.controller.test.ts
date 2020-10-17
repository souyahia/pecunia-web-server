import request from 'supertest';
import { v4 } from 'uuid';
import { getManager, Connection } from 'typeorm';
import app from '../../src/app';
import { User } from '../../src/entities';
import { encryptPassword } from '../../src/auth/auth';
import { connectDB, disconnectDB } from '../../src/database';
import { UserRole, Auth } from '../../src/auth';
import { clearDB } from '../testHelpers';

const adminToken = Auth.signPayload({
  email: 'test.admin@mail.com',
  id: v4(),
  role: 'ADMIN',
}).token;

// const userToken = Auth.signPayload({
//   email: 'test.user@mail.com',
//   id: v4(),
//   role: 'USER',
// }).token;

let connection: Connection = null;

describe('Users controller', () => {
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

  it('GET /users should return 200 OK with the total number of users and all the users in an array', async (done) => {
    const users: User[] = [];
    const passPromises: Promise<string>[] = [];
    const userNb = 5;
    for (let i = 0; i < userNb; i++) {
      users.push(new User());
      users[i].id = v4();
      users[i].email = `user${i}.test@mail.com`;
      passPromises.push(encryptPassword('test-password'));
      users[i].role = UserRole.User;
    }
    const passwords = await Promise.all(passPromises);
    for (let i = 0; i < userNb; i++) {
      users[i].password = passwords[i];
    }
    const savePromises: Promise<User>[] = [];
    const entityManager = getManager();
    for (let i = 0; i < userNb; i++) {
      savePromises.push(entityManager.save(users[i]));
    }
    await Promise.all(savePromises);

    const res = await request(app)
      .get('/users')
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(200);
    expect(res.body.count).toEqual(userNb); // Don't forget the admin account!
    const values = res.body.values as User[];
    for (let i = 0; i < userNb; i++) {
      expect(
        values.findIndex((value: User) => {
          return value.id === users[i].id;
        }),
      ).toBeGreaterThanOrEqual(0);
    }
    done();
  });

  it('GET /users should return 200 OK with the total number of users and all the users in an array', async (done) => {
    const users: User[] = [];
    const passPromises: Promise<string>[] = [];
    const userNb = 5;
    for (let i = 0; i < userNb; i++) {
      users.push(new User());
      users[i].id = v4();
      users[i].email = `user${i}.test@mail.com`;
      passPromises.push(encryptPassword('test-password'));
      users[i].role = UserRole.User;
    }
    const passwords = await Promise.all(passPromises);
    for (let i = 0; i < userNb; i++) {
      users[i].password = passwords[i];
    }
    const savePromises: Promise<User>[] = [];
    const entityManager = getManager();
    for (let i = 0; i < userNb; i++) {
      savePromises.push(entityManager.save(users[i]));
    }
    await Promise.all(savePromises);

    const res = await request(app)
      .get('/users')
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(200);
    expect(res.body.count).toEqual(userNb); // Don't forget the admin account!
    const values = res.body.values as User[];
    for (let i = 0; i < userNb; i++) {
      expect(
        values.findIndex((value: User) => {
          return value.id === users[i].id;
        }),
      ).toBeGreaterThanOrEqual(0);
    }
    done();
  });
});
