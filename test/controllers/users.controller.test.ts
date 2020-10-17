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

const userToken = Auth.signPayload({
  email: 'test.user@mail.com',
  id: v4(),
  role: 'USER',
}).token;

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
    expect(res.body.count).toEqual(userNb);
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

  it('GET /users with range, order and search parameters should filter, order and select a range of users', async (done) => {
    const users: User[] = [];
    const passPromises: Promise<string>[] = [];
    const userNb = 7;
    for (let i = 0; i < userNb; i++) {
      users.push(new User());
      users[i].id = v4();
      if (i > 5) {
        users[i].email = `user${i}.second@mail.com`;
      } else {
        users[i].email = `user${i}.test@mail.com`;
      }
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
      .get('/users?range=[0,4]&sort=["email","ASC"]&search=["email","test"]')
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as User[];
    expect(values.length).toEqual(5);
    for (let i = 0; i < 5; i++) {
      expect(values[i].email).toEqual(`user${i}.test@mail.com`);
    }
    done();
  });

  it('GET /users should return 403 Forbidden when accessed by a non-administrator account', async (done) => {
    const res = await request(app)
      .get('/users')
      .set({ authorization: `Bearer ${userToken}` });

    expect(res.status).toEqual(403);
    done();
  });

  it('GET /user/:userId should return the user information', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(user);

    const res = await request(app)
      .get(`/users/${user.id}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(user.id);
    expect(res.body.email).toEqual(user.email);
    expect(res.body.password).toEqual(user.password);
    expect(res.body.role).toEqual(user.role);
    done();
  });

  it('GET /user/:userId should 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .get(`/users/${v4()}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(404);
    done();
  });

  it('GET /user/:userId should return 403 Forbidden when a non-administrator user try to get another users information', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const otherUser = new User();
    otherUser.id = v4();
    otherUser.email = 'other.user@test.com';
    otherUser.password = await Auth.encryptPassword('other-password');
    otherUser.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);
    await entityManager.save(otherUser);

    const { token } = Auth.signPayload({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const res = await request(app)
      .get(`/users/${otherUser.id}`)
      .set({ authorization: `Bearer ${token}` });

    expect(res.status).toEqual(403);
    done();
  });

  it('GET /user/:userId should allow non administrator accounts to get their own user information', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);

    const { token } = Auth.signPayload({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const res = await request(app)
      .get(`/users/${user.id}`)
      .set({ authorization: `Bearer ${token}` });

    expect(res.status).toEqual(200);
    done();
  });

  it('POST /users should add the new user into the database', async (done) => {
    const newUser = new User();
    newUser.email = 'my.new.user@test.com';
    newUser.password = 'test-password';
    newUser.role = UserRole.Admin;

    await request(app)
      .post('/users')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });

    const entityManager = getManager();
    const lookupUser = await entityManager.findOne(User, {
      where: {
        email: newUser.email,
      },
    });

    expect(lookupUser.email).toEqual(newUser.email);
    expect(lookupUser.role).toEqual(newUser.role);
    done();
  });

  it('POST /users should return 201 Created with the inserted data', async (done) => {
    const newUser = new User();
    newUser.email = 'my.new.user@test.com';
    newUser.password = 'test-password';
    newUser.role = UserRole.Admin;

    const res = await request(app)
      .post('/users')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });

    expect(res.status).toEqual(201);
    expect(res.body.email).toEqual(newUser.email);
    expect(res.body.role).toEqual(newUser.role);
    expect(typeof res.body.password).toBe('string');
    expect(typeof res.body.id).toBe('string');
    done();
  });

  it('POST /users should return 409 Conflict if the email already exists', async (done) => {
    const aeUser = new User();
    aeUser.id = v4();
    aeUser.email = 'my.new.user@test.com';
    aeUser.password = await Auth.encryptPassword('test-password');
    aeUser.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(aeUser);

    const res = await request(app)
      .post('/users')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: aeUser.email,
        password: 'test-random-pass',
        role: UserRole.User,
      });

    expect(res.status).toEqual(409);
    done();
  });

  it('POST /users should return 403 Forbidden when accessed by a non-administrator account', async (done) => {
    const res = await request(app)
      .post('/users')
      .set({ authorization: `Bearer ${userToken}` })
      .send({
        email: 'test.email@test.com',
        password: 'test-random-pass',
        role: UserRole.User,
      });

    expect(res.status).toEqual(403);
    done();
  });

  it('PATCH /users/:userId should update the information of a user', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(user);

    const updatedInfo = {
      email: 'new.email@test.com',
      password: 'new-password',
      role: UserRole.User,
    };

    await request(app)
      .patch(`/users/${user.id}`)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: updatedInfo.email,
        password: updatedInfo.password,
        role: updatedInfo.role,
      });

    const lookupUser = await entityManager.findOne(User, {
      where: {
        id: user.id,
      },
    });

    expect(lookupUser.email).toEqual(updatedInfo.email);
    expect(lookupUser.role).toEqual(updatedInfo.role);
    expect(lookupUser.password).not.toEqual(user.password);
    done();
  });

  it('PATCH /users/:userId should return 200 Ok with the new data', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.Admin;

    const entityManager = getManager();
    await entityManager.save(user);

    const updatedInfo = {
      email: 'new.email@test.com',
      password: 'new-password',
      role: UserRole.User,
    };

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: updatedInfo.email,
        password: updatedInfo.password,
        role: updatedInfo.role,
      });

    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(updatedInfo.email);
    expect(res.body.role).toEqual(updatedInfo.role);
    expect(typeof res.body.password).toBe('string');
    expect(typeof res.body.id).toBe('string');
    done();
  });

  it('PATCH /users/:userId should return 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .patch(`/users/${v4()}`)
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        email: 'test.mail@mail.com',
        password: 'test-password',
        role: UserRole.User,
      });

    expect(res.status).toEqual(404);
    done();
  });

  it('PATCH /user/:userId should return 403 Forbidden when a non-administrator user try to modify another users information', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const otherUser = new User();
    otherUser.id = v4();
    otherUser.email = 'other.user@test.com';
    otherUser.password = await Auth.encryptPassword('other-password');
    otherUser.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);
    await entityManager.save(otherUser);

    const { token } = Auth.signPayload({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const res = await request(app)
      .patch(`/users/${otherUser.id}`)
      .set({ authorization: `Bearer ${token}` })
      .send({ email: 'new@mail.com' });

    expect(res.status).toEqual(403);
    done();
  });

  it('PATCH /users/:userId should allow non-administrator accounts to update their own information', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'my.new.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);

    const { token } = Auth.signPayload({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const email = 'my.new.email@mail.com';

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set({ authorization: `Bearer ${token}` })
      .send({ email });

    expect(res.status).toEqual(200);
    expect(res.body.email).toEqual(email);
    done();
  });

  it('PATCH /user/:userId should return 403 Forbidden when a non-administrator user try to set themselves as administrator', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);

    const { token } = Auth.signPayload({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set({ authorization: `Bearer ${token}` })
      .send({ role: UserRole.Admin });

    expect(res.status).toEqual(403);
    done();
  });

  it('DELETE /user/:userId should delete the user', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);

    await request(app)
      .delete(`/users/${user.id}`)
      .set({ authorization: `Bearer ${adminToken}` });

    const lookupUser = await entityManager.findOne(User, {
      where: {
        id: user.id,
      },
    });

    expect(lookupUser).toBeUndefined();
    done();
  });

  it('DELETE /user/:userId should return 404 Not Found when given an unknown id', async (done) => {
    const res = await request(app)
      .delete(`/users/${v4()}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(res.status).toEqual(404);
    done();
  });

  it('DELETE /user/:userId should return 403 Forbidden when accessed by a non-administrator account', async (done) => {
    const user = new User();
    user.id = v4();
    user.email = 'test.user@test.com';
    user.password = await Auth.encryptPassword('test-password');
    user.role = UserRole.User;

    const entityManager = getManager();
    await entityManager.save(user);

    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set({ authorization: `Bearer ${userToken}` });

    expect(res.status).toEqual(403);
    done();
  });
});
