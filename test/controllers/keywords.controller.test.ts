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
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const keywords: Keyword[] = [];
    const promises: Promise<Keyword>[] = [];
    for (let i = 0; i < 5; i++) {
      keywords.push(new Keyword());
      keywords[i].categoryId = category.id;
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

  it('GET /keywords should only return the keywords of the given category', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const newCategory2 = new Category();
    newCategory2.matchAll = true;
    newCategory2.name = 'TEST CATEGORY 2';
    newCategory2.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);
    const category2 = await entityManager.save(newCategory2);

    const keywords: Keyword[] = [];
    const promises: Promise<Keyword>[] = [];
    for (let i = 0; i < 5; i++) {
      keywords.push(new Keyword());
      keywords[i].categoryId = category.id;
      keywords[i].value = `Keyword #${i}`;
      promises.push(entityManager.save(keywords[i]));

      const wrongKeyword = new Keyword();
      wrongKeyword.categoryId = category2.id;
      wrongKeyword.value = `Wrong Keyword #${i}`;
      promises.push(entityManager.save(wrongKeyword));
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

  it('GET /keywords with range, order and search parameters should filter, order and select a range of keywords', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const keywords: Keyword[] = [];
    const keywordNb = 7;
    const promises: Promise<Keyword>[] = [];
    for (let i = 0; i < keywordNb; i++) {
      keywords.push(new Keyword());
      keywords[i].categoryId = category.id;
      if (i > 5) {
        keywords[i].value = `test #${i}`;
      } else {
        keywords[i].value = `searched #${i}`;
      }
      promises.push(entityManager.save(keywords[i]));
    }
    await Promise.all(promises);

    const res = await request(app)
      .get(
        `/keywords?category=${category.id}&range=[0,4]&sort=["value","ASC"]&search=["value","searched"]`,
      )
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as Keyword[];
    expect(values.length).toEqual(5);
    for (let i = 0; i < 5; i++) {
      expect(values[i].value).toEqual(`searched #${i}`);
    }
    done();
  });

  it('GET /keywords should 404 Not Found when given an unknown category id parameter', async (done) => {
    const res = await request(app)
      .get('/keywords?category=123456789')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(404);
    done();
  });

  it("GET /keywords should return 403 Forbidden when the keyword's category is not owned by the user", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .get(`/keywords?category=${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(403);
    done();
  });

  it("GET /keywords/:keywordId should return the keyword's information", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'My Keyword';
    const keyword = await entityManager.save(newKeyword);

    const res = await request(app)
      .get(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(keyword.id);
    expect(res.body.value).toEqual(keyword.value);
    expect(res.body.categoryId).toEqual(category.id);
    done();
  });

  it('GET /keywords/:keywordId should 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .get('/keywords/123456789')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(404);
    done();
  });

  it("GET /keywords/:keywordId should 403 Forbidden when trying to access another user's keyword", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'My Keyword';
    const keyword = await entityManager.save(newKeyword);

    const res = await request(app)
      .get(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(403);
    done();
  });

  it('POST /keywords should add the new keyword into the database', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';

    await request(app)
      .post('/keywords')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        categoryId: newKeyword.categoryId,
        value: newKeyword.value,
      });

    const lookupKeyword = await entityManager.findOne(Keyword, {
      where: {
        categoryId: category.id,
        value: newKeyword.value,
      },
    });

    expect(lookupKeyword).toBeDefined();
    done();
  });

  it('POST /keywords should return 201 Created with the inserted data', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';

    const res = await request(app)
      .post('/keywords')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        categoryId: newKeyword.categoryId,
        value: newKeyword.value,
      });

    expect(res.status).toEqual(201);
    expect(res.body.categoryId).toEqual(category.id);
    expect(res.body.value).toEqual(newKeyword.value);
    expect(typeof res.body.id).toBe('number');
    done();
  });

  it('POST /keywords should return 404 Not Found when given an invalid category ID', async (done) => {
    const newKeyword = new Keyword();
    newKeyword.categoryId = 132456789;
    newKeyword.value = 'KEYWORD TEST';

    const res = await request(app)
      .post('/keywords')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        categoryId: newKeyword.categoryId,
        value: newKeyword.value,
      });

    expect(res.status).toEqual(404);
    done();
  });

  it("POST /keywords should return 404 Not Found when given the ID of another user's category", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';

    const res = await request(app)
      .post('/keywords')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        categoryId: newKeyword.categoryId,
        value: newKeyword.value,
      });

    expect(res.status).toEqual(403);
    done();
  });

  it('PATCH /keywords/:keywordId should update the value of a keyword', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';
    const keyword = await entityManager.save(newKeyword);

    const value = 'NEW VALUE';

    await request(app)
      .patch(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({ value });

    const lookupKeyword = await entityManager.findOne(Keyword, {
      where: {
        id: keyword.id,
      },
    });

    expect(lookupKeyword.value).toEqual(value);
    done();
  });

  it('PATCH /keywords/:keywordId should return 200 Ok with the new data', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';
    const keyword = await entityManager.save(newKeyword);

    const value = 'NEW VALUE';

    const res = await request(app)
      .patch(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({ value });

    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(keyword.id);
    expect(res.body.categoryId).toEqual(keyword.categoryId);
    expect(res.body.value).toEqual(value);
    done();
  });

  it('PATCH /keywords/:keywordId should return 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .patch('/keywords/123456789')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({ value: 'NEW VALUE' });

    expect(res.status).toEqual(404);
    done();
  });

  it("PATCH /keywords/:keywordId should return 403 Forbidden when given the ID of another user's keyword", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';
    const keyword = await entityManager.save(newKeyword);

    const res = await request(app)
      .patch(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({ value: 'NEW VALUE' });

    expect(res.status).toEqual(403);
    done();
  });

  it('DELETE /keywords/:keywordId should delete the keyword', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';
    const keyword = await entityManager.save(newKeyword);

    await request(app)
      .delete(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    const lookupKeyword = await entityManager.findOne(Keyword, {
      where: {
        id: keyword.id,
      },
    });

    expect(lookupKeyword).toBeUndefined();
    done();
  });

  it('DELETE /keywords/:keywordId should return 404 Not Found when given an unknown id', async (done) => {
    const res = await request(app)
      .delete('/keywords/132456789')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(404);
    done();
  });

  it("DELETE /keywords/:keywordId should return 403 Forbidden when given the ID of another user's keyword", async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const newKeyword = new Keyword();
    newKeyword.categoryId = category.id;
    newKeyword.value = 'KEYWORD TEST';
    const keyword = await entityManager.save(newKeyword);

    const res = await request(app)
      .delete(`/keywords/${keyword.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(403);
    done();
  });
});
