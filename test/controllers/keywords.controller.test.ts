import request from 'supertest';
import { v4 } from 'uuid';
import { getManager, Connection } from 'typeorm';
import app from '../../src/app';
import { User, Category, Keyword } from '../../src/entities';
import { connectDB, disconnectDB } from '../../src/database';
import { UserRole, Auth } from '../../src/auth';
import { clearDB } from '../testHelpers';

const user1 = new User();
user1.id = v4();
user1.email = 'user1.test@mail.com';
user1.role = UserRole.User;

const user2 = new User();
user2.id = v4();
user2.email = 'user2.test@mail.com';
user2.role = UserRole.User;

const user1Token = Auth.signPayload({
  email: user1.email,
  id: user1.id,
  role: user1.role,
}).token;

let connection: Connection = null;

describe('Keywords Controller', () => {
  beforeAll(async (done) => {
    connection = await connectDB();
    user1.password = await Auth.encryptPassword('user1-password');
    user2.password = await Auth.encryptPassword('user2-password');
    done();
  });

  afterAll(async (done) => {
    await disconnectDB();
    done();
  });

  beforeEach(async (done) => {
    await clearDB(connection);
    const entityManager = getManager();
    await entityManager.save(user1);
    await entityManager.save(user2);
    done();
  });

  it('GET /keywords should return 200 OK with all the keywords in an array', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.user = { id: user1.id };
      
    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const keywords: Keyword[] = [];
    const promises: Promise<Keyword>[] = [];
    for (let i = 0; i < 5; i++) {
      keywords.push(new Keyword());
      keywords[i].category = { id: category.id };
      keywords[i].value = `Keyword #${i}`;
      promises.push(entityManager.save(keywords[i]));
    }
    await Promise.all(promises);
    const res = await request(app)
      .get(`/keywords?category=${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as Keyword[];
    for (let i = 0; i < keywords.length; i++) {
      expect(
        values.findIndex((value: Keyword) => {
          return value.id === keywords[i].id;
        }),
      ).toBeGreaterThanOrEqual(0);
    }
    done();
  });
});
