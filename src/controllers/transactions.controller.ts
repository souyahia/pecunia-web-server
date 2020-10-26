import { Response } from 'express';
import { getManager, FindManyOptions } from 'typeorm';
import { v4 } from 'uuid';
import { Category, Transaction } from '../entities';
import { AuthRequest } from '../auth';
import { getQueryOptions } from '../utils';

async function checkCategoriesValidity(
  req: AuthRequest,
): Promise<{ status: number; message?: string; categories?: Category[] }> {
  const entityManager = getManager();
  const promises: Promise<Category>[] = [];
  const inputCategories = req.body.categories as Category[];
  for (let i = 0; i < inputCategories.length; i++) {
    promises.push(
      entityManager.findOne(Category, {
        where: {
          id: inputCategories[i].id,
        },
        relations: ['user'],
      }),
    );
  }
  const resultCategories = await Promise.all(promises);
  for (let i = 0; i < resultCategories.length; i++) {
    if (!resultCategories[i]) {
      return {
        status: 404,
        message: 'Category ID not found.',
      };
    }
    if (resultCategories[i].user.id !== req.payload.id) {
      return {
        status: 403,
        message: 'You are not the owner of one of the categories you mentioned.',
      };
    }
  }
  const categories: Category[] = [];
  for (let i = 0; i < inputCategories.length; i++) {
    categories.push(new Category());
    categories[i].id = inputCategories[i].id;
  }
  return {
    status: 200,
    categories,
  };
}

export async function getTransactions(req: AuthRequest, res: Response): Promise<void> {
  const entityManager = getManager();
  const findOptions: FindManyOptions<Transaction> = getQueryOptions(req);
  if (!findOptions.where) {
    findOptions.where = {};
  }
  Object.assign(findOptions.where, { userId: req.payload.id });
  findOptions.relations = ['categories'];
  const values = await entityManager.find(Transaction, findOptions);
  res.status(200).json({ values });
}

export async function getTransaction(req: AuthRequest, res: Response): Promise<void> {
  const { transactionId } = req.params;
  const entityManager = getManager();
  const findOptions: FindManyOptions<Transaction> = {
    where: {
      id: transactionId,
    },
    relations: ['user', 'categories'],
  };
  const transaction = await entityManager.findOne(Transaction, findOptions);
  if (!transaction) {
    res.status(404).json({
      message: 'Transaction ID not found.',
    });
  } else if (transaction.user.id !== req.payload.id) {
    res.status(403).json({
      message: 'You do not have the rights to access this transaction.',
    });
  } else {
    transaction.userId = transaction.user.id;
    delete transaction.user;
    res.status(200).json(transaction);
  }
}

export async function createTransaction(req: AuthRequest, res: Response): Promise<void> {
  const newTransaction = new Transaction();
  newTransaction.id = v4();
  newTransaction.userId = req.payload.id;
  newTransaction.accountId = req.body.accountId;
  newTransaction.amount = req.body.amount;
  newTransaction.bankId = req.body.bankId;
  newTransaction.currency = req.body.currency;
  newTransaction.date = req.body.date;
  newTransaction.name = req.body.name;
  newTransaction.publicId = req.body.publicId;
  newTransaction.type = req.body.type;
  newTransaction.categories = [];
  if (req.body.categories) {
    const { status, message, categories } = await checkCategoriesValidity(req);
    if (status !== 200) {
      res.status(status).json({ message });
    } else {
      newTransaction.categories = categories;
    }
  }
  await newTransaction.validate();
  const entityManager = getManager();
  const transaction = await entityManager.save(newTransaction);
  res.status(201).json(transaction);
}

export async function updateTransaction(req: AuthRequest, res: Response): Promise<void> {
  const { transactionId } = req.params;
  const entityManager = getManager();
  const lookupTransaction = await entityManager.findOne(Transaction, {
    where: {
      id: transactionId,
    },
    relations: ['user', 'categories'],
  });
  if (!lookupTransaction) {
    res.status(404).json({
      message: 'Transaction ID not found.',
    });
  } else if (req.payload.id !== lookupTransaction.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to update this transaction.',
    });
  } else {
    const updatedTransaction = new Transaction();
    updatedTransaction.id = lookupTransaction.id;
    updatedTransaction.userId = lookupTransaction.user.id;
    updatedTransaction.accountId = req.body.accountId ?? lookupTransaction.accountId;
    updatedTransaction.amount = req.body.amount ?? lookupTransaction.amount;
    updatedTransaction.bankId = req.body.bankId ?? lookupTransaction.bankId;
    updatedTransaction.currency = req.body.currency ?? lookupTransaction.currency;
    updatedTransaction.date = req.body.date ?? lookupTransaction.date;
    updatedTransaction.name = req.body.name ?? lookupTransaction.name;
    updatedTransaction.publicId = req.body.publicId ?? lookupTransaction.publicId;
    updatedTransaction.type = req.body.type ?? lookupTransaction.type;
    if (req.body.categories) {
      const { status, message, categories } = await checkCategoriesValidity(req);
      if (status !== 200) {
        res.status(status).json({ message });
      } else {
        updatedTransaction.categories = categories;
      }
    } else {
      updatedTransaction.categories = lookupTransaction.categories;
    }
    await updatedTransaction.validate();
    await entityManager.save(Transaction, updatedTransaction);
    const result = await entityManager.findOne(Transaction, {
      where: {
        id: transactionId,
      },
      relations: ['categories'],
    });
    res.status(200).json(result);
  }
}

export async function deleteTransaction(req: AuthRequest, res: Response): Promise<void> {
  const { transactionId } = req.params;
  const entityManager = getManager();
  const lookupTransaction = await entityManager.findOne(Transaction, {
    where: {
      id: transactionId,
    },
    relations: ['user'],
  });
  if (!lookupTransaction) {
    res.status(404).json({
      message: 'Transaction ID not found.',
    });
  } else if (req.payload.id !== lookupTransaction.user.id) {
    res.status(403).json({
      message: 'You do not have the rights to delete this transaction.',
    });
  } else {
    const result = await entityManager.delete(Transaction, { id: transactionId });
    res.status(200).json({
      message: 'Transaction successfully deleted.',
      affected: result.affected,
    });
  }
}
