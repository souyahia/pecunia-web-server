import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { v4 } from 'uuid';
import { User } from '../entities';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const entityManager = getManager();
  const users = await entityManager.find(User);
  res.status(200).json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const entityManager = getManager();
  const user = await entityManager.findOne(User, {
    where: {
      email: req.body.email,
    },
  });
  if (user) {
    res.status(400).json({
      message: 'Email already exists.',
    });
  } else {
    const newUser = new User();
    newUser.id = v4();
    newUser.email = req.body.email;
    newUser.password = req.body.password;
    newUser.transactions = [];
    newUser.categories = [];
    const result = await entityManager.save(newUser);
    res.status(200).json(result);
  }
}
