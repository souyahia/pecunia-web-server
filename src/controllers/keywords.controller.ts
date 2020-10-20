import { Response } from 'express';
import { getManager, FindManyOptions } from 'typeorm';
import { Category, Keyword } from '../entities';
import { AuthRequest } from '../auth';
import { getQueryOptions } from '../utils';

export async function getKeywords(req: AuthRequest, res: Response): Promise<void> {
  const entityManager = getManager();
  const lookupCategory = await entityManager.findOne(Category, {
    where: {
      id: req.query.category,
    },
    relations: ['user'],
  });
  if (!lookupCategory) {
    res.status(404).json({
      message: 'Unknown category ID.',
    });
  } else if (lookupCategory.user.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to access the keywords of this category.',
    });
  } else {
    const findOptions: FindManyOptions<Keyword> = getQueryOptions(req);
    const values = await entityManager.find(Keyword, findOptions);
    res.status(200).json({ values });
  }
}

export async function getKeyword(req: AuthRequest, res: Response): Promise<void> {
  const { keywordId } = req.params;
  const entityManager = getManager();
  const keyword = await entityManager.findOne(Keyword, {
    where: {
      id: keywordId,
    },
    relations: ['category', 'category.user'],
  });
  if (!keyword) {
    res.status(404).json({
      message: 'Keyword ID not found.',
    });
  } else if (keyword.category.user.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to access this keyword.',
    });
  } else {
    res.status(200).json({
      id: keyword.id,
      category: keyword.category.id,
      value: keyword.value,
    });
  }
}

export async function createKeyword(req: AuthRequest, res: Response): Promise<void> {
  const newKeyword = new Keyword();
  newKeyword.category = { id: req.body.categoryId };
  newKeyword.value = req.body.value;
  
  const entityManager = getManager();
  const lookupCategory = await entityManager.findOne(Category, {
    where: {
      id: newKeyword.category.id,
    },
    relations: ['category', 'category.user'],
  });
  if (!lookupCategory) {
    res.status(404).json({
      message: 'Category ID not found.',
    });
  } else if (lookupCategory.user.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to add a keyword to this category.',
    });
  } else {
    const keyword = await entityManager.save(newKeyword);
    res.status(201).json(keyword);
  }
}

export async function updateKeyword(req: AuthRequest, res: Response): Promise<void> {
  const { keywordId } = req.params;
  const entityManager = getManager();
  const lookupKeyword = await entityManager.findOne(Keyword, {
    where: {
      id: keywordId,
      relations: ['category', 'category.user'],
    },
  });
  if (!lookupKeyword) {
    res.status(404).json({
      message: 'Keyword ID not found.',
    });
  } else if (req.payload.id !== lookupKeyword.category.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to update this keyword.',
    });
  } else {
    const updatedKeyword = new Keyword();
    updatedKeyword.id = lookupKeyword.id;
    updatedKeyword.value = req.body.value;
    updatedKeyword.category = { id: lookupKeyword.category.id };
    await updatedKeyword.validate();
    await entityManager.update(Keyword, { id: keywordId }, updatedKeyword);
    const result = await entityManager.findOne(Keyword, {
      where: {
        id: keywordId,
      },
    });
    res.status(200).json(result);
  }
}

export async function deleteKeyword(req: AuthRequest, res: Response): Promise<void> {
  const { keywordId } = req.params;
  const entityManager = getManager();
  const lookupKeyword = await entityManager.findOne(Keyword, {
    where: {
      id: keywordId,
      relations: ['category', 'category.user'],
    },
  });
  if (!lookupKeyword) {
    res.status(404).json({
      message: 'Keyword ID not found.',
    });
  } else if (req.payload.id !== lookupKeyword.category.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to delete this keyword.',
    });
  } else {
    const result = await entityManager.delete(Keyword, { id: keywordId });
    res.status(200).json({
      message: 'Keyword successfully deleted.',
      affected: result.affected,
    });
  }
}
