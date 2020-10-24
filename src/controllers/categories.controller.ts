import { Response } from 'express';
import { getManager, FindManyOptions } from 'typeorm';
import { v4 } from 'uuid';
import { Category, User, Keyword } from '../entities';
import { AuthRequest } from '../auth';
import { getQueryOptions } from '../utils';

export async function getCategories(req: AuthRequest, res: Response): Promise<void> {
  const entityManager = getManager();
  const lookupUser = await entityManager.findOne(User, {
    where: {
      id: req.query.userId,
    },
  });
  if (!lookupUser) {
    res.status(404).json({
      message: 'Unknown user ID.',
    });
  } else if (lookupUser.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to access the categories of this user.',
    });
  } else {
    const findOptions: FindManyOptions<Category> = getQueryOptions(req);
    findOptions.relations = ['keywords'];
    const values = await entityManager.find(Category, findOptions);
    res.status(200).json({ values });
  }
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
      const findPromises: Promise<Keyword>[] = [];
      for (let i = 0; i < updatedCategory.keywords.length; i++) {
        if (updatedCategory.keywords[i].id) {
          findPromises.push(
            entityManager.findOne(Keyword, {
              where: {
                id: updatedCategory.keywords[i].id,
              },
              relations: ['category', 'category.user'],
            }),
          );
        }
      }
      const results = await Promise.all(findPromises);
      for (let i = 0; i < results.length; i++) {
        if (!results[i]) {
          res.status(404).json({
            message:
              'Keyword ID not found. Do not specify the keyword ID if you want to create a new one.',
          });
          return;
        }
        if (results[i].category.user.id !== req.payload.id) {
          res.status(403).json({
            message: 'You are not the owner of the keyword you are trying to add to the category.',
          });
          return;
        }
        updatedCategory.keywords[i].id = updatedCategory.keywords[i].id ?? v4();
      }
    } else {
      updatedCategory.keywords = lookupCategory.keywords;
    }
    await updatedCategory.validate();
    await entityManager.update(Category, { id: categoryId }, updatedCategory);
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
