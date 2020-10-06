import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { getManager } from 'typeorm';
import { Auth, Credentials, UserRole } from '../auth';
import { User } from '../entities';

export async function signIn(req: Request, res: Response): Promise<void> {
  const newUser = new User();
  newUser.id = v4();
  newUser.email = req.body.email;
  newUser.password = await Auth.encryptPassword(req.body.password);
  newUser.role = UserRole.User;

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
    const authorization = Auth.signPayload({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.status(201).json({
      message: 'Account successfully created.',
      user,
      authorization,
    });
  }
}

export async function logIn(req: Request, res: Response): Promise<void> {
  const credentials: Credentials = {
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const user = await Auth.validateCredentials(credentials);
    const { token, expiresIn } = Auth.signPayload({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.status(200).json({
      message: 'Authentication successful.',
      token,
      expiresIn,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Invalid email / password combination.',
    });
  }
}
