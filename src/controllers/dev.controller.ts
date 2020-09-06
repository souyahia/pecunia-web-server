import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { Transaction, User } from '../entities';
import { EntityValidationError } from '../errors';

export async function getDev1(req: Request, res: Response): Promise<void> {
  const entityManager = getManager();
  const user = new User();
  user.categories = [];
  user.transactions = [];
  user.email = 'bob@mail.com';
  user.id = 'user-id';
  user.password = 'pass';

  const result = await entityManager.save(user);
  res.status(200).send({
    result,
  });
}


export async function getDev2(req: Request, res: Response): Promise<void> {
  const entityManager = getManager();
  const user = await entityManager.findOne(User, 'user-id');

  const transaction = new Transaction();
  transaction.user = user;
  transaction.date = new Date();
  transaction.amount = 10;
  transaction.name = 'My Transaction';
  transaction.type = 'DEBIT';
  transaction.publicId = 'public-id';
  transaction.currency = 'EUR';
  transaction.balance = 50;
  transaction.bankId = 'bank-id';
  transaction.accountId = 'account-id';
  transaction.categories = [];

  try {
    await transaction.validate();
    const result = await entityManager.save(transaction);
    res.status(200).send({
      result,
    });
  } catch (err) {
    if (err instanceof EntityValidationError) {
      res.status(400).send({
        errors: err.errors,
      });
    } else { throw err; }
  }
}
