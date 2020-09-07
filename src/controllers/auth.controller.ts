import { Request, Response } from 'express';
import { Auth, Credentials } from '../auth';

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
