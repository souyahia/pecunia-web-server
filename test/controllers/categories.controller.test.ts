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

describe('Categories Controller', () => {
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

  it('GET /categories should return 200 OK with all the categories in an array, with their keywords relation', async (done) => {
    const entityManager = getManager();
    const categories: Category[] = [];
    const promises: Promise<Category>[] = [];
    for (let i = 0; i < 5; i++) {
      categories.push(new Category());
      categories[i].id = v4();
      categories[i].name = `Category #${i}`;
      categories[i].userId = user1.id;
      categories[i].matchAll = true;
      categories[i].keywords = [];
      for (let j = 0; j < 2; j++) {
        categories[i].keywords.push(new Keyword());
        categories[i].keywords[j].id = v4();
        categories[i].keywords[j].value = `Category #${i} Keyword #${j}`;
      }
      promises.push(entityManager.save(categories[i]));
    }
    await Promise.all(promises);
    const res = await request(app)
      .get('/categories')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as Category[];
    for (let i = 0; i < categories.length; i++) {
      const index = values.findIndex((value: Category) => {
        return value.id === categories[i].id;
      });
      expect(index).toBeGreaterThanOrEqual(0);
      for (let j = 0; j < categories[j].keywords.length; j++) {
        const subIndex = values[index].keywords.findIndex((value: Keyword) => {
          return value.id === categories[i].keywords[j].id;
        });
        expect(subIndex).toBeGreaterThanOrEqual(0);
      }
    }
    done();
  });

  it('GET /categories should only return the categories of the logged user', async (done) => {
    const entityManager = getManager();
    const categories: Category[] = [];
    const wrongCategories: Category[] = [];
    const promises: Promise<Category>[] = [];
    for (let i = 0; i < 5; i++) {
      categories.push(new Category());
      categories[i].id = v4();
      categories[i].name = `Category #${i}`;
      categories[i].userId = user1.id;
      categories[i].matchAll = true;

      wrongCategories.push(new Category());
      wrongCategories[i].id = v4();
      wrongCategories[i].name = `Wrong Category #${i}`;
      wrongCategories[i].userId = user2.id;
      wrongCategories[i].matchAll = true;

      promises.push(entityManager.save(categories[i]));
      promises.push(entityManager.save(wrongCategories[i]));
    }
    await Promise.all(promises);
    const res = await request(app)
      .get('/categories')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as Category[];
    for (let i = 0; i < categories.length; i++) {
      expect(
        values.findIndex((value: Category) => {
          return value.id === categories[i].id;
        }),
      ).toBeGreaterThanOrEqual(0);
      expect(
        values.findIndex((value: Category) => {
          return value.id === wrongCategories[i].id;
        }),
      ).toEqual(-1);
    }
    done();
  });

  it('GET /categories with range, order and search parameters should filter, order and select a range of categories', async (done) => {
    const entityManager = getManager();
    const categories: Category[] = [];
    const promises: Promise<Category>[] = [];
    for (let i = 0; i < 8; i++) {
      categories.push(new Category());
      categories[i].id = v4();
      if (i > 5) {
        categories[i].name = `test Category #${i}`;
      } else {
        categories[i].name = `searched Category #${i}`;
      }
      categories[i].userId = user1.id;
      categories[i].matchAll = true;

      promises.push(entityManager.save(categories[i]));
    }
    await Promise.all(promises);

    const res = await request(app)
      .get('/categories?range=[0,4]&sort=["name","ASC"]&search=["name","searched"]')
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    const values = res.body.values as Category[];
    expect(values.length).toEqual(5);
    for (let i = 0; i < 5; i++) {
      expect(values[i].name).toEqual(`searched Category #${i}`);
    }
    done();
  });

  it("GET /categories/:categoryId should return the category's information with the keywords relation", async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;
    newCategory.keywords = [new Keyword()];
    newCategory.keywords[0].id = v4();
    newCategory.keywords[0].value = 'TEST KEYWORD';

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .get(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(category.id);
    expect(res.body.matchAll).toEqual(category.matchAll);
    expect(res.body.name).toEqual(category.name);
    expect(res.body.userId).toEqual(category.userId);
    expect(res.body.keywords[0].id).toEqual(category.keywords[0].id);
    expect(res.body.keywords[0].value).toEqual(category.keywords[0].value);
    expect(res.body.keywords[0].categoryId).toEqual(category.keywords[0].categoryId);
    done();
  });

  it('GET /categories/:categoryId should 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .get(`/categories/${v4()}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(404);
    done();
  });

  it("GET /categories/:categoryId should 403 Forbidden when trying to access another user's category", async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .get(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(403);
    done();
  });

  it('POST /categories should add the new category into the database', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';

    await request(app)
      .post('/categories')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        matchAll: newCategory.matchAll,
        name: newCategory.name,
      });

    const entityManager = getManager();

    const lookupCategory = await entityManager.findOne(Category, {
      where: {
        matchAll: newCategory.matchAll,
        name: newCategory.name,
      },
    });

    expect(lookupCategory).toBeDefined();
    done();
  });

  it('POST /categories should return 201 Created with the inserted data', async (done) => {
    const newCategory = new Category();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';

    const res = await request(app)
      .post('/categories')
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        matchAll: newCategory.matchAll,
        name: newCategory.name,
      });

    expect(res.status).toEqual(201);
    expect(res.body.userId).toEqual(user1.id);
    expect(res.body.name).toEqual(newCategory.name);
    expect(res.body.matchAll).toEqual(newCategory.matchAll);
    expect(typeof res.body.id).toBe('string');
    done();
  });

  it('PATCH /categories/:categoryId should update the information of a category', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const updatedCategory = new Category();
    updatedCategory.name = 'NEW NAME';
    updatedCategory.matchAll = false;

    await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        name: updatedCategory.name,
        matchAll: updatedCategory.matchAll,
      });

    const lookupCategory = await entityManager.findOne(Category, {
      where: {
        id: category.id,
      },
    });

    expect(lookupCategory.name).toEqual(updatedCategory.name);
    expect(lookupCategory.matchAll).toEqual(updatedCategory.matchAll);
    done();
  });

  it('PATCH /categories/:categoryId should return 200 OK with the new data', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const updatedCategory = new Category();
    updatedCategory.name = 'NEW NAME';
    updatedCategory.matchAll = false;

    const res = await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        name: updatedCategory.name,
        matchAll: updatedCategory.matchAll,
      });

    expect(res.status).toEqual(200);
    expect(res.body.id).toEqual(category.id);
    expect(res.body.name).toEqual(updatedCategory.name);
    expect(res.body.matchAll).toEqual(updatedCategory.matchAll);
    done();
  });

  it('PATCH /categories/:categoryId should allow to add a new keyword to the category', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const updatedCategory = new Category();
    updatedCategory.keywords = [new Keyword()];
    updatedCategory.keywords[0].value = 'NEW VALUE';

    await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        keywords: updatedCategory.keywords,
      });

    const lookupCategory = await entityManager.findOne(Category, {
      where: {
        id: category.id,
      },
      relations: ['keywords'],
    });

    expect(lookupCategory.keywords[0].categoryId).toEqual(category.id);
    expect(lookupCategory.keywords[0].value).toEqual(updatedCategory.keywords[0].value);
    done();
  });

  it('PATCH /categories/:categoryId should allow to edit a keyword of the category', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;
    newCategory.keywords = [new Keyword()];
    newCategory.keywords[0].id = v4();
    newCategory.keywords[0].value = 'TEST KEYWORD';

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const updatedCategory = new Category();
    updatedCategory.keywords = [new Keyword()];
    updatedCategory.keywords[0].id = category.keywords[0].id;
    updatedCategory.keywords[0].value = 'NEW VALUE';

    await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        keywords: updatedCategory.keywords,
      });

    const lookupKeyword = await entityManager.findOne(Keyword, {
      where: {
        id: category.keywords[0].id,
      },
    });

    expect(lookupKeyword.value).toEqual(updatedCategory.keywords[0].value);
    done();
  });

  it('PATCH /categories/:categoryId should allow to remove a keyword from a category, and from the database', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;
    newCategory.keywords = [new Keyword()];
    newCategory.keywords[0].id = v4();
    newCategory.keywords[0].value = 'TEST KEYWORD';

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        keywords: [],
      });

    const lookupCategory = await entityManager.findOne(Category, {
      where: {
        id: category.id,
      },
      relations: ['keywords'],
    });
    expect(lookupCategory.keywords.length).toEqual(0);

    const lookupKeyword = await entityManager.findOne(Keyword, {
      where: {
        id: category.keywords[0].id,
      },
    });
    expect(lookupKeyword).toBeUndefined();
    done();
  });

  it('PATCH /categories/:categoryId should return 404 Not Found when given a keyword ID not previously in the keywords array of the category', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;
    newCategory.keywords = [new Keyword()];
    newCategory.keywords[0].id = v4();
    newCategory.keywords[0].value = 'TEST KEYWORD';

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        keywords: [
          category.keywords[0],
          {
            id: v4(),
            value: 'SHOULD RETURN ERROR',
          },
        ],
      });

    expect(res.status).toEqual(404);
    done();
  });

  it('PATCH /categories/:categoryId should return 404 Not Found when given an unknown id parameter', async (done) => {
    const res = await request(app)
      .patch(`/categories/${v4()}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        name: 'TEST NAME',
      });

    expect(res.status).toEqual(404);
    done();
  });

  it("PATCH /categories/:categoryId should return 403 Forbidden when trying to update another user's category", async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .patch(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` })
      .send({
        name: 'NEW NAME',
      });

    expect(res.status).toEqual(403);
    done();
  });

  it('DELETE /categories/:categoryId should delete the category', async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user1.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    await request(app)
      .delete(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    const lookupCategory = await entityManager.findOne(Category, {
      where: {
        id: category.id,
      },
    });

    expect(lookupCategory).toBeUndefined();
    done();
  });

  it('DELETE /categories/:categoryId should return 404 Not Found when given an unknown id', async (done) => {
    const res = await request(app)
      .delete(`/categories/${v4()}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(404);
    done();
  });

  it("DELETE /categories/:categoryId should return 403 Forbidden when given the ID of another user's category", async (done) => {
    const newCategory = new Category();
    newCategory.id = v4();
    newCategory.matchAll = true;
    newCategory.name = 'TEST CATEGORY';
    newCategory.userId = user2.id;

    const entityManager = getManager();
    const category = await entityManager.save(newCategory);

    const res = await request(app)
      .delete(`/categories/${category.id}`)
      .set({ authorization: `Bearer ${user1Token}` });

    expect(res.status).toEqual(403);
    done();
  });
});
