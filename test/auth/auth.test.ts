import { getManager } from 'typeorm';
import { v4 } from 'uuid';
import { Auth, UserRole, JWTPayload } from '../../src/auth';
import { connectDB, disconnectDB } from '../../src/database';
import { User } from '../../src/entities';
import config from '../../src/config';
import { clearDB } from '../testHelpers';

const validEmail = 'test@mail.com';
const validPassword = 'test-password';

describe('Authentication module', () => {
  beforeAll(async (done) => {
    const connection = await connectDB();
    await clearDB(connection);
    done();
  });

  afterAll(async (done) => {
    await disconnectDB();
    done();
  });

  it('should return an 60 characters strings when encrypting a password with encryptPassword', async (done) => {
    const encrypted = await Auth.encryptPassword('my-password-test');
    expect(encrypted.length).toEqual(60);
    done();
  });

  it('should return the User object after validating its credentials with validateCredentials', async (done) => {
    const validUser = new User();
    validUser.id = v4();
    validUser.email = validEmail;
    validUser.password = await Auth.encryptPassword(validPassword);
    validUser.role = UserRole.User;
    await validUser.validate();
    const entityManager = getManager();
    await entityManager.save(validUser);

    const user = await Auth.validateCredentials({
      email: validEmail,
      password: validPassword,
    });
    expect(user.id).toEqual(validUser.id);
    expect(user.email).toEqual(validUser.email);
    expect(user.password).toEqual(validUser.password);
    expect(user.role).toEqual(validUser.role);
    done();
  });

  it('should throw an error when given an invalid email in validateCredentials', async (done) => {
    await expect(
      Auth.validateCredentials({
        email: 'unknownEmail@mail.com',
        password: validPassword,
      }),
    ).rejects.toBeInstanceOf(Error);
    done();
  });

  it('should throw an error when given an invalid password in validateCredentials', async (done) => {
    await expect(
      Auth.validateCredentials({
        email: validEmail,
        password: 'invalid-password',
      }),
    ).rejects.toBeInstanceOf(Error);
    done();
  });

  it('should return the JWT and expire time after signing a payload in signPayload', () => {
    const result = Auth.signPayload({
      email: 'test@mail.com',
      id: v4(),
      role: UserRole.User,
    });
    expect(typeof result.token).toBe('string');
    expect(typeof result.expiresIn).toBe('string');
  });

  it('should return the payload after verifying the JWT in verifyToken', () => {
    const payload: JWTPayload = {
      email: 'test@mail.com',
      id: v4(),
      role: UserRole.User,
    };
    const signResult = Auth.signPayload(payload);
    const verifyResult = Auth.verifyToken(signResult.token);
    expect(verifyResult.email).toEqual(payload.email);
    expect(verifyResult.id).toEqual(payload.id);
    expect(verifyResult.role).toEqual(payload.role);
  });

  it('should throw an Error when given an invalid JWT in verifyToken', () => {
    const invalidToken =
      '62QRTpXUt9fvDTArw4EzKdSAR9UMiRyQuQDx.FkjeSRqPa4WaqEcYAiXdKA3WYT7TgfCEnwDfuZHHt97WrMcvBpwSWWR4M5G9ZTDADqBhxifDPdPxH5aWSca6jW64LQNZ9F6qFP7p2C8wkvtQFVbX643PN7S9MSQBfvStYHz8q8TNXEGPH7kcenrEFeZqEXZ8Mmy.QCf74yr_47Qzrqxi2tVZgRx3rL8GRJdxuh9DR-jCY7D';
    expect(() => Auth.verifyToken(invalidToken)).toThrowError();
  });

  it('should add the admin account with addDefaultAdminAccount', async (done) => {
    await Auth.addDefaultAdminAccount();
    const entityManager = getManager();
    const admin = await entityManager.findOne(User, {
      where: {
        email: config.get('Admin:Email'),
      },
    });
    expect(admin.email).toEqual(config.get('Admin:Email'));
    expect(admin.role).toEqual(UserRole.Admin);
    done();
  });
});
