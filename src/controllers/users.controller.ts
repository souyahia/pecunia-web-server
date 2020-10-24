import { Request, Response } from 'express';
import { getManager, FindManyOptions } from 'typeorm';
import { v4 } from 'uuid';
import { User } from '../entities';
import { Auth, AuthRequest, UserRole } from '../auth';
import { getQueryOptions } from '../utils';
import { encryptPassword } from '../auth/auth';

export async function getUsers(req: Request, res: Response): Promise<void> {
  const findOptions: FindManyOptions<User> = getQueryOptions(req);
  const entityManager = getManager();
  const [values, count] = await entityManager.findAndCount(User, findOptions);
  res.status(200).json({ values, count });
}

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  if (req.payload.role !== UserRole.Admin && userId !== req.payload.id) {
    res.status(403).json({
      message: 'Users without administrator rights can only get their own user info.',
    });
  } else {
    const entityManager = getManager();
    const user = await entityManager.findOne(User, {
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.status(404).json({
        message: 'User ID not found.',
      });
    } else {
      res.status(200).json(user);
    }
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const newUser = new User();
  newUser.id = v4();
  newUser.email = req.body.email;
  newUser.password = await Auth.encryptPassword(req.body.password);
  newUser.role = req.body.role;

  await newUser.validate();
  const entityManager = getManager();
  const lookupUser = await entityManager.findOne(User, {
    where: {
      email: newUser.email,
    },
  });
  if (lookupUser) {
    res.status(409).json({
      message: 'Email already exists.',
    });
  } else {
    const user = await entityManager.save(newUser);
    res.status(201).json(user);
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  const { userId } = req.params;
  const entityManager = getManager();
  const lookupUser = await entityManager.findOne(User, {
    where: {
      id: userId,
    },
  });
  if (!lookupUser) {
    res.status(404).json({
      message: 'User ID not found.',
    });
  } else if (req.payload.id !== userId && req.payload.role !== UserRole.Admin) {
    res.status(403).json({
      message: 'Users without administrator rights can only update their own user info.',
    });
  } else if (
    req.body.role &&
    req.body.role === UserRole.Admin &&
    req.payload.role !== UserRole.Admin
  ) {
    res.status(403).json({
      message: 'Users can not set themselves as administrator.',
    });
  } else {
    const updatedUser = new User();
    updatedUser.id = userId;
    updatedUser.email = req.body.email ?? lookupUser.email;
    updatedUser.role = req.body.role ?? lookupUser.role;
    if (req.body.password) {
      updatedUser.password = await encryptPassword(req.body.password);
    } else {
      updatedUser.password = lookupUser.password;
    }
    await updatedUser.validate();
    await entityManager.update(User, { id: userId }, updatedUser);
    const result = await entityManager.findOne(User, {
      where: {
        id: userId,
      },
    });
    res.status(200).json(result);
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const entityManager = getManager();
  const lookupUser = await entityManager.findOne(User, {
    where: {
      id: userId,
    },
  });
  if (!lookupUser) {
    res.status(404).json({
      message: 'User ID not found.',
    });
  } else {
    const result = await entityManager.delete(User, { id: userId });
    res.status(200).json({
      message: 'User successfully deleted.',
      affected: result.affected,
    });
  }
}
