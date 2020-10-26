import { Response } from 'express';
import { getManager, FindManyOptions, DeleteResult } from 'typeorm';
import { v4 } from 'uuid';
import { Category, Keyword } from '../entities';
import { AuthRequest } from '../auth';
import { getQueryOptions } from '../utils';

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  const entityManager = getManager();
  const findOptions: FindManyOptions<Category> = getQueryOptions(req);
  if (!findOptions.where) {
    findOptions.where = {};
  }
  Object.assign(findOptions.where, { userId: req.payload.id });
  findOptions.relations = ['keywords'];
  const values = await entityManager.find(Category, findOptions);
  res.status(200).json({ values });
}

export async function getCategory(req: AuthRequest, res: Response): Promise<void> {
  const { categoryId } = req.params;
  const entityManager = getManager();
  const findOptions: FindManyOptions<Category> = {
    where: {
      id: categoryId,
    },
    relations: ['user', 'keywords'],
  };
  const category = await entityManager.findOne(Category, findOptions);
  if (!category) {
    res.status(404).json({
      message: 'Category ID not found.',
    });
  } else if (category.user.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to access this category.',
    });
  } else {
    category.userId = category.user.id;
    delete category.user;
    res.status(200).json(category);
  }
}

export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  const newCategory = new Category();
  newCategory.id = v4();
  newCategory.userId = req.payload.id;
  newCategory.matchAll = req.body.matchAll;
  newCategory.name = req.body.name;

  const entityManager = getManager();
  await newCategory.validate();
  const category = await entityManager.save(newCategory);
  res.status(201).json(category);
}

export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  const { categoryId } = req.params;
  const entityManager = getManager();
  const lookupCategory = await entityManager.findOne(Category, {
    where: {
      id: categoryId,
    },
    relations: ['user', 'keywords'],
  });
  if (!lookupCategory) {
    res.status(404).json({
      message: 'Category ID not found.',
    });
  } else if (req.payload.id !== lookupCategory.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to update this category.',
    });
  } else {
    const updatedCategory = new Category();
    updatedCategory.id = lookupCategory.id;
    updatedCategory.userId = lookupCategory.user.id;
    updatedCategory.matchAll = req.body.matchAll ?? lookupCategory.matchAll;
    updatedCategory.name = req.body.name ?? lookupCategory.name;
    if (req.body.keywords) {
      updatedCategory.keywords = req.body.keywords;
      for (let i = 0; i < updatedCategory.keywords.length; i++) {
        if (updatedCategory.keywords[i].id) {
          const index = lookupCategory.keywords.findIndex((value: Keyword) => {
            return value.id === updatedCategory.keywords[i].id;
          });
          if (index === -1) {
            res.status(404).json({
              message:
                'Keyword ID not found. Do not specify the keyword ID if you want to create a new one.',
            });
            return;
          }
        } else {
          updatedCategory.keywords[i].id = v4();
        }
      }
      // Since TypeOrm doesn't support onDelete cascades for OneToMany relationships, we have to make the diff
      // manually and delete child entities by hand... See :
      // https://github.com/typeorm/typeorm/issues/5645
      // https://github.com/typeorm/typeorm/issues/2121
      // https://github.com/typeorm/typeorm/issues/1351
      // etc...
      const promises: Promise<DeleteResult>[] = [];
      for (let i = 0; i < lookupCategory.keywords.length; i++) {
        const index = updatedCategory.keywords.findIndex((value: Keyword) => {
          return value.id === lookupCategory.keywords[i].id;
        });
        if (index === -1) {
          promises.push(entityManager.delete(Keyword, { id: lookupCategory.keywords[i].id }));
        }
      }
      await Promise.all(promises);
    } else {
      updatedCategory.keywords = lookupCategory.keywords;
    }
    await updatedCategory.validate();
    await entityManager.save(Category, updatedCategory);
    const result = await entityManager.findOne(Category, {
      where: {
        id: categoryId,
      },
      relations: ['keywords'],
    });
    res.status(200).json(result);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  const { categoryId } = req.params;
  const entityManager = getManager();
  const lookupCategory = await entityManager.findOne(Category, {
    where: {
      id: categoryId,
    },
    relations: ['user'],
  });
  if (!lookupCategory) {
    res.status(404).json({
      message: 'Category ID not found.',
    });
  } else if (req.payload.id !== lookupCategory.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to delete this category.',
    });
  } else {
    const result = await entityManager.delete(Category, { id: categoryId });
    res.status(200).json({
      message: 'Category successfully deleted.',
      affected: result.affected,
    });
  }
}
