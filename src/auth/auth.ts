import { sign, verify } from 'jsonwebtoken';
import { genSalt, hash, compare } from 'bcrypt';
import { getManager } from 'typeorm';
import { v4 } from 'uuid';
import JWTPayload from './jwtPayload.model';
import Credentials from './credentials.model';
import config from '../config';
import { User } from '../entities';

const NCONF_JWT_SECRET_KEY = 'JWT_SECRET_KEY';

function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function encryptPassword(password: string): Promise<string> {
  const salt = await genSalt(10);
  return hash(password, salt);
}

export async function validateCredentials(credentials: Credentials): Promise<User> {
  const entityManager = getManager();
  const user = await entityManager.findOne(User, {
    where: {
      email: credentials.email,
    },
  });

  if (!user) {
    throw new Error('Unknown email address.');
  }

  const match = await comparePassword(credentials.password, user.password);
  if (!match) {
    throw new Error('Invalid password.');
  }

  return user;
}

export function signPayload(payload: JWTPayload): { token: string; expiresIn: string } {
  const expiresIn = '7d';
  return {
    token: sign(payload, config.get(NCONF_JWT_SECRET_KEY), { expiresIn }),
    expiresIn,
  };
}

export function verifyToken(token: string): JWTPayload {
  const payload = verify(token, config.get(NCONF_JWT_SECRET_KEY));
  if (typeof payload === 'string') {
    return JSON.parse(payload) as JWTPayload;
  }
  return payload as JWTPayload;
}

export async function addDefaultAdminAccount(): Promise<User> {
  const admin = new User();
  admin.id = v4();
  admin.email = config.get('Admin:Email');
  admin.password = await encryptPassword(config.get('Admin:Password'));
  admin.role = 'ADMIN';
  admin.categories = [];
  admin.transactions = [];
  await admin.validate();

  const entityManager = getManager();
  return entityManager.save(admin);
}
